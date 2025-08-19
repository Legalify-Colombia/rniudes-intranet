-- Agreements RLS policies to ensure created records are visible to authenticated users
-- Enable RLS (safe if already enabled)
ALTER TABLE public.agreements ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read agreements (adjust if you want stricter access)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'agreements' AND policyname = 'Authenticated can read agreements'
  ) THEN
    CREATE POLICY "Authenticated can read agreements"
      ON public.agreements
      FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END$$;

-- Only allow inserts where created_by matches current user
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'agreements' AND policyname = 'Users can insert their agreements'
  ) THEN
    CREATE POLICY "Users can insert their agreements"
      ON public.agreements
      FOR INSERT
      TO authenticated
      WITH CHECK (created_by = auth.uid());
  END IF;
END$$;

-- Allow owners to update their rows
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'agreements' AND policyname = 'Users can update their agreements'
  ) THEN
    CREATE POLICY "Users can update their agreements"
      ON public.agreements
      FOR UPDATE
      TO authenticated
      USING (created_by = auth.uid())
      WITH CHECK (created_by = auth.uid());
  END IF;
END$$;

-- Allow owners to delete their rows
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'agreements' AND policyname = 'Users can delete their agreements'
  ) THEN
    CREATE POLICY "Users can delete their agreements"
      ON public.agreements
      FOR DELETE
      TO authenticated
      USING (created_by = auth.uid());
  END IF;
END$$;