// Справочник разделов
export type Section = {
  id: string
  code: 'math' | 'analogies' | 'reading' | 'grammar_ru' | 'grammar_ky'
  title_ru: string
  title_ky: string
  question_count: number
  time_limit_sec: number
}

export type QuestionType = 'comparison' | 'standard'

export type Question = {
  id: string
  section_id: string
  // Тип вопроса и часть теста
  question_type: QuestionType
  part: 1 | 2
  // Тело вопроса (для standard и как заголовок для comparison)
  body_ru: string
  body_ky?: string
  // Для вопросов типа 'comparison'
  column_a?: string
  column_b?: string
  context_ru?: string   // условие над колонками, если есть
  // Варианты ответов (для comparison генерируются автоматически)
  choices_ru: string[]
  choices_ky?: string[]
  // Ответ и метаданные
  correct_index: number
  explanation?: string
  order_index: number
}

// Сессия = одна попытка
export type PracticeSession = {
  id: string
  user_id: string
  mode: 'full' | 'section'
  grammar_lang?: 'ru' | 'ky'
  status: 'active' | 'finished' | 'abandoned'
  started_at: string
  finished_at?: string
  total_score?: number
  max_score?: number
}

// Раздел внутри сессии
export type SessionSection = {
  id: string
  session_id: string
  section_id: string
  section: Section          // joined
  order_index: number
  status: 'pending' | 'active' | 'finished'
  started_at?: string
  finished_at?: string
  score?: number
  max_score?: number
  time_spent_sec?: number
}

// Ответ пользователя
export type Answer = {
  id: string
  session_section_id: string
  question_id: string
  chosen_index: number
  is_correct: boolean
  answered_at: string
}

// Результат одного раздела
export type SectionResult = {
  sessionSectionId: string
  sectionCode: string
  sectionTitle: string
  score: number
  maxScore: number
  percent: number
  timeSpentSec: number
  answers: {
    question: Question
    chosenIndex: number
    isCorrect: boolean
  }[]
}

// Итоговый результат
export type FinalResult = {
  sessionId: string
  mode: 'full' | 'section'
  totalScore: number
  maxScore: number
  percent: number
  sections: SectionResult[]
  startedAt: string
  finishedAt: string
}

// История — сводка попытки
export type AttemptSummary = {
  sessionId: string
  mode: 'full' | 'section'
  sectionCode?: string
  sectionTitle?: string
  score: number
  maxScore: number
  percent: number
  timeSpentSec: number
  startedAt: string
}

// Детальный разбор попытки
export type AttemptDetail = AttemptSummary & {
  sections: SectionResult[]
}

// Статистика по разделу
export type SectionStats = {
  sectionCode: string
  sectionTitle: string
  attemptsCount: number
  bestScore: number
  bestPercent: number
  lastScore?: number
  lastPercent?: number
  lastAttemptedAt?: string
  avgPercent: number
}

// Точка графика прогресса
export type ProgressPoint = {
  date: string
  percent: number
  score: number
  maxScore: number
}

// Payload для инициализации стора
export type InitPayload = {
  sessionId: string
  mode: 'full' | 'section'
  sectionQueue: SessionSection[]
}
