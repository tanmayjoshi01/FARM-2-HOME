-- Fix RLS policies - simplify to allow users to view each other for order visibility
-- Run this in Supabase SQL Editor on your LIVE database

BEGIN;

-- Drop all existing policies on users table
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Farmers can view buyers for their orders" ON public.users;
DROP POLICY IF EXISTS "Buyers can view sellers for their orders" ON public.users;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can delete user profiles" ON public.users;

-- Create simpler, working policies
CREATE POLICY "Users can view own profile or authenticated users can view others"
  ON public.users FOR SELECT
  USING (auth.uid() = id OR (auth.uid() IS NOT NULL));

CREATE POLICY "Users can insert own profile"
  ON public.users FOR INSERT
  WITH CHECK (auth.uid() = id OR public.is_admin());

CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id OR public.is_admin())
  WITH CHECK (auth.uid() = id OR public.is_admin());

CREATE POLICY "Admins can delete user profiles"
  ON public.users FOR DELETE
  USING (public.is_admin());

COMMIT;
