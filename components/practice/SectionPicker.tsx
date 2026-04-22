'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { SECTION_META, t } from '@/lib/i18n/quiz'
import type { SectionStats } from '@/lib/supabase/types'
import type { Lang } from '@/lib/i18n/quiz'
import { cn } from '@/lib/utils'

type Props = {
  stats: SectionStats[]
  lang: Lang
  onSelectSection: (code: string, grammarLang?: 'ru' | 'ky') => void
}

const sectionList = [
  { code: 'math', key: 'math' as const },
  { code: 'analogies', key: 'analogies' as const },
  { code: 'reading', key: 'reading' as const },
  { code: 'grammar', key: 'grammar_ru' as const },
] as const

export default function SectionPicker({ stats, lang, onSelectSection }: Props) {
  const tr = t[lang]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {sectionList.map(({ code, key }) => {
        const meta = SECTION_META[key]
        const isGrammar = code === 'grammar'
        const stat = stats.find((s) => s.sectionCode === key || (isGrammar && (s.sectionCode === 'grammar_ru' || s.sectionCode === 'grammar_ky')))

        const title = isGrammar
          ? (lang === 'ky' ? 'Грамматика' : 'Грамматика')
          : (lang === 'ky' ? key : key) // Will use DB titles in real usage

        const sectionTitles: Record<string, Record<Lang, string>> = {
          math: { ru: 'Математика', ky: 'Математика' },
          analogies: { ru: 'Аналогии', ky: 'Аналогиялар' },
          reading: { ru: 'Чтение и понимание', ky: 'Окуу жана түшүнүү' },
          grammar: { ru: 'Грамматика', ky: 'Грамматика' },
        }

        return (
          <Card
            key={code}
            className={cn(
              'relative cursor-pointer overflow-hidden p-6 transition-all duration-200',
              'hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]',
              'border-2 border-transparent hover:border-blue-200'
            )}
            onClick={() => {
              if (isGrammar) {
                // For grammar, default to ru. Dialog should be implemented for selection.
                onSelectSection('grammar_ru', 'ru')
              } else {
                onSelectSection(code)
              }
            }}
          >
            <div className="mb-3 text-4xl">{meta.icon}</div>
            <h3 className="mb-1 text-lg font-bold text-slate-900">
              {sectionTitles[code]?.[lang] || code}
            </h3>
            {stat ? (
              <div className="mt-3 space-y-1 text-xs text-slate-500">
                <p>{tr.attempts}: {stat.attemptsCount}</p>
                <p>{tr.bestResult}: {stat.bestPercent}%</p>
                <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all',
                      stat.bestPercent >= 80 ? 'bg-green-500' : stat.bestPercent >= 50 ? 'bg-amber-500' : 'bg-red-500'
                    )}
                    style={{ width: `${stat.bestPercent}%` }}
                  />
                </div>
              </div>
            ) : (
              <p className="mt-3 text-xs text-slate-400">{tr.noAttempts}</p>
            )}
          </Card>
        )
      })}
    </div>
  )
}
