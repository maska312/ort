'use client'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { SectionResult } from '@/lib/supabase/types'
import type { Lang } from '@/lib/i18n/quiz'
import { t } from '@/lib/i18n/quiz'

type Props = {
  result: SectionResult
  mode: 'full' | 'section'
  isLastSection: boolean
  lang: Lang
  onNext: () => void
  onTryAgain?: () => void
  onGoHome?: () => void
}

function getLevel(percent: number) {
  if (percent >= 80) return { color: 'text-green-600', bg: 'bg-green-50', label: '🟢' }
  if (percent >= 50) return { color: 'text-amber-600', bg: 'bg-amber-50', label: '🟡' }
  return { color: 'text-red-600', bg: 'bg-red-50', label: '🔴' }
}

export default function QuizSectionResult({ result, mode, isLastSection, lang, onNext, onTryAgain, onGoHome }: Props) {
  const tr = t[lang]
  const level = getLevel(result.percent)

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className={cn('rounded-3xl border p-8 text-center', level.bg)}>
        <div className="mb-2 text-5xl">{level.label}</div>
        <h2 className="mb-1 text-2xl font-bold text-slate-900">{tr.yourScore}</h2>
        <p className={cn('text-4xl font-black', level.color)}>
          {result.score} / {result.maxScore}
        </p>
        <p className="mt-1 text-lg text-slate-500">{result.percent}% {tr.correct}</p>
      </div>

      <div className="mt-6 space-y-2">
        {result.answers.map((a, i) => (
          <div key={i} className={cn(
            'flex items-start gap-3 rounded-xl p-3 text-sm',
            a.isCorrect ? 'bg-green-50' : 'bg-red-50'
          )}>
            <span className={cn('mt-0.5 text-lg', a.isCorrect ? 'text-green-600' : 'text-red-600')}>
              {a.isCorrect ? '✓' : '✗'}
            </span>
            <div className="flex-1">
              <p className="font-medium text-slate-900 line-clamp-2">{a.question.body_ru}</p>
              {!a.isCorrect && (
                <p className="mt-1 text-xs text-slate-500">
                  Правильный: {a.question.choices_ru[a.question.correct_index]}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex flex-col gap-3">
        {mode === 'section' && (
          <>
            {onTryAgain && <Button onClick={onTryAgain} className="w-full py-5">{tr.tryAgain}</Button>}
            {onGoHome && <Button onClick={onGoHome} variant="outline" className="w-full py-5">{tr.goHome}</Button>}
          </>
        )}
        {mode === 'full' && !isLastSection && (
          <Button onClick={onNext} className="w-full py-5">{tr.nextSection}</Button>
        )}
        {mode === 'full' && isLastSection && (
          <Button onClick={onNext} className="w-full py-5">{tr.viewResults}</Button>
        )}
      </div>
    </div>
  )
}
