'use client'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { FinalResult } from '@/lib/supabase/types'
import type { Lang } from '@/lib/i18n/quiz'
import { t, SECTION_META } from '@/lib/i18n/quiz'

type Props = {
  result: FinalResult
  lang: Lang
  onGoHome: () => void
  onWeakSection?: (code: string) => void
}

function getLevel(percent: number) {
  if (percent >= 80) return { color: 'text-green-600', bg: 'bg-green-50', badge: '🟢' }
  if (percent >= 50) return { color: 'text-amber-600', bg: 'bg-amber-50', badge: '🟡' }
  return { color: 'text-red-600', bg: 'bg-red-50', badge: '🔴' }
}

export default function QuizFinalResult({ result, lang, onGoHome, onWeakSection }: Props) {
  const tr = t[lang]
  const level = getLevel(result.percent)

  const weakest = result.sections.reduce((min, s) => s.percent < min.percent ? s : min, result.sections[0])

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className={cn('rounded-3xl border p-8 text-center', level.bg)}>
        <div className="mb-2 text-5xl">{level.badge}</div>
        <h2 className="mb-1 text-2xl font-bold text-slate-900">{tr.totalScore}</h2>
        <p className={cn('text-5xl font-black', level.color)}>{result.totalScore} / {result.maxScore}</p>
        <p className="mt-2 text-lg text-slate-500">{result.percent}%</p>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Раздел</th>
              <th className="px-4 py-3 text-center font-semibold text-slate-700">Правильных</th>
              <th className="px-4 py-3 text-right font-semibold text-slate-700">Балл</th>
            </tr>
          </thead>
          <tbody>
            {result.sections.map((s) => {
              const code = s.sectionCode as keyof typeof SECTION_META
              const meta = SECTION_META[code]
              const sl = getLevel(s.percent)
              return (
                <tr key={s.sessionSectionId} className="border-t border-slate-100">
                  <td className="px-4 py-3 font-medium">
                    <span className="mr-2">{meta?.icon}</span>{s.sectionTitle}
                  </td>
                  <td className="px-4 py-3 text-center text-slate-600">
                    {s.score}/{s.maxScore}
                  </td>
                  <td className={cn('px-4 py-3 text-right font-bold', sl.color)}>
                    {s.percent}% {sl.badge}
                  </td>
                </tr>
              )
            })}
            <tr className="border-t-2 border-slate-300 bg-slate-50 font-bold">
              <td className="px-4 py-3">Итого</td>
              <td className="px-4 py-3 text-center">{result.totalScore}/{result.maxScore}</td>
              <td className={cn('px-4 py-3 text-right', level.color)}>{result.percent}%</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mt-8 flex flex-col gap-3">
        {onWeakSection && weakest && weakest.percent < 80 && (
          <Button onClick={() => onWeakSection(weakest.sectionCode)} variant="outline" className="w-full py-5">
            {tr.weakSection}: {weakest.sectionTitle}
          </Button>
        )}
        <Button onClick={onGoHome} className="w-full py-5">{tr.goHome}</Button>
      </div>
    </div>
  )
}
