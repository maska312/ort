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

-- Ответы пользователей
CREATE TABLE answers (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_section_id  uuid REFERENCES session_sections NOT NULL,
  question_id         uuid REFERENCES questions NOT NULL,
  chosen_index        int NOT NULL,
  is_correct          boolean NOT NULL,
  answered_at         timestamptz DEFAULT now(),
  UNIQUE(session_section_id, question_id)
);

-- Seed-вопросы для тестирования (5 вопросов на каждый раздел)
INSERT INTO questions (section_id, body_ru, choices_ru, correct_index, order_index)
SELECT s.id,
  CASE s.code
    WHEN 'math' THEN 'Решите уравнение: $2x + ' || g || ' = ' || (2*g + 4) || '$'
    WHEN 'analogies' THEN 'КНИГА : ЧИТАТЕЛЬ = КАРТИНА : ?'
    WHEN 'reading' THEN 'Прочитайте текст и выберите правильный ответ (вопрос ' || g || ')'
    WHEN 'grammar_ru' THEN 'Выберите правильный вариант: "Мы ' || CASE g WHEN 1 THEN 'пошли' WHEN 2 THEN 'увидели' WHEN 3 THEN 'прочитали' WHEN 4 THEN 'написали' ELSE 'сделали' END || ' ..."'
    WHEN 'grammar_ky' THEN 'Туура вариантты тандаңыз (суроо ' || g || ')'
  END,
  CASE s.code
    WHEN 'math' THEN '["' || (g + 2) || '","' || (g + 1) || '","' || (g + 3) || '","' || g || '"]'
    ELSE '["Вариант A","Вариант B","Вариант C","Вариант D"]'
  END::jsonb,
  0,
  g
FROM sections s, generate_series(1, 5) g;
