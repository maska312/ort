import { Question } from '@/lib/supabase/types'

// ============================================================
// МЕТАДАННЫЕ РАЗДЕЛОВ
// ============================================================

export const SECTION_META = {
  math: { icon: '📐', color: 'blue-600', bg: 'blue-50' },
  analogies: { icon: '🔤', color: 'violet-600', bg: 'violet-50' },
  reading: { icon: '📖', color: 'cyan-600', bg: 'cyan-50' },
  grammar_ru: { icon: '✍️', color: 'emerald-600', bg: 'emerald-50' },
  grammar_ky: { icon: '✍️', color: 'emerald-600', bg: 'emerald-50' },
} as const

export type SectionCode = keyof typeof SECTION_META

// ============================================================
// ВАРИАНТЫ ОТВЕТОВ ДЛЯ ВОПРОСОВ НА СРАВНЕНИЕ
// ============================================================

export const COMPARISON_CHOICES = {
  ru: [
    'А — Колонка А больше',
    'Б — Колонка Б больше',
    'В — Обе величины равны',
    'Г — Невозможно определить',
  ],
  ky: [
    'А — А колонкасы чоң',
    'Б — Б колонкасы чоң',
    'В — Эки чоңдук тең',
    'Г — Аныктоо мүмкүн эмес',
  ],
} as const

// ============================================================
// ПЕРЕВОДЫ UI
// ============================================================

export const t = {
  ru: {
    // Навигация
    practice: 'Тренировка',
    history: 'История',
    dashboard: 'Статистика',
    // Режимы
    fullTest: 'Полный тест',
    sectionTest: 'Тренировка по разделу',
    chooseSection: 'Выберите раздел',
    chooseGrammar: 'Выберите язык грамматики',
    // Тест
    sectionOf: 'Раздел',
    of: 'из',
    questions: 'вопросов',
    minutes: 'минут',
    startSection: 'Начать раздел',
    nextQuestion: 'Следующий вопрос',
    finishSection: 'Завершить раздел',
    timeLeft: 'Осталось',
    // Части математики
    part: 'Часть',
    partComparison: 'Сравнение величин',
    partStandard: 'Задачи',
    columnA: 'Колонка А',
    columnB: 'Колонка Б',
    // Результаты
    yourScore: 'Ваш результат',
    correct: 'правильных',
    totalScore: 'Общий балл',
    tryAgain: 'Пройти ещё раз',
    goHome: 'На главную',
    nextSection: 'Следующий раздел →',
    viewResults: 'Посмотреть итог',
    weakSection: 'Перейти к слабому разделу',
    // История
    attempts: 'попыток',
    bestResult: 'Лучший результат',
    lastResult: 'Последний результат',
    average: 'Средний балл',
    noAttempts: 'Попыток пока нет',
    timeSpent: 'Затрачено',
    // Фильтры
    allSections: 'Все разделы',
    allModes: 'Все режимы',
    sortByDate: 'По дате',
    sortByScore: 'По баллу',
  },
  ky: {
    // Навигация
    practice: 'Машыгуу',
    history: 'Тарых',
    dashboard: 'Статистика',
    // Режимы
    fullTest: 'Толук тест',
    sectionTest: 'Бөлүм боюнча машыгуу',
    chooseSection: 'Бөлүм тандаңыз',
    chooseGrammar: 'Грамматика тилин тандаңыз',
    // Тест
    sectionOf: 'Бөлүм',
    of: 'ичинен',
    questions: 'суроо',
    minutes: 'мүнөт',
    startSection: 'Бөлүмдү баштоо',
    nextQuestion: 'Кийинки суроо',
    finishSection: 'Бөлүмдү бүтүрүү',
    timeLeft: 'Калды',
    // Части математики
    part: 'Бөлүк',
    partComparison: 'Чоңдуктарды салыштыруу',
    partStandard: 'Маселелер',
    columnA: 'А колонкасы',
    columnB: 'Б колонкасы',
    // Результаты
    yourScore: 'Сиздин натыйжаңыз',
    correct: 'туура',
    totalScore: 'Жалпы балл',
    tryAgain: 'Дагы бир жолу',
    goHome: 'Башкы бетке',
    nextSection: 'Кийинки бөлүм →',
    viewResults: 'Жыйынтыкты көрүү',
    weakSection: 'Алсыз бөлүмгө өтүү',
    // История
    attempts: 'аракет',
    bestResult: 'Эң жакшы натыйжа',
    lastResult: 'Акыркы натыйжа',
    average: 'Орточо балл',
    noAttempts: 'Азырынча аракет жок',
    timeSpent: 'Убакыт',
    // Фильтры
    allSections: 'Бардык бөлүмдөр',
    allModes: 'Бардык режимдер',
    sortByDate: 'Датасы боюнча',
    sortByScore: 'Балл боюнча',
  },
} as const

// ============================================================
// ТИПЫ
// ============================================================

export type Lang = 'ru' | 'ky'
export type TranslationKeys = keyof typeof t.ru
export type Translations = Record<TranslationKeys, string>

// ============================================================
// ХЕЛПЕРЫ
// ============================================================

// Возвращает варианты ответов в зависимости от типа вопроса и языка
export function getChoices(question: Question, lang: Lang): string[] {
  if (question.question_type === 'comparison') {
    return [...COMPARISON_CHOICES[lang]]
  }
  if (lang === 'ky' && question.choices_ky && question.choices_ky.length > 0) {
    return question.choices_ky
  }
  return question.choices_ru
}

// Возвращает тело вопроса на нужном языке
export function getBody(question: Question, lang: Lang): string {
  if (lang === 'ky' && question.body_ky) {
    return question.body_ky
  }
  return question.body_ru
}

// Форматирует таймер MM:SS
export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

// Возвращает цветовой класс по проценту результата
export function getScoreColor(percent: number): string {
  if (percent >= 80) return 'text-green-600'
  if (percent >= 50) return 'text-amber-600'
  return 'text-red-600'
}

export function getScoreBg(percent: number): string {
  if (percent >= 80) return 'bg-green-50 border-green-200'
  if (percent >= 50) return 'bg-amber-50 border-amber-200'
  return 'bg-red-50 border-red-200'
}

// Возвращает метаданные раздела с fallback
export function getSectionMeta(code: string) {
  return SECTION_META[code as SectionCode] ?? {
    icon: '📝',
    color: 'slate-600',
    bg: 'slate-50',
  }
}