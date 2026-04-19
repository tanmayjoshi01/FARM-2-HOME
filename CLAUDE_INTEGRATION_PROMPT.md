# 🤖 COPY THIS ENTIRE PROMPT TO CLAUDE

---

## CONTEXT: Farm2Home Marketplace Integration Task

I have a Farm2Home marketplace application that is **60% complete**. The frontend is 100% built, the database schema is 100% designed in Supabase, but the integration between frontend and backend is only partially done. I need you to complete the remaining 40% to make it 100% functional.

## YOUR MISSION

Complete the integration of all features by following the detailed implementation guides already created in this codebase. You will be modifying existing files and creating new hooks to connect the frontend to the Supabase backend.

## WHAT'S ALREADY DONE ✅

1. **Frontend UI**: 100% complete - All pages, components, routing, styling
2. **Supabase Backend**: 100% ready - Database schema, RLS policies, storage buckets, triggers
3. **Authentication**: 100% integrated - Login, register, role-based access working
4. **Shopping Cart**: 100% integrated - Database-backed cart with real-time sync
5. **Products Page**: 100% integrated - Fetches from database using `useProducts` hook
6. **Documentation**: 100% complete - 8 detailed guides with exact code

## WHAT NEEDS INTEGRATION ⏳

1. **Checkout Flow** - Connect payment to create orders in database
2. **Auctions** - Replace mock data with real database queries
3. **Farmer Dashboard** - Connect all pages to database
4. **Admin Dashboard** - Connect all management features to database
5. **Order Tracking** - Connect to tracking table
6. **Image Uploads** - Wire upload functions to forms
7. **Error Handling** - Add proper error boundaries and loading states

## CRITICAL INSTRUCTIONS

### 📚 READ THESE GUIDES FIRST (In Order):

1. **START_HERE.md** - Overview and quick start
2. **MASTER_PLAN.md** - Complete 8-phase strategy
3. **DEPLOYMENT_CHECKLIST.md** - What works vs what doesn't
4. **IMPLEMENTATION_STEP_BY_STEP.md** - Phases 1-2 with exact code
5. **PHASES_3_TO_8.md** - Phases 3-8 with exact code
6. **ROADMAP.md** - Visual timeline
7. **INTEGRATION_GUIDE.md** - Integration patterns
8. **REPLACEMENT_EXAMPLES.md** - Code examples

### 🎯 YOUR IMPLEMENTATION PLAN

Follow the guides sequentially. Do **ALL 8 PHASES** in order:

---

## PHASE 1: CHECKOUT & ORDERS (Priority: Critical)

**Goal**: Make checkout create real orders in database

**Guide**: `IMPLEMENTATION_STEP_BY_STEP.md` → Phase 1

### Files to Create:
1. `/src/app/hooks/useOrders.ts` (NEW FILE)
   - Copy the complete code from the guide
   - This hook handles order creation, fetching, and tracking

### Files to Modify:

2. `/src/app/pages/checkout/Payment.tsx`
   - Import `useOrders` and `useCart`
   - Replace the `handlePayment` function with the code from the guide
   - This connects payment to order creation

3. `/src/app/pages/checkout/Success.tsx`
   - Replace entire component with code from the guide
   - This fetches real order data and displays it

4. `/src/app/pages/TrackOrder.tsx`
   - Add imports: `useEffect`, `useState`, `useSearchParams`, `supabase`
   - Replace tracking logic with real database fetching
   - Use code from the guide

### Testing Checklist:
- [ ] Can add items to cart
- [ ] Can proceed to checkout
- [ ] Can select address
- [ ] Payment creates order in Supabase `orders` table
- [ ] Order items created in `order_items` table
- [ ] Tracking entry created in `tracking` table
- [ ] Success page shows real order data
- [ ] Track order page works with tracking number

---

## PHASE 2: AUCTIONS INTEGRATION (Priority: High)

**Goal**: Make auctions fetch from database and enable real-time bidding

**Guide**: `IMPLEMENTATION_STEP_BY_STEP.md` → Phase 2

### Files to Modify:

1. `/src/app/hooks/useAuctions.ts`
   - Replace entire file with enhanced version from the guide
   - Adds: `getAuction`, `placeBid`, `subscribeToAuction` functions

2. `/src/app/pages/Auctions.tsx`
   - Import `useAuctions` hook
   - Replace mock data with `auctions` from hook
   - Update auction cards to use real data
   - Use filtering logic from the guide

3. `/src/app/pages/LiveAuction.tsx`
   - Replace entire file with the code from the guide
   - This implements real-time bidding
   - Subscribes to bid updates
   - Shows live auction data

### Testing Checklist:
- [ ] Auctions page shows database auctions
- [ ] Can filter/search auctions
- [ ] Clicking auction opens live auction page
- [ ] Can place bids
- [ ] Bids save to database
- [ ] Real-time updates work (open in 2 browsers, bid updates instantly)
- [ ] Timer counts down
- [ ] Bid history shows

---

## PHASE 3: FARMER DASHBOARD (Priority: High)

**Goal**: Connect all farmer features to database

**Guide**: `PHASES_3_TO_8.md` → Phase 3

### Files to Create:

1. `/src/app/hooks/useFarmerData.ts` (NEW FILE)
   - Copy complete code from the guide
   - Handles: stats, products, orders, CRUD operations

### Files to Modify:

2. `/src/app/pages/farmer/Dashboard.tsx`
   - Import `useFarmerData`
   - Replace mock stats with `stats` from hook
   - Replace mock orders with `recentOrders` from hook
   - Add loading state

3. `/src/app/pages/farmer/AddProduct.tsx`
   - Import `useFarmerData`, `uploadProductImage`, `useState`, `useNavigate`
   - Add form state management
   - Add image upload handler
   - Add submit handler that calls `addProduct`
   - Connect all form inputs to state
   - Use complete code from the guide

4. `/src/app/pages/farmer/Products.tsx`
   - Import `useFarmerData`
   - Replace mock products with `products` from hook
   - Add delete handler using `deleteProduct`
   - Add loading state

5. `/src/app/pages/farmer/Orders.tsx`
   - Import `useFarmerData`
   - Replace mock orders with data from hook
   - Add loading state

6. `/src/lib/supabase.ts`
   - Add `uploadProductImage` function at end of file
   - Add `uploadCertificate` function at end of file
   - Copy both functions from the guide

### Testing Checklist:
- [ ] Farmer dashboard shows real stats
- [ ] Can add new product
- [ ] Can upload product image
- [ ] Product saved to `products` table with status='pending'
- [ ] Image saved to Supabase Storage `farm2home-products` bucket
- [ ] Products list shows farmer's products
- [ ] Can delete products
- [ ] Orders show real data

---

## PHASE 4: ADMIN DASHBOARD (Priority: High)

**Goal**: Connect all admin management features

**Guide**: `PHASES_3_TO_8.md` → Phase 4

### Files to Create:

1. `/src/app/hooks/useAdminData.ts` (NEW FILE)
   - Copy complete code from the guide
   - Handles: stats, users, products, orders, approval workflows

### Files to Modify:

2. `/src/app/pages/admin/Dashboard.tsx`
   - Import `useAdminData`
   - Replace mock stats with `stats` from hook
   - Add loading state
   - Use code from the guide

3. `/src/app/pages/admin/Products.tsx`
   - Import `useAdminData`
   - Replace mock products with `products` from hook
   - Add approve handler using `approveProduct`
   - Add reject handler using `rejectProduct`
   - Add delete handler using `deleteProduct`
   - Add action buttons to each product

4. `/src/app/pages/admin/Users.tsx`
   - Import `useAdminData`
   - Replace mock users with `users` from hook
   - Add role change handler using `updateUserRole`
   - Add delete handler using `deleteUser`
   - Add management controls

5. `/src/app/pages/admin/Orders.tsx`
   - Import `useAdminData`
   - Replace mock orders with `orders` from hook
   - Add loading state

### Testing Checklist:
- [ ] Admin dashboard shows real stats
- [ ] Can see all users
- [ ] Can change user roles
- [ ] Can delete users
- [ ] Can see pending products
- [ ] Can approve products (status changes to 'approved')
- [ ] Can reject products (status changes to 'rejected')
- [ ] Can see all orders
- [ ] Analytics show real data

---

## PHASE 5: IMAGE UPLOADS

**Already done in Phase 3!** ✅ The upload helpers are created and integrated into AddProduct form.

---

## PHASE 6: FINISHING TOUCHES (Priority: Medium)

**Goal**: Add error handling, loading states, polish

**Guide**: `PHASES_3_TO_8.md` → Phase 6

### Files to Create:

1. `/src/app/components/ErrorBoundary.tsx` (NEW FILE)
   - Copy complete code from the guide
   - Catches React errors and shows fallback UI

2. `/src/app/components/LoadingSpinner.tsx` (NEW FILE)
   - Copy complete code from the guide
   - Reusable loading component

### Files to Modify:

3. `/src/app/App.tsx`
   - Import `ErrorBoundary`
   - Wrap `<RouterProvider>` with `<ErrorBoundary>`
   - Add `<Toaster />` from sonner

### Package to Install:

```bash
npm install sonner
```

### Files to Update (Optional):

4. Replace loading states in all pages with `<LoadingSpinner />`
5. Replace `alert()` calls with `toast.success()` and `toast.error()`

### Testing Checklist:
- [ ] Error boundary catches errors
- [ ] Loading states show properly
- [ ] Toast notifications work
- [ ] Better user experience

---

## PHASE 7: TESTING (Priority: Critical)

**Goal**: Test all features end-to-end

**Guide**: `PHASES_3_TO_8.md` → Phase 7

### Complete Testing Checklist:

**As Buyer:**
- [ ] Register new account (role: buyer)
- [ ] Browse products page
- [ ] Search and filter products
- [ ] Add items to cart
- [ ] Cart persists after refresh
- [ ] Select delivery address
- [ ] Complete checkout
- [ ] Payment creates order
- [ ] See order on success page
- [ ] Track order with tracking number
- [ ] Join auction
- [ ] Place bid
- [ ] See bid in real-time

**As Farmer:**
- [ ] Register new account (role: farmer)
- [ ] See dashboard with real stats
- [ ] Add new product
- [ ] Upload product image
- [ ] Product appears as 'pending'
- [ ] View products list
- [ ] Edit product
- [ ] Delete product
- [ ] View orders received
- [ ] See analytics

**As Admin:**
- [ ] Login as admin
- [ ] See real stats on dashboard
- [ ] View all users
- [ ] Change user role
- [ ] View pending products
- [ ] Approve product
- [ ] Reject product
- [ ] View all orders
- [ ] See platform analytics

**Database Verification:**
- [ ] Check `users` table has entries
- [ ] Check `products` table has entries
- [ ] Check `orders` table has entries
- [ ] Check `order_items` table has entries
- [ ] Check `cart_items` table has entries
- [ ] Check `auctions` table has entries
- [ ] Check `bids` table has entries
- [ ] Check `tracking` table has entries
- [ ] Check Storage → `farm2home-products` bucket has images
- [ ] All foreign keys work correctly
- [ ] RLS policies allow correct access

---

## PHASE 8: DEPLOYMENT (Optional - User will do this)

Skip this phase. The user will deploy themselves.

---

## IMPLEMENTATION RULES

### ✅ DO:

1. **Follow the guides exactly** - All code is already written for you
2. **Read the file completely** before modifying
3. **Copy code exactly** as shown in guides
4. **Test after each phase** before moving to next
5. **Check Supabase dashboard** to verify data is saving
6. **Use fast_apply_tool** for edits to existing files
7. **Use write_tool** for creating new files
8. **Add helpful comments** where code is complex
9. **Console.log errors** for debugging
10. **Import from correct paths** - check existing imports

### ❌ DON'T:

1. **Don't skip phases** - Do them in order (1→2→3→4→6→7)
2. **Don't modify protected files**:
   - `/src/app/components/figma/ImageWithFallback.tsx`
   - `/supabase/functions/server/kv_store.tsx`
   - `/utils/supabase/info.tsx`
3. **Don't change database schema** - It's already perfect
4. **Don't create new components** unless the guide says to
5. **Don't modify styling** - It's already done
6. **Don't change routing** - It's already configured
7. **Don't add extra features** - Just complete integration
8. **Don't hallucinate code** - Use code from guides
9. **Don't skip testing** - Test each phase
10. **Don't modify `.env` file** - User will configure

---

## FILE REFERENCE

### Files You Will Create (7 new files):

1. `/src/app/hooks/useOrders.ts`
2. `/src/app/hooks/useFarmerData.ts`
3. `/src/app/hooks/useAdminData.ts`
4. `/src/app/components/ErrorBoundary.tsx`
5. `/src/app/components/LoadingSpinner.tsx`

### Files You Will Modify (15 existing files):

1. `/src/app/pages/checkout/Payment.tsx`
2. `/src/app/pages/checkout/Success.tsx`
3. `/src/app/pages/TrackOrder.tsx`
4. `/src/app/hooks/useAuctions.ts`
5. `/src/app/pages/Auctions.tsx`
6. `/src/app/pages/LiveAuction.tsx`
7. `/src/app/pages/farmer/Dashboard.tsx`
8. `/src/app/pages/farmer/AddProduct.tsx`
9. `/src/app/pages/farmer/Products.tsx`
10. `/src/app/pages/farmer/Orders.tsx`
11. `/src/app/pages/admin/Dashboard.tsx`
12. `/src/app/pages/admin/Products.tsx`
13. `/src/app/pages/admin/Users.tsx`
14. `/src/app/pages/admin/Orders.tsx`
15. `/src/lib/supabase.ts`
16. `/src/app/App.tsx`

### Files You Will NOT Touch:

- All files in `/src/app/components/ui/` - UI components
- `/src/app/components/Header.tsx` - Already complete
- `/src/app/components/Footer.tsx` - Already complete
- `/src/app/components/DashboardSidebar.tsx` - Already complete
- `/src/app/pages/Home.tsx` - Already complete
- `/src/app/pages/Products.tsx` - Already complete (uses `useProducts`)
- `/src/app/pages/Login.tsx` - Already complete
- `/src/app/pages/Register.tsx` - Already complete
- `/src/app/context/AuthContext.tsx` - Already complete
- `/src/app/context/CartContext.tsx` - Already complete
- `/src/app/hooks/useProducts.ts` - Already complete
- All styling files - Already complete

---

## STEP-BY-STEP WORKFLOW

### Step 1: Read Documentation (15 minutes)
- [ ] Read `START_HERE.md`
- [ ] Read `MASTER_PLAN.md`
- [ ] Read `DEPLOYMENT_CHECKLIST.md`
- [ ] Understand what's done vs what needs work

### Step 2: Phase 1 - Checkout (1 hour)
- [ ] Read `IMPLEMENTATION_STEP_BY_STEP.md` Phase 1 section completely
- [ ] Create `/src/app/hooks/useOrders.ts` - copy code from guide
- [ ] Modify `/src/app/pages/checkout/Payment.tsx` - use fast_apply_tool
- [ ] Modify `/src/app/pages/checkout/Success.tsx` - use fast_apply_tool
- [ ] Modify `/src/app/pages/TrackOrder.tsx` - use fast_apply_tool
- [ ] Test: Add to cart → checkout → verify order in Supabase

### Step 3: Phase 2 - Auctions (1 hour)
- [ ] Read `IMPLEMENTATION_STEP_BY_STEP.md` Phase 2 section completely
- [ ] Modify `/src/app/hooks/useAuctions.ts` - replace entire file
- [ ] Modify `/src/app/pages/Auctions.tsx` - use fast_apply_tool
- [ ] Modify `/src/app/pages/LiveAuction.tsx` - replace entire file
- [ ] Test: View auctions → join auction → place bid → verify in Supabase

### Step 4: Phase 3 - Farmer Dashboard (2 hours)
- [ ] Read `PHASES_3_TO_8.md` Phase 3 section completely
- [ ] Create `/src/app/hooks/useFarmerData.ts` - copy code from guide
- [ ] Modify `/src/app/pages/farmer/Dashboard.tsx` - use fast_apply_tool
- [ ] Modify `/src/app/pages/farmer/AddProduct.tsx` - replace with code from guide
- [ ] Modify `/src/app/pages/farmer/Products.tsx` - use fast_apply_tool
- [ ] Modify `/src/app/pages/farmer/Orders.tsx` - use fast_apply_tool
- [ ] Modify `/src/lib/supabase.ts` - add upload functions at end
- [ ] Test: Login as farmer → add product → upload image → verify in Supabase

### Step 5: Phase 4 - Admin Dashboard (2 hours)
- [ ] Read `PHASES_3_TO_8.md` Phase 4 section completely
- [ ] Create `/src/app/hooks/useAdminData.ts` - copy code from guide
- [ ] Modify `/src/app/pages/admin/Dashboard.tsx` - use fast_apply_tool
- [ ] Modify `/src/app/pages/admin/Products.tsx` - use fast_apply_tool
- [ ] Modify `/src/app/pages/admin/Users.tsx` - use fast_apply_tool
- [ ] Modify `/src/app/pages/admin/Orders.tsx` - use fast_apply_tool
- [ ] Test: Login as admin → approve product → change role → verify

### Step 6: Phase 6 - Polish (30 minutes)
- [ ] Read `PHASES_3_TO_8.md` Phase 6 section completely
- [ ] Create `/src/app/components/ErrorBoundary.tsx` - copy from guide
- [ ] Create `/src/app/components/LoadingSpinner.tsx` - copy from guide
- [ ] Install sonner: `npm install sonner`
- [ ] Modify `/src/app/App.tsx` - wrap with ErrorBoundary, add Toaster
- [ ] Test: Errors are caught, loading states work

### Step 7: Phase 7 - Testing (1 hour)
- [ ] Read `PHASES_3_TO_8.md` Phase 7 section completely
- [ ] Go through complete buyer flow
- [ ] Go through complete farmer flow
- [ ] Go through complete admin flow
- [ ] Verify all data in Supabase tables
- [ ] Check for console errors
- [ ] Test on different screen sizes

---

## TESTING COMMANDS

After each phase, the user should run:

```bash
# Start dev server
npm run dev

# Open browser
# Go to http://localhost:5173

# Test the features you just integrated
```

To verify database:
```
1. Open Supabase dashboard
2. Go to Table Editor
3. Check the relevant tables
4. Verify data is being saved
```

---

## SUCCESS CRITERIA

You will know integration is complete when:

### Functional Tests:
- [ ] User can register (buyer/farmer/admin)
- [ ] User can login and stay logged in
- [ ] Cart persists across sessions
- [ ] Checkout creates orders in database
- [ ] Orders appear in success page
- [ ] Tracking works
- [ ] Auctions fetch from database
- [ ] Bids save and update in real-time
- [ ] Farmers can upload products
- [ ] Images save to Supabase Storage
- [ ] Admin can approve products
- [ ] Admin can manage users
- [ ] All dashboards show real data

### Database Tests:
- [ ] `users` table has entries
- [ ] `products` table has entries
- [ ] `orders` table has entries
- [ ] `order_items` table has entries
- [ ] `cart_items` table has entries
- [ ] `auctions` table has entries (if created)
- [ ] `bids` table has entries (if bids placed)
- [ ] `tracking` table has entries
- [ ] Storage buckets have images

### Code Quality:
- [ ] No console errors
- [ ] No TypeScript errors
- [ ] All imports resolve correctly
- [ ] All hooks return correct types
- [ ] Loading states work
- [ ] Error handling exists

---

## EXPECTED ERRORS & SOLUTIONS

### Error: "Cannot find module 'sonner'"
**Solution**: Run `npm install sonner`

### Error: "Table 'xxx' does not exist"
**Solution**: User needs to run SQL migrations in Supabase

### Error: "RLS policy violation"
**Solution**: Check if user is logged in, verify RLS policies in Supabase

### Error: "Storage bucket not found"
**Solution**: User needs to create storage buckets in Supabase

### Error: Import path incorrect
**Solution**: Check relative paths, adjust based on file location

---

## COMMUNICATION

After each phase, summarize:
- ✅ What you completed
- ✅ Files created/modified
- ✅ What to test
- ⏭️ What's next

Example:
```
✅ Phase 1 Complete: Checkout & Orders

Files Created:
- /src/app/hooks/useOrders.ts

Files Modified:
- /src/app/pages/checkout/Payment.tsx
- /src/app/pages/checkout/Success.tsx
- /src/app/pages/TrackOrder.tsx

Please Test:
1. Add items to cart
2. Complete checkout
3. Verify order appears in Supabase → orders table
4. Check success page shows order details
5. Try tracking order

Next: Phase 2 - Auctions Integration
```

---

## FINAL DELIVERABLE

When all phases are complete, provide:

### 1. Summary Report
- List all files created
- List all files modified
- List all features integrated
- List what was tested

### 2. Testing Checklist
- Provide complete checklist for user to verify
- Include database verification steps
- Include functional testing steps

### 3. Next Steps for User
- How to test locally
- How to verify in Supabase
- What to do before deployment

---

## IMPORTANT REMINDERS

1. **You have ALL the code** - It's in the guides, just copy it
2. **Don't improvise** - Follow guides exactly
3. **Test as you go** - Don't wait until end
4. **Check Supabase** - Verify data is actually saving
5. **Console.log** - Add logs to debug issues
6. **Read existing code** - Before modifying, understand it
7. **Follow imports** - Use same import style as existing code
8. **Preserve styling** - Don't change any Tailwind classes
9. **Keep structure** - Don't reorganize files or folders
10. **Be thorough** - Complete all phases, don't skip

---

## YOUR TASK STARTS NOW

Begin with **Phase 1: Checkout & Orders**

Read `IMPLEMENTATION_STEP_BY_STEP.md` → Phase 1 section, and start implementing.

**Good luck! Let's make this 100% functional!** 🚀

