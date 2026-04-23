'use client'

import { Card } from '@/components/ui/card'
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

const sectionGradients: Record<string, { from: string; to: string; shadow: string }> = {
  math: { from: 'from-blue-50', to: 'to-indigo-50', shadow: 'shadow-blue-100/50' },
  analogies: { from: 'from-violet-50', to: 'to-purple-50', shadow: 'shadow-violet-100/50' },
  reading: { from: 'from-sky-50', to: 'to-cyan-50', shadow: 'shadow-sky-100/50' },
  grammar: { from: 'from-amber-50', to: 'to-orange-50', shadow: 'shadow-amber-100/50' },
}

const sectionIconBgs: Record<string, string> = {
  math: 'bg-blue-100',
  analogies: 'bg-violet-100',
  reading: 'bg-sky-100',
  grammar: 'bg-amber-100',
}

export default function SectionPicker({ stats, lang, onSelectSection }: Props) {
  const tr = t[lang]

  const sectionTitles: Record<string, Record<Lang, string>> = {
    math: { ru: 'Математика', ky: 'Математика' },
    analogies: { ru: 'Аналогии', ky: 'Аналогиялар' },
    reading: { ru: 'Чтение и понимание', ky: 'Окуу жана түшүнүү' },
    grammar: { ru: 'Грамматика', ky: 'Грамматика' },
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 stagger-children">
      {sectionList.map(({ code, key }) => {
        const meta = SECTION_META[key]
        const isGrammar = code === 'grammar'
        const stat = stats.find((s) => s.sectionCode === key || (isGrammar && (s.sectionCode === 'grammar_ru' || s.sectionCode === 'grammar_ky')))
        const gradient = sectionGradients[code] || sectionGradients.math
        const iconBg = sectionIconBgs[code] || 'bg-slate-100'

        return (
          <Card
            key={code}
            className={cn(
              'group relative cursor-pointer overflow-hidden rounded-2xl p-6 transition-all duration-300',
              'hover:shadow-xl hover:-translate-y-1 active:translate-y-0 active:shadow-md',
              'border border-slate-100 section-card-glow',
              `bg-gradient-to-br ${gradient.from} ${gradient.to}`
            )}
            onClick={() => {
              if (isGrammar) {
                onSelectSection('grammar_ru', 'ru')
              } else {
                onSelectSection(code)
              }
            }}
          >
            {/* Hover shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />

            <div className="relative">
              <div className={cn('mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl text-2xl shadow-sm', iconBg)}>
                {meta.icon}
              </div>
              <h3 className="mb-1 text-lg font-bold text-slate-800">
                {sectionTitles[code]?.[lang] || code}
              </h3>
              {stat ? (
                <div className="mt-3 space-y-2">
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>{tr.attempts}: <b className="text-slate-700">{stat.attemptsCount}</b></span>
                    <span>{tr.bestResult}: <b className={cn(
                      stat.bestPercent >= 80 ? 'text-emerald-600' : stat.bestPercent >= 50 ? 'text-amber-600' : 'text-red-500'
                    )}>{stat.bestPercent}%</b></span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-white/80 overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all duration-500',
                        stat.bestPercent >= 80 ? 'progress-gradient-success' : stat.bestPercent >= 50 ? 'progress-gradient-warning' : 'progress-gradient-danger'
                      )}
                      style={{ width: `${stat.bestPercent}%` }}
                    />
                  </div>
                </div>
              ) : (
                <p className="mt-3 text-xs text-slate-400">{tr.noAttempts}</p>
              )}
            </div>
          </Card>
        )
      })}
    </div>
  )
}
