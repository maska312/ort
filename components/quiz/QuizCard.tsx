'use client'

import ReactMarkdown from 'react-markdown'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import 'katex/dist/katex.min.css'
import type { Question } from '@/lib/supabase/types'
import type { Lang } from '@/lib/i18n/quiz'
import { getBody, getSectionMeta } from '@/lib/i18n/quiz'

type Props = {
  question: Question
  questionNumber: number
  totalQuestions: number
  lang: Lang
  sectionCode: string
}

import { MathJax } from 'better-react-mathjax'

function MathText({ text, isPureMath = false }: { text: string, isPureMath?: boolean }) {
  // If it's pure math (like a column) and has no delimiters, wrap it in AsciiMath delimiters
  if (isPureMath && !text.includes('$') && !text.includes('`') && !text.includes('\\')) {
    return <MathJax dynamic>{`\`${text}\``}</MathJax>
  }

  return (
    <MathJax dynamic>
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{ p: ({ children }) => <span>{children}</span> }}
      >
        {text}
      </ReactMarkdown>
    </MathJax>
  )
}

export default function QuizCard({
  question,
  questionNumber,
  totalQuestions,
  lang,
  sectionCode,
}: Props) {
  const isComparison = question.question_type === 'comparison'
  const meta = getSectionMeta(sectionCode)
  const body = getBody(question, lang)

  const columnALabel = lang === 'ky' ? 'А колонкасы' : 'Колонка А'
  const columnBLabel = lang === 'ky' ? 'Б колонкасы' : 'Колонка Б'

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">

      {/* Шапка */}
      <div className="flex items-center justify-between">
        <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-500">
          {questionNumber} / {totalQuestions}
        </span>
        {isComparison && (
          <span className={`text-xs font-semibold rounded-full px-3 py-1
            text-${meta.color} bg-${meta.bg}`}>
            {lang === 'ky' ? 'Салыштыруу' : 'Сравнение величин'}
          </span>
        )}
      </div>

      {/* Условие (context) — показывается над колонками если есть */}
      {question.context_ru && (
        <div className="text-sm text-slate-500 text-center">
          <MathText text={question.context_ru} />
        </div>
      )}

      {/* Тело вопроса */}
      {isComparison ? (
        <div className="space-y-3">
          {/* Описание задания */}
          <p className="text-base text-slate-700 leading-relaxed">
            <MathText text={body} />
          </p>

          {/* Две колонки */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="flex flex-col items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                {columnALabel}
              </span>
              <div className="w-full min-h-[72px] flex items-center justify-center
                              rounded-2xl border-2 border-blue-100 bg-blue-50
                              px-4 py-3 text-center text-slate-800 text-base font-medium">
                <MathText text={question.column_a ?? '—'} isPureMath />
              </div>
            </div>

            <div className="flex flex-col items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                {columnBLabel}
              </span>
              <div className="w-full min-h-[72px] flex items-center justify-center
                              rounded-2xl border-2 border-violet-100 bg-violet-50
                              px-4 py-3 text-center text-slate-800 text-base font-medium">
                <MathText text={question.column_b ?? '—'} isPureMath />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="prose prose-slate max-w-none text-lg leading-relaxed">
          <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
            {body}
          </ReactMarkdown>
        </div>
      )}

    </div>
  )
}