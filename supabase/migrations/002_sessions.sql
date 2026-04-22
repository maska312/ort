-- Сессия = одна попытка прохождения теста
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
