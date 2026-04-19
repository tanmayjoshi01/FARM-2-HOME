import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Gavel, 
  MapPin, 
  PlusCircle, 
  Users, 
  ClipboardList,
  LogOut
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";

interface SidebarLink {
  path: string;
  label: string;
  icon: React.ElementType;
}

interface DashboardSidebarProps {
  type: "farmer" | "buyer" | "admin";
}

const sidebarLinks = {
  farmer: [
    { path: "/farmer/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/farmer/add-product", label: "Add Product", icon: PlusCircle },
    { path: "/farmer/products", label: "My Products", icon: Package },
    { path: "/farmer/orders", label: "Orders", icon: ClipboardList },
    { path: "/farmer/tracking", label: "Tracking", icon: MapPin },
  ],
  buyer: [
    { path: "/buyer/dashboard", label: "Home", icon: LayoutDashboard },
    { path: "/buyer/marketplace", label: "Marketplace", icon: Package },
    { path: "/buyer/cart", label: "Cart", icon: ShoppingCart },
    { path: "/buyer/auctions", label: "Auctions", icon: Gavel },
    { path: "/buyer/orders", label: "Orders", icon: ClipboardList },
  ],
  admin: [
    { path: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/admin/products", label: "Products", icon: Package },
    { path: "/admin/auctions", label: "Auctions", icon: Gavel },
    { path: "/admin/users", label: "Users", icon: Users },
    { path: "/admin/orders", label: "Orders", icon: ClipboardList },
    { path: "/admin/tracking", label: "Tracking", icon: MapPin },
  ],
};

const roleLabels = {
  farmer: "Farmer Portal",
  buyer: "Buyer Portal",
  admin: "Admin Portal",
};

export function DashboardSidebar({ type }: DashboardSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const links = sidebarLinks[type];

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      toast.success("Logged out successfully");
      navigate("/login", { replace: true });
    } catch (error: any) {
      toast.error(error?.message || "Logout failed");
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Get user initials and name
  const userName = user?.name || "User";
  const userInitials = userName
    .split(" ")
    .map(n => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <Link to="/" className="flex items-center gap-2">
          <img
            src="/brand-logo.svg"
            alt="Farm2Home"
            className="h-10 w-auto object-contain"
          />
          <div>
            <p className="text-xs text-gray-500">{roleLabels[type]}</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.path;
          
          return (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                isActive
                  ? "bg-gradient-to-r from-[#16a34a] to-[#15803d] text-white shadow-md shadow-green-200"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Profile & Logout */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl mb-2">
          <div className="w-10 h-10 bg-gradient-to-br from-[#16a34a] to-[#15803d] rounded-full flex items-center justify-center text-white font-bold text-xs">
            {userInitials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 text-sm truncate">
              {userName}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {type === "farmer" ? "Farmer" : type === "buyer" ? "Buyer" : "Administrator"}
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-red-600 hover:bg-red-50 rounded-xl font-medium transition-colors text-sm disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <LogOut className="w-4 h-4" />
          {isLoggingOut ? "Logging out..." : "Logout"}
        </button>
      </div>
    </div>
  );
}
