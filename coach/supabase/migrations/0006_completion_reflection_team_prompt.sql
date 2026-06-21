ALTER TABLE challenge_completions
  ADD COLUMN reflection TEXT,
  ADD COLUMN is_team_prompt BOOLEAN NOT NULL DEFAULT FALSE;
