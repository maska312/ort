'use client'

import { Button } from '@/components/ui/button'
import { SECTION_META } from '@/lib/i18n/quiz'
import type { SessionSection } from '@/lib/supabase/types'
import type { Lang } from '@/lib/i18n/quiz'
import { t } from '@/lib/i18n/quiz'

type Props = {
  sessionSection: SessionSection
  currentSectionIndex: number
  totalSections: number
  mode: 'full' | 'section'
  lang: Lang
  onStart: () => void
  loading?: boolean
}

export default function QuizSectionIntro({
  sessionSection, currentSectionIndex, totalSections, mode, lang, onStart, loading,
}: Props) {
  const section = sessionSection.section
  const code = section.code as keyof typeof SECTION_META
  const meta = SECTION_META[code]
  const title = lang === 'ky' ? section.title_ky : section.title_ru
  const tr = t[lang]

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-lg text-center">
        <div className="mb-4 text-6xl">{meta.icon}</div>
        <h1 className="mb-2 text-2xl font-bold text-slate-900">{title}</h1>

        {mode === 'full' && (
          <p className="mb-4 text-sm text-slate-500">
            {tr.sectionOf} {currentSectionIndex + 1} {tr.of} {totalSections}
          </p>
        )}

        <div className="mb-6 flex justify-center gap-4">
          <div className="rounded-xl bg-slate-50 px-4 py-2 text-center">
            <p className="text-lg font-bold text-slate-900">{section.question_count}</p>
            <p className="text-xs text-slate-500">{tr.questions}</p>
          </div>
          <div className="rounded-xl bg-slate-50 px-4 py-2 text-center">
            <p className="text-lg font-bold text-slate-900">{Math.round(section.time_limit_sec / 60)}</p>
            <p className="text-xs text-slate-500">{tr.minutes}</p>
          </div>
        </div>

        <Button
          onClick={onStart}
          disabled={loading}
          className="w-full rounded-xl py-6 text-base font-semibold"
          size="lg"
        >
          {loading ? '...' : tr.startSection}
        </Button>
      </div>
    </div>
  )
}
