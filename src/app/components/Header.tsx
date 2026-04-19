import { Link, useLocation } from "react-router";
import { ShoppingCart, Gavel, Package, Truck, ChevronDown, User, Heart, MapPin, Settings, LogOut } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useState, useRef, useEffect } from "react";

export function Header() {
  const location = useLocation();
  const { totalItems } = useCart();
  const { user, isAuthenticated, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(path + "/");

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setShowDropdown(false);
  };

  // Get user initials
  const getUserInitials = () => {
    if (!user) return "U";
    const names = user.name.split(" ");
    if (names.length >= 2) {
      return (names[0][0] + names[1][0]).toUpperCase();
    }
    return user.name.substring(0, 2).toUpperCase();
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <img
            src="/brand-logo.svg"
            alt="Farm2Home"
            className="h-11 w-auto object-contain"
          />
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          <Link
            to="/"
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              location.pathname === "/"
                ? "bg-green-50 text-[#16a34a]"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            Home
          </Link>
          <Link
            to="/products"
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              isActive("/products")
                ? "bg-green-50 text-[#16a34a]"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            Products
          </Link>
          <Link
            to="/auctions"
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
              isActive("/auctions")
                ? "bg-green-50 text-[#16a34a]"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            <Gavel className="w-3.5 h-3.5" />
            Auctions
            <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full leading-none font-bold">
              LIVE
            </span>
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          {/* Show this for logged in buyers */}
          {isAuthenticated && user?.role === "buyer" ? (
            <>
              {/* My Orders Link */}
              <Link
                to="/orders"
                className="hidden sm:flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors font-medium"
              >
                <Package className="w-4 h-4" />
                My Orders
              </Link>

              {/* Track Order Icon Button */}
              <Link
                to="/track-order"
                className="hidden sm:flex p-2 hover:bg-gray-50 rounded-xl transition-colors"
                title="Track Order"
              >
                <Truck className="w-5 h-5 text-gray-700" />
              </Link>

              {/* User Avatar with Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center gap-2 p-1 hover:bg-gray-50 rounded-xl transition-colors"
                >
                  <div className="w-8 h-8 bg-[#16a34a] rounded-full flex items-center justify-center text-white text-sm font-semibold">
                    {getUserInitials()}
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-600 hidden sm:block" />
                </button>

                {/* Dropdown Menu */}
                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-[260px] bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50">
                    {/* User Info */}
                    <div className="px-4 py-3 border-b border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#16a34a] rounded-full flex items-center justify-center text-white font-semibold">
                          {getUserInitials()}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 text-sm">{user?.name}</div>
                          <div className="text-xs text-gray-500">{user?.email}</div>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-1">
                      <Link
                        to="/orders"
                        onClick={() => setShowDropdown(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <Package className="w-4 h-4" />
                        My Orders
                      </Link>
                      <Link
                        to="/track-order"
                        onClick={() => setShowDropdown(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <Truck className="w-4 h-4" />
                        Track Order
                      </Link>
                      <Link
                        to="/products"
                        onClick={() => setShowDropdown(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <Heart className="w-4 h-4" />
                        Wishlist
                      </Link>
                      <Link
                        to="/checkout/address"
                        onClick={() => setShowDropdown(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <MapPin className="w-4 h-4" />
                        Saved Addresses
                      </Link>
                      <Link
                        to="/"
                        onClick={() => setShowDropdown(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <Settings className="w-4 h-4" />
                        Account Settings
                      </Link>
                    </div>

                    {/* Logout */}
                    <div className="border-t border-gray-100 pt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Show this for logged out users */
            <>
              <Link
                to="/login"
                className="hidden sm:block text-sm text-gray-600 hover:text-gray-900 transition-colors font-medium"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="hidden sm:block bg-[#16a34a] text-white px-5 py-2 rounded-full hover:bg-[#15803d] transition-colors text-sm font-semibold"
              >
                Register
              </Link>
            </>
          )}

          <Link to="/cart" className="relative p-2 hover:bg-gray-50 rounded-xl transition-colors">
            <ShoppingCart className="w-6 h-6 text-gray-700" />
            {totalItems > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-[#16a34a] text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold leading-none">
                {totalItems > 99 ? "99+" : totalItems}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}