'use client'

import { useEffect, useState } from 'react'
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client'
import { getAttemptHistory } from '@/lib/supabase/history'
import { useLang } from '@/contexts/LangContext'
import { AttemptCard } from '@/components/history/AttemptCard'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import type { AttemptSummary } from '@/lib/supabase/types'
import { cn } from '@/lib/utils'

export default function HistoryPage() {
  const { lang, tr } = useLang()
  const [attempts, setAttempts] = useState<AttemptSummary[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [mode, setMode] = useState<'full' | 'section' | undefined>()
  const [loading, setLoading] = useState(true)
  const pageSize = 20

  useEffect(() => {
    async function load() {
      if (!isSupabaseConfigured()) {
        setLoading(false)
        return
      }
      try {
        setLoading(true)
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { setLoading(false); return }

        const data = await getAttemptHistory(user.id, { mode }, { page, pageSize })
        setAttempts(data.attempts)
        setTotal(data.total)
      } catch (e) {
        console.error('History load error:', e)
      }
      setLoading(false)
    }
    load()
  }, [page, mode])

  const totalPages = Math.ceil(total / pageSize)

  const filters = [
    { label: tr.allModes, value: undefined },
    { label: tr.sectionTest, value: 'section' as const },
    { label: tr.fullTest, value: 'full' as const },
  ]

  return (
    <div className="mx-auto max-w-3xl p-6 space-y-6 fade-in-up">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">{tr.history}</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          {lang === 'ky' ? 'Мурдагы аракеттериңиз' : 'Ваши прошлые результаты'}
        </p>
      </div>

      <div className="flex gap-1 rounded-full bg-slate-100/80 p-1 w-fit">
        {filters.map((f) => (
          <button
            key={f.label}
            className={cn(
              'rounded-full px-4 py-2 text-sm font-medium transition-all duration-200',
              mode === f.value
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            )}
            onClick={() => { setMode(f.value); setPage(1) }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <Skeleton key={i} className="h-24 rounded-2xl" />)}
        </div>
      ) : attempts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400">
          <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50">
            <span className="text-3xl">📝</span>
          </div>
          <p className="text-sm font-medium">{tr.noAttempts}</p>
          <p className="text-xs text-slate-300 mt-1">
            {lang === 'ky' ? 'Тренировканы баштаңыз' : 'Начните тренировку, чтобы увидеть результаты'}
          </p>
        </div>
      ) : (
        <div className="space-y-3 stagger-children">
          {attempts.map(a => <AttemptCard key={a.sessionId} attempt={a} />)}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-4">
          <button
            className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-sm text-slate-500 shadow-sm transition-all hover:border-indigo-300 hover:text-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed"
            disabled={page <= 1}
            onClick={() => setPage(p => p - 1)}
          >
            ←
          </button>
          <span className="text-sm text-slate-500 tabular-nums">
            {page} / {totalPages}
          </span>
          <button
            className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-sm text-slate-500 shadow-sm transition-all hover:border-indigo-300 hover:text-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed"
            disabled={page >= totalPages}
            onClick={() => setPage(p => p + 1)}
          >
            →
          </button>
        </div>
      )}
    </div>
  )
}
