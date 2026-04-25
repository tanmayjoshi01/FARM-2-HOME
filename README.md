# 🌾 Farm2Home Marketplace

A full-stack agricultural marketplace connecting farmers directly with buyers through auctions and direct sales.

## ✨ Features

### For Buyers
- Browse products by category
- Search and filter
- Real-time auctions with live bidding
- Shopping cart with checkout
- Order tracking
- Multiple delivery addresses

### For Farmers
- Product listing with image upload
- Certificate upload (organic, quality, etc.)
- Direct sales and auction management
- Order management
- Analytics dashboard

### For Admins
- Product approval workflow
- User management
- Platform analytics
- Order oversight

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS v4
- **Routing**: React Router v7
- **Backend**: Supabase (PostgreSQL + Auth + Storage + Realtime)
- **Icons**: Lucide React
- **Charts**: Recharts
- **Animations**: Motion (Framer Motion)

## 🔧 What's Integrated

✅ **Authentication** - Real Supabase Auth with role-based access  
✅ **Products Page** - Fetches from database  
✅ **Cart** - Database-backed with real-time sync  
✅ **Price Calculations** - 3% platform fee, 18% GST, delivery charges  
⏳ **Auctions** - Schema ready, frontend integration pending  
⏳ **Image Uploads** - Helpers created, integration pending  
⏳ **Farmer Dashboard** - Needs database connection  
⏳ **Admin Dashboard** - Needs database connection  

## 📦 Database Schema

13 tables with full relationships:
- `users` - User profiles (buyer/farmer/admin)
- `products` - Product listings
- `certificates` - Product certificates (private storage)
- `carts` + `cart_items` - Shopping cart
- `orders` + `order_items` - Order management
- `auctions` + `bids` - Live auction system
- `tracking` - Order tracking
- `notifications` - User notifications
- `addresses` - Delivery addresses
- `wishlists` - Saved products

## 🔒 Security

- Row-Level Security (RLS) enabled on all tables
- Role-based access control
- Signed URLs for private files (certificates)
- SQL injection protection via parameterized queries

## 💰 Pricing Model

- **Platform Fee**: 3% of order subtotal
- **GST**: 18% of order subtotal
- **Delivery**: ₹49 (free for orders > ₹500)

All calculations happen automatically during checkout.

## 🌐 Demo Mode

Without Supabase configuration, the app runs in **demo mode**:
- Mock authentication (localStorage)
- No data persistence
- Limited functionality



### Suppressing Console Warnings

The `.env.local` file is already configured to suppress demo mode warnings:

```bash
# Already set in .env.local
VITE_MODE=demo
```

You can also dismiss the setup notice banner on the login page by clicking the X button.



## 🤝 Contributing

1. Set up the development environment (see Quick Start)
2. Create a feature branch
3. Make your changes
4. Test with real Supabase backend
5. Submit a pull request

## 📄 License

MIT License - feel free to use for your own projects!



---

**Built with ❤️ for farmers and buyers**
