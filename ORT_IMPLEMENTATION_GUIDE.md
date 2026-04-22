# ORT Prep — Инструкция по имплементации для IDE

> **Правило №1:** Перед каждым шагом заново прочитай раздел «Структура проекта» в этом файле.
> **Правило №2:** Не приступай к следующему шагу, пока текущий полностью не завершён и не проверен.
> **Правило №3:** После каждого шага запускай `npm run build` — проект должен компилироваться без ошибок.

---

## Стек

| Технология | Версия | Назначение |
|---|---|---|
| Next.js | 14 (App Router) | Фреймворк |
| TypeScript | strict | Типизация |
| Tailwind CSS | 3.x | Стили |
| Shadcn/UI | latest | UI-компоненты |
| Lucide Icons | latest | Иконки |
| Supabase | latest | Auth + Postgres |
| Zustand | latest | Стейт-менеджмент |
| Zod | latest | Валидация |
| Recharts | latest | Графики |
| react-markdown | latest | Рендер вопросов |
| remark-math | latest | LaTeX в вопросах |
| rehype-katex | latest | LaTeX CSS |

---

## Структура проекта (читать перед каждым шагом)

```
ort-prep/
├── app/
│   ├── layout.tsx                          # Корневой layout
│   ├── page.tsx                            # Лендинг / редирект
│   ├── dashboard/
│   │   └── page.tsx                        # Главная: прогресс + последние попытки
│   ├── practice/
│   │   ├── page.tsx                        # Выбор режима
│   │   ├── section/
│   │   │   └── [sectionCode]/
│   │   │       └── page.tsx                # Старт раздела (mode='section')
│   │   └── full/
│   │       └── page.tsx                    # Старт полного теста (mode='full')
│   ├── quiz/
│   │   └── [sessionId]/
│   │       └── page.tsx                    # Страница прохождения теста
│   ├── history/
│   │   ├── page.tsx                        # Список всех попыток
│   │   └── [sessionId]/
│   │       └── page.tsx                    # Детальный разбор попытки
│   └── results/
│       └── [sessionId]/
│           └── page.tsx                    # Итоговый экран после теста
│
├── components/
│   ├── quiz/
│   │   ├── QuizShell.tsx                   # Оркестратор фаз теста
│   │   ├── QuizHeader.tsx                  # Таймер + прогресс + навигация
│   │   ├── QuizSectionIntro.tsx            # Экран перед стартом раздела
│   │   ├── QuizCard.tsx                    # Карточка вопроса (LaTeX)
│   │   ├── QuizChoices.tsx                 # Варианты ответов A–D
│   │   ├── QuizSectionResult.tsx           # Результат одного раздела
│   │   └── QuizFinalResult.tsx             # Итог полного теста
│   ├── practice/
│   │   └── SectionPicker.tsx               # Грид карточек разделов
│   ├── history/
│   │   ├── AttemptList.tsx                 # Список попыток с фильтром
│   │   ├── AttemptCard.tsx                 # Карточка одной попытки
│   │   ├── AttemptDetail.tsx               # Детальный разбор попытки
│   │   └── SectionProgressChart.tsx        # График динамики (Recharts)
│   └── dashboard/
│       ├── StatsOverview.tsx               # Сводная статистика
│       ├── SectionStatCard.tsx             # Карточка раздела
│       └── RecentAttempts.tsx              # Последние 5 попыток
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts                       # Supabase клиент (браузер)
│   │   ├── server.ts                       # Supabase клиент (сервер/RSC)
│   │   ├── types.ts                        # Все TypeScript-типы доменной модели
│   │   ├── quiz.ts                         # Функции прохождения теста
│   │   └── history.ts                      # Функции истории и статистики
│   └── i18n/
│       └── quiz.ts                         # UI-строки ru/ky
│
├── store/
│   └── quizStore.ts                        # Zustand: состояние активной сессии
│
├── supabase/
│   └── migrations/
│       ├── 001_sections.sql                # Таблица разделов + seed
│       ├── 002_sessions.sql                # practice_sessions + session_sections
│       ├── 003_questions_answers.sql       # questions + answers
│       ├── 004_section_stats.sql           # section_stats + RLS
│       └── 005_rls.sql                     # RLS-политики для всех таблиц
│
└── contexts/
    └── LangContext.tsx                     # React Context для ru/ky
```

---

## Доменная модель ОРТ

### Разделы (фиксированные)

| code | Название | Вопросов | Время |
|---|---|---|---|
| `math` | Математика | 60 | 90 мин (5400 сек) |
| `analogies` | Аналогии и дополнения предложений | 30 | 30 мин (1800 сек) |
| `reading` | Чтение и понимание | 30 | 60 мин (3600 сек) |
| `grammar_ru` | Практическая грамматика русского языка | 30 | 35 мин (2100 сек) |
| `grammar_ky` | Практическая грамматика кыргызского языка | 30 | 35 мин (2100 сек) |

> `grammar_ru` и `grammar_ky` — взаимоисключающие. В полном тесте пользователь выбирает один.

### Два режима

- **`mode: 'full'`** — все 4 раздела последовательно, итоговый балл = сумма
- **`mode: 'section'`** — один раздел на выбор, отдельный результат

---

## База данных (справочно)

```sql
-- sections (справочник)
CREATE TABLE sections (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code           text UNIQUE NOT NULL,
  title_ru       text NOT NULL,
  title_ky       text NOT NULL,
  question_count int NOT NULL,
  time_limit_sec int NOT NULL
);

-- Сессия = одна попытка
CREATE TABLE practice_sessions (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid REFERENCES auth.users NOT NULL,
  mode          text NOT NULL CHECK (mode IN ('full', 'section')),
  grammar_lang  text CHECK (grammar_lang IN ('ru', 'ky')),
  status        text NOT NULL DEFAULT 'active'
                  CHECK (status IN ('active', 'finished', 'abandoned')),
  started_at    timestamptz DEFAULT now(),
  finished_at   timestamptz,
  total_score   int,
  max_score     int
);

-- Разделы внутри сессии
CREATE TABLE session_sections (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id     uuid REFERENCES practice_sessions NOT NULL,
  section_id     uuid REFERENCES sections NOT NULL,
  order_index    int NOT NULL DEFAULT 0,
  status         text NOT NULL DEFAULT 'pending'
                   CHECK (status IN ('pending', 'active', 'finished')),
  started_at     timestamptz,
  finished_at    timestamptz,
  score          int,
  max_score      int,
  time_spent_sec int
);

-- Вопросы
CREATE TABLE questions (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id    uuid REFERENCES sections NOT NULL,
  body_ru       text NOT NULL,
  body_ky       text,
  choices_ru    jsonb NOT NULL,
  choices_ky    jsonb,
  correct_index int NOT NULL,
  explanation   text,
  order_index   int NOT NULL DEFAULT 0
);

-- Ответы
CREATE TABLE answers (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_section_id  uuid REFERENCES session_sections NOT NULL,
  question_id         uuid REFERENCES questions NOT NULL,
  chosen_index        int NOT NULL,
  is_correct          boolean NOT NULL,
  answered_at         timestamptz DEFAULT now(),
  UNIQUE(session_section_id, question_id)
);

-- Агрегированная статистика
CREATE TABLE section_stats (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           uuid REFERENCES auth.users NOT NULL,
  section_id        uuid REFERENCES sections NOT NULL,
  attempts_count    int NOT NULL DEFAULT 0,
  best_score        int NOT NULL DEFAULT 0,
  best_percent      numeric(5,2) NOT NULL DEFAULT 0,
  last_score        int,
  last_percent      numeric(5,2),
  last_attempted_at timestamptz,
  avg_percent       numeric(5,2),
  UNIQUE(user_id, section_id)
);
```

---

## Цветовая система

| Назначение | Цвет | Класс Tailwind |
|---|---|---|
| Акцент / primary | `#2563EB` | `blue-600` |
| Фон страницы | `#F8FAFC` | `slate-50` |
| Карточки | `#FFFFFF` | `white` |
| Текст основной | `#0F172A` | `slate-900` |
| Текст вторичный | `#64748B` | `slate-500` |
| Правильный ответ | `#16A34A` | `green-600` |
| Неправильный ответ | `#DC2626` | `red-600` |
| Предупреждение (таймер) | `#DC2626` + pulse | `red-600 animate-pulse` |
| Раздел math | `#2563EB` | `blue-600` |
| Раздел analogies | `#7C3AED` | `violet-600` |
| Раздел reading | `#0891B2` | `cyan-600` |
| Раздел grammar | `#059669` | `emerald-600` |
| Уровень < 50% | `#DC2626` | `red-600` |
| Уровень 50–79% | `#D97706` | `amber-600` |
| Уровень ≥ 80% | `#16A34A` | `green-600` |

---

---

# ПЛАН ИМПЛЕМЕНТАЦИИ

---

## ШАГ 0 — Инициализация проекта и окружения

> **Цель:** Рабочий скелет проекта с подключённым Supabase и настроенным стеком.

### Задачи

1. Создать новый Next.js проект:
   ```bash
   npx create-next-app@latest ort-prep --typescript --tailwind --app --src-dir=false --import-alias="@/*"
   ```

2. Установить все зависимости:
   ```bash
   npm install @supabase/supabase-js @supabase/ssr zustand zod recharts
   npm install react-markdown remark-math rehype-katex katex
   npm install lucide-react
   npx shadcn@latest init
   npx shadcn@latest add button card progress badge tabs accordion separator skeleton
   ```

3. Создать `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   ```

4. Создать `lib/supabase/client.ts` и `lib/supabase/server.ts` по документации Supabase SSR.

5. Создать `contexts/LangContext.tsx` с провайдером `lang: 'ru' | 'ky'`.

6. Настроить `app/layout.tsx`: подключить LangContext, KaTeX CSS, базовые метаданные.

### Критерий завершения
- `npm run build` без ошибок
- Supabase клиент инициализируется без ошибок
- Страница `app/page.tsx` рендерится

---

## ШАГ 1 — Миграции базы данных и seed-данные

> **Цель:** Полная схема БД в Supabase с тестовыми данными.

> ⚠️ Перед началом: прочитай раздел «База данных» в этом файле.

### Задачи

1. Создать и применить миграции в порядке:

   **`001_sections.sql`** — таблица `sections` + seed:
   ```sql
   CREATE TABLE sections ( ... );
   INSERT INTO sections (code, title_ru, title_ky, question_count, time_limit_sec) VALUES
     ('math',       'Математика',                                'Математика',                60, 5400),
     ('analogies',  'Аналогии и дополнения предложений',        'Аналогиялар',               30, 1800),
     ('reading',    'Чтение и понимание',                       'Окуу жана түшүнүү',         30, 3600),
     ('grammar_ru', 'Практическая грамматика русского языка',   'Орус тили грамматикасы',    30, 2100),
     ('grammar_ky', 'Практическая грамматика кыргызского языка','Кыргыз тили грамматикасы',  30, 2100);
   ```

   **`002_sessions.sql`** — `practice_sessions` + `session_sections`

   **`003_questions_answers.sql`** — `questions` + `answers`

   **`004_section_stats.sql`** — `section_stats`

   **`005_rls.sql`** — RLS-политики для всех таблиц:
   ```sql
   ALTER TABLE practice_sessions ENABLE ROW LEVEL SECURITY;
   ALTER TABLE session_sections  ENABLE ROW LEVEL SECURITY;
   ALTER TABLE answers            ENABLE ROW LEVEL SECURITY;
   ALTER TABLE section_stats      ENABLE ROW LEVEL SECURITY;

   CREATE POLICY "own data" ON practice_sessions FOR ALL USING (auth.uid() = user_id);
   -- аналогично для остальных таблиц через JOIN
   ```

2. Добавить **seed-вопросы для тестирования** (минимум 5 вопросов на каждый раздел, можно placeholder):
   ```sql
   INSERT INTO questions (section_id, body_ru, choices_ru, correct_index)
   SELECT s.id, 'Тестовый вопрос ' || g, '["Вариант A","Вариант B","Вариант C","Вариант D"]'::jsonb, 0
   FROM sections s, generate_series(1,5) g
   WHERE s.code = 'math';
   -- повторить для всех разделов
   ```

### Критерий завершения
- Все 5 таблиц созданы в Supabase Dashboard
- `SELECT * FROM sections` возвращает 5 строк
- RLS включён, анонимный запрос к `practice_sessions` возвращает пустой массив (не ошибку)
- В каждом разделе есть минимум 5 тестовых вопросов

---

## ШАГ 2 — TypeScript-типы и i18n

> **Цель:** Единый источник правды для типов и строк интерфейса.

> ⚠️ Перед началом: прочитай раздел «Структура проекта» и «Доменная модель».

### Задачи

1. Создать `lib/supabase/types.ts` со всеми типами:

```typescript
// Справочник
export type Section = {
  id: string
  code: 'math' | 'analogies' | 'reading' | 'grammar_ru' | 'grammar_ky'
  title_ru: string
  title_ky: string
  question_count: number
  time_limit_sec: number
}

// Вопрос
export type Question = {
  id: string
  section_id: string
  body_ru: string
  body_ky?: string
  choices_ru: string[]
  choices_ky?: string[]
  correct_index: number
  explanation?: string
  order_index: number
}

// Сессия
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

// Раздел сессии
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

// Ответ
export type Answer = {
  id: string
  session_section_id: string
  question_id: string
  chosen_index: number
  is_correct: boolean
  answered_at: string
}

// Результат раздела
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

// История
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

export type AttemptDetail = AttemptSummary & {
  sections: SectionResult[]
}

// Статистика
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
```

2. Создать `lib/i18n/quiz.ts`:

```typescript
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
export type Translations = typeof t.ru
```

### Критерий завершения
- `npm run build` без ошибок TypeScript
- Все типы экспортируются без `any`
- i18n-объект покрывает все UI-строки обоих языков

---

## ШАГ 3 — Supabase-функции: прохождение теста

> **Цель:** Реализовать все серверные функции для запуска и прохождения теста.

> ⚠️ Перед началом: прочитай раздел «База данных» и «Структура проекта».

### Файл: `lib/supabase/quiz.ts`

Реализовать функции строго в этом порядке:

```typescript
// 1. Создать сессию и подготовить разделы
export async function createPracticeSession(
  mode: 'full' | 'section',
  sectionCode?: string,
  grammarLang?: 'ru' | 'ky'
): Promise<InitPayload>
// Логика:
// - Создать запись в practice_sessions
// - Для mode='section': найти section по sectionCode, создать 1 session_section
// - Для mode='full': создать 4 session_sections (math, analogies, reading, grammar_ru/ky)
//   в правильном порядке (order_index 0–3)
// - Вернуть InitPayload для инициализации стора

// 2. Загрузить вопросы раздела (перемешанные)
export async function loadQuestions(
  sessionSectionId: string
): Promise<Question[]>
// Логика:
// - Получить section_id из session_sections
// - Загрузить вопросы этого раздела
// - Перемешать через Fisher-Yates shuffle
// - Обновить session_sections.status = 'active', started_at = now()
// - Вернуть вопросы

// 3. Сохранить ответ (upsert)
export async function saveAnswer(
  sessionSectionId: string,
  questionId: string,
  chosenIndex: number,
  correctIndex: number
): Promise<void>
// Логика:
// - upsert в answers с is_correct = (chosenIndex === correctIndex)

// 4. Завершить раздел
export async function finishSection(
  sessionSectionId: string,
  timeSpentSec: number
): Promise<SectionResult>
// Логика:
// - Подсчитать score = COUNT(is_correct = true) из answers
// - Обновить session_sections: status='finished', finished_at, score, time_spent_sec
// - Вызвать upsertSectionStats (из history.ts)
// - Вернуть SectionResult

// 5. Завершить всю сессию (только mode='full')
export async function finishSession(
  sessionId: string
): Promise<FinalResult>
// Логика:
// - Получить все session_sections со scores
// - Суммировать total_score
// - Обновить practice_sessions: status='finished', finished_at, total_score
// - Вернуть FinalResult
```

### Критерий завершения
- Все 5 функций реализованы с типизацией через Zod
- Каждая функция обёрнута в try/catch с информативными ошибками
- Протестировать вручную через Supabase Dashboard или простой тест-скрипт

---

## ШАГ 4 — Zustand Store

> **Цель:** Глобальное состояние для активной сессии теста с корректной логикой таймера.

> ⚠️ Перед началом: прочитай раздел «Структура проекта» и типы из `lib/supabase/types.ts`.

### Файл: `store/quizStore.ts`

```typescript
import { create } from 'zustand'
import { Question, SessionSection, SectionResult, InitPayload } from '@/lib/supabase/types'

type Phase = 'idle' | 'intro' | 'active' | 'section_result' | 'final_result'

type QuizStore = {
  // Сессия
  sessionId: string | null
  mode: 'full' | 'section' | null

  // Очередь разделов
  sectionQueue: SessionSection[]
  currentSectionIndex: number

  // Текущий раздел
  sessionSectionId: string | null
  questions: Question[]
  currentQuestionIndex: number
  answers: Record<string, number>   // questionId → chosenIndex
  timeLeft: number                   // секунды
  lastSectionResult: SectionResult | null

  // Фаза UI
  phase: Phase

  // Действия
  initSession: (payload: InitPayload) => void
  setQuestions: (questions: Question[]) => void
  startCurrentSection: () => void
  setAnswer: (questionId: string, chosenIndex: number) => void
  goToNextQuestion: () => void
  tick: () => void
  finishCurrentSection: (result: SectionResult) => void
  proceedToNextSection: () => void
  finishSession: () => void
  reset: () => void
}
```

### Критические требования к реализации

- **`tick()`**: если `timeLeft <= 0` — НЕ вызывать async функции напрямую. Установить флаг `timeExpired: true`, который QuizShell отловит через `useEffect` и вызовет `finishSection`.
- **`setAnswer()`**: сохранять только локально в стор. Вызов `saveAnswer()` из Supabase делается в компоненте `QuizChoices` после обновления стора.
- **`proceedToNextSection()`**: инкрементировать `currentSectionIndex`, сбросить `questions`, `answers`, `currentQuestionIndex`, `timeLeft`, установить `phase = 'intro'`.
- **`reset()`**: полный сброс в начальное состояние (вызывается при навигации прочь).

### Критерий завершения
- Стор создан, все экшены реализованы
- Логика `timeExpired` флага задокументирована комментарием
- `npm run build` без ошибок

---

## ШАГ 5 — Компоненты Quiz UI

> **Цель:** Полный UI для прохождения теста.

> ⚠️ Перед началом: прочитай всю структуру компонентов в разделе «Структура проекта».

### Порядок реализации компонентов (строго по порядку)

#### 5.1 `QuizChoices.tsx`
Варианты ответов A–D. Пропсы:
```typescript
type Props = {
  choices: string[]
  selectedIndex: number | null
  correctIndex: number | null   // null пока не выбран ответ
  onSelect: (index: number) => void
  lang: 'ru' | 'ky'
}
```
Состояния кнопки: `default` → `selected` → после подтверждения: `correct` (зелёный) / `incorrect` (красный) + показать правильный.
Размер: `min-h-[56px]`, `rounded-2xl`, touch-friendly.

#### 5.2 `QuizCard.tsx`
Карточка вопроса с LaTeX. Пропсы:
```typescript
type Props = {
  question: Question
  questionNumber: number
  totalQuestions: number
  lang: 'ru' | 'ky'
}
```
Использовать `ReactMarkdown` с `remarkMath` и `rehypeKatex` для рендера формул.

#### 5.3 `QuizHeader.tsx`
Фиксированный хедер. Пропсы:
```typescript
type Props = {
  sectionTitle: string
  currentSection: number    // 1-based
  totalSections: number
  currentQuestion: number   // 1-based
  totalQuestions: number
  timeLeft: number          // секунды
  lang: 'ru' | 'ky'
}
```
Таймер: форматировать как `MM:SS`. При `timeLeft <= 300` — класс `text-red-600 animate-pulse`.
Прогресс: Shadcn `<Progress>` — прогресс внутри текущего раздела.

#### 5.4 `QuizSectionIntro.tsx`
Экран перед стартом раздела:
- Иконка и название раздела
- Плашки: «N вопросов» и «N минут»
- Если `mode='full'`: «Раздел X из 4»
- Кнопка «Начать» → вызывает `loadQuestions()` → `startCurrentSection()`

#### 5.5 `QuizSectionResult.tsx`
После завершения раздела:
- Балл X из Y + цветовая индикация уровня
- Список вопросов с ✓/✗ и правильным ответом
- Если `mode='section'`: «Пройти ещё раз» + «На главную»
- Если `mode='full'` и не последний: «Следующий раздел →»
- Если `mode='full'` и последний: «Посмотреть итог»

#### 5.6 `QuizFinalResult.tsx`
Только для `mode='full'`:
```
| Раздел     | Правильных | Балл |
|------------|------------|------|
| Математика | 45/60      | 45   |
| ...        | ...        | ...  |
| Итого      | 119/150    | 119  |
```
Кнопка «Перейти к слабому разделу» — автоматически определять раздел с наименьшим %.

#### 5.7 `QuizShell.tsx`
Оркестратор. Рендерит нужный компонент в зависимости от `phase`:
```typescript
// idle         → null (редирект на /practice)
// intro        → <QuizSectionIntro />
// active       → <QuizHeader /> + <QuizCard /> + <QuizChoices />
// section_result → <QuizSectionResult />
// final_result → <QuizFinalResult />
```
Здесь же: `setInterval` для `tick()`, `useEffect` для отслеживания `timeExpired`.

### Критерий завершения
- Все 7 компонентов реализованы
- Прохождение одного раздела работает end-to-end: intro → вопросы → результат
- Таймер корректно останавливается при завершении раздела
- LaTeX формулы рендерятся (проверить с `$x^2 + y^2 = z^2$`)

---

## ШАГ 6 — Страницы Practice и Quiz

> **Цель:** Маршруты для выбора режима и прохождения теста.

> ⚠️ Перед началом: прочитай раздел «Структура проекта», особенно `app/` директорию.

### 6.1 `app/practice/page.tsx`

Два блока:

**Блок 1 — Тренировка по разделу** (`SectionPicker`):
- Грид 2×2 карточек (math, analogies, reading, grammar)
- Для grammar — модалка выбора языка (ru/ky) перед переходом
- Каждая карточка: иконка, название, кол-во вопросов, время, статистика (если есть)

**Блок 2 — Полный тест**:
- Одна карточка: 150 вопросов, ~215 минут
- Кнопка → модалка выбора языка грамматики → `createPracticeSession('full', ...)` → редирект на `/quiz/[sessionId]`

### 6.2 `components/practice/SectionPicker.tsx`

```typescript
type Props = {
  stats: SectionStats[]   // может быть пустым для новых пользователей
  lang: 'ru' | 'ky'
  onSelectSection: (code: string, grammarLang?: 'ru' | 'ky') => void
}
```

### 6.3 `app/practice/section/[sectionCode]/page.tsx`

Server Component. Принимает `sectionCode` из params.
Вызывает `createPracticeSession('section', sectionCode)` → редирект на `/quiz/[sessionId]`.

### 6.4 `app/quiz/[sessionId]/page.tsx`

Client Component (`'use client'`).
- При монтировании: `initSession(payload)` в стор
- Рендерит `<QuizShell />`
- При `phase = 'final_result'` или завершении: редирект на `/results/[sessionId]`

### 6.5 `app/results/[sessionId]/page.tsx`

Server Component.
- Загружает результат через `getSessionResult(sessionId)`
- Рендерит `<QuizFinalResult />` или `<QuizSectionResult />` в зависимости от `mode`

### Критерий завершения
- Полный флоу работает: `/practice` → выбор → `/quiz/[id]` → тест → `/results/[id]`
- Оба режима (`full` и `section`) проходимы до конца
- Grammar-раздел: модалка выбора языка работает корректно

---

## ШАГ 7 — Supabase-функции: история и статистика

> **Цель:** Реализовать все функции для истории попыток и агрегированной статистики.

> ⚠️ Перед началом: прочитай типы `AttemptSummary`, `AttemptDetail`, `SectionStats`, `ProgressPoint` из `lib/supabase/types.ts`.

### Файл: `lib/supabase/history.ts`

```typescript
// 1. История попыток с фильтрацией и пагинацией
export async function getAttemptHistory(
  userId: string,
  filters: { sectionCode?: string; mode?: 'full' | 'section' },
  pagination: { page: number; pageSize: number }
): Promise<{ attempts: AttemptSummary[]; total: number }>

// 2. Детальный разбор попытки (с вопросами и ответами)
export async function getAttemptDetail(
  sessionId: string
): Promise<AttemptDetail>

// 3. Статистика по всем разделам пользователя
export async function getSectionStats(
  userId: string
): Promise<SectionStats[]>

// 4. Динамика прогресса по разделу
export async function getSectionProgress(
  userId: string,
  sectionCode: string,
  limit?: number   // default: 10
): Promise<ProgressPoint[]>

// 5. Обновить агрегаты (вызывается из finishSection в quiz.ts)
export async function upsertSectionStats(
  userId: string,
  sectionId: string,
  score: number,
  maxScore: number
): Promise<void>
// Логика upsert:
// - Если запись есть: пересчитать avg_percent, обновить best если нужно, last
// - Если нет: создать с attempts_count=1
```

### Критерий завершения
- Все 5 функций реализованы
- `upsertSectionStats` вызывается в `finishSection` из `quiz.ts`
- После завершения попытки данные корректно появляются в `section_stats`

---

## ШАГ 8 — Страницы History и Dashboard

> **Цель:** Страницы просмотра истории и статистики прогресса.

> ⚠️ Перед началом: прочитай компоненты в `components/history/` и `components/dashboard/`.

### 8.1 `app/history/page.tsx` + `AttemptList.tsx` + `AttemptCard.tsx`

**`AttemptCard`** — карточка попытки:
```
┌─────────────────────────────────────────────────────┐
│ Математика · Раздел                  14 апр, 14:32   │
│ ████████████░░░░  45 / 60 правильных   75%  🟡       │
│ Затрачено: 67 мин из 90                              │
│                                    [Подробнее →]     │
└─────────────────────────────────────────────────────┘
```

**`AttemptList`** — фильтры:
- По разделу: все / math / analogies / reading / grammar
- По режиму: все / section / full
- Сортировка: по дате (по умолчанию) / по баллу
- Пагинация: 20 на страницу (Shadcn `Pagination`)

### 8.2 `app/history/[sessionId]/page.tsx` + `AttemptDetail.tsx`

- Шапка: дата, режим, итог, время
- Для `mode='full'`: Shadcn `Tabs` по разделам
- Список вопросов: тело, выбранный ответ, правильный ответ
- Неверные ответы: Shadcn `Accordion` с объяснением (если `explanation` заполнено)
- Кнопка «Пройти этот раздел заново» → `/practice/section/[code]`

### 8.3 `app/dashboard/page.tsx`

**`StatsOverview`** — три цифры:
- Всего попыток
- Часов в практике (sum of time_spent_sec / 3600)
- Средний балл по последним 10 попыткам

**`SectionStatCard`** — для каждого из 4 разделов:
```
┌─────────────────────────────────┐
│ 📐 Математика                   │
│ Попыток: 12                     │
│ Лучший: 52/60 (87%)  🟢         │
│ Последний: 45/60 (75%) ↑        │
│ Средний: 71%                    │
│ [████████████░░░░] 75%          │
│      [Тренироваться →]          │
└─────────────────────────────────┘
```
Стрелка ↑/↓ сравнивает `last_percent` с предпоследней попыткой.

**`SectionProgressChart`** — Recharts `LineChart`:
- Ось X: дата, ось Y: % правильных (0–100)
- Линия для каждого активного раздела (цвет из `SECTION_META`)
- Тултип при hover: дата + балл
- Показывать только разделы с ≥2 попытками

**`RecentAttempts`** — последние 5 попыток в виде `AttemptCard` без кнопки деталей (или с ней).

### Критерий завершения
- Страница истории работает с фильтрами и пагинацией
- Детальный разбор показывает вопросы и ответы
- Dashboard показывает актуальную статистику
- График рендерится для разделов с данными

---

## ШАГ 9 — Аутентификация

> **Цель:** Auth через Supabase, защита маршрутов, базовый профиль.

> ⚠️ Перед началом: прочитай всю структуру `app/` и проверь, что RLS-политики из шага 1 работают.

### Задачи

1. **`app/auth/login/page.tsx`** — форма входа (email + password или magic link)
2. **`app/auth/register/page.tsx`** — форма регистрации
3. **`middleware.ts`** — защита маршрутов:
   ```typescript
   // Публичные: /auth/*, /
   // Защищённые: /dashboard, /practice, /quiz/*, /history, /results/*
   ```
4. **Навбар** — показывать имя пользователя, кнопку выхода, переключатель языка (ru/ky)
5. **Выбор языка** — сохранять `lang` в `localStorage` и/или профиле пользователя

### Критерий завершения
- Незалогиненный пользователь редиректится на `/auth/login`
- После входа попадает на `/dashboard`
- Выход работает, стор сбрасывается (`reset()`)
- RLS работает: пользователь A не видит данные пользователя B

---

## ШАГ 10 — Полировка и финальная проверка

> **Цель:** Устранить edge cases, добавить loading states, проверить мобильную версию.

> ⚠️ Перед началом: прочитай ВСЮ структуру проекта и пройди все ключевые флоу вручную.

### Чеклист

#### Edge cases
- [ ] Пользователь закрыл вкладку во время теста → статус остался `active`. Добавить обработку: при открытии `/quiz/[id]` проверять статус сессии, если `active` — предложить продолжить или начать заново
- [ ] Таймер истёк в момент перехода на следующий вопрос — не должно быть двойного вызова `finishSection`
- [ ] `grammar_ru` и `grammar_ky` в `SectionPicker` — показывать как одну карточку «Грамматика» с выбором языка

#### Loading & Error States
- [ ] Skeleton-лоадеры для `SectionPicker` (пока грузится статистика)
- [ ] Skeleton для `AttemptList`
- [ ] Error boundary для `QuizShell`
- [ ] Toast-уведомление при ошибке сохранения ответа (Shadcn `useToast`)

#### Мобильная версия
- [ ] `QuizChoices` — кнопки не обрезаются на 320px
- [ ] `QuizHeader` — таймер и прогресс помещаются на малом экране
- [ ] `SectionProgressChart` — горизонтальный скролл на мобиле
- [ ] `AttemptDetail` — таблица адаптивна

#### Производительность
- [ ] `loadQuestions` — добавить `limit` (не грузить все 60 вопросов сразу если не нужно, или убедиться что это приемлемо)
- [ ] `getAttemptHistory` — убедиться что индексы на `user_id` и `started_at` созданы в БД

#### Финальные SQL-индексы
```sql
CREATE INDEX idx_practice_sessions_user ON practice_sessions(user_id);
CREATE INDEX idx_session_sections_session ON session_sections(session_id);
CREATE INDEX idx_answers_session_section ON answers(session_section_id);
CREATE INDEX idx_questions_section ON questions(section_id);
CREATE INDEX idx_section_stats_user ON section_stats(user_id);
```

### Критерий завершения
- Все пункты чеклиста отмечены
- Полный тест (mode='full') проходится от начала до финального результата
- Режим одного раздела проходится и результат сохраняется в историю
- Страница `/dashboard` показывает актуальные данные после попытки
- `npm run build` — 0 ошибок, 0 предупреждений TypeScript

---

## Сводная таблица шагов

| Шаг | Название | Файлы | Зависит от |
|---|---|---|---|
| 0 | Инициализация проекта | `package.json`, `layout.tsx`, `client.ts` | — |
| 1 | Миграции БД | `supabase/migrations/*.sql` | 0 |
| 2 | Типы и i18n | `lib/supabase/types.ts`, `lib/i18n/quiz.ts` | 1 |
| 3 | Supabase quiz.ts | `lib/supabase/quiz.ts` | 2 |
| 4 | Zustand Store | `store/quizStore.ts` | 2, 3 |
| 5 | Quiz UI компоненты | `components/quiz/*.tsx` | 2, 4 |
| 6 | Страницы Practice + Quiz | `app/practice/**`, `app/quiz/**`, `app/results/**` | 3, 5 |
| 7 | Supabase history.ts | `lib/supabase/history.ts` | 2, 3 |
| 8 | Страницы History + Dashboard | `app/history/**`, `app/dashboard/**`, `components/history/**`, `components/dashboard/**` | 7 |
| 9 | Аутентификация | `app/auth/**`, `middleware.ts` | 6, 8 |
| 10 | Полировка | все файлы | 9 |

---

*Документ актуален для MVP Основного ОРТ. Предметный ОРТ — следующая итерация.*
