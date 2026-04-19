import { Link, useNavigate } from "react-router";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { useCart } from "../context/CartContext";
import {
  Minus,
  Plus,
  Trash2,
  ShoppingCart,
  ArrowRight,
  Tag,
  Truck,
  ShieldCheck,
  RotateCcw,
  ChevronRight,
} from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

export function Cart() {
  const { cartItems, removeItem, updateQuantity } = useCart();
  const navigate = useNavigate();

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const platformFee = Math.round(subtotal * 0.03);
  const gst = Math.round(subtotal * 0.18);
  const delivery = subtotal > 500 ? 0 : 49;
  const total = subtotal + platformFee + gst + delivery;

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-[#f9fafb]">
        <Header />
        <div className="flex-1 flex items-center justify-center py-20 px-4">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-28 h-28 bg-green-50 rounded-full mb-6">
              <ShoppingCart className="w-14 h-14 text-[#16a34a]" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Your cart is empty
            </h2>
            <p className="text-gray-500 mb-8 max-w-sm mx-auto">
              Browse our fresh farm products and add them to your cart to get
              started.
            </p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 bg-[#16a34a] text-white px-8 py-3 rounded-xl hover:bg-[#15803d] transition-colors font-semibold shadow-md shadow-green-200"
            >
              Browse Products
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f9fafb]">
      <Header />

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-1.5 text-sm text-gray-500">
            <Link to="/" className="hover:text-[#16a34a] transition-colors">
              Home
            </Link>
            <ChevronRight className="w-4 h-4 text-gray-300" />
            <Link
              to="/products"
              className="hover:text-[#16a34a] transition-colors"
            >
              Products
            </Link>
            <ChevronRight className="w-4 h-4 text-gray-300" />
            <span className="text-gray-900 font-medium">Cart</span>
          </div>
        </div>
      </div>

      {/* Checkout Steps */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-2 text-sm max-w-md">
            <div className="flex items-center gap-1.5">
              <span className="w-6 h-6 rounded-full bg-[#16a34a] text-white text-xs flex items-center justify-center font-bold">
                1
              </span>
              <span className="font-semibold text-[#16a34a]">Cart</span>
            </div>
            <div className="flex-1 h-px bg-gray-200" />
            <div className="flex items-center gap-1.5">
              <span className="w-6 h-6 rounded-full bg-gray-200 text-gray-500 text-xs flex items-center justify-center font-bold">
                2
              </span>
              <span className="text-gray-400">Address</span>
            </div>
            <div className="flex-1 h-px bg-gray-200" />
            <div className="flex items-center gap-1.5">
              <span className="w-6 h-6 rounded-full bg-gray-200 text-gray-500 text-xs flex items-center justify-center font-bold">
                3
              </span>
              <span className="text-gray-400">Payment</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <ShoppingCart className="w-6 h-6 text-[#16a34a]" />
          My Cart
          <span className="text-gray-400 text-lg font-normal">
            ({cartItems.length} {cartItems.length === 1 ? "item" : "items"})
          </span>
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left – Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {/* Free delivery banner */}
            {delivery > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center gap-2 text-sm">
                <Truck className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span className="text-amber-700">
                  Add{" "}
                  <strong>₹{(500 - subtotal).toLocaleString()}</strong> more
                  to get <strong>FREE delivery!</strong>
                </span>
              </div>
            )}
            {delivery === 0 && (
              <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 flex items-center gap-2 text-sm">
                <Truck className="w-4 h-4 text-green-600 flex-shrink-0" />
                <span className="text-green-700 font-medium">
                  🎉 You've unlocked FREE delivery!
                </span>
              </div>
            )}

            {cartItems.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex gap-4 hover:shadow-md transition-shadow"
              >
                <div className="w-28 h-28 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                  <ImageWithFallback
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex-1 min-w-0 pr-3">
                      <h3 className="font-bold text-gray-900 text-lg leading-snug">
                        {item.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        by {item.farmer}
                      </p>
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors flex-shrink-0"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2 mb-4">
                    <span className="inline-flex items-center gap-1 bg-green-50 text-[#16a34a] text-xs px-2 py-0.5 rounded-full font-medium">
                      <Tag className="w-3 h-3" />
                      {item.category}
                    </span>
                    <span className="text-xs text-gray-400">
                      ₹{item.price}/{item.unit}
                    </span>
                  </div>

                  <div className="flex items-center justify-between flex-wrap gap-3">
                    {/* Quantity Selector */}
                    <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity - 1)
                        }
                        className="px-3 py-2 bg-gray-50 hover:bg-gray-100 transition-colors text-gray-600 border-r border-gray-200"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="px-5 py-2 font-bold text-gray-900 min-w-[44px] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity + 1)
                        }
                        className="px-3 py-2 bg-gray-50 hover:bg-gray-100 transition-colors text-gray-600 border-l border-gray-200"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="text-right">
                      <div className="text-xl font-bold text-[#16a34a]">
                        ₹{(item.price * item.quantity).toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-400">
                        ₹{item.price} × {item.quantity} {item.unit}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <Link
              to="/products"
              className="inline-flex items-center gap-1.5 text-[#16a34a] font-medium hover:underline text-sm mt-2"
            >
              ← Continue Shopping
            </Link>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4 mt-4">
              {[
                { icon: ShieldCheck, text: "Secure Payments" },
                { icon: Truck, text: "Fresh Delivery" },
                { icon: RotateCcw, text: "Easy Returns" },
              ].map(({ icon: Icon, text }) => (
                <div
                  key={text}
                  className="bg-white rounded-xl border border-gray-100 p-3 flex items-center gap-2 text-xs text-gray-500"
                >
                  <Icon className="w-4 h-4 text-[#16a34a] flex-shrink-0" />
                  {text}
                </div>
              ))}
            </div>
          </div>

          {/* Right – Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
              <h2 className="text-lg font-bold text-gray-900 mb-5 pb-4 border-b border-gray-100">
                Order Summary
              </h2>

              <div className="space-y-3 mb-5">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>
                    Subtotal (
                    {cartItems.reduce((s, i) => s + i.quantity, 0)} items)
                  </span>
                  <span className="font-medium text-gray-900">
                    ₹{subtotal.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    Platform Fee
                    <span className="text-xs bg-gray-100 text-gray-500 px-1 rounded">
                      3%
                    </span>
                  </span>
                  <span className="font-medium text-gray-900">
                    ₹{platformFee}
                  </span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    GST
                    <span className="text-xs bg-gray-100 text-gray-500 px-1 rounded">
                      18%
                    </span>
                  </span>
                  <span className="font-medium text-gray-900">
                    ₹{gst.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Delivery Charges</span>
                  <span
                    className={
                      delivery === 0
                        ? "text-[#16a34a] font-semibold"
                        : "font-medium text-gray-900"
                    }
                  >
                    {delivery === 0 ? "FREE" : `₹${delivery}`}
                  </span>
                </div>
              </div>

              <div className="border-t border-dashed border-gray-200 pt-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-base font-bold text-gray-900">
                    Total Payable
                  </span>
                  <span className="text-2xl font-bold text-[#16a34a]">
                    ₹{total.toLocaleString()}
                  </span>
                </div>
                {delivery === 0 && (
                  <p className="text-xs text-[#16a34a] mt-1 text-right font-medium">
                    You saved ₹49 on delivery!
                  </p>
                )}
              </div>

              <button
                onClick={() => navigate("/checkout/address")}
                className="w-full bg-[#16a34a] hover:bg-[#15803d] text-white py-4 rounded-xl font-bold text-base shadow-lg shadow-green-200/60 transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                Proceed to Buy
                <ArrowRight className="w-5 h-5" />
              </button>

              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-400">
                <ShieldCheck className="w-3.5 h-3.5 text-green-500" />
                <span>100% Secure & Safe Checkout</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
