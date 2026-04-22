-- Агрегированная статистика по разделам
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
