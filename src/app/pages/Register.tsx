import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Info, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";

type UserRole = "buyer" | "farmer";

export function Register() {
  const [accountType, setAccountType] = useState<UserRole>("buyer");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (!fullName || !email || !password) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    try {
      await register(fullName, email, password, accountType, phone);
      toast.success("Account created successfully!");
      
      // Redirect based on role
      if (accountType === "buyer") {
        navigate("/");
      } else if (accountType === "farmer") {
        navigate("/farmer/dashboard");
      }
    } catch (error: any) {
      console.error("Registration error:", error);
      toast.error(error.message || "Registration failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f9fafb] py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-[480px]">
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
              onClick={() => setAccountType("buyer")}
              className={`flex-1 py-2.5 px-4 rounded-full text-sm font-semibold transition-all ${
                accountType === "buyer"
                  ? "bg-[#16a34a] text-white shadow-sm"
                  : "text-[#6b7280] hover:text-[#111827]"
              }`}
            >
              Buyer
            </button>
            <button
              type="button"
              onClick={() => setAccountType("farmer")}
              className={`flex-1 py-2.5 px-4 rounded-full text-sm font-semibold transition-all ${
                accountType === "farmer"
                  ? "bg-[#16a34a] text-white shadow-sm"
                  : "text-[#6b7280] hover:text-[#111827]"
              }`}
            >
              Farmer
            </button>
          </div>

          {/* Info Banner */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3 mb-6">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue-800">
              Admin accounts are provisioned internally and cannot be registered here.
            </p>
          </div>

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="fullName"
                className="block text-sm font-medium text-[#111827] mb-2"
              >
                Full Name
              </label>
              <input
                id="fullName"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#16a34a] focus:border-transparent transition-all"
              />
            </div>

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
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-[#111827] mb-2"
              >
                Phone Number <span className="text-[#9ca3af]">(optional)</span>
              </label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#16a34a] focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-[#111827] mb-2"
              >
                Password
              </label>
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

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-[#111827] mb-2"
              >
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#16a34a] focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-[#16a34a] text-white py-3.5 rounded-full hover:bg-[#15803d] transition-colors font-bold text-base shadow-sm h-[52px] mt-6"
            >
              Create Account
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-[#6b7280] text-sm">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-[#16a34a] hover:text-[#15803d] font-semibold"
              >
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}