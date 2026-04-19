-- Farm2Home fresh Supabase setup for a brand-new project.
-- Run this whole file in Supabase SQL Editor on an empty database.
-- It creates the schema, auth trigger, RLS policies, and storage buckets used by the app.

BEGIN;

-- =====================================================
-- Extensions
-- =====================================================
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =====================================================
-- Enum types
-- =====================================================
DO $$ BEGIN
  CREATE TYPE public.user_role AS ENUM ('buyer', 'farmer', 'admin');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.product_status AS ENUM ('pending', 'approved', 'rejected');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.product_grade AS ENUM ('A', 'B', 'C');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.order_type AS ENUM ('direct', 'auction');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.auction_status AS ENUM ('scheduled', 'live', 'closed', 'cancelled');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.address_tag AS ENUM ('Home', 'Office', 'Other');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.certificate_type AS ENUM ('organic', 'quality', 'fssai', 'other');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- =====================================================
-- Helper functions
-- =====================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, auth
AS $$
  -- Placeholder to allow function creation before public.users exists.
  SELECT FALSE;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  resolved_role public.user_role;
  resolved_name TEXT;
  resolved_phone TEXT;
  resolved_avatar TEXT;
BEGIN
  resolved_role := CASE
    WHEN NEW.raw_user_meta_data ->> 'role' IN ('buyer', 'farmer', 'admin')
      THEN (NEW.raw_user_meta_data ->> 'role')::public.user_role
    ELSE 'buyer'::public.user_role
  END;

  resolved_name := COALESCE(NULLIF(NEW.raw_user_meta_data ->> 'full_name', ''), SPLIT_PART(NEW.email, '@', 1), 'User');
  resolved_phone := NULLIF(NEW.raw_user_meta_data ->> 'phone', '');
  resolved_avatar := NULLIF(NEW.raw_user_meta_data ->> 'avatar_url', '');

  INSERT INTO public.users (
    id,
    email,
    role,
    full_name,
    phone,
    avatar_url,
    is_verified
  )
  VALUES (
    NEW.id,
    NEW.email,
    resolved_role,
    resolved_name,
    resolved_phone,
    resolved_avatar,
    NEW.email_confirmed_at IS NOT NULL
  )
  ON CONFLICT (id) DO UPDATE
  SET
    email = EXCLUDED.email,
    role = EXCLUDED.role,
    full_name = EXCLUDED.full_name,
    phone = EXCLUDED.phone,
    avatar_url = EXCLUDED.avatar_url,
    is_verified = EXCLUDED.is_verified,
    updated_at = NOW();

  INSERT INTO public.carts (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.sync_order_aliases()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Mirror current app naming differences.
  IF NEW.user_id IS NULL THEN
    NEW.user_id := NEW.buyer_id;
  END IF;

  IF NEW.buyer_id IS NULL THEN
    NEW.buyer_id := NEW.user_id;
  END IF;

  IF NEW.address_id IS NULL THEN
    NEW.address_id := NEW.delivery_address_id;
  END IF;

  IF NEW.delivery_address_id IS NULL THEN
    NEW.delivery_address_id := NEW.address_id;
  END IF;

  IF COALESCE(NEW.total_amount, 0) = 0 AND COALESCE(NEW.subtotal, 0) > 0 THEN
    NEW.total_amount := NEW.subtotal;
  END IF;

  IF COALESCE(NEW.subtotal, 0) = 0 AND COALESCE(NEW.total_amount, 0) > 0 THEN
    NEW.subtotal := NEW.total_amount;
  END IF;

  IF COALESCE(NEW.delivery_fee, 0) = 0 AND COALESCE(NEW.delivery_charge, 0) > 0 THEN
    NEW.delivery_fee := NEW.delivery_charge;
  END IF;

  IF COALESCE(NEW.delivery_charge, 0) = 0 AND COALESCE(NEW.delivery_fee, 0) > 0 THEN
    NEW.delivery_charge := NEW.delivery_fee;
  END IF;

  IF COALESCE(NEW.final_amount, 0) = 0 AND COALESCE(NEW.total, 0) > 0 THEN
    NEW.final_amount := NEW.total;
  END IF;

  IF COALESCE(NEW.total, 0) = 0 AND COALESCE(NEW.final_amount, 0) > 0 THEN
    NEW.total := NEW.final_amount;
  END IF;

  IF NEW.payment_method IS NULL OR NEW.payment_method = '' THEN
    NEW.payment_method := 'upi';
  END IF;

  IF NEW.status IS NULL OR NEW.status = '' THEN
    NEW.status := 'pending';
  END IF;

  IF NEW.order_status IS NULL OR NEW.order_status = '' THEN
    NEW.order_status := NEW.status;
  END IF;

  IF NEW.status = 'pending' AND NEW.order_status <> 'pending' THEN
    NEW.status := NEW.order_status;
  END IF;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.sync_tracking_status()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.status IS NULL OR NEW.status = '' THEN
    NEW.status := 'received';
  END IF;

  IF NEW.tracking_number IS NULL OR NEW.tracking_number = '' THEN
    NEW.tracking_number := 'F2H' || UPPER(SUBSTRING(REPLACE(gen_random_uuid()::TEXT, '-', ''), 1, 8));
  END IF;

  RETURN NEW;
END;
$$;

-- =====================================================
-- Tables
-- =====================================================
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  role public.user_role NOT NULL DEFAULT 'buyer',
  full_name TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address_line TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  pincode TEXT NOT NULL CHECK (pincode ~ '^\d{6}$'),
  tag public.address_tag NOT NULL DEFAULT 'Home',
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  latitude NUMERIC(10, 8),
  longitude NUMERIC(11, 8),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  quantity NUMERIC(12, 2) NOT NULL CHECK (quantity >= 0),
  unit TEXT NOT NULL,
  price_per_unit NUMERIC(12, 2) NOT NULL CHECK (price_per_unit > 0),
  grade public.product_grade,
  image_url TEXT,
  certificate_url TEXT,
  status public.product_status NOT NULL DEFAULT 'pending',
  has_certificate BOOLEAN NOT NULL DEFAULT FALSE,
  location TEXT,
  approved_by UUID REFERENCES public.users(id),
  approved_at TIMESTAMPTZ,
  rejection_reason TEXT,
  view_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  certificate_type public.certificate_type NOT NULL,
  certificate_url TEXT NOT NULL,
  issued_by TEXT,
  issued_date DATE,
  valid_until DATE,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.wishlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, product_id)
);

CREATE TABLE IF NOT EXISTS public.carts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id UUID NOT NULL REFERENCES public.carts(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  added_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (cart_id, product_id)
);

CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL DEFAULT ('F2H' || UPPER(SUBSTRING(REPLACE(gen_random_uuid()::TEXT, '-', ''), 1, 8))),

  -- Current app uses these names.
  buyer_id UUID REFERENCES public.users(id) ON DELETE RESTRICT,
  farmer_id UUID REFERENCES public.users(id) ON DELETE RESTRICT,
  address_id UUID REFERENCES public.addresses(id) ON DELETE RESTRICT,
  order_type public.order_type NOT NULL DEFAULT 'direct',
  subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0,
  platform_fee NUMERIC(12, 2) NOT NULL DEFAULT 0,
  gst NUMERIC(12, 2) NOT NULL DEFAULT 0,
  delivery_charge NUMERIC(12, 2) NOT NULL DEFAULT 0,
  total NUMERIC(12, 2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',

  -- Alternate names used by other parts of the app.
  user_id UUID REFERENCES public.users(id) ON DELETE RESTRICT,
  delivery_address_id UUID,
  payment_method TEXT DEFAULT 'upi',
  total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  delivery_fee NUMERIC(12, 2) NOT NULL DEFAULT 0,
  final_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  order_status TEXT NOT NULL DEFAULT 'pending',
  payment_status TEXT NOT NULL DEFAULT 'pending',

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  payment_completed_at TIMESTAMPTZ,
  dispatched_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  cancellation_reason TEXT
);

CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  product_name TEXT,
  quantity NUMERIC(12, 2) NOT NULL CHECK (quantity > 0),
  unit TEXT,
  price_per_unit NUMERIC(12, 2) NOT NULL,
  total_price NUMERIC(12, 2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.auctions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  farmer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  base_price NUMERIC(12, 2) NOT NULL CHECK (base_price > 0),
  current_bid NUMERIC(12, 2) NOT NULL DEFAULT 0,
  quantity NUMERIC(12, 2) NOT NULL CHECK (quantity > 0),
  unit TEXT NOT NULL,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  status public.auction_status NOT NULL DEFAULT 'scheduled',
  winner_id UUID REFERENCES public.users(id),
  winning_bid NUMERIC(12, 2),
  total_bids INTEGER NOT NULL DEFAULT 0,
  unique_bidders INTEGER NOT NULL DEFAULT 0,
  order_id UUID REFERENCES public.orders(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  closed_at TIMESTAMPTZ,
  CONSTRAINT valid_auction_times CHECK (ends_at > starts_at)
);

CREATE TABLE IF NOT EXISTS public.bids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auction_id UUID NOT NULL REFERENCES public.auctions(id) ON DELETE CASCADE,
  bidder_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  bid_amount NUMERIC(12, 2) NOT NULL CHECK (bid_amount > 0),
  bid_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_winning BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'system',
  related_id UUID,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  tracking_number TEXT UNIQUE NOT NULL DEFAULT ('F2H' || UPPER(SUBSTRING(REPLACE(gen_random_uuid()::TEXT, '-', ''), 1, 8))),
  status TEXT NOT NULL DEFAULT 'received',
  location TEXT,
  message TEXT,
  latitude NUMERIC(10, 8),
  longitude NUMERIC(11, 8),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- Compatibility upgrades for pre-existing schemas
-- =====================================================
-- If this runs on a project that already has tables from older scripts,
-- ensure columns referenced by this setup exist before triggers/policies.
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS user_id UUID,
  ADD COLUMN IF NOT EXISTS delivery_address_id UUID,
  ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'upi',
  ADD COLUMN IF NOT EXISTS total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS delivery_fee NUMERIC(12, 2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS final_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS order_status TEXT NOT NULL DEFAULT 'pending';

ALTER TABLE public.tracking
  ADD COLUMN IF NOT EXISTS tracking_number TEXT,
  ADD COLUMN IF NOT EXISTS message TEXT,
  ADD COLUMN IF NOT EXISTS latitude NUMERIC(10, 8),
  ADD COLUMN IF NOT EXISTS longitude NUMERIC(11, 8);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'orders_user_id_fkey'
  ) THEN
    ALTER TABLE public.orders
      ADD CONSTRAINT orders_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE RESTRICT;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'orders_delivery_address_id_fkey'
  ) THEN
    ALTER TABLE public.orders
      ADD CONSTRAINT orders_delivery_address_id_fkey
      FOREIGN KEY (delivery_address_id) REFERENCES public.addresses(id) ON DELETE RESTRICT;
  END IF;
END $$;

-- Backfill aliases used by different parts of the app.
UPDATE public.orders
SET user_id = buyer_id
WHERE user_id IS NULL AND buyer_id IS NOT NULL;

UPDATE public.orders
SET delivery_address_id = address_id
WHERE delivery_address_id IS NULL AND address_id IS NOT NULL;

UPDATE public.orders
SET order_status = status
WHERE (order_status IS NULL OR order_status = '') AND status IS NOT NULL;

UPDATE public.orders
SET status = order_status
WHERE (status IS NULL OR status = '') AND order_status IS NOT NULL;

-- Replace placeholder with real implementation now that public.users exists.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, auth
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.users u
    WHERE u.id = auth.uid()
      AND u.role = 'admin'
  );
$$;

-- =====================================================
-- Triggers
-- =====================================================
DROP TRIGGER IF EXISTS trg_users_updated_at ON public.users;
CREATE TRIGGER trg_users_updated_at
BEFORE UPDATE ON public.users
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_addresses_updated_at ON public.addresses;
CREATE TRIGGER trg_addresses_updated_at
BEFORE UPDATE ON public.addresses
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_products_updated_at ON public.products;
CREATE TRIGGER trg_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_carts_updated_at ON public.carts;
CREATE TRIGGER trg_carts_updated_at
BEFORE UPDATE ON public.carts
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_orders_updated_at ON public.orders;
CREATE TRIGGER trg_orders_updated_at
BEFORE UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_order_items_updated_at ON public.order_items;
CREATE TRIGGER trg_order_items_updated_at
BEFORE UPDATE ON public.order_items
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_handle_new_auth_user ON auth.users;
CREATE TRIGGER trg_handle_new_auth_user
AFTER INSERT OR UPDATE OF email, raw_user_meta_data, email_confirmed_at ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_auth_user();

DROP TRIGGER IF EXISTS trg_sync_order_aliases ON public.orders;
CREATE TRIGGER trg_sync_order_aliases
BEFORE INSERT OR UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.sync_order_aliases();

DROP TRIGGER IF EXISTS trg_sync_tracking_status ON public.tracking;
CREATE TRIGGER trg_sync_tracking_status
BEFORE INSERT OR UPDATE ON public.tracking
FOR EACH ROW
EXECUTE FUNCTION public.sync_tracking_status();

-- =====================================================
-- Row Level Security
-- =====================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auctions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tracking ENABLE ROW LEVEL SECURITY;

-- Drop old policies if the script is re-run in the same project.
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN SELECT policyname, schemaname, tablename FROM pg_policies WHERE schemaname = 'public' LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol.policyname, pol.tablename);
  END LOOP;
END $$;

-- USERS
CREATE POLICY "Users can view own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Farmers can view buyers for their orders"
  ON public.users FOR SELECT
  USING (
    public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.farmer_id = auth.uid()
        AND (o.buyer_id = id OR o.user_id = id)
    )
  );

CREATE POLICY "Buyers can view sellers for their orders"
  ON public.users FOR SELECT
  USING (
    public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.orders o
      WHERE (o.buyer_id = auth.uid() OR o.user_id = auth.uid())
        AND o.farmer_id = id
    )
  );

-- ADDRESSES
CREATE POLICY "Users can view own addresses"
  ON public.addresses FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can manage own addresses"
  ON public.addresses FOR ALL
  USING (auth.uid() = user_id OR public.is_admin())
  WITH CHECK (auth.uid() = user_id OR public.is_admin());

-- PRODUCTS
CREATE POLICY "Anyone can view approved products"
  ON public.products FOR SELECT
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
        AND u.role = 'farmer'
    )
  );

CREATE POLICY "Farmers can update own products"
  ON public.products FOR UPDATE
  TO authenticated
  USING (auth.uid() = farmer_id OR public.is_admin())
  WITH CHECK (auth.uid() = farmer_id OR public.is_admin());

CREATE POLICY "Farmers or admins can delete products"
  ON public.products FOR DELETE
  TO authenticated
  USING (auth.uid() = farmer_id OR public.is_admin());

-- CERTIFICATES
CREATE POLICY "Owners or admins can view certificates"
  ON public.certificates FOR SELECT
  USING (
    public.is_admin()
    OR EXISTS (
      SELECT 1
      FROM public.products p
      WHERE p.id = product_id
        AND p.farmer_id = auth.uid()
    )
  );

CREATE POLICY "Owners or admins can manage certificates"
  ON public.certificates FOR ALL
  USING (
    public.is_admin()
    OR EXISTS (
      SELECT 1
      FROM public.products p
      WHERE p.id = product_id
        AND p.farmer_id = auth.uid()
    )
  )
  WITH CHECK (
    public.is_admin()
    OR EXISTS (
      SELECT 1
      FROM public.products p
      WHERE p.id = product_id
        AND p.farmer_id = auth.uid()
    )
  );

-- WISHLISTS
CREATE POLICY "Users can manage own wishlist"
  ON public.wishlists FOR ALL
  USING (auth.uid() = user_id OR public.is_admin())
  WITH CHECK (auth.uid() = user_id OR public.is_admin());

-- CARTS
CREATE POLICY "Users can view own carts"
  ON public.carts FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can create own carts"
  ON public.carts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can update own carts"
  ON public.carts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id OR public.is_admin())
  WITH CHECK (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can delete own carts"
  ON public.carts FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id OR public.is_admin());

-- CART ITEMS
CREATE POLICY "Users can view cart items in own cart"
  ON public.cart_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.carts c
      WHERE c.id = cart_id
        AND (c.user_id = auth.uid() OR public.is_admin())
    )
  );

CREATE POLICY "Users can manage cart items in own cart"
  ON public.cart_items FOR ALL
  USING (
    EXISTS (
      SELECT 1
      FROM public.carts c
      WHERE c.id = cart_id
        AND (c.user_id = auth.uid() OR public.is_admin())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.carts c
      WHERE c.id = cart_id
        AND (c.user_id = auth.uid() OR public.is_admin())
    )
  );

-- ORDERS
CREATE POLICY "Users and admins can view orders"
  ON public.orders FOR SELECT
  USING (
    auth.uid() = user_id
    OR auth.uid() = buyer_id
    OR auth.uid() = farmer_id
    OR public.is_admin()
  );

CREATE POLICY "Authenticated users can create their own orders"
  ON public.orders FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = COALESCE(user_id, buyer_id)
    AND (
      COALESCE(address_id, delivery_address_id) IS NULL
      OR EXISTS (
        SELECT 1
        FROM public.addresses a
        WHERE a.id = COALESCE(address_id, delivery_address_id)
          AND a.user_id = auth.uid()
      )
      OR public.is_admin()
    )
  );

CREATE POLICY "Users and admins can update orders"
  ON public.orders FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id
    OR auth.uid() = buyer_id
    OR auth.uid() = farmer_id
    OR public.is_admin()
  )
  WITH CHECK (
    auth.uid() = user_id
    OR auth.uid() = buyer_id
    OR auth.uid() = farmer_id
    OR public.is_admin()
  );

-- ORDER ITEMS
CREATE POLICY "Users and admins can view order items"
  ON public.order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.orders o
      WHERE o.id = order_id
        AND (
          o.user_id = auth.uid()
          OR o.buyer_id = auth.uid()
          OR o.farmer_id = auth.uid()
          OR public.is_admin()
        )
    )
  );

CREATE POLICY "Users and admins can create order items"
  ON public.order_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.orders o
      WHERE o.id = order_id
        AND (
          o.user_id = auth.uid()
          OR o.buyer_id = auth.uid()
          OR public.is_admin()
        )
    )
  );

-- AUCTIONS
CREATE POLICY "Anyone can view active or closed auctions"
  ON public.auctions FOR SELECT
  USING (
    status IN ('scheduled', 'live', 'closed')
    OR auth.uid() = farmer_id
    OR public.is_admin()
  );

CREATE POLICY "Admins or farmers can create auctions"
  ON public.auctions FOR INSERT
  TO authenticated
  WITH CHECK (
    public.is_admin()
    OR (
      auth.uid() = farmer_id
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
  USING (public.is_admin() OR auth.uid() = farmer_id)
  WITH CHECK (public.is_admin() OR auth.uid() = farmer_id);

CREATE POLICY "Admins can delete auctions"
  ON public.auctions FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- BIDS
CREATE POLICY "Anyone can view live or closed bids"
  ON public.bids FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.auctions a
      WHERE a.id = auction_id
        AND a.status IN ('scheduled', 'live', 'closed')
    )
    OR auth.uid() = bidder_id
    OR public.is_admin()
  );

CREATE POLICY "Buyers can place bids on live auctions"
  ON public.bids FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = bidder_id
    AND EXISTS (
      SELECT 1
      FROM public.users u
      WHERE u.id = auth.uid()
        AND u.role = 'buyer'
    )
    AND EXISTS (
      SELECT 1
      FROM public.auctions a
      WHERE a.id = auction_id
        AND a.status = 'live'
        AND a.ends_at > NOW()
    )
  );

CREATE POLICY "Buyers or admins can update bids"
  ON public.bids FOR UPDATE
  TO authenticated
  USING (auth.uid() = bidder_id OR public.is_admin())
  WITH CHECK (auth.uid() = bidder_id OR public.is_admin());

-- NOTIFICATIONS
CREATE POLICY "Users and admins can view own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Authenticated users can create notifications"
  ON public.notifications FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users and admins can update own notifications"
  ON public.notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id OR public.is_admin())
  WITH CHECK (auth.uid() = user_id OR public.is_admin());

-- TRACKING
CREATE POLICY "Users and admins can view tracking for own orders"
  ON public.tracking FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.orders o
      WHERE o.id = order_id
        AND (
          o.user_id = auth.uid()
          OR o.buyer_id = auth.uid()
          OR o.farmer_id = auth.uid()
          OR public.is_admin()
        )
    )
  );

CREATE POLICY "Authenticated users can create tracking entries for own orders"
  ON public.tracking FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.orders o
      WHERE o.id = order_id
        AND (
          o.user_id = auth.uid()
          OR o.buyer_id = auth.uid()
          OR o.farmer_id = auth.uid()
          OR public.is_admin()
        )
    )
  );

CREATE POLICY "Authenticated users and admins can update tracking"
  ON public.tracking FOR UPDATE
  TO authenticated
  USING (
    public.is_admin()
    OR EXISTS (
      SELECT 1
      FROM public.orders o
      WHERE o.id = order_id
        AND o.farmer_id = auth.uid()
    )
  )
  WITH CHECK (
    public.is_admin()
    OR EXISTS (
      SELECT 1
      FROM public.orders o
      WHERE o.id = order_id
        AND o.farmer_id = auth.uid()
    )
  );

-- =====================================================
-- Storage buckets
-- =====================================================
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('farm2home-products', 'farm2home-products', TRUE),
  ('farm2home-certificates', 'farm2home-certificates', FALSE),
  ('certificates', 'certificates', FALSE)
ON CONFLICT (id) DO NOTHING;

-- Clear any existing storage policies before recreating them.
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname
    FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', pol.policyname);
  END LOOP;
END $$;

-- Public product images.
CREATE POLICY "Public can view product images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'farm2home-products');

CREATE POLICY "Authenticated users can upload product images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'farm2home-products' AND owner = auth.uid());

CREATE POLICY "Owners can update product images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'farm2home-products' AND owner = auth.uid())
  WITH CHECK (bucket_id = 'farm2home-products' AND owner = auth.uid());

CREATE POLICY "Owners can delete product images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'farm2home-products' AND owner = auth.uid());

-- Private certificates bucket used by the current code.
CREATE POLICY "Owners or admins can view certificates in farm2home-certificates"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'farm2home-certificates'
    AND (owner = auth.uid() OR public.is_admin())
  );

CREATE POLICY "Owners can upload certificates in farm2home-certificates"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'farm2home-certificates' AND owner = auth.uid());

CREATE POLICY "Owners can update certificates in farm2home-certificates"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'farm2home-certificates' AND owner = auth.uid())
  WITH CHECK (bucket_id = 'farm2home-certificates' AND owner = auth.uid());

CREATE POLICY "Owners can delete certificates in farm2home-certificates"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'farm2home-certificates' AND owner = auth.uid());

-- Legacy certificate bucket kept because the current helper still references it.
CREATE POLICY "Owners or admins can view certificates in certificates"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'certificates'
    AND (owner = auth.uid() OR public.is_admin())
  );

CREATE POLICY "Owners can upload certificates in certificates"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'certificates' AND owner = auth.uid());

CREATE POLICY "Owners can update certificates in certificates"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'certificates' AND owner = auth.uid())
  WITH CHECK (bucket_id = 'certificates' AND owner = auth.uid());

CREATE POLICY "Owners can delete certificates in certificates"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'certificates' AND owner = auth.uid());

COMMIT;

-- =====================================================
-- Optional first-admin step
-- =====================================================
-- Promote a registered user to admin.
-- IMPORTANT: The user must sign up first in auth/users.
DO $$
DECLARE
  v_updated INTEGER;
BEGIN
  UPDATE public.users
  SET role = 'admin', updated_at = NOW()
  WHERE email = 'tanmay@admin.com';

  GET DIAGNOSTICS v_updated = ROW_COUNT;

  IF v_updated = 0 THEN
    RAISE NOTICE 'No user found for tanmay@admin.com. Please register this email first, then run this block again.';
  END IF;
END $$;

-- Example for promoting farmer later:
-- UPDATE public.users SET role = 'farmer' WHERE email = 'farmer@example.com';
