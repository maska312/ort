'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuizStore } from '@/store/quizStore'
import { useLang } from '@/contexts/LangContext'
import { loadQuestions, saveAnswer, finishSection as finishSectionApi, finishSession as finishSessionApi } from '@/lib/supabase/quiz'
import QuizSectionIntro from './QuizSectionIntro'
import QuizHeader from './QuizHeader'
import QuizCard from './QuizCard'
import QuizChoices from './QuizChoices'
import QuizSectionResult from './QuizSectionResult'
import QuizFinalResult from './QuizFinalResult'
import { Button } from '@/components/ui/button'

export default function QuizShell() {
  const router = useRouter()
  const { lang, tr } = useLang()
  const store = useQuizStore()
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [loading, setLoading] = useState(false)
  const [answering, setAnswering] = useState(false)
  const finishingRef = useRef(false)

  const {
    phase, sessionId, mode, sectionQueue, currentSectionIndex,
    sessionSectionId, questions, currentQuestionIndex, answers,
    timeLeft, timeExpired, lastSectionResult,
  } = store

  const currentSection = sectionQueue[currentSectionIndex]
  const currentQuestion = questions[currentQuestionIndex]

  // Timer
  useEffect(() => {
    if (phase === 'active') {
      timerRef.current = setInterval(() => store.tick(), 1000)
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [phase, store])

  // Time expired handler
  const handleTimeExpired = useCallback(async () => {
    if (finishingRef.current || !sessionSectionId) return
    finishingRef.current = true
    try {
      const elapsed = currentSection ? currentSection.section.time_limit_sec : 0
      const result = await finishSectionApi(sessionSectionId, elapsed)
      store.finishCurrentSection(result)
    } finally {
      finishingRef.current = false
    }
  }, [sessionSectionId, currentSection, store])

  useEffect(() => {
    if (timeExpired && phase === 'active') {
      handleTimeExpired()
    }
  }, [timeExpired, phase, handleTimeExpired])

  // Start section
  const handleStartSection = async () => {
    if (!currentSection) return
    setLoading(true)
    try {
      const qs = await loadQuestions(currentSection.id)
      store.setQuestions(qs)
      store.startCurrentSection()
    } finally {
      setLoading(false)
    }
  }

  // Select answer
  const handleSelectAnswer = async (chosenIndex: number) => {
    if (!currentQuestion || !sessionSectionId || answering) return
    setAnswering(true)
    store.setAnswer(currentQuestion.id, chosenIndex)
    try {
      await saveAnswer(sessionSectionId, currentQuestion.id, chosenIndex, currentQuestion.correct_index)
    } catch (e) {
      console.error('Failed to save answer:', e)
    }
    setAnswering(false)
  }

  // Finish section manually
  const handleFinishSection = async () => {
    if (!sessionSectionId || !currentSection || finishingRef.current) return
    finishingRef.current = true
    try {
      const elapsed = currentSection.section.time_limit_sec - timeLeft
      const result = await finishSectionApi(sessionSectionId, elapsed)
      store.finishCurrentSection(result)
    } finally {
      finishingRef.current = false
    }
  }

  // Next/finish handlers
  const handleNextFromResult = async () => {
    if (!mode || !sessionId) return
    const isLast = currentSectionIndex >= sectionQueue.length - 1
    if (mode === 'full' && isLast) {
      const result = await finishSessionApi(sessionId)
      store.finishSession()
      router.push(`/results/${sessionId}`)
    } else if (mode === 'full') {
      store.proceedToNextSection()
    }
  }

  const selectedIndex = currentQuestion ? (answers[currentQuestion.id] ?? null) : null

  // Phase rendering
  if (phase === 'idle') return null

  if (phase === 'intro' && currentSection) {
    return (
      <QuizSectionIntro
        sessionSection={currentSection}
        currentSectionIndex={currentSectionIndex}
        totalSections={sectionQueue.length}
        mode={mode || 'section'}
        lang={lang}
        onStart={handleStartSection}
        loading={loading}
      />
    )
  }

  if (phase === 'active' && currentQuestion) {
    const choices = lang === 'ky' && currentQuestion.choices_ky
      ? currentQuestion.choices_ky : currentQuestion.choices_ru

    return (
      <div className="min-h-screen bg-slate-50">
        <QuizHeader
          sectionTitle={lang === 'ky' ? currentSection?.section.title_ky || '' : currentSection?.section.title_ru || ''}
          currentSection={currentSectionIndex + 1}
          totalSections={sectionQueue.length}
          currentQuestion={currentQuestionIndex + 1}
          totalQuestions={questions.length}
          timeLeft={timeLeft}
          lang={lang}
        />
        <div className="mx-auto max-w-3xl px-4 py-6 space-y-6">
          <QuizCard
            question={currentQuestion}
            questionNumber={currentQuestionIndex + 1}
            totalQuestions={questions.length}
            lang={lang}
            sectionCode={currentSection.section.code}
          />
          <QuizChoices
            choices={choices}
            selectedIndex={selectedIndex}
            correctIndex={null}
            onSelect={handleSelectAnswer}
            disabled={answering}
          />
          <div className="flex justify-between gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => store.goToPrevQuestion()}
              disabled={currentQuestionIndex === 0}
            >
              ←
            </Button>
            {currentQuestionIndex < questions.length - 1 ? (
              <Button onClick={() => store.goToNextQuestion()} disabled={selectedIndex === null}>
                {tr.nextQuestion}
              </Button>
            ) : (
              <Button onClick={handleFinishSection} disabled={finishingRef.current}>
                {tr.finishSection}
              </Button>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (phase === 'section_result' && lastSectionResult) {
    const isLast = currentSectionIndex >= sectionQueue.length - 1
    return (
      <QuizSectionResult
        result={lastSectionResult}
        mode={mode || 'section'}
        isLastSection={isLast}
        lang={lang}
        onNext={handleNextFromResult}
        onTryAgain={mode === 'section' ? () => router.push('/practice') : undefined}
        onGoHome={() => router.push('/dashboard')}
      />
    )
  }

  if (phase === 'final_result') {
    return null // Redirect handled above
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="animate-spin h-8 w-8 rounded-full border-4 border-blue-600 border-t-transparent" />
    </div>
  )
}
