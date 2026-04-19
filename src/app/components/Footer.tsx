import { Link } from "react-router";

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand Section */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img
                src="/brand-logo.svg"
                alt="Farm2Home"
                className="h-10 w-auto object-contain"
              />
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Connecting local farmers with their community through a transparent, auction-based marketplace for better value and fresher food.
            </p>
          </div>
          
          {/* Marketplace Links */}
          <div>
            <h3 className="text-white font-semibold mb-4 uppercase text-sm tracking-wider">Marketplace</h3>
            <div className="space-y-3">
              <Link to="/products" className="block text-gray-300 hover:text-white transition-colors">
                Browse Products
              </Link>
              <Link to="/auctions" className="block text-gray-300 hover:text-white transition-colors">
                Live Auctions
              </Link>
              <Link to="/register" className="block text-gray-300 hover:text-white transition-colors">
                Start Selling
              </Link>
            </div>
          </div>
          
          {/* Support Links */}
          <div>
            <h3 className="text-white font-semibold mb-4 uppercase text-sm tracking-wider">Support</h3>
            <div className="space-y-3">
              <a href="#" className="block text-gray-300 hover:text-white transition-colors">
                FAQ
              </a>
              <a href="#" className="block text-gray-300 hover:text-white transition-colors">
                Contact Us
              </a>
              <a href="#" className="block text-gray-300 hover:text-white transition-colors">
                Privacy Policy
              </a>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">
            © 2026 Farm2Home Marketplace. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-gray-500 hover:text-white transition-colors text-sm">
              Terms of Service
            </a>
            <a href="#" className="text-gray-500 hover:text-white transition-colors text-sm">
              Privacy Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
