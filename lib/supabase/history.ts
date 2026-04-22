import { createClient } from '@/lib/supabase/client'
import type { AttemptSummary, SectionStats, ProgressPoint, SectionResult } from '@/lib/supabase/types'

export async function getAttemptHistory(
  userId: string,
  filters: { sectionCode?: string; mode?: 'full' | 'section' },
  pagination: { page: number; pageSize: number }
): Promise<{ attempts: AttemptSummary[]; total: number }> {
  const supabase = createClient()
  let query = supabase
    .from('practice_sessions')
    .select('*, session_sections:session_sections(*, section:sections(*))', { count: 'exact' })
    .eq('user_id', userId)
    .eq('status', 'finished')
    .order('started_at', { ascending: false })

  if (filters.mode) query = query.eq('mode', filters.mode)

  const from = (pagination.page - 1) * pagination.pageSize
  query = query.range(from, from + pagination.pageSize - 1)

  const { data, count, error } = await query
  if (error) throw new Error(error.message)

  const attempts: AttemptSummary[] = (data || [])
    .filter((s) => !filters.sectionCode || s.session_sections?.some((ss: { section: { code: string } }) => ss.section?.code === filters.sectionCode))
    .map((s) => {
      const totalTime = s.session_sections?.reduce((sum: number, ss: { time_spent_sec: number | null }) => sum + (ss.time_spent_sec || 0), 0) || 0
      const first = s.session_sections?.[0]
      return {
        sessionId: s.id, mode: s.mode,
        sectionCode: s.mode === 'section' ? first?.section?.code : undefined,
        sectionTitle: s.mode === 'section' ? first?.section?.title_ru : undefined,
        score: s.total_score || first?.score || 0,
        maxScore: s.max_score || first?.max_score || 0,
        percent: s.max_score ? Math.round(((s.total_score || 0) / s.max_score) * 100) : 0,
        timeSpentSec: totalTime, startedAt: s.started_at,
      }
    })

  return { attempts, total: count || 0 }
}

export async function getAttemptDetail(sessionId: string) {
  const supabase = createClient()
  const { data: session, error: se } = await supabase.from('practice_sessions').select('*').eq('id', sessionId).single()
  if (se) throw new Error(se.message)

  const { data: ssList } = await supabase.from('session_sections').select('*, section:sections(*)').eq('session_id', sessionId).order('order_index')
  const sections: SectionResult[] = []
  let totalTime = 0

  for (const ss of ssList || []) {
    const { data: answers } = await supabase.from('answers').select('*, question:questions(*)').eq('session_section_id', ss.id)
    totalTime += ss.time_spent_sec || 0
    sections.push({
      sessionSectionId: ss.id, sectionCode: ss.section.code, sectionTitle: ss.section.title_ru,
      score: ss.score || 0, maxScore: ss.max_score || ss.section.question_count,
      percent: ss.max_score > 0 ? Math.round((ss.score / ss.max_score) * 100) : 0,
      timeSpentSec: ss.time_spent_sec || 0,
      answers: (answers || []).map((a) => ({ question: a.question, chosenIndex: a.chosen_index, isCorrect: a.is_correct })),
    })
  }

  const first = ssList?.[0]
  return {
    sessionId, mode: session.mode,
    sectionCode: session.mode === 'section' ? first?.section?.code : undefined,
    sectionTitle: session.mode === 'section' ? first?.section?.title_ru : undefined,
    score: session.total_score || sections.reduce((s, sec) => s + sec.score, 0),
    maxScore: session.max_score || sections.reduce((s, sec) => s + sec.maxScore, 0),
    percent: session.max_score > 0 ? Math.round(((session.total_score || 0) / session.max_score) * 100) : 0,
    timeSpentSec: totalTime, startedAt: session.started_at, sections,
  }
}

export async function getSectionStats(userId: string): Promise<SectionStats[]> {
  const supabase = createClient()
  const { data, error } = await supabase.from('section_stats').select('*, section:sections(*)').eq('user_id', userId)
  if (error) throw new Error(error.message)
  return (data || []).map((s) => ({
    sectionCode: s.section.code, sectionTitle: s.section.title_ru,
    attemptsCount: s.attempts_count, bestScore: s.best_score,
    bestPercent: Number(s.best_percent), lastScore: s.last_score,
    lastPercent: s.last_percent ? Number(s.last_percent) : undefined,
    lastAttemptedAt: s.last_attempted_at, avgPercent: Number(s.avg_percent || 0),
  }))
}

export async function getSectionProgress(userId: string, sectionCode: string, limit = 10): Promise<ProgressPoint[]> {
  const supabase = createClient()
  const { data: section } = await supabase.from('sections').select('id').eq('code', sectionCode).single()
  if (!section) return []
  const { data } = await supabase
    .from('session_sections')
    .select('score, max_score, finished_at, session:practice_sessions!inner(user_id)')
    .eq('section_id', section.id).eq('status', 'finished').eq('session.user_id', userId)
    .order('finished_at', { ascending: true }).limit(limit)
  return (data || []).map((i) => ({
    date: i.finished_at || '', percent: i.max_score > 0 ? Math.round((i.score / i.max_score) * 100) : 0,
    score: i.score || 0, maxScore: i.max_score || 0,
  }))
}

export async function upsertSectionStats(userId: string, sectionId: string, score: number, maxScore: number): Promise<void> {
  const supabase = createClient()
  const percent = maxScore > 0 ? Number(((score / maxScore) * 100).toFixed(2)) : 0
  const { data: existing } = await supabase.from('section_stats').select('*').eq('user_id', userId).eq('section_id', sectionId).single()

  if (existing) {
    const cnt = existing.attempts_count + 1
    const newAvg = Number(((Number(existing.avg_percent || 0) * existing.attempts_count + percent) / cnt).toFixed(2))
    await supabase.from('section_stats').update({
      attempts_count: cnt, best_score: Math.max(existing.best_score, score),
      best_percent: Math.max(Number(existing.best_percent), percent),
      last_score: score, last_percent: percent,
      last_attempted_at: new Date().toISOString(), avg_percent: newAvg,
    }).eq('id', existing.id)
  } else {
    await supabase.from('section_stats').insert({
      user_id: userId, section_id: sectionId, attempts_count: 1,
      best_score: score, best_percent: percent, last_score: score,
      last_percent: percent, last_attempted_at: new Date().toISOString(), avg_percent: percent,
    })
  }
}
