-- Migration: Add Song Detail Columns to public.songs
-- Safety: Non-destructive. Preserves all existing columns, constraints, and data.

ALTER TABLE public.songs
  ADD COLUMN IF NOT EXISTS duration text,
  ADD COLUMN IF NOT EXISTS chords jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS sections jsonb DEFAULT '[]'::jsonb;

-- Optional GIN index for chord querying / filtering in catalog
CREATE INDEX IF NOT EXISTS idx_songs_chords_gin ON public.songs USING gin (chords);
