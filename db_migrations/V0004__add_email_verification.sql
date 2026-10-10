ALTER TABLE t_p65598014_dream_ai_chatbot_1.users
  ADD COLUMN IF NOT EXISTS email_verified BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS verify_token VARCHAR(64),
  ADD COLUMN IF NOT EXISTS verify_expires TIMESTAMP;

UPDATE t_p65598014_dream_ai_chatbot_1.users SET email_verified = TRUE;

CREATE INDEX IF NOT EXISTS idx_users_verify_token
  ON t_p65598014_dream_ai_chatbot_1.users (verify_token);
