import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { useAuctions } from '../hooks/useAuctions';
import { useAuth } from '../context/AuthContext';
import { Gavel, Clock, TrendingUp, MapPin, AlertCircle, Trophy, ChevronRight, ArrowUp } from 'lucide-react';

export function LiveAuction() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getAuction, placeBid, subscribeToAuction } = useAuctions();

  const [auction, setAuction] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [bidAmount, setBidAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    if (!id) return;

    const loadAuction = async () => {
      try {
        const data = await getAuction(id);
        setAuction(data);
        const basePrice = Number(data.base_price ?? 0);
        const rawCurrentBid = Number(data.current_bid ?? data.current_price ?? 0);
        const currentPrice = rawCurrentBid > 0 ? rawCurrentBid : basePrice;
        const increment = Number(data.min_bid_increment ?? 100);
        setBidAmount(String(currentPrice + increment));
      } catch (err: any) {
        console.error('Error loading auction:', err);
        setError(err.message || 'Failed to load auction');
      } finally {
        setLoading(false);
      }
    };

    loadAuction();

    const unsubscribe = subscribeToAuction(id, (updatedAuction) => {
      setAuction(updatedAuction);
      const basePrice = Number(updatedAuction.base_price ?? 0);
      const rawCurrentBid = Number(updatedAuction.current_bid ?? updatedAuction.current_price ?? 0);
      const currentPrice = rawCurrentBid > 0 ? rawCurrentBid : basePrice;
      const increment = Number(updatedAuction.min_bid_increment ?? 100);
      setBidAmount(String(currentPrice + increment));
    });

    return unsubscribe;
  }, [id]);

  useEffect(() => {
    if (!auction?.end_time && !auction?.ends_at) return;

    const timer = setInterval(() => {
      const endAt = new Date(auction.end_time || auction.ends_at).getTime();
      const diff = endAt - Date.now();

      if (diff <= 0) {
        setTimeLeft('Auction Ended');
        clearInterval(timer);
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
    }, 1000);

    return () => clearInterval(timer);
  }, [auction]);

  const basePrice = Number(auction?.base_price ?? 0);
  const rawCurrentBid = Number(auction?.current_bid ?? auction?.current_price ?? 0);
  const currentPrice = rawCurrentBid > 0 ? rawCurrentBid : basePrice;
  const minBid = currentPrice + Number(auction?.min_bid_increment ?? 100);
  const sortedBids = useMemo(() => [...(auction?.bids || [])].sort((a, b) => Number(b.bid_amount || b.amount || 0) - Number(a.bid_amount || a.amount || 0)), [auction]);

  const handlePlaceBid = async () => {
    const amount = Number(bidAmount);

    if (!user) {
      navigate('/login');
      return;
    }

    if (!bidAmount || Number.isNaN(amount) || amount < minBid) {
      setError(`Minimum bid is ₹${minBid.toLocaleString()}`);
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await placeBid(String(id), amount);
      const refreshed = await getAuction(String(id));
      setAuction(refreshed);
      setBidAmount(String(amount + Number(refreshed.min_bid_increment ?? 100)));
    } catch (err: any) {
      console.error('Error placing bid:', err);
      setError(err.message || 'Failed to place bid');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex flex-col bg-[#f9fafb]"><Header /><LoadingSpinner message="Loading live auction..." /><Footer /></div>;
  }

  if (error && !auction) {
    return (
      <div className="min-h-screen flex flex-col bg-[#f9fafb]">
        <Header />
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm max-w-md text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
            <h1 className="text-xl font-bold text-gray-900 mb-2">Auction unavailable</h1>
            <p className="text-sm text-gray-600 mb-4">{error}</p>
            <Link to="/auctions" className="inline-flex items-center gap-2 px-4 py-2 bg-[#16a34a] text-white rounded-xl font-semibold">Back to Auctions</Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const product = auction?.product || {};
  const farmer = product?.users || auction?.farmer || {};
  const isEnded = timeLeft === 'Auction Ended';

  return (
    <div className="min-h-screen flex flex-col bg-[#f9fafb]">
      <Header />
      <div className="bg-red-600 text-white py-2 text-center text-sm font-semibold">
        <span className="inline-flex items-center gap-2"><span className="w-2 h-2 bg-white rounded-full animate-pulse" />LIVE AUCTION · {sortedBids.length} Bids · {timeLeft || 'Counting down'}<span className="w-2 h-2 bg-white rounded-full animate-pulse" /></span>
      </div>
      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full">
        <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-6"><Link to="/" className="hover:text-[#16a34a] transition-colors">Home</Link><ChevronRight className="w-4 h-4 text-gray-300" /><Link to="/auctions" className="hover:text-[#16a34a] transition-colors">Auctions</Link><ChevronRight className="w-4 h-4 text-gray-300" /><span className="text-gray-900 font-medium">Live Auction</span></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-4">
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100"><div className="aspect-square relative"><ImageWithFallback src={product.image_url || product.image || 'https://images.unsplash.com/photo-1629630092135-8c4aebe98a61?w=1080'} alt={product.name || 'Auction item'} className="w-full h-full object-cover" /><div className="absolute top-3 left-3 bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />LIVE</div></div></div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5"><div className="mb-4"><h1 className="text-xl font-bold text-gray-900 mb-1">{product.name || 'Live Auction'}</h1><div className="flex items-center gap-1.5 text-sm"><span className="text-gray-500">by</span><span className="text-[#16a34a] font-semibold">{farmer.full_name || farmer.name || 'Verified Farmer'}</span></div></div><div className="space-y-2 text-sm"><div className="flex items-center gap-2 text-gray-600"><MapPin className="w-4 h-4 text-[#16a34a]" /><span>{product.location || farmer.location || 'India'}</span></div><div className="flex items-center gap-2 text-gray-600"><TrendingUp className="w-4 h-4 text-orange-500" /><span>{product.category || 'Produce'}</span></div></div><div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-2">{[{ label: 'Quantity', value: `${auction?.quantity || product.quantity || 1} ${auction?.unit || product.unit || 'kg'}` }, { label: 'Base Price', value: `₹${Number(auction?.base_price ?? auction?.baseBid ?? currentPrice).toLocaleString()}` }].map(({ label, value }) => (<div key={label} className="bg-gray-50 rounded-xl p-3"><div className="text-xs text-gray-400 mb-1">{label}</div><div className="font-semibold text-gray-900 text-sm">{value}</div></div>))}</div></div>
          </div>
          <div className="space-y-4 lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-4"><h2 className="font-bold text-gray-900 flex items-center gap-2"><Clock className="w-5 h-5 text-gray-500" /> Time Remaining</h2>{isEnded ? <span className="text-xs px-3 py-1.5 rounded-full bg-red-50 text-red-600 font-semibold">Ended</span> : <span className="text-xs px-3 py-1.5 rounded-full bg-green-50 text-[#16a34a] font-semibold">Live</span>}</div>
              <div className="bg-gray-900 rounded-xl p-4 text-center text-white mb-4"><div className="text-3xl font-bold font-mono">{timeLeft || '--'}</div></div>
              <div className="bg-gradient-to-br from-green-50 to-emerald-100 border border-green-200 rounded-2xl p-5 mb-4 text-center"><div className="text-xs text-gray-500 mb-1 font-medium uppercase tracking-wider">Current Highest Bid</div><div className="text-4xl font-bold text-[#16a34a]">₹{currentPrice.toLocaleString()}</div></div>
              <div className="grid grid-cols-2 gap-3 mb-5">{[{label:'Min Next Bid',value:`₹${minBid.toLocaleString()}`},{label:'Total Bidders',value:Number(auction?.total_bids || sortedBids.length || 0)},{label:'Bids Placed',value:sortedBids.length},{label:'Status',value:String(auction?.status || 'scheduled')}].map(({label,value}) => <div key={label} className="bg-gray-50 rounded-xl p-3"><div className="text-xs text-gray-400 mb-1">{label}</div><div className="font-bold text-sm text-gray-900">{String(value)}</div></div>)}</div>
              {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
              <div className="flex gap-2 mb-4">{[100,200,500,1000].map((inc) => <button key={inc} onClick={() => setBidAmount(String(minBid + inc))} className="flex-1 text-xs border border-[#16a34a] text-[#16a34a] py-2 rounded-lg hover:bg-green-50 transition-colors font-semibold">+₹{inc}</button>)}</div>
              <div className="relative mb-4"><span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold text-lg">₹</span><input type="number" value={bidAmount} onChange={(e) => setBidAmount(e.target.value)} className="w-full pl-9 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#16a34a] text-lg font-bold text-gray-900 transition-colors" placeholder={String(minBid)} /></div>
              <button onClick={handlePlaceBid} disabled={submitting || isEnded} className="w-full bg-[#16a34a] hover:bg-[#15803d] disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold text-base shadow-lg shadow-green-200/60 transition-all flex items-center justify-center gap-2 active:scale-95"><Gavel className="w-5 h-5" />{submitting ? 'Placing Bid...' : isEnded ? 'Auction Ended' : 'Place Bid'}</button>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5"><h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-[#16a34a]" />Bid History</h2><div className="space-y-2 max-h-72 overflow-y-auto pr-1">{sortedBids.length > 0 ? sortedBids.map((bid: any, index: number) => <div key={bid.id || `${bid.bid_amount || 0}-${index}`} className={`flex items-center justify-between p-3 rounded-xl ${index === 0 ? 'bg-green-50 border border-green-200' : 'bg-gray-50'}`}><div className="flex items-center gap-2">{index === 0 ? <Trophy className="w-4 h-4 text-yellow-500" /> : <ArrowUp className="w-3.5 h-3.5 text-gray-400" />}<div><span className="font-semibold text-gray-900 text-sm">{bid.user?.full_name || bid.user?.email || 'Bidder'}</span><span className="text-xs text-gray-400 ml-1.5">{bid.bid_time ? new Date(bid.bid_time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : ''}</span></div></div><span className="font-bold text-sm text-[#16a34a]">₹{Number(bid.bid_amount || 0).toLocaleString()}</span></div>) : <div className="text-sm text-gray-500 text-center py-8">No bids yet. Be the first to bid.</div>}</div></div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
