export const SECTION_META = {
  math:       { icon: '📐', color: 'blue-600',    bg: 'blue-50'    },
  analogies:  { icon: '🔤', color: 'violet-600',  bg: 'violet-50'  },
  reading:    { icon: '📖', color: 'cyan-600',     bg: 'cyan-50'    },
  grammar_ru: { icon: '✍️', color: 'emerald-600', bg: 'emerald-50' },
  grammar_ky: { icon: '✍️', color: 'emerald-600', bg: 'emerald-50' },
} as const

export const t = {
  ru: {
    // Навигация
    practice:       'Тренировка',
    history:        'История',
    dashboard:      'Статистика',
    // Режимы
    fullTest:       'Полный тест',
    sectionTest:    'Тренировка по разделу',
    chooseSection:  'Выберите раздел',
    chooseGrammar:  'Выберите язык грамматики',
    // Тест
    sectionOf:      'Раздел',
    of:             'из',
    questions:      'вопросов',
    minutes:        'минут',
    startSection:   'Начать раздел',
    nextQuestion:   'Следующий вопрос',
    finishSection:  'Завершить раздел',
    timeLeft:       'Осталось',
    // Результаты
    yourScore:      'Ваш результат',
    correct:        'правильных',
    totalScore:     'Общий балл',
    tryAgain:       'Пройти ещё раз',
    goHome:         'На главную',
    nextSection:    'Следующий раздел →',
    viewResults:    'Посмотреть итог',
    weakSection:    'Перейти к слабому разделу',
    // История
    attempts:       'попыток',
    bestResult:     'Лучший результат',
    lastResult:     'Последний результат',
    average:        'Средний балл',
    noAttempts:     'Попыток пока нет',
    timeSpent:      'Затрачено',
    // Фильтры
    allSections:    'Все разделы',
    allModes:       'Все режимы',
    sortByDate:     'По дате',
    sortByScore:    'По баллу',
  },
  ky: {
    practice:       'Машыгуу',
    history:        'Тарых',
    dashboard:      'Статистика',
    fullTest:       'Толук тест',
    sectionTest:    'Бөлүм боюнча машыгуу',
    chooseSection:  'Бөлүм тандаңыз',
    chooseGrammar:  'Грамматика тилин тандаңыз',
    sectionOf:      'Бөлүм',
    of:             'ичинен',
    questions:      'суроо',
    minutes:        'мүнөт',
    startSection:   'Бөлүмдү баштоо',
    nextQuestion:   'Кийинки суроо',
    finishSection:  'Бөлүмдү бүтүрүү',
    timeLeft:       'Калды',
    yourScore:      'Сиздин натыйжаңыз',
    correct:        'туура',
    totalScore:     'Жалпы балл',
    tryAgain:       'Дагы бир жолу',
    goHome:         'Башкы бетке',
    nextSection:    'Кийинки бөлүм →',
    viewResults:    'Жыйынтыкты көрүү',
    weakSection:    'Алсыз бөлүмгө өтүү',
    attempts:       'аракет',
    bestResult:     'Эң жакшы натыйжа',
    lastResult:     'Акыркы натыйжа',
    average:        'Орточо балл',
    noAttempts:     'Азырынча аракет жок',
    timeSpent:      'Убакыт',
    allSections:    'Бардык бөлүмдөр',
    allModes:       'Бардык режимдер',
    sortByDate:     'Датасы боюнча',
    sortByScore:    'Балл боюнча',
  }
} as const

export type Lang = 'ru' | 'ky'
export type TranslationKeys = keyof typeof t.ru
export type Translations = Record<TranslationKeys, string>

