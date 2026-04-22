'use client'

import ReactMarkdown from 'react-markdown'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import type { Question } from '@/lib/supabase/types'
import type { Lang } from '@/lib/i18n/quiz'

type Props = {
  question: Question
  questionNumber: number
  totalQuestions: number
  lang: Lang
}

export default function QuizCard({ question, questionNumber, totalQuestions, lang }: Props) {
  const body = lang === 'ky' && question.body_ky ? question.body_ky : question.body_ru

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-600">
          {questionNumber} / {totalQuestions}
        </span>
      </div>
      <div className="prose prose-slate max-w-none text-lg leading-relaxed">
        <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
          {body}
        </ReactMarkdown>
      </div>
    </div>
  )
}
