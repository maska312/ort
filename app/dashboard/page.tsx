'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getSectionStats } from '@/lib/supabase/history'
import { getAttemptHistory } from '@/lib/supabase/history'
import { useLang } from '@/contexts/LangContext'
import StatsOverview, { SectionStatCard } from '@/components/dashboard/StatsOverview'
import { RecentAttempts } from '@/components/history/AttemptCard'
import { Skeleton } from '@/components/ui/skeleton'
import type { SectionStats, AttemptSummary } from '@/lib/supabase/types'

export default function DashboardPage() {
  const { lang } = useLang()
  const [stats, setStats] = useState<SectionStats[]>([])
  const [recent, setRecent] = useState<AttemptSummary[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }

      const [statsData, historyData] = await Promise.all([
        getSectionStats(user.id),
        getAttemptHistory(user.id, {}, { page: 1, pageSize: 5 }),
      ])

      setStats(statsData)
      setRecent(historyData.attempts)
      setLoading(false)
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl p-6 space-y-6">
        <div className="grid grid-cols-3 gap-3">
          {[1,2,3].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-40 rounded-xl" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl p-6 space-y-8">
      <h1 className="text-2xl font-bold text-slate-900">
        {lang === 'ky' ? 'Статистика' : 'Статистика'}
      </h1>

      <StatsOverview stats={stats} />

      {stats.length > 0 && (
        <div>
          <h2 className="mb-4 text-lg font-semibold text-slate-800">По разделам</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {stats.map((s) => (
              <SectionStatCard key={s.sectionCode} stat={s} />
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="mb-4 text-lg font-semibold text-slate-800">Последние попытки</h2>
        <RecentAttempts attempts={recent} />
      </div>
    </div>
  )
}
