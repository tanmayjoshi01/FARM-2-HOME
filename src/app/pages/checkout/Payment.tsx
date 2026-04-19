import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Header } from "../../components/Header";
import { Footer } from "../../components/Footer";
import { useCart } from "../../context/CartContext";
import { toast } from "sonner";
import {
  CreditCard,
  Smartphone,
  Building2,
  Wallet,
  Lock,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

const paymentMethods = [
  {
    id: "upi",
    label: "UPI",
    description: "Pay via UPI ID or QR code — Google Pay, PhonePe, Paytm",
    emoji: "📱",
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    Icon: Smartphone,
  },
  {
    id: "debit",
    label: "Debit Card",
    description: "Visa, Mastercard, RuPay debit cards",
    emoji: "💳",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    Icon: CreditCard,
  },
  {
    id: "credit",
    label: "Credit Card",
    description: "All major credit cards accepted",
    emoji: "💳",
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    Icon: CreditCard,
  },
  {
    id: "netbanking",
    label: "Net Banking",
    description: "All major Indian banks supported",
    emoji: "����",
    color: "text-green-600",
    bgColor: "bg-green-50",
    Icon: Building2,
  },
  {
    id: "wallet",
    label: "Mobile Wallet",
    description: "Paytm, Amazon Pay, Mobikwik",
    emoji: "👛",
    color: "text-pink-600",
    bgColor: "bg-pink-50",
    Icon: Wallet,
  },
];

const popularBanks = ["SBI", "HDFC", "ICICI", "Axis", "Kotak", "PNB"];

export function Payment() {
  const [selected, setSelected] = useState("upi");
  const [upiId, setUpiId] = useState("");
  const [processing, setProcessing] = useState(false);
  const navigate = useNavigate();
  const { cartItems, checkout } = useCart();

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const platformFee = Math.round(subtotal * 0.03);
  const gst = Math.round(subtotal * 0.18);
  const delivery = subtotal > 500 ? 0 : 49;
  const total = subtotal + platformFee + gst + delivery;

  const handlePayment = async () => {
    if (!selected) {
      toast.error('Please select a payment method');
      return;
    }

    setProcessing(true);

    try {
      const selectedAddress = JSON.parse(localStorage.getItem('selectedAddress') || '{}');

      if (!cartItems.length || !selectedAddress.id) {
        toast.error('Cart or address not found');
        return;
      }

      const result = await checkout(String(selectedAddress.id));

      if (!result.success || !result.orderId) {
        throw new Error('Order creation failed');
      }

      localStorage.setItem('lastOrderId', result.orderId);
      localStorage.setItem('trackingNumber', String(result.orderId).slice(0, 8).toUpperCase());
      toast.success('Payment successful! Order placed.');
      navigate('/checkout/success');
    } catch (error) {
      console.error('Payment failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Payment failed. Please try again.';
      toast.error(errorMessage);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f9fafb]">
      <Header />

      {/* Checkout Steps */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-2 text-sm max-w-md">
            <div className="flex items-center gap-1.5">
              <span className="w-6 h-6 rounded-full bg-green-100 text-[#16a34a] text-xs flex items-center justify-center font-bold">
                ✓
              </span>
              <Link to="/cart" className="text-gray-400 hover:text-gray-600">
                Cart
              </Link>
            </div>
            <div className="flex-1 h-px bg-[#16a34a]" />
            <div className="flex items-center gap-1.5">
              <span className="w-6 h-6 rounded-full bg-green-100 text-[#16a34a] text-xs flex items-center justify-center font-bold">
                ✓
              </span>
              <Link
                to="/checkout/address"
                className="text-gray-400 hover:text-gray-600"
              >
                Address
              </Link>
            </div>
            <div className="flex-1 h-px bg-[#16a34a]" />
            <div className="flex items-center gap-1.5">
              <span className="w-6 h-6 rounded-full bg-[#16a34a] text-white text-xs flex items-center justify-center font-bold">
                3
              </span>
              <span className="font-semibold text-[#16a34a]">Payment</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Lock className="w-6 h-6 text-[#16a34a]" />
          Secure Payment
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left – Payment Methods */}
          <div className="lg:col-span-2 space-y-3">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Select Payment Method
            </p>

            {paymentMethods.map((method) => (
              <div
                key={method.id}
                onClick={() => setSelected(method.id)}
                className={`bg-white rounded-2xl border-2 p-5 cursor-pointer transition-all ${
                  selected === method.id
                    ? "border-[#16a34a] shadow-md shadow-green-100"
                    : "border-gray-100 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center gap-4">
                  {/* Radio */}
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                      selected === method.id
                        ? "border-[#16a34a] bg-[#16a34a]"
                        : "border-gray-300"
                    }`}
                  >
                    {selected === method.id && (
                      <div className="w-2 h-2 bg-white rounded-full" />
                    )}
                  </div>

                  {/* Icon */}
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${method.bgColor}`}
                  >
                    <method.Icon className={`w-5 h-5 ${method.color}`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-gray-900">{method.label}</div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {method.description}
                    </div>
                  </div>

                  {selected === method.id && (
                    <CheckCircle2 className="w-5 h-5 text-[#16a34a] flex-shrink-0" />
                  )}
                </div>

                {/* UPI Input */}
                {selected === "upi" && method.id === "upi" && (
                  <div className="mt-4 pl-9">
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                      Enter UPI ID
                    </label>
                    <input
                      type="text"
                      placeholder="yourname@upi"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#16a34a] text-sm"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className="flex gap-2 mt-2 flex-wrap">
                      {["@okaxis", "@oksbi", "@ybl", "@paytm"].map((suffix) => (
                        <button
                          key={suffix}
                          onClick={(e) => {
                            e.stopPropagation();
                            setUpiId((prev) => {
                              const base = prev.includes("@")
                                ? prev.split("@")[0]
                                : prev;
                              return base + suffix;
                            });
                          }}
                          className="text-xs border border-gray-200 rounded-full px-2.5 py-1 text-gray-600 hover:border-[#16a34a] hover:text-[#16a34a] transition-colors"
                        >
                          {suffix}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Card Inputs */}
                {(selected === "debit" || selected === "credit") &&
                  method.id === selected && (
                    <div
                      className="mt-4 pl-9 space-y-3"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                          Card Number
                        </label>
                        <input
                          type="text"
                          placeholder="1234 5678 9012 3456"
                          maxLength={19}
                          className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#16a34a] text-sm"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                            Expiry Date
                          </label>
                          <input
                            type="text"
                            placeholder="MM / YY"
                            maxLength={7}
                            className="border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#16a34a] text-sm w-full"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                            CVV
                          </label>
                          <input
                            type="password"
                            placeholder="• • •"
                            maxLength={4}
                            className="border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#16a34a] text-sm w-full"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                          Cardholder Name
                        </label>
                        <input
                          type="text"
                          placeholder="Name as on card"
                          className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#16a34a] text-sm"
                        />
                      </div>
                    </div>
                  )}

                {/* Net Banking */}
                {selected === "netbanking" && method.id === "netbanking" && (
                  <div
                    className="mt-4 pl-9"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <label className="block text-xs font-semibold text-gray-500 mb-2">
                      Popular Banks
                    </label>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-3">
                      {popularBanks.map((bank) => (
                        <button
                          key={bank}
                          className="border border-gray-200 rounded-lg py-2 text-xs font-medium text-gray-700 hover:border-[#16a34a] hover:text-[#16a34a] transition-colors"
                        >
                          {bank}
                        </button>
                      ))}
                    </div>
                    <select className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#16a34a] text-sm text-gray-700">
                      <option>Select your bank</option>
                      {popularBanks.map((b) => (
                        <option key={b}>{b} Bank</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            ))}

            <div className="flex items-center gap-2 text-sm text-gray-400 pt-2">
              <ShieldCheck className="w-4 h-4 text-green-500" />
              <span>
                Your payment information is 256-bit SSL encrypted and fully
                secure.
              </span>
            </div>
          </div>

          {/* Right – Order Summary */}
          <div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
              <h2 className="text-base font-bold text-gray-900 mb-4 pb-3 border-b border-gray-100">
                Order Summary
              </h2>

              {/* Cart items mini-list */}
              {cartItems.slice(0, 2).map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center mb-2 text-sm"
                >
                  <span className="text-gray-600 truncate pr-2">
                    {item.name} × {item.quantity}
                  </span>
                  <span className="font-medium text-gray-900 flex-shrink-0">
                    ₹{(item.price * item.quantity).toLocaleString()}
                  </span>
                </div>
              ))}
              {cartItems.length > 2 && (
                <p className="text-xs text-gray-400 mb-3">
                  +{cartItems.length - 2} more item
                  {cartItems.length - 2 > 1 ? "s" : ""}
                </p>
              )}

              <div className="border-t border-gray-100 pt-3 space-y-2 mb-4 mt-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-medium text-gray-900">
                    ₹{subtotal.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Platform Fee (3%)</span>
                  <span className="font-medium text-gray-900">
                    ₹{platformFee}
                  </span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>GST (18%)</span>
                  <span className="font-medium text-gray-900">
                    ₹{gst.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Delivery</span>
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

              <div className="border-t border-dashed border-gray-200 pt-3 mb-5">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-gray-900">Total</span>
                  <span className="text-xl font-bold text-[#16a34a]">
                    ₹{total.toLocaleString()}
                  </span>
                </div>
              </div>

              <button
                onClick={handlePayment}
                disabled={processing}
                className="w-full bg-[#16a34a] hover:bg-[#15803d] disabled:bg-gray-400 text-white py-4 rounded-xl font-bold text-base shadow-lg shadow-green-200/60 transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                {processing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Lock className="w-5 h-5" />
                    Pay ₹{total.toLocaleString()}
                  </>
                )}
              </button>

              <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-gray-400">
                <ShieldCheck className="w-3.5 h-3.5 text-green-500" />
                <span>Secured by RazorPay</span>
                <ChevronRight className="w-3 h-3" />
                <span>SSL Encrypted</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
