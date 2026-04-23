'use client'

import { useEffect, useState } from 'react'
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client'
import { getSectionStats } from '@/lib/supabase/history'
import { getAttemptHistory } from '@/lib/supabase/history'
import { useLang } from '@/contexts/LangContext'
import StatsOverview, { SectionStatCard } from '@/components/dashboard/StatsOverview'
import { RecentAttempts } from '@/components/history/AttemptCard'
import { Skeleton } from '@/components/ui/skeleton'
import type { SectionStats, AttemptSummary } from '@/lib/supabase/types'
import Link from 'next/link'

export default function DashboardPage() {
  const { lang, tr } = useLang()
  const [stats, setStats] = useState<SectionStats[]>([])
  const [recent, setRecent] = useState<AttemptSummary[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      if (!isSupabaseConfigured()) {
        setLoading(false)
        return
      }
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { setLoading(false); return }

        const [statsData, historyData] = await Promise.all([
          getSectionStats(user.id),
          getAttemptHistory(user.id, {}, { page: 1, pageSize: 5 }),
        ])

        setStats(statsData)
        setRecent(historyData.attempts)
      } catch (e) {
        console.error('Dashboard load error:', e)
      }
      setLoading(false)
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl p-6 space-y-6">
        <div className="grid grid-cols-3 gap-4">
          {[1,2,3].map(i => <Skeleton key={i} className="h-28 rounded-2xl" />)}
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-44 rounded-2xl" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl p-6 space-y-8 fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            {lang === 'ky' ? 'Башкы бет' : 'Главная'}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {lang === 'ky' ? 'ОРТга даярдык прогрессиңиз' : 'Ваш прогресс подготовки к ОРТ'}
          </p>
        </div>
        <Link
          href="/practice"
          className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-200/50 transition-all hover:shadow-xl hover:shadow-indigo-300/50 hover:-translate-y-0.5 active:translate-y-0"
        >
          <span className="transition-transform group-hover:scale-110">🎯</span>
          {tr.practice}
        </Link>
      </div>

      <StatsOverview stats={stats} />

      {stats.length > 0 && (
        <div>
          <h2 className="mb-4 text-lg font-semibold text-slate-700 flex items-center gap-2">
            <span className="h-1 w-6 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500" />
            {lang === 'ky' ? 'Бөлүмдөр боюнча' : 'По разделам'}
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 stagger-children">
            {stats.map((s) => (
              <SectionStatCard key={s.sectionCode} stat={s} />
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="mb-4 text-lg font-semibold text-slate-700 flex items-center gap-2">
          <span className="h-1 w-6 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500" />
          {lang === 'ky' ? 'Акыркы аракеттер' : 'Последние попытки'}
        </h2>
        <RecentAttempts attempts={recent} />
      </div>
    </div>
  )
}
