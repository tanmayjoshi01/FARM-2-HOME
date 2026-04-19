# Farm2Home - Quick Start Guide

## ✅ What's Been Done

### 1. **Supabase Client Installed** ✓
```bash
npm install @supabase/supabase-js
```

### 2. **Core Integration Files Created** ✓
- `/src/lib/supabase.ts` - Client setup + upload helpers
- `/src/app/context/AuthContext.tsx` - Real authentication
- `/src/app/context/CartContext.tsx` - Database-backed cart
- `/src/app/hooks/useProducts.ts` - Fetch real products
- `/src/app/hooks/useAuctions.ts` - Fetch live auctions
- `/src/app/pages/Products.tsx` - Updated to use real data
- `/.env.example` - Environment variable template

### 3. **Complete Documentation** ✓
- `/SUPABASE_SETUP.md` - Full backend schema (13 tables, RLS policies, functions)
- `/INTEGRATION_GUIDE.md` - Detailed frontend integration guide
- `/QUICK_START.md` - This file

---

## 🚀 How to Get Started (3 Steps)

### STEP 1: Create Supabase Project

1. Go to https://supabase.com and create a new project
2. Wait for it to initialize (~2 minutes)
3. Go to **Settings** → **API**
4. Copy your `URL` and `anon/public key`

### STEP 2: Add Environment Variables

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Edit `.env` and paste your Supabase credentials:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### STEP 3: Run Database Migrations

Open **Supabase Dashboard** → **SQL Editor** and run these in order:

1. **Extensions & Enums** (from SUPABASE_SETUP.md, Step 1)
2. **All Tables** (from SUPABASE_SETUP.md, Step 2)
3. **Triggers** (from SUPABASE_SETUP.md, Part 3)
4. **Functions** (from SUPABASE_SETUP.md, Part 5)
5. **RLS Policies** (from SUPABASE_SETUP.md, Part 6)
6. **Storage Buckets** (from SUPABASE_SETUP.md, Part 7)

7. **Auth user mirror trigger**: also run [supabase/fix_auth_user_trigger.sql](./supabase/fix_auth_user_trigger.sql) to auto-create `public.users` rows for new signups. This is required for cart inserts to pass the `carts_user_id_fkey` foreign key.

---

## 📊 What You Get

### ✅ WORKING NOW

1. **Real Authentication**
   - Login/Register with role selection
   - Buyer/Farmer/Admin roles
   - Session persistence

2. **Real Products**
   - Products page fetches from database
   - Search and filter work
   - Only approved products shown

3. **Real Cart**
   - Adds items to database
   - Syncs across tabs (real-time)
   - Persists after logout

4. **Real Price Calculations**
   - 3% platform fee
   - 18% GST
   - Free delivery over ₹500
   - Calculated automatically

---

## 🔧 What to Replace Next

### Priority 1: Farmer Product Upload

**File**: `/src/app/pages/farmer/AddProduct.tsx`

**Complete code provided in INTEGRATION_GUIDE.md** - includes:
- Image upload to Supabase Storage
- Certificate upload with signed URLs
- Form submission to database
- Waiting for admin approval

### Priority 2: Auctions Page

Replace mock data in `/src/app/pages/Auctions.tsx`:

```typescript
// OLD (mock data)
const auctionItems = [ ... ];

// NEW (real data)
import { useAuctions } from "../hooks/useAuctions";

export function Auctions() {
  const { auctions, loading } = useAuctions();
  // ... rest remains same
}
```

### Priority 3: Live Auction with Real-time Bidding

Use the `useLiveAuction` hook (provided in SUPABASE_SETUP.md, Part 8):

```typescript
import { useLiveAuction } from "../hooks/useLiveAuction";

export function LiveAuction() {
  const { auction, bids, placeBid, timeLeft } = useLiveAuction(auctionId);
  // Real-time updates automatically!
}
```

---

## 📝 Key Features Explained

### 1. Image Upload

```typescript
import { uploadProductImage } from "../../lib/supabase";

const handleUpload = async (file: File, productId: string) => {
  const imageUrl = await uploadProductImage(file, productId);
  // Returns public URL like:
  // https://your-project.supabase.co/storage/v1/object/public/product-images/...
};
```

### 2. Certificate Upload (Private)

```typescript
import { uploadCertificate, getCertificateUrl } from "../../lib/supabase";

// Upload
const certPath = await uploadCertificate(file, productId);

// View (generates signed URL that expires)
const signedUrl = await getCertificateUrl(certPath, 3600); // 1 hour
window.open(signedUrl, '_blank');
```

### 3. Price Calculation

```typescript
import { calculateOrderTotals } from "../../lib/supabase";

const subtotal = 1000;
const { platformFee, gst, delivery, total } = calculateOrderTotals(subtotal);

// Results:
// platformFee: 30    (3% of 1000)
// gst: 180           (18% of 1000)
// delivery: 0        (free because > 500)
// total: 1210
```

### 4. Real-time Auction Updates

```typescript
// Subscribe to auction updates
const subscription = supabase
  .channel(`auction:${auctionId}`)
  .on('postgres_changes', 
    { 
      event: 'UPDATE',
      schema: 'public',
      table: 'auctions',
      filter: `id=eq.${auctionId}`
    },
    (payload) => {
      // Auction updated! (new bid placed)
      console.log('New bid:', payload.new.current_bid);
    }
  )
  .subscribe();
```

---

## 🔐 Security Features

### Row Level Security (RLS)

**Already configured!** Example policies:

```sql
-- Buyers can only view approved products
CREATE POLICY "View approved products"
  ON products FOR SELECT
  USING (status = 'approved');

-- Farmers can only update their own products
CREATE POLICY "Update own products"
  ON products FOR UPDATE
  USING (auth.uid() = farmer_id);

-- Only buyers can add to cart
CREATE POLICY "Buyers manage cart"
  ON cart_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM carts WHERE id = cart_id AND user_id = auth.uid()
    )
  );
```

---

## 📋 Database Schema Summary

| Table | Purpose | Key Fields |
|-------|---------|------------|
| **users** | User profiles | role, full_name, phone |
| **products** | Product listings | name, price, status, farmer_id |
| **certificates** | Product certificates | certificate_url (private storage) |
| **carts** | Shopping carts | user_id |
| **cart_items** | Cart contents | cart_id, product_id, quantity |
| **orders** | Order records | buyer_id, farmer_id, total, status |
| **order_items** | Order line items | order_id, product_id, quantity |
| **auctions** | Live auctions | product_id, current_bid, ends_at |
| **bids** | Auction bids | auction_id, bidder_id, bid_amount |
| **notifications** | User notifications | user_id, message, is_read |
| **tracking** | Order tracking | order_id, status, location |
| **addresses** | Delivery addresses | user_id, pincode, is_default |
| **wishlists** | Saved products | user_id, product_id |

---

## 🧪 Testing Flow

1. **Register as Admin** (manually update role in database)
2. **Register as Farmer** → Add product with image
3. **Admin Login** → Approve product
4. **Register as Buyer** → Add to cart → Checkout
5. **Check Database** → Order created with correct prices
6. **Farmer Login** → See order → Update tracking

---

## 🆘 Common Issues

### Issue: "Missing environment variables"
**Fix**: Make sure `.env` file exists with valid Supabase credentials

### Issue: "Products not loading"
**Fix**: Run all database migrations, ensure RLS policies are active

### Issue: "Can't upload images"
**Fix**: Create storage buckets (SUPABASE_SETUP.md, Part 7)

### Issue: "Cart not syncing"
**Fix**: Enable realtime on `cart_items` table (Database → Replication)

---

## 📚 Next Steps

1. ✅ Set up Supabase
2. ✅ Add environment variables
3. ✅ Run database migrations
4. ⏳ Replace Farmer AddProduct page (code in INTEGRATION_GUIDE.md)
5. ⏳ Replace remaining pages using same patterns
6. ⏳ Test complete user flows
7. ⏳ Add more features (wishlist, notifications, etc.)

---

## 💡 Pro Tips

1. **Use Supabase Studio** to view database changes in real-time
2. **Check RLS policies** if queries return empty arrays
3. **Enable realtime** for tables you want to sync live
4. **Use signed URLs** for private files (certificates)
5. **Test with multiple users** to verify RLS works correctly

---

**You now have everything needed to build a production-ready Farm2Home marketplace!** 🚀
