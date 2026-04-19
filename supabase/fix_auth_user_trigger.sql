-- Run this in the Supabase SQL Editor.
-- Fixes missing public.users rows for newly registered auth users.
-- This prevents carts.user_id foreign key failures when a buyer tries to add items.

BEGIN;

-- Create or replace the trigger function that mirrors auth.users into public.users.
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (
    id,
    email,
    full_name,
    role,
    phone,
    avatar_url
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', split_part(NEW.email, '@', 1), 'User'),
    COALESCE((NEW.raw_user_meta_data ->> 'role')::public.user_role, 'buyer'),
    NEW.raw_user_meta_data ->> 'phone',
    NEW.raw_user_meta_data ->> 'avatar_url'
  )
  ON CONFLICT (id) DO UPDATE
    SET
      email = EXCLUDED.email,
      full_name = EXCLUDED.full_name,
      role = EXCLUDED.role,
      phone = EXCLUDED.phone,
      avatar_url = EXCLUDED.avatar_url,
      updated_at = NOW();

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_auth_user();

-- Backfill any existing auth users that do not yet have a matching public.users row.
INSERT INTO public.users (
  id,
  email,
  full_name,
  role,
  phone,
  avatar_url
)
SELECT
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data ->> 'full_name', split_part(u.email, '@', 1), 'User'),
  COALESCE((u.raw_user_meta_data ->> 'role')::public.user_role, 'buyer'),
  u.raw_user_meta_data ->> 'phone',
  u.raw_user_meta_data ->> 'avatar_url'
FROM auth.users u
LEFT JOIN public.users p ON p.id = u.id
WHERE p.id IS NULL;

COMMIT;
