-- Run this in Supabase SQL Editor (single-shot fix).
-- Repairs RLS for public.products and public.auctions.

BEGIN;

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auctions ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname
    FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'products'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.products', pol.policyname);
  END LOOP;

  FOR pol IN
    SELECT policyname
    FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'auctions'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.auctions', pol.policyname);
  END LOOP;
END $$;

-- =========================
-- PRODUCTS POLICIES
-- =========================
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

-- =========================
-- AUCTIONS POLICIES
-- =========================
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

-- Verify:
-- SELECT schemaname, tablename, policyname, cmd
-- FROM pg_policies
-- WHERE schemaname = 'public' AND tablename IN ('products', 'auctions')
-- ORDER BY tablename, cmd, policyname;
