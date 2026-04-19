import { useEffect, useMemo, useState } from "react";
import { DashboardSidebar } from "../../components/DashboardSidebar";
import { ImageWithFallback } from "../../components/figma/ImageWithFallback";
import { Gavel, Clock, Play, Pause, StopCircle, Users } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { supabase } from "../../../lib/supabase";

export function AdminAuctionManagement() {
  const [selectedProduct, setSelectedProduct] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("");
  const [products, setProducts] = useState<any[]>([]);
  const [activeAuctions, setActiveAuctions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const selectedProductData = useMemo(
    () => products.find((product) => String(product.id) === selectedProduct),
    [products, selectedProduct]
  );

  const loadAuctionManagementData = async () => {
    try {
      setLoading(true);

      const { data: auctionRows, error: auctionError } = await supabase
        .from("auctions")
        .select(`
          id,
          product_id,
          base_price,
          current_bid,
          total_bids,
          starts_at,
          ends_at,
          status,
          product:products(
            id,
            name,
            image_url,
            farmer_id,
            users!products_farmer_id_fkey(full_name)
          )
        `)
        .in("status", ["scheduled", "live"])
        .order("ends_at", { ascending: true });

      if (auctionError) throw auctionError;

      const activeProductIds = new Set((auctionRows || []).map((a: any) => a.product_id));

      const { data: approvedProducts, error: productsError } = await supabase
        .from("products")
        .select(`
          id,
          name,
          price_per_unit,
          quantity,
          unit,
          image_url,
          farmer_id,
          users!products_farmer_id_fkey(full_name)
        `)
        .eq("status", "approved")
        .order("created_at", { ascending: false });

      if (productsError) throw productsError;

      setProducts((approvedProducts || []).filter((product: any) => !activeProductIds.has(product.id)));
      setActiveAuctions(auctionRows || []);
    } catch (error: any) {
      console.error("Failed to load auction management data:", error);
      toast.error(error?.message || "Failed to load auction data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAuctionManagementData();
  }, []);

  const handleStartAuction = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedProductData) {
      toast.error("Please select a product");
      return;
    }

    if (!startDate || !startTime || !endDate || !endTime) {
      toast.error("Please provide valid start and end date/time");
      return;
    }

    const startsAt = new Date(`${startDate}T${startTime}`);
    const endsAt = new Date(`${endDate}T${endTime}`);

    if (Number.isNaN(startsAt.getTime()) || Number.isNaN(endsAt.getTime()) || endsAt <= startsAt) {
      toast.error("End time must be later than start time");
      return;
    }

    const resolvedBasePrice = Number(basePrice || selectedProductData.price_per_unit || 0);
    if (resolvedBasePrice <= 0) {
      toast.error("Base price must be greater than zero");
      return;
    }

    try {
      setSubmitting(true);

      const status = startsAt <= new Date() ? "live" : "scheduled";

      const { error } = await supabase.from("auctions").insert({
        product_id: selectedProductData.id,
        farmer_id: selectedProductData.farmer_id,
        base_price: resolvedBasePrice,
        current_bid: 0,
        quantity: Number(selectedProductData.quantity || 1),
        unit: selectedProductData.unit || "kg",
        starts_at: startsAt.toISOString(),
        ends_at: endsAt.toISOString(),
        status,
      });

      if (error) throw error;

      toast.success(`Auction ${status === "live" ? "started" : "scheduled"} successfully`);
      setSelectedProduct("");
      setBasePrice("");
      setStartDate("");
      setStartTime("");
      setEndDate("");
      setEndTime("");
      await loadAuctionManagementData();
    } catch (error: any) {
      console.error("Failed to start auction:", error);
      const message = String(error?.message || "").toLowerCase();
      const isRlsError =
        error?.code === "42501" ||
        message.includes("row-level security") ||
        message.includes("violates row-level security policy");

      if (isRlsError) {
        toast.error("Permission denied by auctions RLS policy. Run supabase/fix_auctions_rls.sql in Supabase SQL Editor.");
      } else {
        toast.error(error?.message || "Failed to start auction");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleEndAuction = async (auctionId: string) => {
    try {
      const { error } = await supabase
        .from("auctions")
        .update({ status: "closed", closed_at: new Date().toISOString() })
        .eq("id", auctionId);

      if (error) throw error;
      toast.success("Auction ended");
      await loadAuctionManagementData();
    } catch (error: any) {
      toast.error(error?.message || "Failed to end auction");
    }
  };

  const formatTimeRemaining = (endsAt: string) => {
    const diff = new Date(endsAt).getTime() - Date.now();
    if (diff <= 0) return "Ending soon";
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#f9fafb]">
        <DashboardSidebar type="admin" />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#f9fafb]">
      <DashboardSidebar type="admin" />
      
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Auction Management</h1>
          <p className="text-gray-600 mt-1">Create and manage live auctions</p>
        </div>

        {/* Main Content */}
        <div className="p-8">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Create Auction Form */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
              >
                <h2 className="font-bold text-gray-900 text-lg mb-6">Create New Auction</h2>
                <form onSubmit={handleStartAuction} className="space-y-6">
                  {/* Product Selection */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Select Product *
                    </label>
                    <div className="grid gap-3">
                      {products.map((product) => (
                        <label
                          key={product.id}
                          className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                            selectedProduct === product.id.toString()
                              ? "border-[#16a34a] bg-green-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <input
                            type="radio"
                            name="product"
                            value={product.id}
                            checked={selectedProduct === product.id.toString()}
                            onChange={(e) => setSelectedProduct(e.target.value)}
                            className="w-5 h-5 text-[#16a34a] focus:ring-[#16a34a]"
                          />
                          <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                            <ImageWithFallback
                                src={product.image_url || "https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=200"}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900">{product.name}</p>
                            <p className="text-xs text-gray-500">by {product.users?.full_name || "Farmer"}</p>
                          </div>
                          <p className="font-semibold text-gray-700">₹{Number(product.price_per_unit || 0)}/{product.unit}</p>
                        </label>
                      ))}
                    </div>
                    {products.length === 0 && (
                      <p className="text-sm text-gray-500 mt-3">No approved products available for new auctions.</p>
                    )}
                  </div>

                  {/* Base Price */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Base Price (₹) *
                    </label>
                    <input
                      type="number"
                      placeholder="Enter starting price"
                      value={basePrice}
                      onChange={(e) => setBasePrice(e.target.value)}
                      required
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#16a34a] focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-2">Minimum bid amount for this auction</p>
                  </div>

                  {/* Start Date & Time */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Start Date *
                      </label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        required
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#16a34a] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Start Time *
                      </label>
                      <input
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        required
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#16a34a] focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* End Date & Time */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        End Date *
                      </label>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        required
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#16a34a] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        End Time *
                      </label>
                      <input
                        type="time"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        required
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#16a34a] focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Duration Info */}
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <p className="text-sm text-blue-900">
                      <strong>Note:</strong> Once started, the auction cannot be modified. Ensure all details are correct before proceeding.
                    </p>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={submitting || products.length === 0}
                    className="w-full py-4 bg-[#16a34a] text-white rounded-xl font-bold text-lg hover:bg-[#15803d] transition-colors shadow-lg shadow-green-200 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <Play className="w-5 h-5" />
                    {submitting ? "Starting..." : "Start Auction"}
                  </button>
                </form>
              </motion.div>
            </div>

            {/* Active Auctions */}
            <div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden sticky top-8"
              >
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                  <h2 className="font-bold text-gray-900 text-lg">Active Auctions</h2>
                  <span className="flex items-center gap-1 text-xs text-red-600 font-semibold">
                    <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
                    LIVE
                  </span>
                </div>
                <div className="p-4 space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto">
                  {activeAuctions.map((auction) => (
                    <div key={auction.id} className="border border-gray-200 rounded-xl p-4 hover:border-[#16a34a] transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900 text-sm mb-0.5">{auction.product?.name || "Auction Product"}</p>
                          <p className="text-xs text-gray-500">by {auction.product?.users?.full_name || "Farmer"}</p>
                        </div>
                        <span className="bg-red-100 text-red-700 px-2 py-1 rounded-lg text-xs font-bold">
                          {String(auction.status || "scheduled").toUpperCase()}
                        </span>
                      </div>

                      <div className="space-y-2 mb-3">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500">Base Price:</span>
                          <span className="font-semibold text-gray-700">₹{Number(auction.base_price || 0).toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500">Current Bid:</span>
                          <span className="font-bold text-[#16a34a]">₹{Number(auction.current_bid || auction.base_price || 0).toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500 flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            Bidders:
                          </span>
                          <span className="font-semibold text-gray-700">{Number(auction.total_bids || 0)}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Ends in:
                          </span>
                          <span className="font-bold text-red-600">{formatTimeRemaining(auction.ends_at)}</span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          disabled
                          className="flex-1 py-2 bg-gray-200 text-gray-500 rounded-lg text-xs font-semibold cursor-not-allowed flex items-center justify-center gap-1"
                        >
                          <Pause className="w-3 h-3" />
                          Pause
                        </button>
                        <button
                          onClick={() => handleEndAuction(auction.id)}
                          className="flex-1 py-2 bg-red-500 text-white rounded-lg text-xs font-semibold hover:bg-red-600 transition-colors flex items-center justify-center gap-1"
                        >
                          <StopCircle className="w-3 h-3" />
                          End
                        </button>
                      </div>
                    </div>
                  ))}
                  {activeAuctions.length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-6">No live or scheduled auctions yet.</p>
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
