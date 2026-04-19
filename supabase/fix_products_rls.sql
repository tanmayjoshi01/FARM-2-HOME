-- Run this in Supabase SQL Editor for your project.
-- Fixes farmer INSERT denial on public.products caused by broken/conflicting RLS policies.

BEGIN;

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'products'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.products', pol.policyname);
  END LOOP;
END $$;

CREATE POLICY "Anyone can view approved products"
  ON public.products FOR SELECT
  TO authenticated
  USING (
    status = 'approved'
    OR auth.uid() = farmer_id
    OR public.is_admin()
  );

CREATE POLICY "Farmers can create products"
  ON public.products FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = farmer_id
    AND EXISTS (
      SELECT 1
      FROM public.users u
      WHERE u.id = auth.uid()
        AND u.role::text = 'farmer'
    )
  );

CREATE POLICY "Farmers can update own products"
  ON public.products FOR UPDATE
  TO authenticated
  USING (auth.uid() = farmer_id)
  WITH CHECK (auth.uid() = farmer_id);

CREATE POLICY "Admins can update products"
  ON public.products FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

COMMIT;

-- Optional verification:
-- SELECT schemaname, tablename, policyname, roles, cmd, qual, with_check
-- FROM pg_policies
-- WHERE schemaname = 'public' AND tablename = 'products'
-- ORDER BY cmd, policyname;
