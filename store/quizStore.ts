import { create } from 'zustand'
import type { Question, SessionSection, SectionResult, InitPayload } from '@/lib/supabase/types'

type Phase = 'idle' | 'intro' | 'active' | 'section_result' | 'final_result'

type QuizStore = {
  sessionId: string | null
  mode: 'full' | 'section' | null
  sectionQueue: SessionSection[]
  currentSectionIndex: number
  sessionSectionId: string | null
  questions: Question[]
  currentQuestionIndex: number
  answers: Record<string, number>
  timeLeft: number
  timeExpired: boolean
  lastSectionResult: SectionResult | null
  phase: Phase

  initSession: (payload: InitPayload) => void
  setQuestions: (questions: Question[]) => void
  startCurrentSection: () => void
  setAnswer: (questionId: string, chosenIndex: number) => void
  goToNextQuestion: () => void
  goToPrevQuestion: () => void
  goToQuestion: (index: number) => void
  tick: () => void
  finishCurrentSection: (result: SectionResult) => void
  proceedToNextSection: () => void
  finishSession: () => void
  reset: () => void
}

const initialState = {
  sessionId: null as string | null,
  mode: null as 'full' | 'section' | null,
  sectionQueue: [] as SessionSection[],
  currentSectionIndex: 0,
  sessionSectionId: null as string | null,
  questions: [] as Question[],
  currentQuestionIndex: 0,
  answers: {} as Record<string, number>,
  timeLeft: 0,
  timeExpired: false,
  lastSectionResult: null as SectionResult | null,
  phase: 'idle' as Phase,
}

export const useQuizStore = create<QuizStore>((set, get) => ({
  ...initialState,

  initSession: (payload: InitPayload) => {
    set({
      sessionId: payload.sessionId,
      mode: payload.mode,
      sectionQueue: payload.sectionQueue,
      currentSectionIndex: 0,
      phase: 'intro',
      timeExpired: false,
    })
  },

  setQuestions: (questions: Question[]) => {
    set({ questions })
  },

  startCurrentSection: () => {
    const { sectionQueue, currentSectionIndex } = get()
    const current = sectionQueue[currentSectionIndex]
    if (!current) return
    set({
      sessionSectionId: current.id,
      currentQuestionIndex: 0,
      answers: {},
      timeLeft: current.section.time_limit_sec,
      timeExpired: false,
      phase: 'active',
    })
  },

  setAnswer: (questionId: string, chosenIndex: number) => {
    set((state) => ({
      answers: { ...state.answers, [questionId]: chosenIndex },
    }))
  },

  goToNextQuestion: () => {
    set((state) => {
      const next = state.currentQuestionIndex + 1
      if (next >= state.questions.length) return state
      return { currentQuestionIndex: next }
    })
  },

  goToPrevQuestion: () => {
    set((state) => {
      if (state.currentQuestionIndex <= 0) return state
      return { currentQuestionIndex: state.currentQuestionIndex - 1 }
    })
  },

  goToQuestion: (index: number) => {
    set((state) => {
      if (index < 0 || index >= state.questions.length) return state
      return { currentQuestionIndex: index }
    })
  },

  // tick уменьшает таймер на 1 секунду.
  // Если время вышло — устанавливает timeExpired = true.
  // QuizShell должен отслеживать timeExpired через useEffect и вызвать finishSection.
  tick: () => {
    set((state) => {
      if (state.timeLeft <= 0) return { timeExpired: true }
      return { timeLeft: state.timeLeft - 1 }
    })
  },

  finishCurrentSection: (result: SectionResult) => {
    set({
      lastSectionResult: result,
      phase: 'section_result',
      timeExpired: false,
    })
  },

  proceedToNextSection: () => {
    set((state) => ({
      currentSectionIndex: state.currentSectionIndex + 1,
      questions: [],
      answers: {},
      currentQuestionIndex: 0,
      timeLeft: 0,
      timeExpired: false,
      lastSectionResult: null,
      phase: 'intro',
    }))
  },

  finishSession: () => {
    set({ phase: 'final_result' })
  },

  reset: () => {
    set(initialState)
  },
}))
