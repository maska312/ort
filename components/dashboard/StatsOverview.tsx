'use client'

import { Card } from '@/components/ui/card'
import type { SectionStats } from '@/lib/supabase/types'
import { SECTION_META } from '@/lib/i18n/quiz'
import { cn } from '@/lib/utils'

type Props = { stats: SectionStats[] }

const statCardStyles = [
  { bg: 'stat-card-blue', iconBg: 'bg-indigo-100', iconColor: 'text-indigo-600' },
  { bg: 'stat-card-purple', iconBg: 'bg-purple-100', iconColor: 'text-purple-600' },
  { bg: 'stat-card-emerald', iconBg: 'bg-emerald-100', iconColor: 'text-emerald-600' },
]

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
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 stagger-children">
      {items.map((item, i) => (
        <div
          key={item.label}
          className={cn(
            'rounded-2xl p-5 text-center transition-all duration-300 hover:scale-[1.03] hover:shadow-lg',
            statCardStyles[i].bg
          )}
        >
          <div className={cn(
            'mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl',
            statCardStyles[i].iconBg
          )}>
            <span className="text-xl">{item.icon}</span>
          </div>
          <p className="text-3xl font-bold text-slate-800">{item.value}</p>
          <p className="mt-1 text-xs font-medium text-slate-500 uppercase tracking-wider">{item.label}</p>
        </div>
      ))}
    </div>
  )
}

function getProgressColor(percent: number): string {
  if (percent >= 80) return 'progress-gradient-success'
  if (percent >= 50) return 'progress-gradient-warning'
  return 'progress-gradient-danger'
}

function getTextColor(percent: number): string {
  if (percent >= 80) return 'text-emerald-600'
  if (percent >= 50) return 'text-amber-600'
  return 'text-red-500'
}

export function SectionStatCard({ stat }: { stat: SectionStats }) {
  const code = stat.sectionCode as keyof typeof SECTION_META
  const meta = SECTION_META[code]

  return (
    <Card className="group relative overflow-hidden rounded-2xl p-5 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 border-slate-100">
      {/* Subtle gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/0 to-indigo-50/0 group-hover:from-indigo-50/50 group-hover:to-purple-50/30 transition-all duration-500" />

      <div className="relative">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-xl shadow-sm">
            {meta?.icon || '📋'}
          </div>
          <h3 className="font-bold text-slate-800">{stat.sectionTitle}</h3>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center mb-4">
          <div className="rounded-lg bg-slate-50/80 py-2 px-1">
            <p className="text-lg font-bold text-slate-800">{stat.attemptsCount}</p>
            <p className="text-[10px] font-medium text-slate-400 uppercase">Попыток</p>
          </div>
          <div className="rounded-lg bg-slate-50/80 py-2 px-1">
            <p className={cn('text-lg font-bold', getTextColor(stat.bestPercent))}>{stat.bestPercent}%</p>
            <p className="text-[10px] font-medium text-slate-400 uppercase">Лучший</p>
          </div>
          <div className="rounded-lg bg-slate-50/80 py-2 px-1">
            <p className="text-lg font-bold text-slate-700">{stat.avgPercent}%</p>
            <p className="text-[10px] font-medium text-slate-400 uppercase">Средний</p>
          </div>
        </div>
        <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
          <div
            className={cn('h-full rounded-full transition-all duration-500', getProgressColor(stat.bestPercent))}
            style={{ width: `${Math.min(stat.bestPercent, 100)}%` }}
          />
        </div>
      </div>
    </Card>
  )
}
