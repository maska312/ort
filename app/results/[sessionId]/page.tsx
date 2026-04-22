'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getSessionResult } from '@/lib/supabase/quiz'
import { useLang } from '@/contexts/LangContext'
import QuizFinalResult from '@/components/quiz/QuizFinalResult'
import QuizSectionResult from '@/components/quiz/QuizSectionResult'
import { Skeleton } from '@/components/ui/skeleton'
import type { FinalResult } from '@/lib/supabase/types'

export default function ResultsPage() {
  const params = useParams()
  const router = useRouter()
  const { lang } = useLang()
  const sessionId = params.sessionId as string
  const [result, setResult] = useState<FinalResult | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const data = await getSessionResult(sessionId)
        setResult(data)
      } catch (e) {
        console.error(e)
      }
      setLoading(false)
    }
    load()
  }, [sessionId])

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl p-6 space-y-4">
        <Skeleton className="h-48 rounded-3xl" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    )
  }

  if (!result) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-slate-500">Результат не найден</p>
      </div>
    )
  }

  if (result.mode === 'section' && result.sections.length === 1) {
    return (
      <QuizSectionResult
        result={result.sections[0]}
        mode="section"
        isLastSection={true}
        lang={lang}
        onNext={() => router.push('/dashboard')}
        onTryAgain={() => router.push('/practice')}
        onGoHome={() => router.push('/dashboard')}
      />
    )
  }

  return (
    <QuizFinalResult
      result={result}
      lang={lang}
      onGoHome={() => router.push('/dashboard')}
      onWeakSection={(code) => router.push(`/practice`)}
    />
  )
}
