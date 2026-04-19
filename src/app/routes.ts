import { createBrowserRouter } from "react-router";
import { Home } from "./pages/Home";
import { Products } from "./pages/Products";
import { Auctions } from "./pages/Auctions";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { Cart } from "./pages/Cart";
import { Address } from "./pages/checkout/Address";
import { Payment } from "./pages/checkout/Payment";
import { Success } from "./pages/checkout/Success";
import { LiveAuction } from "./pages/LiveAuction";
import { TrackOrder } from "./pages/TrackOrder";
import { BuyerOrders } from "./pages/BuyerOrders";
import { FarmerDashboard } from "./pages/farmer/Dashboard";
import { FarmerAddProduct } from "./pages/farmer/AddProduct";
import { FarmerProducts } from "./pages/farmer/Products";
import { FarmerOrders } from "./pages/farmer/Orders";
import { FarmerTracking } from "./pages/farmer/Tracking";
import { AdminDashboard } from "./pages/admin/Dashboard";
import { AdminProducts } from "./pages/admin/Products";
import { AdminAuctionManagement } from "./pages/admin/AuctionManagement";
import { AdminUsers } from "./pages/admin/Users";
import { AdminOrders } from "./pages/admin/Orders";
import { AdminTracking } from "./pages/admin/Tracking";
import { NotFound } from "./pages/NotFound";

export const router = createBrowserRouter([
  { 
    path: "/", 
    Component: Home 
  },
  { 
    path: "/products", 
    Component: Products 
  },
  { 
    path: "/auctions", 
    Component: Auctions 
  },
  { 
    path: "/auctions/live/:id", 
    Component: LiveAuction 
  },
  { 
    path: "/login", 
    Component: Login 
  },
  { 
    path: "/register", 
    Component: Register 
  },
  { 
    path: "/cart", 
    Component: Cart 
  },
  { 
    path: "/checkout/address", 
    Component: Address 
  },
  { 
    path: "/checkout/payment", 
    Component: Payment 
  },
  { 
    path: "/checkout/success", 
    Component: Success 
  },
  { 
    path: "/orders", 
    Component: BuyerOrders 
  },
  { 
    path: "/track-order", 
    Component: TrackOrder 
  },
  // Farmer Dashboard Routes
  { 
    path: "/farmer/dashboard", 
    Component: FarmerDashboard 
  },
  { 
    path: "/farmer/add-product", 
    Component: FarmerAddProduct 
  },
  { 
    path: "/farmer/products", 
    Component: FarmerProducts 
  },
  { 
    path: "/farmer/orders", 
    Component: FarmerOrders 
  },
  { 
    path: "/farmer/tracking", 
    Component: FarmerTracking 
  },
  // Admin Dashboard Routes
  { 
    path: "/admin/dashboard", 
    Component: AdminDashboard 
  },
  { 
    path: "/admin/products", 
    Component: AdminProducts 
  },
  { 
    path: "/admin/auctions", 
    Component: AdminAuctionManagement 
  },
  { 
    path: "/admin/users", 
    Component: AdminUsers 
  },
  { 
    path: "/admin/orders", 
    Component: AdminOrders 
  },
  { 
    path: "/admin/tracking", 
    Component: AdminTracking 
  },
  // Catch-all 404 route - must be last
  { 
    path: "*", 
    Component: NotFound 
  },
]);