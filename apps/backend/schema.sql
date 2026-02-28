-- Run this in the Supabase SQL editor to create the artifacts table

CREATE TABLE IF NOT EXISTS artifacts (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  location_id   TEXT NOT NULL,
  location_name TEXT NOT NULL,
  city          TEXT NOT NULL,
  era_id        TEXT NOT NULL,
  era_year      TEXT NOT NULL,
  era_label     TEXT NOT NULL,
  latitude      DOUBLE PRECISION,
  longitude     DOUBLE PRECISION,
  author_name   TEXT NOT NULL DEFAULT 'Anonymous',
  message       TEXT,
  emoji         TEXT DEFAULT '📍',
  share_token   TEXT UNIQUE DEFAULT encode(gen_random_bytes(6), 'hex')
);

ALTER TABLE artifacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "artifacts_select_public" ON artifacts FOR SELECT USING (true);
CREATE POLICY "artifacts_insert_public" ON artifacts FOR INSERT
  WITH CHECK (length(author_name) <= 50 AND (message IS NULL OR length(message) <= 200));
