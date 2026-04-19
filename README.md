# 🌾 Farm2Home Marketplace

A full-stack agricultural marketplace connecting farmers directly with buyers through auctions and direct sales.

## 🎯 Current Status

✅ **Frontend**: Complete (React + React Router + Tailwind CSS)  
⚙️ **Backend**: Ready to deploy (Supabase configuration provided)  
📦 **Integration**: 60% complete (~14 hours remaining)

---

## 🚀 TWO WAYS TO COMPLETE (Choose One)

### 🤖 OPTION 1: Automated with Claude (Recommended - 4-5 hours)

**Claude does the integration for you automatically!**

1. Read **[HOW_TO_USE_CLAUDE_PROMPT.md](./HOW_TO_USE_CLAUDE_PROMPT.md)** (10 min)
2. Copy **[CLAUDE_INTEGRATION_PROMPT.md](./CLAUDE_INTEGRATION_PROMPT.md)** (entire file)
3. Paste into a new Claude conversation
4. Claude completes all phases (2-3 hours)
5. You test as it goes (1 hour)
6. Done - 100% functional! 🎉

### 👨‍💻 OPTION 2: Manual Implementation (3-4 days)

**Follow step-by-step guides yourself:**

1. Read **[START_HERE.md](./START_HERE.md)** (5 min)
2. Read **[MASTER_PLAN.md](./MASTER_PLAN.md)** (10 min)
3. Follow **[IMPLEMENTATION_STEP_BY_STEP.md](./IMPLEMENTATION_STEP_BY_STEP.md)** (Day 1)
4. Follow **[PHASES_3_TO_8.md](./PHASES_3_TO_8.md)** (Days 2-4)
5. Deploy - 100% functional! 🎉

---

## 📖 COMPLETE DOCUMENTATION

**15 comprehensive guides** - See **[INDEX.md](./INDEX.md)** for full navigation

### Quick Access:
| What You Need | Read This |
|---------------|-----------|
| 📊 **Visual Overview** | [QUICK_VISUAL_GUIDE.md](./QUICK_VISUAL_GUIDE.md) |
| 🎯 **Full Summary** | [COMPLETE_SOLUTION_SUMMARY.md](./COMPLETE_SOLUTION_SUMMARY.md) |
| ✅ **What's Done** | [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) |
| 🗺️ **Timeline** | [ROADMAP.md](./ROADMAP.md) |
| 📚 **All Docs** | [INDEX.md](./INDEX.md) |

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

**To unlock all features, set up Supabase (see QUICK_START.md)**

### Suppressing Console Warnings

The `.env.local` file is already configured to suppress demo mode warnings:

```bash
# Already set in .env.local
VITE_MODE=demo
```

You can also dismiss the setup notice banner on the login page by clicking the X button.

## 📸 Screenshots

*(Add screenshots here after setup)*

## 🤝 Contributing

1. Set up the development environment (see Quick Start)
2. Create a feature branch
3. Make your changes
4. Test with real Supabase backend
5. Submit a pull request

## 📄 License

MIT License - feel free to use for your own projects!

## 🆘 Need Help?

- Check **QUICK_START.md** for setup help
- Review **INTEGRATION_GUIDE.md** for development patterns
- See **REPLACEMENT_EXAMPLES.md** for code examples

---

**Built with ❤️ for farmers and buyers**