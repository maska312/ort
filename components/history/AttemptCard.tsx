'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { AttemptSummary } from '@/lib/supabase/types'
import { SECTION_META } from '@/lib/i18n/quiz'
import { useRouter } from 'next/navigation'

export function AttemptCard({ attempt }: { attempt: AttemptSummary }) {
  const router = useRouter()
  const level = attempt.percent >= 80 ? 'green' : attempt.percent >= 50 ? 'amber' : 'red'
  const code = attempt.sectionCode as keyof typeof SECTION_META | undefined
  const meta = code ? SECTION_META[code] : null
  const date = new Date(attempt.startedAt)
  const timeMin = Math.round(attempt.timeSpentSec / 60)

  return (
    <Card
      className="p-4 cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => router.push(`/history/${attempt.sessionId}`)}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          {meta && <span>{meta.icon}</span>}
          <span className="font-semibold text-slate-900">
            {attempt.sectionTitle || 'Полный тест'}
          </span>
          <Badge variant="outline" className="text-xs">
            {attempt.mode === 'full' ? 'Полный' : 'Раздел'}
          </Badge>
        </div>
        <span className="text-xs text-slate-500">
          {date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })},{' '}
          {date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
            <div
              className={cn('h-full rounded-full', `bg-${level}-500`)}
              style={{ width: `${attempt.percent}%` }}
            />
          </div>
        </div>
        <span className={cn('font-bold text-sm', `text-${level}-600`)}>
          {attempt.score}/{attempt.maxScore} ({attempt.percent}%)
        </span>
      </div>
      <p className="mt-1 text-xs text-slate-500">Затрачено: {timeMin} мин</p>
    </Card>
  )
}

export function RecentAttempts({ attempts }: { attempts: AttemptSummary[] }) {
  if (attempts.length === 0) {
    return (
      <div className="text-center py-8 text-slate-400">
        <p className="text-lg">📝</p>
        <p>Попыток пока нет</p>
      </div>
    )
  }
  return (
    <div className="space-y-3">
      {attempts.map((a) => (
        <AttemptCard key={a.sessionId} attempt={a} />
      ))}
    </div>
  )
}
