import { useState, useEffect } from "react";
import { Link } from "react-router";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { CertificatePreview } from "../components/CertificatePreview";
import { UploadCertificate } from "../components/UploadCertificate";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { useAuctions } from "../hooks/useAuctions";
import {
  Gavel,
  TrendingUp,
  Filter,
  Search,
  Users,
  Clock,
  Trophy,
  Zap,
  BadgeCheck,
  MapPin,
  Award,
  FileText,
  Upload,
} from "lucide-react";

interface AuctionItem {
  id: number;
  name: string;
  farmer: string;
  location: string;
  currentBid: number;
  baseBid: number;
  timeLeft: { hours: number; minutes: number; seconds: number };
  image: string;
  category: string;
  totalBidders: number;
  unit: string;
  quantity: number;
  verified: boolean;
  grade?: "A" | "B" | "C";
  hasCertificate?: boolean;
}

const auctionItems: AuctionItem[] = [
  {
    id: 1,
    name: "Alphonso Mango",
    farmer: "Ratnagiri Farms",
    location: "Maharashtra",
    currentBid: 5400,
    baseBid: 4500,
    timeLeft: { hours: 2, minutes: 47, seconds: 33 },
    image:
      "https://images.unsplash.com/photo-1629630092135-8c4aebe98a61?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcmVzaCUyMG1hbmdvJTIwZmFybSUyMGhhcnZlc3QlMjBpbmRpYXxlbnwxfHx8fDE3NzM2MzY0OTl8MA&ixlib=rb-4.1.0&q=80&w=1080",
    category: "Fruits",
    totalBidders: 23,
    unit: "kg",
    quantity: 50,
    verified: true,
    grade: "A",
    hasCertificate: true,
  },
  {
    id: 2,
    name: "Organic Pomegranate",
    farmer: "Desert Rose Farms",
    location: "Rajasthan",
    currentBid: 3200,
    baseBid: 2500,
    timeLeft: { hours: 1, minutes: 15, seconds: 44 },
    image:
      "https://images.unsplash.com/photo-1615411640087-873c938dd259?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb21lZ3JhbmF0ZSUyMGZyZXNoJTIwcmVkJTIwZnJ1aXQlMjBmYXJtJTIwaW5kaWF8ZW58MXx8fHwxNzczNjM2NTIyfDA&ixlib=rb-4.1.0&q=80&w=1080",
    category: "Fruits",
    totalBidders: 15,
    unit: "kg",
    quantity: 30,
    verified: true,
    grade: "A",
    hasCertificate: true,
  },
  {
    id: 3,
    name: "Basmati Rice (50kg)",
    farmer: "Punjab Agro",
    location: "Punjab",
    currentBid: 2800,
    baseBid: 2000,
    timeLeft: { hours: 4, minutes: 30, seconds: 0 },
    image:
      "https://images.unsplash.com/photo-1681472437648-4fb400b2fd68?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcmVzaCUyMGJhc21hdGklMjByaWNlJTIwZmFybSUyMGdyYWluJTIwaGFydmVzdHxlbnwxfHx8fDE3NzM2MzY1MDF8MA&ixlib=rb-4.1.0&q=80&w=1080",
    category: "Grains",
    totalBidders: 31,
    unit: "bag",
    quantity: 1,
    verified: false,
    grade: "B",
    hasCertificate: false,
  },
  {
    id: 4,
    name: "Farm Fresh Spinach",
    farmer: "Harvest Moon Farm",
    location: "Karnataka",
    currentBid: 350,
    baseBid: 200,
    timeLeft: { hours: 0, minutes: 45, seconds: 20 },
    image:
      "https://images.unsplash.com/photo-1726978731245-16206a5d2f3f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncmVlbiUyMHNwaW5hY2glMjBsZWF2ZXMlMjBmYXJtJTIwdmVnZXRhYmxlfGVufDF8fHx8MTc3MzYzNjUwMnww&ixlib=rb-4.1.0&q=80&w=1080",
    category: "Vegetables",
    totalBidders: 8,
    unit: "bundle",
    quantity: 20,
    verified: false,
    grade: "C",
    hasCertificate: false,
  },
  {
    id: 5,
    name: "Red Onions",
    farmer: "Nasik Valley Farms",
    location: "Maharashtra",
    currentBid: 1200,
    baseBid: 800,
    timeLeft: { hours: 3, minutes: 20, seconds: 15 },
    image:
      "https://images.unsplash.com/photo-1760549255949-767d18981890?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvbmlvbiUyMGZhcm0lMjBmcmVzaCUyMGhhcnZlc3QlMjBhZ3JpY3VsdHVyZXxlbnwxfHx8fDE3NzM2MzY1MjJ8MA&ixlib=rb-4.1.0&q=80&w=1080",
    category: "Vegetables",
    totalBidders: 19,
    unit: "kg",
    quantity: 100,
    verified: true,
    grade: "B",
    hasCertificate: true,
  },
  {
    id: 6,
    name: "Premium Wheat Grain",
    farmer: "Golden Fields",
    location: "Madhya Pradesh",
    currentBid: 4500,
    baseBid: 3500,
    timeLeft: { hours: 6, minutes: 0, seconds: 0 },
    image:
      "https://images.unsplash.com/photo-1633766158438-151884dabfc4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aGVhdCUyMGdyYWluJTIwaGFydmVzdCUyMGFncmljdWx0dXJlJTIwaW5kaWF8ZW58MXx8fHwxNzczNjM2NTAyfDA&ixlib=rb-4.1.0&q=80&w=1080",
    category: "Grains",
    totalBidders: 27,
    unit: "quintal",
    quantity: 5,
    verified: true,
    grade: "A",
    hasCertificate: true,
  },
];

// ─────────────────────────────────────────
// Auction Card Component
// ─────────────────────────────────────────
function AuctionCard({ item }: { item: AuctionItem }) {
  const [timeLeft, setTimeLeft] = useState(item.timeLeft);
  const [showCertificate, setShowCertificate] = useState(false);
  const [showUpload, setShowUpload] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        const { hours, minutes, seconds } = prev;
        if (seconds > 0) return { hours, minutes, seconds: seconds - 1 };
        if (minutes > 0) return { hours, minutes: minutes - 1, seconds: 59 };
        if (hours > 0) return { hours: hours - 1, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const pad = (n: number) => String(n).padStart(2, "0");
  const isUrgent = timeLeft.hours === 0 && timeLeft.minutes < 30;
  const percentAboveBase = Math.round(
    ((item.currentBid - item.baseBid) / item.baseBid) * 100
  );

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 group flex flex-col">
      {/* Certificate Modals */}
      <CertificatePreview
        isOpen={showCertificate}
        onClose={() => setShowCertificate(false)}
        productName={item.name}
        grade={item.grade || "A"}
        farmer={item.farmer}
      />
      <UploadCertificate
        isOpen={showUpload}
        onClose={() => setShowUpload(false)}
        productName={item.name}
      />

      {/* Image */}
      <div className="relative overflow-hidden bg-gray-100" style={{ aspectRatio: "4/3" }}>
        <ImageWithFallback
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-1.5">
          <span className="bg-red-600 text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
            LIVE
          </span>
          <span
            className={`text-white text-xs font-bold px-2.5 py-1 rounded-full ${
              item.category === "Fruits"
                ? "bg-orange-500"
                : item.category === "Vegetables"
                ? "bg-green-600"
                : "bg-yellow-600"
            }`}
          >
            {item.category}
          </span>
        </div>

        {/* Timer Overlay */}
        <div
          className={`absolute top-3 right-3 text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 ${
            isUrgent ? "bg-red-600 animate-pulse" : "bg-gray-900/70 backdrop-blur-sm"
          }`}
        >
          <Clock className="w-3 h-3" />
          {pad(timeLeft.hours)}:{pad(timeLeft.minutes)}:{pad(timeLeft.seconds)}
        </div>

        {/* Gradient bottom */}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/40 to-transparent" />
        <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between">
          <span className="text-white text-xs font-medium flex items-center gap-1">
            <Users className="w-3 h-3" />
            {item.totalBidders} bidders
          </span>
          {percentAboveBase > 0 && (
            <span className="text-white text-xs font-medium flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-green-300" />
              +{percentAboveBase}% above base
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0 pr-2">
            <h3 className="font-bold text-gray-900 text-base leading-snug">
              {item.name}
            </h3>
            <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
              <span>{item.farmer}</span>
              {item.verified && (
                <BadgeCheck className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
          <MapPin className="w-3 h-3 text-[#16a34a]" />
          <span>{item.location}</span>
          <span className="mx-1 text-gray-300">·</span>
          <span>
            {item.quantity} {item.unit}
          </span>
        </div>

        {/* Grade & Certificate Section */}
        {item.grade && (
          <div className="mb-3 flex items-center gap-2">
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold text-sm ${
                item.grade === "A"
                  ? "bg-green-100 text-[#16a34a]"
                  : item.grade === "B"
                  ? "bg-blue-100 text-blue-600"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              <Award className="w-4 h-4" />
              Grade {item.grade}
            </div>
            {item.hasCertificate ? (
              <button
                onClick={() => setShowCertificate(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border-2 border-[#16a34a] text-[#16a34a] rounded-lg text-xs font-semibold hover:bg-green-50 transition-colors"
              >
                <FileText className="w-3.5 h-3.5" />
                View Certificate
              </button>
            ) : (
              <button
                onClick={() => setShowUpload(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border-2 border-gray-300 text-gray-600 rounded-lg text-xs font-semibold hover:bg-gray-50 transition-colors"
              >
                <Upload className="w-3.5 h-3.5" />
                Upload
              </button>
            )}
          </div>
        )}

        {/* Certified Quality Badge */}
        {item.hasCertificate && (
          <div className="mb-3 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-lg px-3 py-2 flex items-center gap-2">
            <BadgeCheck className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span className="text-xs font-semibold text-amber-800">Certified Quality Product</span>
          </div>
        )}

        {/* Bid Info */}
        <div className="flex items-center justify-between mb-4 bg-green-50 rounded-xl p-3">
          <div>
            <div className="text-xs text-gray-500 font-medium">
              Current Bid
            </div>
            <div className="text-xl font-bold text-[#16a34a] flex items-center gap-1">
              ₹{item.currentBid.toLocaleString()}
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-500 font-medium">Base Price</div>
            <div className="text-sm font-semibold text-gray-500 line-through">
              ₹{item.baseBid.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Time urgency bar */}
        {isUrgent && (
          <div className="mb-3 bg-red-50 border border-red-200 rounded-lg px-3 py-2 flex items-center gap-1.5 text-xs text-red-600 font-semibold">
            <Zap className="w-3.5 h-3.5" />
            Ending in {pad(timeLeft.minutes)}:{pad(timeLeft.seconds)} — Bid
            now!
          </div>
        )}

        {/* CTA */}
        <Link
          to={`/auctions/live/${item.id}`}
          className="mt-auto w-full flex items-center justify-center gap-2 bg-[#16a34a] hover:bg-[#15803d] text-white py-3 rounded-xl font-bold text-sm transition-all shadow-md shadow-green-200/50 active:scale-95"
        >
          <Gavel className="w-4 h-4" />
          Join Auction
        </Link>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// Auctions Page
// ─────────────────────────────────────────
export function Auctions() {
  const { auctions: auctionItems, loading, error } = useAuctions();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("ending-soon");

  const categories = ["All", "Fruits", "Vegetables", "Grains"];

  const filtered = auctionItems
    .filter((item) => {
      const matchSearch =
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.farmer.toLowerCase().includes(search.toLowerCase()) ||
        item.location.toLowerCase().includes(search.toLowerCase());
      const matchCat = category === "All" || item.category === category;
      return matchSearch && matchCat;
    })
    .sort((a, b) => {
      if (sort === "ending-soon") {
        const aTime =
          a.timeLeft.hours * 3600 +
          a.timeLeft.minutes * 60 +
          a.timeLeft.seconds;
        const bTime =
          b.timeLeft.hours * 3600 +
          b.timeLeft.minutes * 60 +
          b.timeLeft.seconds;
        return aTime - bTime;
      }
      if (sort === "highest-bid") return b.currentBid - a.currentBid;
      if (sort === "most-bidders") return b.totalBidders - a.totalBidders;
      return 0;
    });

  const topBidItem = [...auctionItems].sort(
    (a, b) => b.currentBid - a.currentBid
  )[0];

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#f9fafb]">
        <Header />
        <LoadingSpinner message="Loading auctions..." />
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-[#f9fafb]">
        <Header />
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="text-center bg-white rounded-2xl p-8 shadow-sm border border-gray-100 max-w-md">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Unable to load auctions</h2>
            <p className="text-gray-600 text-sm">{error}</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f9fafb]">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-gray-900 via-green-950 to-green-900 text-white py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-red-600/90 px-4 py-2 rounded-full mb-5 text-sm font-bold">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
              {auctionItems.length} LIVE AUCTIONS NOW
              <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-3">
              Live Farm Auctions
            </h1>
            <p className="text-lg text-gray-300 max-w-xl mx-auto">
              Bid on premium fresh produce directly from verified Indian
              farmers. Best prices, freshest produce.
            </p>
          </div>

          {/* Search */}
          <div className="max-w-xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by product, farmer or location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-2xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#16a34a] shadow-lg"
            />
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-3 gap-4 mt-8 max-w-lg mx-auto">
            {[
              { label: "Live Auctions", value: auctionItems.length },
              {
                label: "Active Bidders",
                value: auctionItems.reduce((s, i) => s + i.totalBidders, 0),
              },
              { label: "Verified Farmers", value: auctionItems.filter(i => i.verified).length },
            ].map(({ label, value }) => (
              <div key={label} className="text-center">
                <div className="text-2xl font-bold text-[#facc15]">{value}</div>
                <div className="text-xs text-gray-400 mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Banner */}
      {topBidItem && (
        <div className="bg-gradient-to-r from-[#16a34a] to-[#15803d] text-white py-3">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-3 justify-center flex-wrap text-sm">
            <Trophy className="w-4 h-4 text-[#facc15]" />
            <span>
              <strong>Top Auction:</strong> {topBidItem.name} by{" "}
              {topBidItem.farmer} — Current bid{" "}
              <strong>₹{topBidItem.currentBid.toLocaleString()}</strong>
            </span>
            <Link
              to={`/auctions/live/${topBidItem.id}`}
              className="bg-white text-[#16a34a] px-3 py-1 rounded-full text-xs font-bold hover:bg-green-50 transition-colors"
            >
              Bid Now →
            </Link>
          </div>
        </div>
      )}

      {/* Main Content */}
      <section className="flex-1 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Filters */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              <Filter className="w-4 h-4 text-gray-400" />
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                    category === cat
                      ? "bg-[#16a34a] text-white shadow-sm"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <label className="text-sm text-gray-500">Sort:</label>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#16a34a]"
              >
                <option value="ending-soon">Ending Soon</option>
                <option value="highest-bid">Highest Bid</option>
                <option value="most-bidders">Most Bidders</option>
              </select>
              <span className="text-sm text-gray-400">
                {filtered.length}{" "}
                {filtered.length === 1 ? "auction" : "auctions"}
              </span>
            </div>
          </div>

          {/* Grid */}
          {filtered.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((item) => (
                <AuctionCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-16 text-center border border-gray-100">
              <Gavel className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                No auctions found
              </h3>
              <p className="text-gray-500">
                Try adjusting your search or filters.
              </p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}