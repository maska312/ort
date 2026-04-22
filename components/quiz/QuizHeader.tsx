'use client'

import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

type Props = {
  sectionTitle: string
  currentSection: number
  totalSections: number
  currentQuestion: number
  totalQuestions: number
  timeLeft: number
  lang: 'ru' | 'ky'
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

export default function QuizHeader({
  sectionTitle, currentSection, totalSections,
  currentQuestion, totalQuestions, timeLeft,
}: Props) {
  const progress = totalQuestions > 0 ? (currentQuestion / totalQuestions) * 100 : 0
  const isLowTime = timeLeft <= 300

  return (
    <div className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto max-w-3xl px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-slate-900">{sectionTitle}</span>
            {totalSections > 1 && (
              <span className="text-xs text-slate-500">
                Раздел {currentSection} из {totalSections}
              </span>
            )}
          </div>
          <div className={cn(
            'rounded-lg px-3 py-1.5 text-lg font-mono font-bold tabular-nums',
            isLowTime ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-slate-100 text-slate-700'
          )}>
            {formatTime(timeLeft)}
          </div>
        </div>
        <div className="mt-2 flex items-center gap-3">
          <Progress value={progress} className="h-2 flex-1" />
          <span className="text-xs font-medium text-slate-500 tabular-nums whitespace-nowrap">
            {currentQuestion} / {totalQuestions}
          </span>
        </div>
      </div>
    </div>
  )
}
