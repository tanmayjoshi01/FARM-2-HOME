import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { SupabaseSetupNotice } from "../components/SupabaseSetupNotice";
import { toast } from "sonner";

type UserRole = "buyer" | "farmer" | "admin";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>("buyer");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await login(email, password, selectedRole);
      toast.success("Login successful!");
      
      // Redirect based on role
      if (selectedRole === "buyer") {
        navigate("/");
      } else if (selectedRole === "farmer") {
        navigate("/farmer/dashboard");
      } else if (selectedRole === "admin") {
        navigate("/admin/dashboard");
      }
    } catch (error: any) {
      toast.error(error.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f9fafb] py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-[480px]">
        {/* Supabase Setup Notice */}
        <SupabaseSetupNotice />
        
        <div className="bg-white rounded-[20px] shadow-lg p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <img
              src="/brand-logo.svg"
              alt="Farm2Home"
              className="h-20 w-auto object-contain mx-auto"
            />
          </div>

          {/* Role Selector Tabs */}
          <div className="flex gap-2 mb-6 p-1 bg-gray-100 rounded-full">
            <button
              type="button"
              onClick={() => setSelectedRole("buyer")}
              className={`flex-1 py-2.5 px-4 rounded-full text-sm font-semibold transition-all ${
                selectedRole === "buyer"
                  ? "bg-[#16a34a] text-white shadow-sm"
                  : "text-[#6b7280] hover:text-[#111827]"
              }`}
            >
              Buyer
            </button>
            <button
              type="button"
              onClick={() => setSelectedRole("farmer")}
              className={`flex-1 py-2.5 px-4 rounded-full text-sm font-semibold transition-all ${
                selectedRole === "farmer"
                  ? "bg-[#16a34a] text-white shadow-sm"
                  : "text-[#6b7280] hover:text-[#111827]"
              }`}
            >
              Farmer
            </button>
            <button
              type="button"
              onClick={() => setSelectedRole("admin")}
              className={`flex-1 py-2.5 px-4 rounded-full text-sm font-semibold transition-all ${
                selectedRole === "admin"
                  ? "bg-[#16a34a] text-white shadow-sm"
                  : "text-[#6b7280] hover:text-[#111827]"
              }`}
            >
              Admin
            </button>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-[#111827] mb-2"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#16a34a] focus:border-transparent transition-all"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-[#111827]"
                >
                  Password
                </label>
                <a
                  href="#"
                  className="text-sm text-[#16a34a] hover:text-[#15803d] font-medium"
                >
                  Forgot Password?
                </a>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#16a34a] focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-[#16a34a] focus:ring-[#16a34a] border-gray-300 rounded"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-sm text-[#6b7280]"
                >
                  Remember me
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#16a34a] text-white py-3.5 rounded-full hover:bg-[#15803d] transition-colors font-bold text-base shadow-sm h-[52px] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-[#6b7280] text-sm">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="text-[#16a34a] hover:text-[#15803d] font-semibold"
              >
                Register now
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}