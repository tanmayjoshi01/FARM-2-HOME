import { Link } from "react-router";
import { Home as HomeIcon, ArrowLeft } from "lucide-react";

export function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-orange-50 to-green-50 flex items-center justify-center px-4">
      <div className="text-center max-w-2xl">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-[#166534] mb-4">404</h1>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Page Not Found
          </h2>
          <p className="text-gray-600 text-lg">
            Sorry, the page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-[#166534] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#145028] transition-colors"
          >
            <HomeIcon className="w-5 h-5" />
            Go to Home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 bg-white text-[#166534] border-2 border-[#166534] px-6 py-3 rounded-xl font-semibold hover:bg-green-50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Go Back
          </button>
        </div>

        <div className="mt-12 p-6 bg-white rounded-2xl shadow-lg border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-3">
            Quick Links
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <Link
              to="/products"
              className="text-[#166534] hover:underline font-medium"
            >
              Browse Products
            </Link>
            <Link
              to="/auctions"
              className="text-[#166534] hover:underline font-medium"
            >
              View Auctions
            </Link>
            <Link
              to="/login"
              className="text-[#166534] hover:underline font-medium"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="text-[#166534] hover:underline font-medium"
            >
              Register
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
