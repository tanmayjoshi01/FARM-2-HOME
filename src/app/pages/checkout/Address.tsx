import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { Header } from "../../components/Header";
import { Footer } from "../../components/Footer";
import { supabase } from "../../../lib/supabase";
import { useAuth } from "../../context/AuthContext";
import { toast } from "sonner";
import {
  MapPin,
  Plus,
  ChevronRight,
  Phone,
  Home,
  Building,
  ShieldCheck,
} from "lucide-react";

interface SavedAddress {
  id: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pin: string;
  tag: string;
  is_default?: boolean;
}

const INDIAN_STATES = [
  "Andhra Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
];

export function Address() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [savingAddress, setSavingAddress] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pin: "",
    tag: "Home",
  });

  useEffect(() => {
    const fetchAddresses = async () => {
      if (!user?.id) {
        setSavedAddresses([]);
        setSelected(null);
        setLoadingAddresses(false);
        return;
      }

      try {
        setLoadingAddresses(true);
        const { data, error } = await supabase
          .from("addresses")
          .select("id, name, phone, address_line, city, state, pincode, tag, is_default")
          .eq("user_id", user.id);

        if (error) throw error;

        const mapped: SavedAddress[] = (data || []).map((addr: any) => ({
          id: String(addr.id),
          name: addr.name || "",
          phone: addr.phone || "",
          address: addr.address_line || "",
          city: addr.city || "",
          state: addr.state || "",
          pin: String(addr.pincode || ""),
          tag: addr.tag || "Home",
          is_default: !!addr.is_default,
        }));

        setSavedAddresses(mapped);

        if (mapped.length) {
          const defaultAddr = mapped.find((addr) => addr.is_default) || mapped[0];
          setSelected(defaultAddr.id);
        } else {
          setSelected(null);
        }
      } catch (error: any) {
        toast.error(error?.message || "Failed to load saved addresses");
      } finally {
        setLoadingAddresses(false);
      }
    };

    void fetchAddresses();
  }, [user?.id]);

  const selectedAddr = savedAddresses.find((a) => a.id === selected);

  const handleSaveAddress = async () => {
    if (!user?.id) {
      toast.error("Please log in again");
      return;
    }

    if (!form.name || !form.phone || !form.address || !form.city || !form.state || !form.pin) {
      toast.error("Please fill all required fields");
      return;
    }

    if (!/^\d{10}$/.test(form.phone)) {
      toast.error("Please enter a valid 10-digit phone number");
      return;
    }

    if (!/^\d{6}$/.test(form.pin)) {
      toast.error("Please enter a valid 6-digit PIN code");
      return;
    }

    try {
      setSavingAddress(true);

      const { data, error } = await supabase
        .from("addresses")
        .insert({
          user_id: user.id,
          name: form.name,
          phone: form.phone,
          address_line: form.address,
          city: form.city,
          state: form.state,
          pincode: form.pin,
          tag: form.tag,
          is_default: savedAddresses.length === 0,
        })
        .select("id, name, phone, address_line, city, state, pincode, tag, is_default")
        .single();

      if (error) throw error;

      const newAddress: SavedAddress = {
        id: String(data.id),
        name: data.name || "",
        phone: data.phone || "",
        address: data.address_line || "",
        city: data.city || "",
        state: data.state || "",
        pin: String(data.pincode || ""),
        tag: data.tag || "Home",
        is_default: !!data.is_default,
      };

      setSavedAddresses((prev) => [newAddress, ...prev]);
      setSelected(newAddress.id);
      localStorage.setItem("selectedAddress", JSON.stringify(newAddress));
      setShowForm(false);
      setForm({
        name: "",
        phone: "",
        address: "",
        city: "",
        state: "",
        pin: "",
        tag: "Home",
      });
      toast.success("Address saved");
    } catch (error: any) {
      toast.error(error?.message || "Failed to save address");
    } finally {
      setSavingAddress(false);
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
              <span className="w-6 h-6 rounded-full bg-[#16a34a] text-white text-xs flex items-center justify-center font-bold">
                2
              </span>
              <span className="font-semibold text-[#16a34a]">Address</span>
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

      <div className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <MapPin className="w-6 h-6 text-[#16a34a]" />
          Delivery Address
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left – Address Section */}
          <div className="lg:col-span-2 space-y-4">
            {!showForm && (
              <>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Saved Addresses
                </p>

                {loadingAddresses && (
                  <div className="bg-white rounded-2xl border border-gray-100 p-5 text-sm text-gray-500">
                    Loading saved addresses...
                  </div>
                )}

                {!loadingAddresses && savedAddresses.map((addr) => (
                  <div
                    key={addr.id}
                    onClick={() => setSelected(addr.id)}
                    className={`bg-white rounded-2xl border-2 p-5 cursor-pointer transition-all ${
                      selected === addr.id
                        ? "border-[#16a34a] shadow-md shadow-green-100"
                        : "border-gray-100 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                          selected === addr.id
                            ? "border-[#16a34a] bg-[#16a34a]"
                            : "border-gray-300"
                        }`}
                      >
                        {selected === addr.id && (
                          <div className="w-2 h-2 bg-white rounded-full" />
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="font-bold text-gray-900">
                            {addr.name}
                          </span>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                              addr.tag === "Home"
                                ? "bg-blue-50 text-blue-600"
                                : "bg-purple-50 text-purple-600"
                            }`}
                          >
                            {addr.tag === "Home" ? (
                              <span className="flex items-center gap-1">
                                <Home className="w-3 h-3" /> {addr.tag}
                              </span>
                            ) : (
                              <span className="flex items-center gap-1">
                                <Building className="w-3 h-3" /> {addr.tag}
                              </span>
                            )}
                          </span>
                          <span className="text-sm text-gray-500 flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {addr.phone}
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm leading-relaxed">
                          {addr.address}, {addr.city}, {addr.state} –{" "}
                          {addr.pin}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}

                {!loadingAddresses && savedAddresses.length === 0 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-700">
                    You do not have any saved address yet. Add one to continue.
                  </div>
                )}

                <button
                  onClick={() => setShowForm(true)}
                  className="w-full flex items-center gap-2 justify-center border-2 border-dashed border-gray-300 text-gray-500 hover:border-[#16a34a] hover:text-[#16a34a] py-4 rounded-2xl transition-colors font-medium"
                >
                  <Plus className="w-5 h-5" />
                  Add New Address
                </button>
              </>
            )}

            {/* New Address Form */}
            {showForm && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
                  <Plus className="w-5 h-5 text-[#16a34a]" />
                  Add New Address
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Enter your full name"
                      value={form.name}
                      onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                      }
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#16a34a] focus:border-transparent text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Mobile Number <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium">
                        +91
                      </span>
                      <input
                        type="tel"
                        placeholder="10-digit mobile number"
                        value={form.phone}
                        onChange={(e) =>
                          setForm({ ...form, phone: e.target.value })
                        }
                        className="w-full border border-gray-200 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#16a34a] focus:border-transparent text-sm"
                      />
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      House / Street Address{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Flat no., house no., building, street, area"
                      value={form.address}
                      onChange={(e) =>
                        setForm({ ...form, address: e.target.value })
                      }
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#16a34a] focus:border-transparent text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      City <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="City"
                      value={form.city}
                      onChange={(e) =>
                        setForm({ ...form, city: e.target.value })
                      }
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#16a34a] focus:border-transparent text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      State <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={form.state}
                      onChange={(e) =>
                        setForm({ ...form, state: e.target.value })
                      }
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#16a34a] focus:border-transparent text-sm text-gray-700"
                    >
                      <option value="">Select State</option>
                      {INDIAN_STATES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      PIN Code <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="6-digit PIN code"
                      maxLength={6}
                      value={form.pin}
                      onChange={(e) =>
                        setForm({ ...form, pin: e.target.value })
                      }
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#16a34a] focus:border-transparent text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Address Type
                    </label>
                    <div className="flex gap-2">
                      {["Home", "Office"].map((t) => (
                        <button
                          type="button"
                          key={t}
                          onClick={() => setForm({ ...form, tag: t })}
                          className={`flex-1 py-3 rounded-xl text-sm font-medium border-2 transition-colors ${
                            form.tag === t
                              ? "border-[#16a34a] bg-green-50 text-[#16a34a]"
                              : "border-gray-200 text-gray-600 hover:border-gray-300"
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setShowForm(false)}
                    className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-xl hover:bg-gray-50 transition-colors font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      void handleSaveAddress();
                    }}
                    disabled={savingAddress}
                    className="flex-1 bg-[#16a34a] text-white py-3 rounded-xl hover:bg-[#15803d] transition-colors font-semibold shadow-md shadow-green-200"
                  >
                    {savingAddress ? "Saving..." : "Save Address"}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right – Summary */}
          <div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
              <h2 className="text-base font-bold text-gray-900 mb-4 pb-3 border-b border-gray-100">
                Delivering to
              </h2>

              {selectedAddr ? (
                <div className="text-sm text-gray-600 mb-5 space-y-1">
                  <p className="font-bold text-gray-900 text-base">
                    {selectedAddr.name}
                  </p>
                  <p className="flex items-center gap-1 text-gray-500">
                    <Phone className="w-3.5 h-3.5" />
                    {selectedAddr.phone}
                  </p>
                  <p className="text-gray-600 leading-relaxed">
                    {selectedAddr.address}
                  </p>
                  <p className="text-gray-600">
                    {selectedAddr.city}, {selectedAddr.state}
                  </p>
                  <p className="font-semibold text-gray-700">
                    PIN – {selectedAddr.pin}
                  </p>
                </div>
              ) : (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-5 text-sm text-amber-700">
                  Please select or add a delivery address to continue.
                </div>
              )}

              <button
                onClick={async () => {
                  if (selectedAddr) {
                    localStorage.setItem("selectedAddress", JSON.stringify(selectedAddr));
                    navigate("/checkout/payment");
                  }
                }}
                disabled={!selected}
                className="w-full bg-[#16a34a] hover:bg-[#15803d] disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold text-base shadow-md shadow-green-200 transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                Continue to Payment
                <ChevronRight className="w-5 h-5" />
              </button>

              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-400">
                <ShieldCheck className="w-3.5 h-3.5 text-green-500" />
                <span>Your address is stored securely</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
