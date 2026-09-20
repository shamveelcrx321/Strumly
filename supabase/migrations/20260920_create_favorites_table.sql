-- Migration: Create favorites table with Row Level Security
-- Table: public.favorites
-- Safety: Non-destructive. References auth.users(id) and public.songs(id) with ON DELETE CASCADE.

CREATE TABLE IF NOT EXISTS public.favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  song_id uuid NOT NULL REFERENCES public.songs(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT favorites_user_id_song_id_key UNIQUE (user_id, song_id)
);

-- Performance indexes for querying favorites by user or song
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON public.favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_song_id ON public.favorites(song_id);

-- Enable Row Level Security
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- 1. SELECT Policy: Authenticated users can only read their own favorites
CREATE POLICY "Authenticated users can select their own favorites"
  ON public.favorites
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- 2. INSERT Policy: Authenticated users can only insert favorites for themselves
CREATE POLICY "Authenticated users can insert their own favorites"
  ON public.favorites
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 3. DELETE Policy: Authenticated users can only delete their own favorites
CREATE POLICY "Authenticated users can delete their own favorites"
  ON public.favorites
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
