'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { AttemptSummary } from '@/lib/supabase/types'
import { SECTION_META } from '@/lib/i18n/quiz'
import { useRouter } from 'next/navigation'

function getProgressClass(percent: number): string {
  if (percent >= 80) return 'progress-gradient-success'
  if (percent >= 50) return 'progress-gradient-warning'
  return 'progress-gradient-danger'
}

function getTextClass(percent: number): string {
  if (percent >= 80) return 'text-emerald-600'
  if (percent >= 50) return 'text-amber-600'
  return 'text-red-500'
}

export function AttemptCard({ attempt }: { attempt: AttemptSummary }) {
  const router = useRouter()
  const code = attempt.sectionCode as keyof typeof SECTION_META | undefined
  const meta = code ? SECTION_META[code] : null
  const date = new Date(attempt.startedAt)
  const timeMin = Math.round(attempt.timeSpentSec / 60)

  return (
    <Card
      className="group cursor-pointer rounded-2xl p-4 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 border-slate-100"
      onClick={() => router.push(`/history/${attempt.sessionId}`)}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2.5">
          {meta && (
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 text-base shadow-sm">
              {meta.icon}
            </div>
          )}
          <div>
            <span className="font-semibold text-slate-800">
              {attempt.sectionTitle || 'Полный тест'}
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <Badge
                variant="outline"
                className={cn(
                  'text-[10px] font-medium border-0 px-2 py-0.5',
                  attempt.mode === 'full'
                    ? 'bg-indigo-50 text-indigo-600'
                    : 'bg-slate-50 text-slate-500'
                )}
              >
                {attempt.mode === 'full' ? 'Полный' : 'Раздел'}
              </Badge>
              <span className="text-[10px] text-slate-400">⏱ {timeMin} мин</span>
            </div>
          </div>
        </div>
        <span className="text-xs text-slate-400 whitespace-nowrap">
          {date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })},{' '}
          {date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
            <div
              className={cn('h-full rounded-full transition-all duration-500', getProgressClass(attempt.percent))}
              style={{ width: `${attempt.percent}%` }}
            />
          </div>
        </div>
        <span className={cn('text-sm font-bold tabular-nums', getTextClass(attempt.percent))}>
          {attempt.score}/{attempt.maxScore}
          <span className="text-xs font-medium text-slate-400 ml-1">({attempt.percent}%)</span>
        </span>
      </div>
    </Card>
  )
}

export function RecentAttempts({ attempts }: { attempts: AttemptSummary[] }) {
  if (attempts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-slate-400">
        <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50">
          <span className="text-3xl">📝</span>
        </div>
        <p className="text-sm">Попыток пока нет</p>
        <p className="text-xs text-slate-300 mt-1">Начните тренировку, чтобы увидеть результаты</p>
      </div>
    )
  }
  return (
    <div className="space-y-3 stagger-children">
      {attempts.map((a) => (
        <AttemptCard key={a.sessionId} attempt={a} />
      ))}
    </div>
  )
}
