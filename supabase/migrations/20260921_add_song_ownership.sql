-- Migration: Add uploaded_by column and configure RLS for song ownership
-- Table: public.songs
-- Safety: Non-destructive. Column is nullable so all existing catalog songs remain valid and publicly discoverable.

-- 1. Add uploaded_by column referencing auth.users
ALTER TABLE public.songs
  ADD COLUMN IF NOT EXISTS uploaded_by uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- 2. Performance index for querying songs by uploader
CREATE INDEX IF NOT EXISTS idx_songs_uploaded_by ON public.songs(uploaded_by);

-- 3. Ensure Row Level Security is enabled
ALTER TABLE public.songs ENABLE ROW LEVEL SECURITY;

-- 4. Public SELECT policy: All songs remain discoverable and readable by guests and authenticated users
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'songs' AND policyname = 'Public can view all songs'
  ) THEN
    CREATE POLICY "Public can view all songs"
      ON public.songs
      FOR SELECT
      TO public
      USING (true);
  END IF;
END $$;

-- 5. Safe replacement of INSERT policy to enforce ownership
DROP POLICY IF EXISTS "Authenticated users can insert songs" ON public.songs;
DROP POLICY IF EXISTS "Authenticated users can insert songs with ownership" ON public.songs;

CREATE POLICY "Authenticated users can insert songs with ownership"
  ON public.songs
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = uploaded_by);
