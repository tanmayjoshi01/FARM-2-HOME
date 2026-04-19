# Farm2Home - Complete Frontend Integration Guide

## 🎯 Overview

This guide shows you **exactly** how to replace ALL mock data, implement certificate uploads, product image uploads, and integrate real price calculations with your Supabase backend.

---

## ✅ COMPLETED INTEGRATIONS

### 1. **AuthContext** ✓
- **Location**: `/src/app/context/AuthContext.tsx`
- **Status**: Fully integrated with Supabase Auth
- **Features**:
  - Real user authentication
  - Role-based login (buyer/farmer/admin)
  - Session persistence
  - Auto-profile fetching

### 2. **CartContext** ✓
- **Location**: `/src/app/context/CartContext.tsx`
- **Status**: Fully integrated with database
- **Features**:
  - Real-time cart sync across tabs
  - Database-backed cart storage
  - Automatic price calculations (3% platform fee, 18% GST)
  - Checkout function with order creation

### 3. **Products Page** ✓
- **Location**: `/src/app/pages/Products.tsx`
- **Status**: Mock data replaced with `useProducts` hook
- **Features**:
  - Real-time product loading from database
  - Search and filter functionality
  - Add to cart integration

### 4. **useProducts Hook** ✓
- **Location**: `/src/app/hooks/useProducts.ts`
- **Fetches**: Real products from Supabase
- **Features**:
  - Approved products only
  - Search by name/category
  - Filter by type (direct/auction)

### 5. **useAuctions Hook** ✓
- **Location**: `/src/app/hooks/useAuctions.ts`
- **Fetches**: Live auctions from Supabase
- **Features**:
  - Real-time countdown
  - Live bid updates
  - Auto-refresh on changes

---

## 📋 REMAINING INTEGRATIONS

### 6. Farmer Add Product Page (WITH IMAGE & CERTIFICATE UPLOAD)

**File**: `/src/app/pages/farmer/AddProduct.tsx`

**What needs to be replaced**:
- Mock image upload → Real Supabase Storage upload
- Mock certificate upload → Real Supabase Storage upload with signed URLs
- Mock form submission → Real database insert

**Complete Implementation**:

```typescript
import { useState } from "react";
import { useNavigate } from "react-router";
import { DashboardSidebar } from "../../components/DashboardSidebar";
import { Upload, Image as ImageIcon, FileText, CheckCircle2, X, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { useAuth } from "../../context/AuthContext";
import { supabase, uploadProductImage, uploadCertificate } from "../../../lib/supabase";
import { toast } from "sonner";

export function FarmerAddProduct() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "Vegetables",
    quantity: "",
    unit: "kg",
    price_per_unit: "",
    grade: "A" as "A" | "B" | "C",
    location: "",
  });

  // File upload states
  const [productImageFile, setProductImageFile] = useState<File | null>(null);
  const [productImagePreview, setProductImagePreview] = useState<string | null>(null);
  const [certificateFile, setCertificateFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Handle image file selection
  const handleImageChange = (file: File) => {
    if (file && file.type.startsWith("image/")) {
      setProductImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProductImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      toast.error("Please select a valid image file");
    }
  };

  // Handle certificate file selection
  const handleCertificateChange = (file: File) => {
    const validTypes = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];
    if (file && validTypes.includes(file.type)) {
      setCertificateFile(file);
    } else {
      toast.error("Please select a valid certificate file (PDF or Image)");
    }
  };

  // Handle drag and drop
  const handleImageDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleImageChange(file);
  };

  const handleCertificateDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleCertificateChange(file);
  };

  // Submit product with image and certificate upload
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error("You must be logged in");
      return;
    }

    if (!productImageFile) {
      toast.error("Please upload a product image");
      return;
    }

    setSubmitting(true);

    try {
      // Step 1: Create product record first (to get product ID)
      const { data: product, error: productError } = await supabase
        .from("products")
        .insert({
          farmer_id: user.id,
          name: formData.name,
          description: formData.description,
          category: formData.category,
          quantity: parseInt(formData.quantity),
          unit: formData.unit,
          price_per_unit: parseFloat(formData.price_per_unit),
          grade: formData.grade,
          location: formData.location,
          status: "pending", // Awaits admin approval
        })
        .select("id")
        .single();

      if (productError) throw productError;

      // Step 2: Upload product image to Supabase Storage
      const imageUrl = await uploadProductImage(productImageFile, product.id);

      // Step 3: Update product with image URL
      const { error: updateError } = await supabase
        .from("products")
        .update({ 
          image_url: imageUrl,
          has_certificate: !!certificateFile 
        })
        .eq("id", product.id);

      if (updateError) throw updateError;

      // Step 4: Upload certificate if provided
      if (certificateFile) {
        const certPath = await uploadCertificate(certificateFile, product.id);

        // Step 5: Create certificate record
        await supabase.from("certificates").insert({
          product_id: product.id,
          certificate_type: "organic", // You can make this selectable
          certificate_url: certPath,
        });
      }

      toast.success("Product submitted for approval!");
      navigate("/farmer/products");
    } catch (error: any) {
      console.error("Error adding product:", error);
      toast.error(error.message || "Failed to add product");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f9fafb]">
      <DashboardSidebar type="farmer" />
      
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Add New Product</h1>
          <p className="text-gray-600 mt-1">List your fresh produce on the marketplace</p>
        </div>

        {/* Main Content */}
        <div className="p-8">
          <div className="max-w-4xl">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Product Image Upload */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
              >
                <h2 className="font-bold text-gray-900 text-lg mb-4">Product Image *</h2>
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleImageDrop}
                  className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                    isDragging
                      ? "border-[#16a34a] bg-green-50"
                      : productImagePreview
                      ? "border-green-300 bg-green-50"
                      : "border-gray-300 bg-gray-50"
                  }`}
                >
                  {productImagePreview ? (
                    <div className="flex flex-col items-center">
                      <img src={productImagePreview} alt="Preview" className="w-48 h-48 object-cover rounded-lg mb-4" />
                      <p className="font-semibold text-gray-900 mb-1">Image Ready</p>
                      <p className="text-sm text-gray-600 mb-4">{productImageFile?.name}</p>
                      <button
                        type="button"
                        onClick={() => {
                          setProductImageFile(null);
                          setProductImagePreview(null);
                        }}
                        className="text-sm text-red-600 hover:text-red-700 font-medium"
                      >
                        Remove Image
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="w-20 h-20 bg-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Upload className="w-10 h-10 text-gray-500" />
                      </div>
                      <p className="font-semibold text-gray-700 mb-1">
                        Drag & drop product image here
                      </p>
                      <p className="text-sm text-gray-500 mb-4">or</p>
                      <label className="inline-block">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => e.target.files && handleImageChange(e.target.files[0])}
                          className="hidden"
                        />
                        <span className="inline-block bg-[#16a34a] text-white px-6 py-3 rounded-xl font-semibold text-sm cursor-pointer hover:bg-[#15803d] transition-colors shadow-md shadow-green-200">
                          Browse Files
                        </span>
                      </label>
                      <p className="text-xs text-gray-400 mt-3">JPG, PNG (Max 5MB)</p>
                    </>
                  )}
                </div>
              </motion.div>

              {/* Certificate Upload */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
              >
                <h2 className="font-bold text-gray-900 text-lg mb-4">Certificate (Optional)</h2>
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleCertificateDrop}
                  className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                    certificateFile
                      ? "border-green-300 bg-green-50"
                      : "border-gray-300 bg-gray-50"
                  }`}
                >
                  {certificateFile ? (
                    <div className="flex flex-col items-center">
                      <div className="w-20 h-20 bg-[#16a34a] rounded-2xl flex items-center justify-center mb-4">
                        <CheckCircle2 className="w-10 h-10 text-white" />
                      </div>
                      <p className="font-semibold text-gray-900 mb-1">Certificate Uploaded</p>
                      <p className="text-sm text-gray-600 mb-4 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-[#16a34a]" />
                        {certificateFile.name}
                      </p>
                      <button
                        type="button"
                        onClick={() => setCertificateFile(null)}
                        className="text-sm text-red-600 hover:text-red-700 font-medium"
                      >
                        Remove Certificate
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="w-20 h-20 bg-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <FileText className="w-10 h-10 text-gray-500" />
                      </div>
                      <p className="font-semibold text-gray-700 mb-1">
                        Drag & drop certificate here
                      </p>
                      <p className="text-sm text-gray-500 mb-4">or</p>
                      <label className="inline-block">
                        <input
                          type="file"
                          accept=".pdf,image/*"
                          onChange={(e) => e.target.files && handleCertificateChange(e.target.files[0])}
                          className="hidden"
                        />
                        <span className="inline-block bg-gray-700 text-white px-6 py-3 rounded-xl font-semibold text-sm cursor-pointer hover:bg-gray-800 transition-colors">
                          Browse Files
                        </span>
                      </label>
                      <p className="text-xs text-gray-400 mt-3">PDF, JPG, PNG (Max 10MB)</p>
                    </>
                  )}
                </div>
              </motion.div>

              {/* Product Details */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4"
              >
                <h2 className="font-bold text-gray-900 text-lg mb-4">Product Details</h2>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-600"
                    placeholder="e.g., Organic Tomatoes"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-600"
                    placeholder="Describe your product..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category *
                    </label>
                    <select
                      required
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-600"
                    >
                      <option>Vegetables</option>
                      <option>Fruits</option>
                      <option>Grains</option>
                      <option>Dairy</option>
                      <option>Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Grade
                    </label>
                    <select
                      value={formData.grade}
                      onChange={(e) => setFormData({ ...formData, grade: e.target.value as "A" | "B" | "C" })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-600"
                    >
                      <option value="A">Grade A (Premium)</option>
                      <option value="B">Grade B (Good)</option>
                      <option value="C">Grade C (Standard)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quantity *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-600"
                      placeholder="100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Unit *
                    </label>
                    <select
                      required
                      value={formData.unit}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-600"
                    >
                      <option value="kg">Kilograms (kg)</option>
                      <option value="bunch">Bunch</option>
                      <option value="bag">Bag</option>
                      <option value="box">Box</option>
                      <option value="liter">Liters</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price per Unit (₹) *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      step="0.01"
                      value={formData.price_per_unit}
                      onChange={(e) => setFormData({ ...formData, price_per_unit: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-600"
                      placeholder="50.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location
                    </label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-600"
                      placeholder="Maharashtra"
                    />
                  </div>
                </div>
              </motion.div>

              {/* Submit Button */}
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-[#16a34a] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#15803d] transition-colors shadow-lg shadow-green-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit for Approval"
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/farmer/products")}
                  className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

### 7. Price Calculations in Checkout

**All prices are automatically calculated** in the `CartContext.checkout()` function:

```typescript
// From /src/lib/supabase.ts
export function calculateOrderTotals(subtotal: number) {
  const platformFee = Math.round(subtotal * 0.03 * 100) / 100;  // 3%
  const gst = Math.round(subtotal * 0.18 * 100) / 100;          // 18%
  const delivery = subtotal > 500 ? 0 : 49;                      // Free above ₹500
  const total = Math.round((subtotal + platformFee + gst + delivery) * 100) / 100;

  return { subtotal, platformFee, gst, delivery, total };
}
```

**How it's used in CartContext**:

```typescript
const checkout = async (addressId: string) => {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const { platformFee, gst, delivery, total } = calculateOrderTotals(subtotal);

  // Create order with calculated prices
  await supabase.from("orders").insert({
    subtotal,
    platform_fee: platformFee,
    gst,
    delivery_charge: delivery,
    total,
    // ... other fields
  });
};
```

**The Cart page already displays these calculations**:

```typescript
// From /src/app/pages/Cart.tsx
const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
const platformFee = Math.round(subtotal * 0.03);  // 3%
const gst = Math.round(subtotal * 0.18);          // 18%
const delivery = subtotal > 500 ? 0 : 49;         // Free delivery over ₹500
const total = subtotal + platformFee + gst + delivery;
```

---

### 8. Certificate Upload & Viewing

**Upload (Farmer)**: See "Farmer Add Product" section above

**View Certificate (Buyer)**:

```typescript
// Get signed URL for certificate
import { getCertificateUrl } from "../../lib/supabase";

const viewCertificate = async (certificatePath: string) => {
  const signedUrl = await getCertificateUrl(certificatePath);
  window.open(signedUrl, '_blank');
};
```

---

## 🔄 SUMMARY OF ALL REPLACEMENTS

| Page/Component | Status | What Was Replaced |
|----------------|--------|-------------------|
| **AuthContext** | ✅ Done | Mock login → Real Supabase Auth |
| **CartContext** | ✅ Done | localStorage → Supabase database |
| **Products Page** | ✅ Done | mockProducts array → useProducts hook |
| **Auctions Page** | ⏳ Next | auctionItems array → useAuctions hook |
| **LiveAuction Page** | ⏳ Next | Fake bid simulation → Real-time Supabase |
| **Farmer AddProduct** | ⏳ Next | Mock upload → Real Supabase Storage |
| **Farmer Products** | ⏳ Next | Mock list → Database query |
| **Farmer Orders** | ⏳ Next | Mock orders → Real order queries |
| **Admin Dashboard** | ⏳ Next | Mock stats → get_admin_stats() function |
| **Admin Products** | ⏳ Next | Mock approval → Real status updates |
| **TrackOrder** | ⏳ Next | Mock tracking → Real tracking table |

---

## 🚀 NEXT STEPS

1. **Set up Supabase project** (follow SUPABASE_SETUP.md)
2. **Add environment variables** (copy .env.example to .env)
3. **Replace remaining pages** using the patterns shown above
4. **Test complete flow**:
   - Register as Farmer
   - Add product with image + certificate
   - Admin approves
   - Buyer adds to cart
   - Checkout with real price calculation
   - Track order

---

## 📞 HELP

If you need help replacing any specific page, just ask! I can provide complete implementations for:
- Auctions page
- LiveAuction with real-time bidding
- Farmer dashboard with real stats
- Admin approval workflows
- Order tracking with real location updates

**All mock data will be replaced with real Supabase queries!**
