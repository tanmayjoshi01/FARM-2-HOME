-- Run this in Supabase SQL Editor for your project.
-- Fixes INSERT/UPDATE RLS denials on public.auctions.

BEGIN;

ALTER TABLE public.auctions ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'auctions'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.auctions', pol.policyname);
  END LOOP;
END $$;

CREATE POLICY "Users can view auctions"
  ON public.auctions FOR SELECT
  USING (
    status IN ('scheduled', 'live', 'closed')
    OR auth.uid() = farmer_id
    OR EXISTS (
      SELECT 1
      FROM public.users u
      WHERE u.id = auth.uid()
        AND u.role::text = 'admin'
    )
  );

CREATE POLICY "Admins or farmers can create auctions"
  ON public.auctions FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.users u
      WHERE u.id = auth.uid()
        AND u.role::text = 'admin'
    )
    OR (
      auth.uid() = farmer_id
      AND EXISTS (
        SELECT 1
        FROM public.users u
        WHERE u.id = auth.uid()
          AND u.role::text = 'farmer'
      )
      AND EXISTS (
        SELECT 1
        FROM public.products p
        WHERE p.id = product_id
          AND p.farmer_id = auth.uid()
          AND p.status = 'approved'
      )
    )
  );

CREATE POLICY "Admins or owners can update auctions"
  ON public.auctions FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.users u
      WHERE u.id = auth.uid()
        AND u.role::text = 'admin'
    )
    OR auth.uid() = farmer_id
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.users u
      WHERE u.id = auth.uid()
        AND u.role::text = 'admin'
    )
    OR auth.uid() = farmer_id
  );

CREATE POLICY "Admins can delete auctions"
  ON public.auctions FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.users u
      WHERE u.id = auth.uid()
        AND u.role::text = 'admin'
    )
  );

COMMIT;

-- Optional verification:
-- SELECT schemaname, tablename, policyname, roles, cmd, qual, with_check
-- FROM pg_policies
-- WHERE schemaname = 'public' AND tablename = 'auctions'
-- ORDER BY cmd, policyname;
