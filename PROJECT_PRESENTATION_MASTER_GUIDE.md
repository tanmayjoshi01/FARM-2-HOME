# Farm2Home Master Project Preparation Guide

## 1. Project Overview
Farm2Home is a full-stack agriculture marketplace platform that connects farmers directly to buyers with two commerce modes:
1. Direct purchase marketplace (cart and checkout).
2. Live auctions with bidding.

The platform uses role-based experiences:
1. Buyer: browse products, bid in auctions, place orders, track deliveries.
2. Farmer: add products, view and process orders, update delivery status.
3. Admin: approve or reject products, manage users, oversee orders and auctions.

Core business value:
1. Reduces middlemen by enabling farm-to-home sales.
2. Increases trust through role governance and certificate support.
3. Improves transparency via delivery tracking and order status timelines.
4. Supports dynamic pricing with auction flows.

---

## 2. Technology Stack

### Frontend
1. React + TypeScript (SPA architecture).
2. Vite for local dev and production bundling.
3. React Router for client-side routing.
4. Tailwind CSS for utility-first styling.
5. Sonner for toast notifications.
6. Lucide React icons.
7. Motion for UI animations.
8. qrcode.react for UPI QR code rendering.

Reference files:
1. [package.json](package.json)
2. [src/main.tsx](src/main.tsx)
3. [src/app/App.tsx](src/app/App.tsx)
4. [vite.config.ts](vite.config.ts)

### Backend (BaaS)
1. Supabase Auth for authentication/session handling.
2. Supabase Postgres for transactional data.
3. Supabase Storage for files (product images, certificates).
4. Supabase Realtime for selective live updates.
5. SQL scripts for schema, triggers, and RLS security policies.

Reference files:
1. [src/lib/supabase.ts](src/lib/supabase.ts)
2. [supabase/FRESH_SUPABASE_SETUP.sql](supabase/FRESH_SUPABASE_SETUP.sql)

### Deployment
1. Vercel for hosting.
2. SPA rewrite configured so deep links and refresh on nested routes work correctly.

Reference file:
1. [vercel.json](vercel.json)

---

## 3. High-Level Architecture

The project follows a client-heavy architecture with backend managed by Supabase services.

1. UI Layer:
   React pages/components for buyer, farmer, admin dashboards and workflows.

2. State/Domain Layer:
   Context providers and custom hooks encapsulate business logic and remote data access.

3. Data Access Layer:
   Supabase client methods `.from()`, `.auth.*`, `.storage.from()`, and realtime channels.

4. Persistence & Security Layer:
   Supabase Postgres with RLS, triggers, and enums for robust role-aware constraints.

Runtime composition:
1. App bootstraps from [src/main.tsx](src/main.tsx).
2. Global providers and router in [src/app/App.tsx](src/app/App.tsx).
3. Browser routes defined in [src/app/routes.ts](src/app/routes.ts).

---

## 4. App Bootstrapping and Core Composition

### Entry Point
In [src/main.tsx](src/main.tsx):
1. Creates React root.
2. Renders App.
3. Imports global CSS.

### App Composition
In [src/app/App.tsx](src/app/App.tsx):
1. ErrorBoundary wraps entire app.
2. AuthProvider handles user session and role state.
3. CartProvider handles cart and checkout context.
4. RouterProvider renders route tree.
5. Toaster provides top-right notifications.

This composition ensures:
1. Authentication and cart state available globally.
2. Error isolation.
3. Consistent user feedback.

---

## 5. Complete Frontend Route Map

Defined in [src/app/routes.ts](src/app/routes.ts).

### Public/Buyer Routes
1. `/` Home.
2. `/products` Product listing and search.
3. `/auctions` Auction list.
4. `/auctions/live/:id` Live auction detail.
5. `/login` Login screen.
6. `/register` Signup screen.
7. `/cart` Cart view.
8. `/checkout/address` Delivery address selection/creation.
9. `/checkout/payment` Payment method and UPI QR.
10. `/checkout/success` Post-payment success view.
11. `/orders` Buyer orders.
12. `/track-order` Tracking search and timeline.

### Farmer Routes
1. `/farmer/dashboard`
2. `/farmer/add-product`
3. `/farmer/products`
4. `/farmer/orders`
5. `/farmer/tracking`

### Admin Routes
1. `/admin/dashboard`
2. `/admin/products`
3. `/admin/auctions`
4. `/admin/users`
5. `/admin/orders`
6. `/admin/tracking`

### Fallback
1. `*` mapped to NotFound page.

---

## 6. Authentication and Authorization Flow

Primary implementation: [src/app/context/AuthContext.tsx](src/app/context/AuthContext.tsx)

### Session Lifecycle
1. On mount: `getSession()` checks active user session.
2. `onAuthStateChange` updates app user state reactively.
3. Profile hydration from `public.users` table.

### Registration
1. Uses `supabase.auth.signUp`.
2. Passes metadata: full_name, role, phone.
3. Attempts profile fetch after signup.
4. Temporary fallback state if profile row is delayed.

### Login
1. Uses `signInWithPassword`.
2. Fetches role from `public.users` and validates selected login role.
3. If role mismatch, force sign out and reject login.

### Logout
1. Calls `supabase.auth.signOut`.
2. Clears app user state.

### Security Pattern
1. Role check in frontend for UX gating.
2. RLS in database for hard enforcement.

---

## 7. Supabase Client and Configuration Strategy

Implementation: [src/lib/supabase.ts](src/lib/supabase.ts)

### Environment Variables
1. `VITE_SUPABASE_URL`
2. `VITE_SUPABASE_ANON_KEY` or `VITE_SUPABASE_PUBLISHABLE_KEY`
3. Payment env values used elsewhere:
4. `VITE_MERCHANT_UPI_ID`
5. `VITE_MERCHANT_NAME`

### Demo/Mock Fallback Mode
If Supabase env is missing:
1. Creates a mock client with stubbed auth/from/storage/channel methods.
2. Prevents app crashes in demo mode.
3. Logs explanatory guidance once.

This design allows:
1. Local UI development without backend hard fail.
2. Easy migration to production by setting env values.

### Utility Helpers
In [src/lib/supabase.ts](src/lib/supabase.ts):
1. `uploadProductImage` to product bucket.
2. `uploadCertificate` to certificate bucket with signed URL.
3. `getCertificateUrl` for private certificate access.
4. `generateOrderNumber` helper.
5. `calculateOrderTotals` applying platform fee, GST, delivery.

---

## 8. Database Schema (Complete Domain Model)

Main schema and policy setup: [supabase/FRESH_SUPABASE_SETUP.sql](supabase/FRESH_SUPABASE_SETUP.sql)

### Enum Types
1. `user_role`: buyer, farmer, admin.
2. `product_status`: pending, approved, rejected.
3. `product_grade`: A, B, C.
4. `order_type`: direct, auction.
5. `auction_status`: scheduled, live, closed, cancelled.
6. `address_tag`: Home, Office, Other.
7. `certificate_type`: organic, quality, fssai, other.

### Core Tables
1. `users`
2. `addresses`
3. `products`
4. `certificates`
5. `wishlists`
6. `carts`
7. `cart_items`
8. `orders`
9. `order_items`
10. `auctions`
11. `bids`
12. `notifications`
13. `tracking`

### Schema Compatibility Concept
The `orders` table supports alias fields used by different parts of app history:
1. `buyer_id` and `user_id`
2. `address_id` and `delivery_address_id`
3. `total` and `final_amount`
4. `delivery_charge` and `delivery_fee`
5. `status` and `order_status`

Trigger `sync_order_aliases` keeps these synchronized.

---

## 9. Trigger and Function Architecture

Defined in [supabase/FRESH_SUPABASE_SETUP.sql](supabase/FRESH_SUPABASE_SETUP.sql).

### Functions
1. `set_updated_at`: standardized updated_at auto-maintenance.
2. `is_admin`: helper for policy checks.
3. `handle_new_auth_user`: creates/updates profile row and default cart after auth signup.
4. `sync_order_aliases`: keeps legacy/new column names aligned.
5. `sync_tracking_status`: defaults tracking status and tracking number generation.

### Triggers
1. updated_at triggers on core mutable tables.
2. trigger for new auth users.
3. trigger for order alias synchronization.
4. trigger for tracking normalization.

Operational benefit:
1. Reduces app-level inconsistency logic.
2. Enforces data invariants centrally in DB.

---

## 10. Row Level Security Model

RLS is enabled broadly in [supabase/FRESH_SUPABASE_SETUP.sql](supabase/FRESH_SUPABASE_SETUP.sql).

### Policy Categories
1. Self-access policies for users and addresses.
2. Ownership policies for farmer products.
3. Admin override policies for moderation and governance.
4. Order visibility policies for buyer/farmer/admin relationships.
5. Auction and bid policies for live operations.
6. Tracking and notification scoped policies.

### Storage Policies
For buckets used by app:
1. Public read for product images.
2. Owner/admin scoped access for certificate files.

### Additional Fix Scripts
Targeted scripts available in [supabase](supabase):
1. [supabase/fix_products_rls.sql](supabase/fix_products_rls.sql)
2. [supabase/fix_auctions_rls.sql](supabase/fix_auctions_rls.sql)
3. [supabase/fix_marketplace_rls.sql](supabase/fix_marketplace_rls.sql)
4. [supabase/fix_rls_for_buyer_seller_visibility.sql](supabase/fix_rls_for_buyer_seller_visibility.sql)
5. [supabase/backfill_buyer_fk.sql](supabase/backfill_buyer_fk.sql)

---

## 11. Complete Supabase Endpoint Map (What Is Called From Frontend)

### Auth Endpoints
1. `auth.signUp`
2. `auth.signInWithPassword`
3. `auth.signOut`
4. `auth.getSession`
5. `auth.onAuthStateChange`

### Table Endpoints
1. `users`: select/update/delete.
2. `addresses`: select/insert.
3. `products`: select/insert/update/delete.
4. `carts`: select/insert.
5. `cart_items`: select/insert/update/delete.
6. `orders`: select/insert/update.
7. `order_items`: select/insert.
8. `auctions`: select/insert/update.
9. `bids`: select/insert.
10. `tracking`: select/insert/update.
11. `notifications`: insert.

### Storage Endpoints
1. `storage.from('farm2home-products').upload/getPublicUrl`
2. `storage.from('farm2home-certificates').upload/createSignedUrl`
3. `storage.from('certificates').createSignedUrl`

### Realtime Endpoints
1. cart channel on `cart_items` changes.
2. auction channel on `bids` changes.

---

## 12. Buyer Journey: End-to-End Technical Flow

### Product Discovery
1. `useProducts` fetches approved products.
2. Joins farmer profile fields.
3. Cross-checks active auctions to tag product mode.

Reference: [src/app/hooks/useProducts.ts](src/app/hooks/useProducts.ts)

### Cart
1. Ensure or create cart per user.
2. Add/update/remove cart items.
3. Realtime subscription refreshes cart state.

Reference: [src/app/context/CartContext.tsx](src/app/context/CartContext.tsx)

### Address
1. Fetch user saved addresses.
2. Validate and insert new addresses.
3. Maintain selected address in local storage.

Reference: [src/app/pages/checkout/Address.tsx](src/app/pages/checkout/Address.tsx)

### Payment
1. Payment method selection UI.
2. UPI QR generated from exact payable amount.
3. Uses fixed merchant UPI/name from env where configured.
4. On confirmation, invokes checkout context flow.

Reference: [src/app/pages/checkout/Payment.tsx](src/app/pages/checkout/Payment.tsx)

### Order Creation
In checkout context:
1. Group items by farmer.
2. Create one order per farmer.
3. Insert order items.
4. Create initial tracking row.
5. Insert notification row for farmer.
6. Clear cart.

Reference: [src/app/context/CartContext.tsx](src/app/context/CartContext.tsx)

### Order History and Tracking
1. Buyer order fetch joins order_items, addresses, tracking.
2. Tracking page resolves by tracking number and renders timeline.

References:
1. [src/app/hooks/useOrders.ts](src/app/hooks/useOrders.ts)
2. [src/app/pages/TrackOrder.tsx](src/app/pages/TrackOrder.tsx)

---

## 13. Farmer Journey: End-to-End Technical Flow

### Product Management
1. Farmer adds product -> status defaults to pending.
2. Farmer can update/delete own products.

Reference: [src/app/hooks/useFarmerData.ts](src/app/hooks/useFarmerData.ts)

### Farmer Dashboard Data
1. Fetch farmer products.
2. Fetch related order_items for those products.
3. Fetch full orders and related buyer/address/tracking.
4. Compute KPIs (revenue, orders, pending approvals, top products).

Reference: [src/app/hooks/useFarmerData.ts](src/app/hooks/useFarmerData.ts)

### Delivery Status Updates
1. Farmer updates order status.
2. Orders table status/order_status updated.
3. Tracking row updated or inserted.

Reference: [src/app/hooks/useFarmerData.ts](src/app/hooks/useFarmerData.ts)

---

## 14. Admin Journey: End-to-End Technical Flow

### Admin Aggregation
1. Fetch users.
2. Fetch products with farmer profile relation.
3. Fetch orders with buyer/farmer/address/tracking/item relations.
4. Compute platform stats.

Reference: [src/app/hooks/useAdminData.ts](src/app/hooks/useAdminData.ts)

### Product Moderation
1. Approve/reject/delete products.

### User Governance
1. Update roles.
2. Delete user accounts.

### Order Oversight
1. Admin can update order delivery state.
2. Sync order status and tracking timeline.

Reference: [src/app/hooks/useAdminData.ts](src/app/hooks/useAdminData.ts)

### Auction Administration
1. Loads active/scheduled auctions.
2. Loads approved products not currently auctioned.
3. Creates new auctions.
4. Ends auctions.

Reference: [src/app/pages/admin/AuctionManagement.tsx](src/app/pages/admin/AuctionManagement.tsx)

---

## 15. Auction System Technical Details

Implementation: [src/app/hooks/useAuctions.ts](src/app/hooks/useAuctions.ts)

### Read Layer
1. Select scheduled/live auctions.
2. Join product and farmer.
3. Derive normalized UI model.
4. Compute dynamic countdown timers.

### Bid Layer
1. Insert bid row for authenticated buyer.
2. Update auction current bid and bid count.

### Realtime Layer
1. Subscribe to bids table filtered by auction ID.
2. On event, reload auction details.

---

## 16. Payment and UPI QR Design

Implementation: [src/app/pages/checkout/Payment.tsx](src/app/pages/checkout/Payment.tsx)

### Supported Modes
1. UPI
2. Debit
3. Credit
4. Net banking
5. Wallet

### UPI Advanced Behavior
1. If `VITE_MERCHANT_UPI_ID` is set, QR is fixed to merchant receiver.
2. If not set, manual UPI ID input can drive QR.
3. UPI payload includes exact total in INR.
4. Merchant branding uses `VITE_MERCHANT_NAME`.

### Amount Composition
1. Subtotal from cart items.
2. Platform fee (3 percent, rounded).
3. GST (18 percent, rounded).
4. Delivery charge rule.

---

## 17. Tracking Model and Status Paradigm

The app maps multiple source statuses into a canonical progression:
1. received
2. packing
3. in_transit
4. out_for_delivery
5. delivered

Used by:
1. Farmer and admin update functions.
2. Tracking timeline UI.
3. Order overview cards.

References:
1. [src/app/hooks/useFarmerData.ts](src/app/hooks/useFarmerData.ts)
2. [src/app/pages/TrackOrder.tsx](src/app/pages/TrackOrder.tsx)

---

## 18. Performance and Reliability Patterns

Patterns present in code:
1. Retry handling for transient auth-token lock scenarios in product and auction hooks.
2. 8-second interval polling for order/farmer updates.
3. Selective realtime channels for critical rapidly changing domains.
4. Local state normalization to handle schema alias differences.

Potential enhancement areas:
1. Move more polling paths to realtime.
2. Introduce server-side RPC transaction for checkout atomicity.
3. Add query caching (React Query style).

---

## 19. Deployment and Environment Management

### Local Commands
1. `npm install`
2. `npm run dev`
3. `npm run build`

### Required Env Variables
1. `VITE_SUPABASE_URL`
2. `VITE_SUPABASE_PUBLISHABLE_KEY`
3. `VITE_MERCHANT_UPI_ID`
4. `VITE_MERCHANT_NAME`

Current local example in [\.env.local](.env.local).

### Vercel Notes
1. Environment variables must be set in Vercel project settings (not only local .env.local).
2. Redeploy required after env changes.
3. SPA rewrite in [vercel.json](vercel.json) avoids refresh 404 errors on nested routes.

---

## 20. Supabase Edge Function Notes

Server function files:
1. [supabase/functions/server/index.tsx](supabase/functions/server/index.tsx)
2. [supabase/functions/server/kv_store.tsx](supabase/functions/server/kv_store.tsx)

Current endpoint exposed:
1. `/make-server-82823d20/health`

KV module supports:
1. set/get/del
2. mset/mget/mdel
3. prefix queries

Use case:
1. Lightweight server-side key-value support for auxiliary workflows.

---

## 21. System Design Talking Points for External Panel

1. Why Supabase:
   Rapid full-stack velocity with strong Postgres semantics and RLS security.

2. Why role-based architecture:
   Distinct business actors need separate UI and constrained access rights.

3. Why both polling and realtime:
   Realtime where volatility is high (bids/cart), polling where operational simplicity wins.

4. Why DB trigger-based alias sync:
   Backward compatibility across evolving schema naming conventions.

5. Why env-driven payment branding:
   Merchant payout details can change without code refactor.

---

## 22. End-to-End Demo Script (Presentation Ready)

### Demo Plan (10-12 minutes)
1. Explain value proposition and role architecture (1 minute).
2. Show buyer browsing products and adding to cart (1 minute).
3. Show address creation and persistence (1 minute).
4. Show payment page with fixed merchant UPI QR and exact amount (1 minute).
5. Place order and show success/tracking number (1 minute).
6. Show Track Order timeline and status progress (1 minute).
7. Login as farmer and show incoming order with buyer details (2 minutes).
8. Update delivery status as farmer (1 minute).
9. Login as admin and show moderation and analytics (2 minutes).
10. Conclude with security and scalability notes (1 minute).

### Suggested Q&A Prepared Answers
1. How is data secured?
   Through Supabase Auth and strict RLS policies per table and role.

2. How do you prevent inconsistent order fields?
   Trigger-based normalization (`sync_order_aliases`) and frontend mapping fallback.

3. Is payment truly integrated?
   Current implementation supports UPI intent/QR initiation and order creation; webhook-grade payment verification can be next enhancement.

4. Can this scale?
   Yes, because PostgreSQL + policy-driven access + stateless frontend deployment on Vercel is horizontally extensible.

---

## 23. Risks and Improvement Backlog

Known practical risks:
1. Checkout currently does multiple inserts from client side; partial failure risk exists.
2. Mixed naming in orders table increases mapping complexity.
3. Some areas still rely on periodic polling.

Recommended production-hardening roadmap:
1. Implement RPC or edge function for atomic checkout transaction.
2. Consolidate order naming conventions over a migration window.
3. Add centralized audit logs for admin actions.
4. Add richer observability and alerting.
5. Add payment gateway webhook reconciliation.

---

## 24. Important File Index for Presentation Reference

Core app and routing:
1. [src/main.tsx](src/main.tsx)
2. [src/app/App.tsx](src/app/App.tsx)
3. [src/app/routes.ts](src/app/routes.ts)

Auth and context:
1. [src/app/context/AuthContext.tsx](src/app/context/AuthContext.tsx)
2. [src/app/context/CartContext.tsx](src/app/context/CartContext.tsx)

Business hooks:
1. [src/app/hooks/useProducts.ts](src/app/hooks/useProducts.ts)
2. [src/app/hooks/useAuctions.ts](src/app/hooks/useAuctions.ts)
3. [src/app/hooks/useOrders.ts](src/app/hooks/useOrders.ts)
4. [src/app/hooks/useFarmerData.ts](src/app/hooks/useFarmerData.ts)
5. [src/app/hooks/useAdminData.ts](src/app/hooks/useAdminData.ts)

Checkout/payment/tracking:
1. [src/app/pages/checkout/Address.tsx](src/app/pages/checkout/Address.tsx)
2. [src/app/pages/checkout/Payment.tsx](src/app/pages/checkout/Payment.tsx)
3. [src/app/pages/TrackOrder.tsx](src/app/pages/TrackOrder.tsx)

Supabase and SQL:
1. [src/lib/supabase.ts](src/lib/supabase.ts)
2. [supabase/FRESH_SUPABASE_SETUP.sql](supabase/FRESH_SUPABASE_SETUP.sql)
3. [supabase/fix_products_rls.sql](supabase/fix_products_rls.sql)
4. [supabase/fix_auctions_rls.sql](supabase/fix_auctions_rls.sql)
5. [supabase/fix_marketplace_rls.sql](supabase/fix_marketplace_rls.sql)
6. [supabase/fix_rls_for_buyer_seller_visibility.sql](supabase/fix_rls_for_buyer_seller_visibility.sql)
7. [supabase/functions/server/index.tsx](supabase/functions/server/index.tsx)
8. [supabase/functions/server/kv_store.tsx](supabase/functions/server/kv_store.tsx)

Deployment:
1. [vercel.json](vercel.json)
2. [vite.config.ts](vite.config.ts)
3. [package.json](package.json)

---

## 25. One-Page Closing Statement You Can Speak
Farm2Home is a role-driven agri-commerce platform designed to connect farmers directly with consumers through both instant purchases and competitive auctions. The system combines modern React frontend architecture with Supabase backend services for authentication, relational storage, file management, and realtime updates. Security is implemented through row-level policies and role-aware access controls. Operational workflows cover complete commerce lifecycle: discovery, cart, address, payment, order generation, tracking, and admin governance. The solution is deployable on Vercel, environment-configurable, and structured for future hardening into enterprise-grade transaction and payment verification pipelines.
