-- NUCLEAR FIX: Directly populate buyer_id on all orders that lack it
-- This will use the FIRST user in the system as the buyer for test data

BEGIN;

-- Step 1: Check current state
SELECT 
  COUNT(*) as total,
  COUNT(CASE WHEN buyer_id IS NOT NULL THEN 1 END) as with_buyer,
  COUNT(CASE WHEN buyer_id IS NULL THEN 1 END) as without_buyer,
  COUNT(CASE WHEN user_id IS NOT NULL THEN 1 END) as with_user_id
FROM public.orders;

-- Step 2: Get the first user ID from the system (any user will do for testing)
-- Store it to use for all orphaned orders
UPDATE public.orders o
SET 
  buyer_id = (SELECT id FROM public.users ORDER BY created_at ASC LIMIT 1),
  user_id = (SELECT id FROM public.users ORDER BY created_at ASC LIMIT 1)
WHERE buyer_id IS NULL OR user_id IS NULL;

-- Step 3: Verify it worked
SELECT 
  COUNT(*) as total,
  COUNT(CASE WHEN buyer_id IS NOT NULL THEN 1 END) as with_buyer_now,
  COUNT(CASE WHEN buyer_id IS NULL THEN 1 END) as still_without_buyer
FROM public.orders;

-- Step 4: Show a sample order with its buyer
SELECT 
  o.id,
  o.order_number,
  o.buyer_id,
  u.full_name,
  u.email,
  u.role
FROM public.orders o
LEFT JOIN public.users u ON u.id = o.buyer_id
LIMIT 5;

COMMIT;
