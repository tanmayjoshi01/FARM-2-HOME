import { Link } from "react-router";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { Leaf, Gavel, ShoppingBag, Truck, ArrowRight, Sprout, TrendingUp, Clock, MapPin, Navigation, X } from "lucide-react";
import { motion } from "motion/react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useState } from "react";

export function Home() {
  const { user, isAuthenticated } = useAuth();
  const { totalItems } = useCart();
  const [showGreeting, setShowGreeting] = useState(true);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      {/* Personalized Greeting Bar for Logged-in Buyers */}
      {isAuthenticated && user?.role === "buyer" && showGreeting && (
        <div className="bg-[#16a34a] text-white py-3 px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm sm:text-base">
              <span className="font-semibold">Welcome back, {user.name}! 🌾</span>
              <span className="hidden sm:inline">|</span>
              <span className="hidden sm:inline">{totalItems} items in cart</span>
              <span className="hidden md:inline">|</span>
              <Link 
                to="/track-order" 
                className="hidden md:inline-flex items-center gap-1 hover:underline"
              >
                1 order in transit → Track
              </Link>
            </div>
            <button
              onClick={() => setShowGreeting(false)}
              className="p-1 hover:bg-green-700 rounded-full transition-colors"
              aria-label="Dismiss"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-800 to-green-700 text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-64 h-64 bg-green-600 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-green-900 rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-green-900/40 backdrop-blur-sm px-4 py-2 rounded-full border border-green-600/30 mb-6">
              <Sprout className="w-4 h-4 text-green-300" />
              <span className="text-green-100 text-sm">Farm Fresh, Direct to You</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-4">
              Farm<span className="text-orange-400">2</span>Home
            </h1>
            <p className="text-2xl md:text-3xl font-semibold mb-6 text-green-50">
              Direct From Local Producers
            </p>
            <p className="text-lg md:text-xl text-green-100 max-w-3xl mx-auto mb-10 leading-relaxed">
              Fresh produce directly from farmers through auctions and marketplace buying. No middlemen, better prices, healthier food.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link 
                to="/products" 
                className="inline-flex items-center gap-2 bg-orange-500 text-white px-8 py-4 rounded-full hover:bg-orange-600 transition-colors font-semibold text-lg shadow-lg"
              >
                Browse Products
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link 
                to="/register" 
                className="inline-flex items-center gap-2 bg-white text-green-800 px-8 py-4 rounded-full hover:bg-green-50 transition-colors font-semibold text-lg shadow-lg"
              >
                Start Selling
              </Link>
              <Link 
                to="/auctions" 
                className="inline-flex items-center gap-2 bg-green-900/40 backdrop-blur-sm border-2 border-green-600/50 text-white px-8 py-4 rounded-full hover:bg-green-900/60 transition-colors font-semibold text-lg"
              >
                Join Auctions
              </Link>
            </div>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-400 mb-1">500+</div>
              <div className="text-green-200 text-sm">Products Listed</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-400 mb-1">150+</div>
              <div className="text-green-200 text-sm">Farmers</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-400 mb-1">1K+</div>
              <div className="text-green-200 text-sm">Happy Buyers</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-400 mb-1">Live</div>
              <div className="text-green-200 text-sm">Auctions Daily</div>
            </div>
          </div>
        </div>
      </section>
      
      {/* How It Works Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              A simple, transparent process connecting farmers directly with buyers.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mb-6">
                <Leaf className="w-8 h-8 text-green-700" />
              </div>
              <div className="text-sm font-semibold text-gray-400 mb-2">1</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Farmers List Products</h3>
              <p className="text-gray-600 leading-relaxed">
                Verified local producers upload their fresh harvest directly to our platform.
              </p>
            </div>
            
            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mb-6">
                <Gavel className="w-8 h-8 text-orange-600" />
              </div>
              <div className="text-sm font-semibold text-gray-400 mb-2">2</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Auctions Start</h3>
              <p className="text-gray-600 leading-relaxed">
                Farmers set a starting price and duration. Live, transparent bidding begins.
              </p>
            </div>
            
            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6">
                <ShoppingBag className="w-8 h-8 text-blue-600" />
              </div>
              <div className="text-sm font-semibold text-gray-400 mb-2">3</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Buyers Bid or Buy</h3>
              <p className="text-gray-600 leading-relaxed">
                Follow live auctions, place competitive bids, or buy directly at listed prices.
              </p>
            </div>
            
            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mb-6">
                <Truck className="w-8 h-8 text-purple-600" />
              </div>
              <div className="text-sm font-semibold text-gray-400 mb-2">4</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Fresh Delivery</h3>
              <p className="text-gray-600 leading-relaxed">
                Highest bidder wins! Farm-fresh produce delivered straight to your door.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Featured Auctions Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-2">Featured Auctions</h2>
              <p className="text-gray-600">Live auctions happening right now. Place your bid!</p>
            </div>
            <Link to="/auctions" className="text-green-700 font-semibold flex items-center gap-1 hover:gap-2 transition-all">
              View All
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: "Alphonso Mango", farmer: "Ratnagiri Farms", bid: 5400, bidders: 23, time: "2:47:33", id: 1 },
              { name: "Red Onions", farmer: "Nasik Valley Farms", bid: 1200, bidders: 19, time: "3:20:15", id: 5 },
              { name: "Premium Wheat Grain", farmer: "Golden Fields", bid: 4500, bidders: 27, time: "6:00:00", id: 6 },
            ].map((item) => (
              <div key={item.id} className="bg-gray-50 rounded-2xl p-5 border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-3">
                  <span className="bg-red-600 text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                    LIVE
                  </span>
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {item.time}
                  </span>
                </div>
                <h3 className="font-bold text-gray-900 mb-1">{item.name}</h3>
                <p className="text-sm text-gray-500 mb-3">by {item.farmer}</p>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-xs text-gray-500">Current Bid</div>
                    <div className="text-xl font-bold text-green-700 flex items-center gap-1">
                      ₹{item.bid.toLocaleString()} <TrendingUp className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500">Bidders</div>
                    <div className="font-bold text-gray-900">{item.bidders}</div>
                  </div>
                </div>
                <Link
                  to={`/auctions/live/${item.id}`}
                  className="w-full block text-center bg-green-700 text-white py-2.5 rounded-xl font-bold text-sm hover:bg-green-800 transition-colors"
                >
                  Join Auction →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Live Tracking Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Track Your Orders in Real-Time</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Monitor your delivery from farm to doorstep with live GPS tracking
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 items-center">
            {/* Mini Map Preview */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
            >
              <div className="px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-[#16a34a] to-[#15803d]">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-white flex items-center gap-2">
                    <Navigation className="w-5 h-5" />
                    Live Tracking
                  </h3>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    <span className="text-xs text-green-100">Active</span>
                  </div>
                </div>
              </div>

              {/* Mini Map */}
              <div className="relative h-80 bg-gradient-to-br from-green-50 to-blue-50 overflow-hidden">
                {/* Grid pattern background */}
                <div
                  className="absolute inset-0 opacity-20"
                  style={{
                    backgroundImage:
                      'linear-gradient(#16a34a 1px, transparent 1px), linear-gradient(90deg, #16a34a 1px, transparent 1px)',
                    backgroundSize: '30px 30px',
                  }}
                />

                {/* Route path */}
                <svg className="absolute inset-0 w-full h-full">
                  <path
                    d="M 50 280 Q 150 220, 250 200 T 450 150"
                    stroke="#94a3b8"
                    strokeWidth="4"
                    fill="none"
                    strokeDasharray="8 6"
                    opacity="0.4"
                  />
                  <path
                    d="M 50 280 Q 150 220, 250 200 T 450 150"
                    stroke="#16a34a"
                    strokeWidth="4"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray="50% 100%"
                  />
                </svg>

                {/* Start Marker */}
                <div className="absolute bottom-6 left-12">
                  <div className="w-8 h-8 bg-[#F97316] rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                    <MapPin className="w-4 h-4 text-white" />
                  </div>
                </div>

                {/* End Marker */}
                <div className="absolute top-12 right-12">
                  <div className="w-8 h-8 bg-[#16a34a] rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                    <MapPin className="w-4 h-4 text-white" />
                  </div>
                </div>

                {/* Animated Truck */}
                <motion.div
                  animate={{
                    x: [0, 150, 300],
                    y: [0, -60, -120],
                  }}
                  transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="absolute bottom-6 left-12"
                >
                  <motion.div
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-xl border-2 border-[#16a34a]"
                  >
                    <Truck className="w-6 h-6 text-[#16a34a]" />
                  </motion.div>
                </motion.div>

                {/* Info overlay */}
                <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-sm rounded-xl p-3 shadow-md">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500">Order Status</p>
                      <p className="font-semibold text-gray-900 text-sm">In Transit</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">ETA</p>
                      <p className="font-semibold text-[#16a34a] text-sm">23 mins</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Track Button */}
              <div className="p-5 bg-gray-50">
                <Link
                  to="/track-order"
                  className="w-full flex items-center justify-center gap-2 bg-[#16a34a] hover:bg-[#15803d] text-white py-3 rounded-xl font-semibold transition-colors shadow-md shadow-green-200"
                >
                  View Full Tracking
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>

            {/* Order Status Cards */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-4"
            >
              {[
                {
                  status: "In Transit",
                  orderId: "F2HKJ8492",
                  product: "Organic Tomatoes (5kg)",
                  eta: "23 mins",
                  color: "green",
                  active: true,
                },
                {
                  status: "Dispatched",
                  orderId: "F2HMN6721",
                  product: "Basmati Rice (10kg)",
                  eta: "2 hours",
                  color: "blue",
                  active: false,
                },
                {
                  status: "Delivered",
                  orderId: "F2HRT3945",
                  product: "Fresh Spinach Bundle",
                  eta: "Completed",
                  color: "gray",
                  active: false,
                },
              ].map((order, index) => (
                <motion.div
                  key={order.orderId}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className={`bg-white rounded-2xl p-5 border-2 transition-all ${
                    order.active
                      ? "border-[#16a34a] shadow-lg shadow-green-100"
                      : "border-gray-100 hover:border-gray-200"
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                          order.color === "green"
                            ? "bg-green-100 text-[#16a34a]"
                            : order.color === "blue"
                            ? "bg-blue-100 text-blue-600"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {order.active && (
                          <span className="w-1.5 h-1.5 bg-current rounded-full animate-pulse" />
                        )}
                        {order.status}
                      </span>
                    </div>
                    <Link
                      to="/track-order"
                      className="text-sm text-[#16a34a] font-semibold hover:underline"
                    >
                      Track →
                    </Link>
                  </div>

                  <p className="font-semibold text-gray-900 mb-1">{order.product}</p>
                  <p className="text-xs text-gray-500 mb-3 font-mono">
                    Order ID: {order.orderId}
                  </p>

                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>ETA: {order.eta}</span>
                    </div>
                    <Truck
                      className={`w-5 h-5 ${
                        order.active ? "text-[#16a34a]" : "text-gray-400"
                      }`}
                    />
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="bg-gradient-to-br from-green-800 to-green-700 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-lg text-green-100 mb-8 max-w-2xl mx-auto">
            Join thousands of buyers and farmers already using Farm2Home for transparent, fair marketplace trading.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/register" 
              className="inline-block bg-orange-500 text-white px-8 py-4 rounded-full hover:bg-orange-600 transition-colors font-semibold text-lg"
            >
              Create Account
            </Link>
            <Link 
              to="/products" 
              className="inline-block bg-green-900/40 backdrop-blur-sm border-2 border-green-600/50 text-white px-8 py-4 rounded-full hover:bg-green-900/60 transition-colors font-semibold text-lg"
            >
              Browse Marketplace
            </Link>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
}