-- Таблица разделов (справочник)
CREATE TABLE sections (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code           text UNIQUE NOT NULL,
  title_ru       text NOT NULL,
  title_ky       text NOT NULL,
  question_count int NOT NULL,
  time_limit_sec int NOT NULL
);

-- Seed-данные разделов
INSERT INTO sections (code, title_ru, title_ky, question_count, time_limit_sec) VALUES
  ('math',       'Математика',                                'Математика',                60, 5400),
  ('analogies',  'Аналогии и дополнения предложений',        'Аналогиялар',               30, 1800),
  ('reading',    'Чтение и понимание',                       'Окуу жана түшүнүү',         30, 3600),
  ('grammar_ru', 'Практическая грамматика русского языка',   'Орус тили грамматикасы',    30, 2100),
  ('grammar_ky', 'Практическая грамматика кыргызского языка','Кыргыз тили грамматикасы',  30, 2100);
