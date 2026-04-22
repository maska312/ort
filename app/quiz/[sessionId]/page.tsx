'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useQuizStore } from '@/store/quizStore'
import { getSessionResult } from '@/lib/supabase/quiz'
import QuizShell from '@/components/quiz/QuizShell'
import type { InitPayload } from '@/lib/supabase/types'
import { createClient } from '@/lib/supabase/client'

export default function QuizPage() {
  const params = useParams()
  const sessionId = params.sessionId as string
  const store = useQuizStore()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function init() {
      try {
        // If already initialized for this session, skip
        if (store.sessionId === sessionId && store.phase !== 'idle') {
          setLoading(false)
          return
        }

        const supabase = createClient()

        // Load session data
        const { data: session, error: se } = await supabase
          .from('practice_sessions')
          .select('*')
          .eq('id', sessionId)
          .single()

        if (se) throw new Error(se.message)

        // Load session sections
        const { data: sessionSections, error: sse } = await supabase
          .from('session_sections')
          .select('*, section:sections(*)')
          .eq('session_id', sessionId)
          .order('order_index')

        if (sse) throw new Error(sse.message)

        const payload: InitPayload = {
          sessionId,
          mode: session.mode,
          sectionQueue: sessionSections || [],
        }

        store.initSession(payload)
        setLoading(false)
      } catch (e) {
        setError((e as Error).message)
        setLoading(false)
      }
    }

    init()

    return () => {
      // Don't reset on unmount — user might navigate back
    }
  }, [sessionId])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin h-10 w-10 rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 font-semibold">Ошибка</p>
          <p className="text-sm text-slate-500 mt-2">{error}</p>
        </div>
      </div>
    )
  }

  return <QuizShell />
}
