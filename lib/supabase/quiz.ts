import { createClient } from '@/lib/supabase/client'
import type { InitPayload, Question, SectionResult, FinalResult } from '@/lib/supabase/types'

// Fisher-Yates shuffle
function shuffle<T>(array: T[]): T[] {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

const FULL_TEST_ORDER = ['math', 'analogies', 'reading'] as const

export async function createPracticeSession(
  mode: 'full' | 'section',
  sectionCode?: string,
  grammarLang?: 'ru' | 'ky'
): Promise<InitPayload> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Пользователь не авторизован')

  const { data: session, error: sessionError } = await supabase
    .from('practice_sessions')
    .insert({ user_id: user.id, mode, grammar_lang: grammarLang || null, status: 'active' })
    .select()
    .single()
  if (sessionError) throw new Error(sessionError.message)

  if (mode === 'section') {
    if (!sectionCode) throw new Error('Не указан раздел')
    const { data: section, error: sErr } = await supabase.from('sections').select().eq('code', sectionCode).single()
    if (sErr) throw new Error(sErr.message)

    const { data: ss, error: ssErr } = await supabase
      .from('session_sections')
      .insert({ session_id: session.id, section_id: section.id, order_index: 0, status: 'pending' })
      .select('*, section:sections(*)')
      .single()
    if (ssErr) throw new Error(ssErr.message)

    return { sessionId: session.id, mode: 'section', sectionQueue: [ss] }
  }

  const grammarCode = grammarLang === 'ky' ? 'grammar_ky' : 'grammar_ru'
  const sectionCodes = [...FULL_TEST_ORDER, grammarCode]
  const { data: sections, error: secErr } = await supabase.from('sections').select().in('code', sectionCodes)
  if (secErr) throw new Error(secErr.message)

  const inserts = sectionCodes.map((code, i) => {
    const sec = sections!.find((s) => s.code === code)
    if (!sec) throw new Error(`Раздел ${code} не найден`)
    return { session_id: session.id, section_id: sec.id, order_index: i, status: 'pending' as const }
  })

  const { data: sessionSections, error: ssErr } = await supabase
    .from('session_sections').insert(inserts).select('*, section:sections(*)').order('order_index')
  if (ssErr) throw new Error(ssErr.message)

  return { sessionId: session.id, mode: 'full', sectionQueue: sessionSections! }
}

export async function loadQuestions(sessionSectionId: string): Promise<Question[]> {
  const supabase = createClient()
  const { data: ss, error: ssErr } = await supabase.from('session_sections').select('section_id').eq('id', sessionSectionId).single()
  if (ssErr) throw new Error(ssErr.message)

  const { data: questions, error: qErr } = await supabase.from('questions').select('*').eq('section_id', ss.section_id).order('order_index')
  if (qErr) throw new Error(qErr.message)

  await supabase.from('session_sections').update({ status: 'active', started_at: new Date().toISOString() }).eq('id', sessionSectionId)

  return shuffle(questions || [])
}

export async function saveAnswer(sessionSectionId: string, questionId: string, chosenIndex: number, correctIndex: number): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from('answers').upsert(
    { session_section_id: sessionSectionId, question_id: questionId, chosen_index: chosenIndex, is_correct: chosenIndex === correctIndex },
    { onConflict: 'session_section_id,question_id' }
  )
  if (error) throw new Error(error.message)
}

export async function finishSection(sessionSectionId: string, timeSpentSec: number): Promise<SectionResult> {
  const supabase = createClient()
  const { data: ss, error: ssErr } = await supabase.from('session_sections').select('*, section:sections(*)').eq('id', sessionSectionId).single()
  if (ssErr) throw new Error(ssErr.message)

  const { data: answers, error: aErr } = await supabase.from('answers').select('*, question:questions(*)').eq('session_section_id', sessionSectionId)
  if (aErr) throw new Error(aErr.message)

  const score = (answers || []).filter((a) => a.is_correct).length
  const maxScore = ss.section.question_count

  await supabase.from('session_sections').update({
    status: 'finished', finished_at: new Date().toISOString(), score, max_score: maxScore, time_spent_sec: timeSpentSec,
  }).eq('id', sessionSectionId)

  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    const { upsertSectionStats } = await import('@/lib/supabase/history')
    await upsertSectionStats(user.id, ss.section_id, score, maxScore)
  }

  return {
    sessionSectionId, sectionCode: ss.section.code, sectionTitle: ss.section.title_ru,
    score, maxScore, percent: maxScore > 0 ? Math.round((score / maxScore) * 100) : 0, timeSpentSec,
    answers: (answers || []).map((a) => ({ question: a.question, chosenIndex: a.chosen_index, isCorrect: a.is_correct })),
  }
}

export async function finishSession(sessionId: string): Promise<FinalResult> {
  const supabase = createClient()
  const { data: sessionSections, error: ssErr } = await supabase
    .from('session_sections').select('*, section:sections(*)').eq('session_id', sessionId).order('order_index')
  if (ssErr) throw new Error(ssErr.message)

  const sections: SectionResult[] = []
  let totalScore = 0, maxScore = 0

  for (const ss of sessionSections || []) {
    const { data: answers } = await supabase.from('answers').select('*, question:questions(*)').eq('session_section_id', ss.id)
    const score = ss.score || 0, max = ss.max_score || ss.section.question_count
    totalScore += score; maxScore += max
    sections.push({
      sessionSectionId: ss.id, sectionCode: ss.section.code, sectionTitle: ss.section.title_ru,
      score, maxScore: max, percent: max > 0 ? Math.round((score / max) * 100) : 0,
      timeSpentSec: ss.time_spent_sec || 0,
      answers: (answers || []).map((a) => ({ question: a.question, chosenIndex: a.chosen_index, isCorrect: a.is_correct })),
    })
  }

  const finishedAt = new Date().toISOString()
  await supabase.from('practice_sessions').update({ status: 'finished', finished_at: finishedAt, total_score: totalScore, max_score: maxScore }).eq('id', sessionId)
  const { data: session } = await supabase.from('practice_sessions').select('started_at, mode').eq('id', sessionId).single()

  return {
    sessionId, mode: (session?.mode || 'full') as 'full' | 'section',
    totalScore, maxScore, percent: maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0,
    sections, startedAt: session?.started_at || '', finishedAt,
  }
}

export async function getSessionResult(sessionId: string): Promise<FinalResult> {
  const supabase = createClient()
  const { data: session, error: se } = await supabase.from('practice_sessions').select('*').eq('id', sessionId).single()
  if (se) throw new Error(se.message)

  const { data: ssList } = await supabase.from('session_sections').select('*, section:sections(*)').eq('session_id', sessionId).order('order_index')
  const sections: SectionResult[] = []

  for (const ss of ssList || []) {
    const { data: answers } = await supabase.from('answers').select('*, question:questions(*)').eq('session_section_id', ss.id)
    sections.push({
      sessionSectionId: ss.id, sectionCode: ss.section.code, sectionTitle: ss.section.title_ru,
      score: ss.score || 0, maxScore: ss.max_score || ss.section.question_count,
      percent: ss.max_score > 0 ? Math.round((ss.score / ss.max_score) * 100) : 0,
      timeSpentSec: ss.time_spent_sec || 0,
      answers: (answers || []).map((a) => ({ question: a.question, chosenIndex: a.chosen_index, isCorrect: a.is_correct })),
    })
  }

  return {
    sessionId, mode: session.mode,
    totalScore: session.total_score || sections.reduce((s, sec) => s + sec.score, 0),
    maxScore: session.max_score || sections.reduce((s, sec) => s + sec.maxScore, 0),
    percent: session.max_score > 0 ? Math.round(((session.total_score || 0) / session.max_score) * 100) : 0,
    sections, startedAt: session.started_at, finishedAt: session.finished_at || '',
  }
}
