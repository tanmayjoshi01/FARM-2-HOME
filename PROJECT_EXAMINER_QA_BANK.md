# Farm2Home Examiner Q&A Bank (Frontend + Supabase + Database + Architecture)

## 1. How To Use This File
This is a viva/preparation bank for external examiners.

Suggested usage:
1. Read Section 2 to 8 first for core understanding.
2. Practice Section 9 to 18 question-by-question.
3. Use Section 19 for rapid-fire one-line responses.
4. Use Section 20 for “if examiner challenges your design” responses.

Answer strategy in viva:
1. Start from business reason.
2. Explain technical implementation.
3. Mention tradeoff and next improvement.

---

## 2. 30-Second Project Pitch
Farm2Home is a role-based agri-commerce platform that connects farmers directly to buyers. It supports two commerce models: direct purchase through cart-checkout and competitive live auctions. The stack is React + Vite frontend and Supabase backend (Auth, Postgres, Storage, Realtime). Security is enforced with Row-Level Security policies, and the platform has separate buyer, farmer, and admin operational workflows.

---

## 3. System Overview Questions

### Q1. What exact problem does Farm2Home solve?
It solves market inefficiency in agriculture by reducing intermediaries. Farmers get better selling channels, buyers get transparent source access, and admins enforce quality control and governance.

### Q2. Why two modes: direct purchase and auction?
Direct purchase is best for predictable sales. Auctions are best for demand-based price discovery. Together they maximize both liquidity and farmer pricing opportunity.

### Q3. What are the three user roles and their responsibilities?
1. Buyer: product discovery, cart, checkout, tracking, bidding.
2. Farmer: product listing, order handling, status updates.
3. Admin: approvals, user moderation, auction management, platform oversight.

### Q4. Why role-based architecture instead of one dashboard?
Because each role has different permissions, data visibility, and workflow complexity. Separate role domains reduce accidental privilege leaks and improve UX clarity.

### Q5. Is this monolith, microservice, or serverless?
Frontend is SPA monolith on client side; backend is serverless BaaS-style using managed Supabase services.

---

## 4. Frontend Architecture Questions

### Q6. Why React + Vite?
React gives composable UI and mature ecosystem. Vite gives very fast dev server and optimized production build with modern ES module tooling.

### Q7. How is navigation handled?
Through React Router with a browser router configuration. Route definitions map pages for public, buyer, farmer, and admin sections.

### Q8. How do you prevent refresh errors on nested routes in production?
By adding Vercel SPA rewrite configuration so all paths are redirected to index.html and then resolved by client-side router.

### Q9. How is global state managed?
Using React Context providers:
1. AuthProvider for session/user role.
2. CartProvider for cart lifecycle and checkout.
Domain-specific data is mostly in custom hooks.

### Q10. Why custom hooks instead of putting API calls directly in pages?
Hooks encapsulate data-fetch logic, error/loading state, and business rules. This improves reuse, testability, and separation of concerns.

### Q11. How do you handle loading and error states?
Every hook tracks loading and error state, and pages render fallback UI, messages, or toasts accordingly.

### Q12. How do you handle transient backend/query failures?
Some hooks include retry strategy for transient auth/token lock errors with short backoff.

### Q13. How do you keep UI responsive during async actions?
By setting action-local loading flags (e.g., savingAddress, processing payment) and disabling controls to prevent duplicate submissions.

### Q14. How do you show user feedback?
Using toast notifications for success/failure and contextual inline state messages.

### Q15. Why use utility-first CSS (Tailwind)?
It speeds UI development, keeps styles localized, and reduces stylesheet complexity. It is efficient for dashboard-heavy products.

---

## 5. Authentication and Session Questions

### Q16. How is signup implemented?
Signup is done using Supabase Auth `signUp`, with user metadata (name, role, phone). Profile data is synced to public users table through DB trigger.

### Q17. How is login role validated?
After sign-in, role is resolved from `public.users`. If selected role does not match resolved role, user is signed out and login is rejected.

### Q18. Why check role in DB if metadata already has role?
Because admin/farmer promotion can happen post-signup in DB. DB role is authoritative for runtime access decisions.

### Q19. How is session persistence handled?
On app mount, session is fetched. Additionally, `onAuthStateChange` listener keeps app state synchronized with auth events.

### Q20. What happens if profile row is missing after signup?
AuthContext falls back to metadata-mapped temporary user object and attempts subsequent profile fetch.

### Q21. Is role check in frontend enough for security?
No. Frontend role checks are UX-level only. Actual security is enforced in database using RLS policies.

---

## 6. Supabase Design Questions

### Q22. Which Supabase modules are used?
1. Auth
2. Postgres database
3. Storage
4. Realtime
5. Edge function (health/KV helper in repository)

### Q23. What tables are central to business flow?
1. users
2. products
3. carts/cart_items
4. orders/order_items
5. addresses
6. tracking
7. auctions/bids
8. notifications
9. certificates

### Q24. Why both `buyer_id` and `user_id` style fields in orders?
Because of schema evolution and compatibility needs across code versions. Trigger-based alias sync keeps these columns aligned.

### Q25. Why trigger-based normalization in DB?
It centralizes consistency rules and prevents scattered transformation logic across frontend.

### Q26. How do you enforce who can see what data?
Through RLS policies per table, using ownership/role checks and admin helper functions.

### Q27. Why is RLS critical in Supabase?
Supabase API directly exposes database access patterns from client. Without RLS, unauthorized access risks are high.

### Q28. How do you handle storage security?
Product images can be public-view. Certificates use restricted owner/admin access and signed URL patterns.

### Q29. Do you use RPC or SQL functions for checkout transaction?
Current flow is client-driven inserts. Recommended next hardening is a single atomic RPC/edge transaction for order + items + tracking.

### Q30. Why keep fix scripts for policies?
During iterative development, policy mismatches can block new joins/flows. Fix scripts let us patch production safely and quickly.

---

## 7. Database Modeling Questions

### Q31. Why separate `orders` and `order_items`?
It is a classic parent-child model. Order stores aggregate/payment status; order_items stores line-level quantities and pricing.

### Q32. Why keep addresses in dedicated table?
It supports multiple saved addresses per user, default tagging, and normalized reference from orders.

### Q33. Why are enums used?
Enums enforce controlled domain values (roles, statuses, grades), reducing invalid states and improving data integrity.

### Q34. Why have `tracking` as separate table?
It models delivery lifecycle events independent of order core record and supports timeline updates.

### Q35. Why include `notifications` table?
To support role-targeted system/order events and eventual in-app notification center evolution.

### Q36. Why have `wishlists` even if not fully emphasized in UI?
Schema is prepared for product-saving behavior and feature expansion without disruptive migration.

### Q37. Why include `approved_by` and `approved_at` in products?
Auditability for moderation decisions.

### Q38. Why include `updated_at` triggers on many tables?
Automatic change tracking for recency sorting, audits, and synchronization logic.

### Q39. Why not store full address text inside orders only?
Normalized address references reduce duplication, support reuse, and allow profile-level address management.

### Q40. How do you handle pincode validation?
Database check constraint enforces six-digit pincode format.

---

## 8. Checkout and Payment Questions

### Q41. How is total amount calculated?
Total = subtotal + platform_fee + GST + delivery charge.
Current model uses platform fee 3% and GST 18% with threshold-based delivery.

### Q42. Where are payment values computed?
In frontend checkout/payment workflow using cart item totals and helper functions.

### Q43. Is payment gateway integrated?
Current implementation provides UPI intent/QR initiation with exact amount and merchant metadata. Full gateway webhook verification is a next-step enhancement.

### Q44. How is UPI QR generated?
A UPI URI string is constructed with receiver ID, merchant name, amount, currency, and note; then rendered as QR using `qrcode.react`.

### Q45. How do you keep QR fixed to merchant account?
By environment variable `VITE_MERCHANT_UPI_ID`. If set, user input is read-only and QR always points to that merchant ID.

### Q46. Why use env for merchant name and UPI ID?
Operational flexibility. Merchant payout/account branding can change without code change.

### Q47. What happens after payment confirm button?
Checkout function creates order(s), inserts order items, initializes tracking entries, inserts notifications, and clears cart.

### Q48. Why one order per farmer in checkout?
It simplifies fulfillment ownership, tracking updates, and farmer-specific order processing.

### Q49. What failure risk exists in checkout?
Since multi-step inserts happen from client, partial completion can occur on mid-step failure. Atomic transaction API is a recommended upgrade.

### Q50. How is selected address passed from address page to payment?
Selected address is persisted in localStorage and read in payment flow.

---

## 9. Auction and Realtime Questions

### Q51. How does auction listing identify active auctions?
Queries `auctions` table for scheduled/live statuses and maps to product metadata.

### Q52. How is bid placement implemented?
Insert into `bids`, then update corresponding auction current bid and count.

### Q53. How does live update work in auction room?
Realtime subscription on `bids` filtered by auction ID. On change, auction data is refreshed.

### Q54. Why both realtime and timer interval?
Realtime handles bid events. Timer interval updates countdown display every second for UX smoothness.

### Q55. How are auction permissions enforced?
Through RLS policies: who can view, create, update, and bid based on role and status.

### Q56. Why admin-managed auction creation is useful?
Ensures curated quality and scheduling discipline for live events.

### Q57. How do you prevent duplicate auctioning of same product?
Admin auction page filters out already active/scheduled product IDs from available products.

### Q58. How are winner/close states represented?
Schema supports status transitions and fields like winner_id, winning_bid, closed_at.

---

## 10. Farmer Dashboard Questions

### Q59. How are farmer orders derived?
Farmer products are fetched first, then order_items for those products, then orders joined with buyer/address/tracking.

### Q60. How is revenue computed for farmer?
Sum of total_price across farmer-linked order items.

### Q61. How do you show buyer details in farmer view?
Orders query joins users table through buyer/user foreign key relations, then maps resolved buyer fields.

### Q62. Why have delivery status normalization?
Different legacy statuses are mapped to canonical statuses for consistent UI and logic.

### Q63. How does farmer update delivery status?
Update order status/order_status and then update or insert tracking entry with message and timestamp.

### Q64. Why can farmer only update own orders?
Ownership guard in query conditions and RLS ensures farmer_id matches authenticated farmer.

### Q65. How are top products generated?
Group order items by product, aggregate sold quantity and revenue, then sort descending.

---

## 11. Admin Dashboard Questions

### Q66. What does admin dashboard aggregate?
Users, products, orders, pending products, total revenue and relation-enriched order data.

### Q67. How does product approval workflow work?
Admin updates `products.status` to approved/rejected; data refreshes in dashboard and marketplace behavior changes accordingly.

### Q68. Can admin change user roles?
Yes, users table role field is updateable from admin controls.

### Q69. Why is admin order status update important?
Operational override for escalations and centralized tracking correction.

### Q70. How is admin view richer than buyer/farmer?
Admin joins multi-entity relations (buyer, farmer, addresses, tracking, items) and can perform moderation operations.

---

## 12. Tracking and Delivery Questions

### Q71. How is tracking searched by user?
Tracking page queries `tracking` by tracking number and joins related order and order items.

### Q72. How do you render a delivery timeline?
Current status is normalized into fixed stage pipeline and each stage rendered as completed/pending.

### Q73. Where does tracking number come from?
Auto-generated in DB defaults and/or app helper function for initial insert.

### Q74. Can tracking exist without location?
Yes, location can be optional; message/status still drives timeline.

### Q75. How frequently does order/tracking refresh?
Hooks use periodic polling (for example every 8 seconds) in some views.

---

## 13. Security Questions (High Probability)

### Q76. Where is the strongest security boundary?
Database RLS policies.

### Q77. What can go wrong if RLS is wrong?
Data leaks, unauthorized updates, and blocked business flows. This is why policy fix scripts exist and are tested.

### Q78. Is sensitive key exposed on frontend?
Only publishable anon key is used in client. Service role keys remain server-side only.

### Q79. How do you mitigate broken object access?
Ownership predicates (`eq(auth.uid())` style policies), role checks, and constrained update/delete policies.

### Q80. How do you handle unauthorized operation errors in app?
Catch errors, show contextual toasts, and in some cases provide guidance to apply specific policy scripts.

### Q81. Why signed URLs for certificates?
To grant temporary access without exposing private bucket files publicly.

### Q82. Why validate phone/pincode client-side and DB-side?
Defense in depth: immediate UX validation + hard database constraints.

---

## 14. Deployment and DevOps Questions

### Q83. Why Vercel for deployment?
Simple CI/CD from Git, efficient static hosting, and easy environment management for Vite app.

### Q84. Why did refresh fail previously on nested routes?
Because SPA rewrite was missing. Direct route requests were treated as file paths by hosting layer.

### Q85. How did you fix refresh issue?
Added rewrite rule in `vercel.json` routing all paths to index.html.

### Q86. Why local .env values do not affect production?
Vercel builds run in cloud; only Vercel environment variables are injected into production build.

### Q87. Why redeploy after env changes?
Vite embeds env values at build time, so runtime page won’t change until rebuild/redeploy.

### Q88. What if latest commit not visible in production?
Check branch mapping, deployment commit SHA, cache, and force fresh redeploy.

---

## 15. Code Quality and Engineering Questions

### Q89. How is code modularized?
Pages for UI routes, hooks for domain logic, context for cross-cutting state, lib for shared backend helpers.

### Q90. Why not use Redux?
Current scope is manageable with Context + hooks, keeping footprint lower.

### Q91. How do you handle shared calculations?
Utility helpers in supabase lib and explicit calculations in checkout/payment flow.

### Q92. How are side effects managed?
Within `useEffect` with clear dependency arrays and cleanup where required (subscriptions, intervals).

### Q93. How do you avoid stale UI after mutations?
Refetch patterns and local state updates are used after inserts/updates/deletes.

### Q94. Any anti-patterns you would improve?
Client-heavy transaction orchestration in checkout should move server-side for atomicity and trust.

---

## 16. Examiner Scenario Questions (Case-Based)

### Q95. Suppose two users bid at same time. How do you avoid race conditions?
Current implementation updates latest bid sequentially from client writes, but ideal production approach is DB transaction/RPC with strict compare-and-set validation.

### Q96. Suppose checkout fails after order row created but before order_items insert. What happens?
Partial state may exist. Recovery can be done by cleanup job/admin tool. Recommended solution is atomic server-side transaction.

### Q97. Suppose farmer tries to update another farmer’s order. What prevents it?
Ownership filters in update query and RLS ownership rules in DB.

### Q98. Suppose buyer enters invalid address details. How handled?
Client validation (required fields, phone/pincode format) plus DB constraints for integrity.

### Q99. Suppose Supabase config missing in local setup. Does app crash?
No. Mock mode returns controlled errors and keeps UI usable for demo paths.

### Q100. Suppose Vercel shows old UI after push. What do you verify first?
Latest deployment commit, env scope, production URL, and force redeploy with cache clear.

---

## 17. Tradeoff Discussion Questions

### Q101. Why choose BaaS vs custom backend?
BaaS accelerates delivery and reduces infrastructure overhead; tradeoff is tighter coupling to provider patterns.

### Q102. Why polling for some modules if realtime exists?
Polling is simpler and robust for non-high-frequency updates. Realtime is used where immediate update value is high.

### Q103. Why put some business logic in frontend?
Faster iteration and lower server complexity initially. Tradeoff is trust/atomicity concerns for critical flows.

### Q104. Why SQL scripts in repo?
Version-controlled schema/policy evolution and reproducible environment setup.

### Q105. Why not strict REST backend endpoints?
Supabase query API already serves data access; architecture intentionally optimizes speed of implementation.

---

## 18. Future Enhancement Questions

### Q106. What is your first production hardening step?
Move checkout to atomic server-side transaction (RPC/edge function) including payment verification hooks.

### Q107. How would you implement reliable payment confirmation?
Integrate gateway webhook, verify signature server-side, then mark order payment_status and emit notifications.

### Q108. How would you improve scalability for analytics dashboards?
Use materialized views, scheduled aggregation jobs, and caching layer.

### Q109. How would you improve observability?
Centralized logging, error tracking, tracing IDs per order/payment flow.

### Q110. How would you improve security posture?
Periodic RLS audits, stricter policy tests, secret scanning, and least-privilege review for storage policies.

---

## 19. Rapid Fire One-Line Answers

1. Database: Supabase Postgres with RLS.
2. Auth: Supabase Auth with role validation from users table.
3. Routing: React Router with Vercel SPA rewrites.
4. State: Context + hooks.
5. Payment: UPI QR intent with exact amount payload.
6. File storage: Supabase Storage with signed URLs for private artifacts.
7. Realtime: Cart and bids channels.
8. Admin power: product moderation + user role governance + order oversight.
9. Farmer power: product lifecycle + delivery status.
10. Buyer power: marketplace + checkout + tracking + auctions.

---

## 20. Tough Examiner Challenges and Strong Responses

### Challenge A: “Your payment is not a full gateway integration.”
Response:
Correct. Current release provides UPI intent/QR initiation and transactional order placement. Next milestone is webhook-verified payment confirmation with server-side signature validation and reconciliation.

### Challenge B: “Client-side checkout is risky.”
Response:
Agreed. It is acceptable for rapid prototype velocity but our planned production hardening is single RPC transaction for order, items, tracking, and stock updates atomically.

### Challenge C: “Why duplicated order columns?”
Response:
It was deliberate backward-compatibility handling during migration. Trigger sync currently preserves consistency, and we have a roadmap to consolidate into a single canonical schema.

### Challenge D: “How do you prove security?”
Response:
Security is policy-driven at DB layer: RLS on all sensitive tables, role-scoped access, ownership checks, and controlled storage policies. Frontend checks are non-authoritative.

### Challenge E: “How would you handle auditability?”
Response:
Add immutable audit event table for admin actions, moderation decisions, role changes, and order status transitions with actor/timestamp metadata.

---

## 21. Suggested Viva Practice Plan (Tonight)

1. 20 minutes: memorize architecture and stack.
2. 30 minutes: practice top 30 questions aloud.
3. 20 minutes: practice security + RLS answers.
4. 20 minutes: practice payment and checkout tradeoff answers.
5. 20 minutes: practice demo flow narration with timing.
6. 10 minutes: rapid-fire section.

---

## 22. Final Examiner Closing Statement (Use As-Is)
Farm2Home is a role-oriented agri-commerce system built for practical execution speed and secure data access. We used React and Vite for modular, high-velocity frontend development and Supabase for authentication, relational data, storage, and realtime capabilities. The architecture balances rapid delivery with strong policy-level security via RLS. The current version successfully demonstrates complete buyer-farmer-admin operations, and we already have a clear hardening roadmap for atomic checkout transactions and webhook-grade payment verification.
