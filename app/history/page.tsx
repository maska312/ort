'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getAttemptHistory } from '@/lib/supabase/history'
import { useLang } from '@/contexts/LangContext'
import { AttemptCard } from '@/components/history/AttemptCard'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import type { AttemptSummary } from '@/lib/supabase/types'

export default function HistoryPage() {
  const { tr } = useLang()
  const [attempts, setAttempts] = useState<AttemptSummary[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [mode, setMode] = useState<'full' | 'section' | undefined>()
  const [loading, setLoading] = useState(true)
  const pageSize = 20

  useEffect(() => {
    async function load() {
      setLoading(true)
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }

      const data = await getAttemptHistory(user.id, { mode }, { page, pageSize })
      setAttempts(data.attempts)
      setTotal(data.total)
      setLoading(false)
    }
    load()
  }, [page, mode])

  const totalPages = Math.ceil(total / pageSize)

  return (
    <div className="mx-auto max-w-3xl p-6 space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">{tr.history}</h1>

      <div className="flex gap-2">
        <Button
          size="sm"
          variant={!mode ? 'default' : 'outline'}
          onClick={() => { setMode(undefined); setPage(1) }}
        >
          {tr.allModes}
        </Button>
        <Button
          size="sm"
          variant={mode === 'section' ? 'default' : 'outline'}
          onClick={() => { setMode('section'); setPage(1) }}
        >
          {tr.sectionTest}
        </Button>
        <Button
          size="sm"
          variant={mode === 'full' ? 'default' : 'outline'}
          onClick={() => { setMode('full'); setPage(1) }}
        >
          {tr.fullTest}
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
      ) : attempts.length === 0 ? (
        <div className="py-12 text-center text-slate-400">
          <p className="text-4xl mb-2">📝</p>
          <p>{tr.noAttempts}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {attempts.map(a => <AttemptCard key={a.sessionId} attempt={a} />)}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 pt-4">
          <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
            ←
          </Button>
          <span className="flex items-center text-sm text-slate-500">
            {page} / {totalPages}
          </span>
          <Button size="sm" variant="outline" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
            →
          </Button>
        </div>
      )}
    </div>
  )
}
