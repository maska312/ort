-- RLS для всех таблиц

-- sections — доступ на чтение всем
ALTER TABLE sections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sections_read_all" ON sections FOR SELECT USING (true);

-- practice_sessions — только свои данные
ALTER TABLE practice_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_sessions" ON practice_sessions FOR ALL USING (auth.uid() = user_id);

-- session_sections — через JOIN с practice_sessions
ALTER TABLE session_sections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_session_sections" ON session_sections FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM practice_sessions ps
      WHERE ps.id = session_sections.session_id
        AND ps.user_id = auth.uid()
    )
  );

-- answers — через JOIN с session_sections → practice_sessions
ALTER TABLE answers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_answers" ON answers FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM session_sections ss
      JOIN practice_sessions ps ON ps.id = ss.session_id
      WHERE ss.id = answers.session_section_id
        AND ps.user_id = auth.uid()
    )
  );

-- section_stats — только свои
ALTER TABLE section_stats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_section_stats" ON section_stats FOR ALL USING (auth.uid() = user_id);

-- Индексы для производительности
CREATE INDEX idx_practice_sessions_user ON practice_sessions(user_id);
CREATE INDEX idx_session_sections_session ON session_sections(session_id);
CREATE INDEX idx_answers_session_section ON answers(session_section_id);
CREATE INDEX idx_questions_section ON questions(section_id);
CREATE INDEX idx_section_stats_user ON section_stats(user_id);
