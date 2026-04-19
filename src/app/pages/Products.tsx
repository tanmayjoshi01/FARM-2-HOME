import { useState } from "react";
import { useNavigate } from "react-router";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { Search, SlidersHorizontal, Flame, ShoppingCart } from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { useProducts } from "../hooks/useProducts";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";

export function Products() {
  const [filter, setFilter] = useState<"all" | "auction" | "direct">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const { products, loading, error } = useProducts(filter, searchQuery);
  const { addItem } = useCart();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const handleProductAction = async (product: any) => {
    if (product.type === "auction") {
      if (product.auction_id) {
        navigate(`/auctions/live/${product.auction_id}`);
      } else {
        toast.error("Auction not available for this product");
      }
      return;
    }

    if (!isAuthenticated) {
      toast.error("Please log in to add items to cart");
      return;
    }

    if (user?.role !== "buyer") {
      toast.error("Only buyers can add items to cart");
      return;
    }

    try {
      await addItem(product.id);
      toast.success(`${product.name} added to cart!`);
    } catch (error: any) {
      toast.error(error?.message || "Failed to add to cart");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-800 to-green-700 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-3">
            Farm2Home Marketplace
          </h1>
          <p className="text-lg text-green-100 text-center mb-8">
            Fresh produce directly from local farmers.
          </p>

          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search products by name or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-xl text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-green-600"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Filters and Products */}
      <section className="flex-1 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Filter Bar */}
          <div className="bg-white rounded-xl shadow-sm p-4 mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-5 h-5 text-gray-400" />
              <div className="flex gap-2">
                <button
                  onClick={() => setFilter("all")}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    filter === "all"
                      ? "bg-green-700 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  All Products
                </button>
                <button
                  onClick={() => setFilter("auction")}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-1 ${
                    filter === "auction"
                      ? "bg-green-700 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <Flame className="w-4 h-4" />
                  On Auction
                </button>
                <button
                  onClick={() => setFilter("direct")}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-1 ${
                    filter === "direct"
                      ? "bg-green-700 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <ShoppingCart className="w-4 h-4" />
                  Direct Buy
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <label className="text-gray-600 text-sm">Sort by:</label>
              <select className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-600">
                <option>Newest First</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
                <option>Most Popular</option>
              </select>
              <span className="text-gray-500 text-sm">
                {products.length} items
              </span>
            </div>
          </div>

          {/* Products Grid */}
          {error ? (
            <div className="bg-white rounded-xl p-16 text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Unable to load products</h3>
              <p className="text-gray-600">{error}</p>
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group"
                >
                  <div className="relative aspect-square bg-gray-100 overflow-hidden">
                    <ImageWithFallback
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {product.type === "auction" && (
                      <div className="absolute top-3 right-3 bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                        <Flame className="w-3 h-3" />
                        Auction
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-gray-900 mb-1 text-lg">
                      {product.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      {product.farmer}
                    </p>
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-2xl font-bold text-green-700">
                          ₹{product.price}
                        </span>
                        <span className="text-gray-500 text-sm ml-1">
                          /{product.unit}
                        </span>
                      </div>
                      <button
                        className="bg-green-700 text-white px-4 py-2 rounded-lg hover:bg-green-800 transition-colors font-medium text-sm"
                        onClick={() => handleProductAction(product)}
                      >
                        {product.type === "auction" ? "Bid Now" : "Buy Now"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl p-16 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                No products found
              </h3>
              <p className="text-gray-600">
                Try adjusting your search or filters
              </p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}