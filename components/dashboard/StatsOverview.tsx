'use client'

import { Card } from '@/components/ui/card'
import type { SectionStats } from '@/lib/supabase/types'
import { SECTION_META } from '@/lib/i18n/quiz'
import { cn } from '@/lib/utils'

type Props = { stats: SectionStats[] }

export default function StatsOverview({ stats }: Props) {
  const totalAttempts = stats.reduce((s, st) => s + st.attemptsCount, 0)
  const avgPercent = stats.length > 0
    ? Math.round(stats.reduce((s, st) => s + st.avgPercent, 0) / stats.length)
    : 0

  const items = [
    { label: 'Всего попыток', value: totalAttempts, icon: '🎯' },
    { label: 'Средний балл', value: `${avgPercent}%`, icon: '📊' },
    { label: 'Разделов изучено', value: stats.filter(s => s.attemptsCount > 0).length, icon: '📚' },
  ]

  return (
    <div className="grid grid-cols-3 gap-3">
      {items.map((item) => (
        <Card key={item.label} className="p-4 text-center">
          <div className="text-2xl mb-1">{item.icon}</div>
          <p className="text-2xl font-bold text-slate-900">{item.value}</p>
          <p className="text-xs text-slate-500">{item.label}</p>
        </Card>
      ))}
    </div>
  )
}

export function SectionStatCard({ stat }: { stat: SectionStats }) {
  const code = stat.sectionCode as keyof typeof SECTION_META
  const meta = SECTION_META[code]
  const level = stat.bestPercent >= 80 ? 'green' : stat.bestPercent >= 50 ? 'amber' : 'red'

  return (
    <Card className="p-5">
      <div className="flex items-center gap-3 mb-3">
        <span className="text-2xl">{meta?.icon || '📋'}</span>
        <h3 className="font-bold text-slate-900">{stat.sectionTitle}</h3>
      </div>
      <div className="space-y-1 text-sm text-slate-600">
        <p>Попыток: <span className="font-semibold">{stat.attemptsCount}</span></p>
        <p>Лучший: <span className={cn('font-semibold', `text-${level}-600`)}>{stat.bestPercent}%</span></p>
        {stat.lastPercent !== undefined && (
          <p>Последний: <span className="font-semibold">{stat.lastPercent}%</span></p>
        )}
        <p>Средний: <span className="font-semibold">{stat.avgPercent}%</span></p>
      </div>
      <div className="mt-3 h-2 w-full rounded-full bg-slate-100 overflow-hidden">
        <div
          className={cn('h-full rounded-full', `bg-${level}-500`)}
          style={{ width: `${Math.min(stat.bestPercent, 100)}%` }}
        />
      </div>
    </Card>
  )
}
