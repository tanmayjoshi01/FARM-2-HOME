# Farm2Home - Exact Replacement Examples

## 📌 How Mock Data is Being Replaced

This document shows BEFORE and AFTER for all key replacements.

---

## 1. Products Page - BEFORE vs AFTER

### ❌ BEFORE (Mock Data)

```typescript
// OLD /src/app/pages/Products.tsx
const mockProducts = [
  {
    id: 1,
    name: "Organic Tomatoes",
    farmer: "Green Valley Farm",
    price: 60,
    unit: "kg",
    image: "https://...",
    type: "direct",
  },
  // ... more mock data
];

const filteredProducts = mockProducts.filter((product) => {
  // filtering logic
});
```

### ✅ AFTER (Real Database)

```typescript
// NEW /src/app/pages/Products.tsx
import { useProducts } from "../hooks/useProducts";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";

export function Products() {
  const { products, loading } = useProducts(filter, searchQuery);
  const { addItem } = useCart();
  const { isAuthenticated, user } = useAuth();

  const handleAddToCart = async (productId: string, productName: string) => {
    if (!isAuthenticated) {
      toast.error("Please log in to add items to cart");
      return;
    }
    try {
      await addItem(productId); // Real database insert
      toast.success(`${productName} added to cart!`);
    } catch (error) {
      toast.error("Failed to add to cart");
    }
  };

  // ... rest of component uses {products} instead of mockProducts
}
```

**What changed**:
- ❌ `mockProducts` array → ✅ `useProducts()` hook
- ❌ Client-side filter → ✅ Database query with filter
- ❌ Fake add to cart → ✅ Real `addItem()` with database insert

---

## 2. Cart Context - BEFORE vs AFTER

### ❌ BEFORE (localStorage)

```typescript
// OLD CartContext
const [cartItems, setCartItems] = useState<CartItem[]>(defaultItems);

const addItem = (item: Omit<CartItem, "quantity">) => {
  setCartItems((prev) => {
    const exists = prev.find((i) => i.id === item.id);
    if (exists) {
      return prev.map((i) =>
        i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
      );
    }
    return [...prev, { ...item, quantity: 1 }];
  });
};
```

### ✅ AFTER (Supabase Database)

```typescript
// NEW CartContext
const addItem = async (productId: string, quantity: number = 1) => {
  if (!cartId || !user) {
    throw new Error("Please log in to add items to cart");
  }

  try {
    const existingItem = cartItems.find((item) => item.product_id === productId);

    if (existingItem) {
      await updateQuantity(existingItem.id, existingItem.quantity + quantity);
    } else {
      // REAL DATABASE INSERT
      const { error } = await supabase.from("cart_items").insert({
        cart_id: cartId,
        product_id: productId,
        quantity,
      });

      if (error) throw error;
      await loadCart(); // Reload from database
    }
  } catch (error) {
    console.error("Error adding to cart:", error);
    throw error;
  }
};
```

**What changed**:
- ❌ `setCartItems` → ✅ `supabase.from("cart_items").insert()`
- ❌ Memory only → ✅ Persisted in database
- ❌ Lost on refresh → ✅ Survives logout/login
- ❌ No sync across tabs → ✅ Real-time sync

---

## 3. Farmer Add Product - IMAGE & CERTIFICATE UPLOAD

### ❌ BEFORE (Fake Upload)

```typescript
// OLD - Mock upload
const handleImageDrop = (e: React.DragEvent) => {
  e.preventDefault();
  setIsDragging(false);
  setProductImage("product-image.jpg"); // Just sets filename!
};

const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  alert("Product added successfully!"); // Does nothing!
};
```

### ✅ AFTER (Real Supabase Storage + Database)

```typescript
// NEW - Real upload to Supabase Storage
import { supabase, uploadProductImage, uploadCertificate } from "../../../lib/supabase";

const [productImageFile, setProductImageFile] = useState<File | null>(null);
const [certificateFile, setCertificateFile] = useState<File | null>(null);

const handleImageChange = (file: File) => {
  if (file && file.type.startsWith("image/")) {
    setProductImageFile(file); // Store actual File object
    const reader = new FileReader();
    reader.onloadend = () => {
      setProductImagePreview(reader.result as string); // Show preview
    };
    reader.readAsDataURL(file);
  }
};

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setSubmitting(true);

  try {
    // STEP 1: Create product in database
    const { data: product, error } = await supabase
      .from("products")
      .insert({
        farmer_id: user.id,
        name: formData.name,
        category: formData.category,
        quantity: parseInt(formData.quantity),
        price_per_unit: parseFloat(formData.price_per_unit),
        status: "pending", // Awaits admin approval
      })
      .select("id")
      .single();

    if (error) throw error;

    // STEP 2: Upload image to Supabase Storage (product-images bucket)
    const imageUrl = await uploadProductImage(productImageFile!, product.id);

    // STEP 3: Update product with image URL
    await supabase
      .from("products")
      .update({ image_url: imageUrl })
      .eq("id", product.id);

    // STEP 4: Upload certificate if provided
    if (certificateFile) {
      const certPath = await uploadCertificate(certificateFile, product.id);
      
      // Create certificate record
      await supabase.from("certificates").insert({
        product_id: product.id,
        certificate_type: "organic",
        certificate_url: certPath, // Private path
      });
    }

    toast.success("Product submitted for approval!");
    navigate("/farmer/products");
  } catch (error: any) {
    toast.error(error.message || "Failed to add product");
  } finally {
    setSubmitting(false);
  }
};
```

**What changed**:
- ❌ Fake filename string → ✅ Actual File object
- ❌ `alert()` → ✅ Real database insert
- ❌ No image upload → ✅ Upload to Supabase Storage bucket
- ❌ No certificate storage → ✅ Private storage with signed URLs
- ❌ Instant approval → ✅ Pending status, requires admin approval

---

## 4. Price Calculations - BEFORE vs AFTER

### ❌ BEFORE (Hardcoded in Component)

```typescript
// OLD Cart.tsx - Calculations in component
const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
const platformFee = Math.round(subtotal * 0.03);
const gst = Math.round(subtotal * 0.18);
const delivery = subtotal > 500 ? 0 : 49;
const total = subtotal + platformFee + gst + delivery;

// But... not saved to database!
```

### ✅ AFTER (Helper Function + Database)

```typescript
// NEW - Centralized calculation in /src/lib/supabase.ts
export function calculateOrderTotals(subtotal: number) {
  const platformFee = Math.round(subtotal * 0.03 * 100) / 100;
  const gst = Math.round(subtotal * 0.18 * 100) / 100;
  const delivery = subtotal > 500 ? 0 : 49;
  const total = Math.round((subtotal + platformFee + gst + delivery) * 100) / 100;

  return { subtotal, platformFee, gst, delivery, total };
}

// Used in CartContext.checkout()
const checkout = async (addressId: string) => {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const { platformFee, gst, delivery, total } = calculateOrderTotals(subtotal);

  // SAVE TO DATABASE
  const { data, error } = await supabase.from("orders").insert({
    order_number: generateOrderNumber(),
    buyer_id: user.id,
    farmer_id: farmerData.farmer_id,
    address_id: addressId,
    order_type: "direct",
    subtotal,              // ₹1000
    platform_fee: platformFee,  // ₹30 (3%)
    gst,                   // ₹180 (18%)
    delivery_charge: delivery,   // ₹0 or ₹49
    total,                 // ₹1210
    status: "pending",
    payment_status: "completed",
  });
};
```

**What changed**:
- ❌ Calculations only in UI → ✅ Saved to database
- ❌ Duplicate code → ✅ Centralized helper function
- ❌ Can't query orders by price → ✅ Can filter/sort by price in database
- ❌ Lost on refresh → ✅ Permanent record

---

## 5. Auctions - BEFORE vs AFTER

### ❌ BEFORE (Fake Timer with setInterval)

```typescript
// OLD LiveAuction.tsx
const [timeLeft, setTimeLeft] = useState({ hours: 2, minutes: 47, seconds: 33 });
const [currentBid, setCurrentBid] = useState(5400);

// Fake countdown
useEffect(() => {
  const timer = setInterval(() => {
    setTimeLeft((prev) => {
      const { hours, minutes, seconds } = prev;
      if (seconds > 0) return { hours, minutes, seconds: seconds - 1 };
      // ... decrement logic
    });
  }, 1000);
  return () => clearInterval(timer);
}, []);

// Fake incoming bids!
useEffect(() => {
  const simulate = setInterval(() => {
    const shouldBid = Math.random() > 0.6;
    if (shouldBid) {
      const newAmount = currentBid + 100;
      setBids((prev) => [
        { user: "FakeUser", amount: newAmount, time: "Now", isNew: true },
        ...prev
      ]);
      setCurrentBid(newAmount);
    }
  }, 6000); // Random fake bids every 6 seconds!
}, [currentBid]);
```

### ✅ AFTER (Real-time Supabase)

```typescript
// NEW - Real auction with live updates
import { useLiveAuction } from "../hooks/useLiveAuction";

export function LiveAuction() {
  const { auctionId } = useParams();
  const { auction, bids, timeLeft, placeBid, loading } = useLiveAuction(auctionId!);

  const handlePlaceBid = async (amount: number) => {
    try {
      await placeBid(amount); // Calls place_bid() SQL function
      toast.success("Bid placed successfully!");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  // Countdown calculated from database ends_at field
  // Bids come from real-time subscription to 'bids' table
  // Current bid updates via real-time subscription to 'auctions' table
}

// In useLiveAuction.ts hook:
const subscription = supabase
  .channel(`auction:${auctionId}`)
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'bids',
      filter: `auction_id=eq.${auctionId}`,
    },
    () => {
      loadBids(); // Real bid just came in!
    }
  )
  .subscribe();
```

**What changed**:
- ❌ `Math.random()` fake bids → ✅ Real users bidding
- ❌ `setInterval` simulation → ✅ Real-time Supabase subscriptions
- ❌ Countdown from hardcoded value → ✅ Countdown from database `ends_at`
- ❌ No validation → ✅ SQL function validates minimum bid
- ❌ Bids lost on refresh → ✅ Bids persisted in database

---

## 6. Certificate Upload & Viewing

### ❌ BEFORE (No Implementation)

```typescript
// OLD - Certificate was just a string!
const [certificate, setCertificate] = useState<string | null>(null);

const handleCertificateDrop = (e: React.DragEvent) => {
  e.preventDefault();
  setCertificate("certificate.pdf"); // Just a filename!
};
```

### ✅ AFTER (Real Private Storage with Signed URLs)

```typescript
// NEW - Real certificate upload to private bucket

// UPLOAD (Farmer)
import { uploadCertificate } from "../../../lib/supabase";

const [certificateFile, setCertificateFile] = useState<File | null>(null);

const handleUpload = async () => {
  // Upload to private 'certificates' bucket
  const certPath = await uploadCertificate(certificateFile!, product.id);
  // Returns: "certificates/product-123-cert-1234567890.pdf"

  // Save path to database
  await supabase.from("certificates").insert({
    product_id: product.id,
    certificate_type: "organic",
    certificate_url: certPath, // Private path
    issued_by: "Indian Organic Certification",
    valid_until: "2025-12-31",
  });
};

// VIEW (Buyer who ordered the product)
import { getCertificateUrl } from "../../lib/supabase";

const viewCertificate = async (certificatePath: string) => {
  // Generate signed URL (expires in 1 hour)
  const signedUrl = await getCertificateUrl(certificatePath, 3600);
  // Returns: "https://...supabase.co/storage/...?token=xyz&expires=..."
  
  window.open(signedUrl, '_blank');
};
```

**What changed**:
- ❌ String filename → ✅ Actual File uploaded to storage
- ❌ Public access → ✅ Private bucket, signed URLs only
- ❌ Anyone can view → ✅ Only buyers who ordered + admin + farmer
- ❌ Lost on refresh → ✅ Permanent storage with metadata

---

## Summary Table

| Feature | BEFORE (Mock) | AFTER (Real) |
|---------|---------------|--------------|
| **Products** | Hardcoded array | Database query |
| **Cart** | localStorage | Supabase table |
| **Cart Sync** | None | Real-time across tabs |
| **Add to Cart** | Push to array | Database INSERT |
| **Checkout** | Alert message | Create order record |
| **Price Calc** | UI only | Saved to database |
| **Image Upload** | Fake filename | Supabase Storage |
| **Certificate** | String | Private storage + signed URLs |
| **Auctions** | setInterval fake | Real-time subscriptions |
| **Bids** | Math.random() | Real users + SQL validation |
| **Authentication** | localStorage | Supabase Auth + RLS |
| **Persistence** | Lost on refresh | Permanent database |

---

## 🔥 Next: Apply These Patterns to Remaining Pages

Use the same patterns for:

1. **Farmer Products Page** - Replace mock product list with database query
2. **Farmer Orders** - Fetch real orders from `orders` table
3. **Admin Dashboard** - Use `get_admin_stats()` SQL function
4. **Admin Approve Products** - UPDATE status from 'pending' to 'approved'
5. **Track Order** - Read from `tracking` table with real-time updates

**All follow the same pattern**: Replace mock → Import from Supabase → Use hooks/queries

