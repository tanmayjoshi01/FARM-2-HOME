import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../context/AuthContext';

export interface AuctionItem {
  id: string;
  name: string;
  farmer: string;
  farmer_id: string;
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
  grade?: 'A' | 'B' | 'C';
  hasCertificate?: boolean;
  ends_at: string;
  status: string;
  min_bid_increment?: number;
}

export interface Auction extends AuctionItem {
  product?: any;
  farmer?: any;
  bids?: any[];
  current_price?: number;
  base_price?: number;
  end_time?: string;
}

export function useAuctions() {
  const { user } = useAuth();
  const [auctions, setAuctions] = useState<AuctionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isTransientAuthLockError = (err: any) => {
    const message = String(err?.message || '').toLowerCase();
    return message.includes('auth-token') && message.includes('stole it');
  };

  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  const calculateTimeLeft = (endsAt: string) => {
    const distance = new Date(endsAt).getTime() - Date.now();

    if (distance <= 0) {
      return { hours: 0, minutes: 0, seconds: 0 };
    }

    const hours = Math.floor(distance / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    return { hours, minutes, seconds };
  };

  const normalizeAuction = (auction: any): AuctionItem => {
    const product = auction.product || auction.products || {};
    const farmer = product.users || auction.farmer || auction.users || {};
    const endValue = auction.end_time || auction.ends_at || auction.endAt || new Date().toISOString();
    const basePrice = Number(auction.base_price ?? auction.baseBid ?? 0);
    const rawCurrentBid = Number(auction.current_bid ?? auction.current_price ?? 0);
    const currentPrice = rawCurrentBid > 0 ? rawCurrentBid : basePrice;
    const bidsCount = Array.isArray(auction.bids)
      ? auction.bids.length
      : Number(auction.total_bids ?? auction.unique_bidders ?? 0);

    return {
      id: String(auction.id),
      name: product.name || auction.name || 'Auction Item',
      farmer: farmer.full_name || farmer.name || 'Verified Farmer',
      farmer_id: String(farmer.id || auction.farmer_id || ''),
      location: product.location || farmer.location || 'India',
      currentBid: currentPrice,
      baseBid: basePrice,
      timeLeft: calculateTimeLeft(endValue),
      image: product.image_url || product.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400',
      category: product.category || auction.category || 'Produce',
      totalBidders: bidsCount,
      unit: auction.unit || product.unit || 'kg',
      quantity: Number(auction.quantity || product.quantity || 1),
      verified: true,
      grade: product.grade,
      hasCertificate: Boolean(product.has_certificate),
      ends_at: endValue,
      status: String(auction.status || 'scheduled'),
      min_bid_increment: Number(auction.min_bid_increment || 100),
    };
  };

  const fetchAuctions = async () => {
    try {
      setLoading(true);
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          const { data, error: queryError } = await supabase
            .from('auctions')
            .select(`
              *,
              product:products(
                *,
                users!products_farmer_id_fkey(full_name, id, email)
              ),
              bids:bids(count)
            `)
            .in('status', ['scheduled', 'live'])
            .order('ends_at', { ascending: true });

          if (queryError) throw queryError;

          setAuctions((data || []).map(normalizeAuction));
          setError(null);
          return;
        } catch (innerError: any) {
          if (attempt === 0 && isTransientAuthLockError(innerError)) {
            await sleep(120);
            continue;
          }
          throw innerError;
        }
      }
    } catch (err: any) {
      console.error('Error fetching auctions:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getAuction = async (auctionId: string) => {
    const { data, error: queryError } = await supabase
      .from('auctions')
      .select(`
        *,
        product:products(*, users!products_farmer_id_fkey(full_name, id, email)),
        bids:bids(
          *,
          user:users!bids_bidder_id_fkey(id, full_name, email)
        )
      `)
      .eq('id', auctionId)
      .single();

    if (queryError) throw queryError;
    return data;
  };

  const placeBid = async (auctionId: string, amount: number) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error: bidError } = await supabase
      .from('bids')
      .insert({
        auction_id: auctionId,
        bidder_id: user.id,
        bid_amount: amount,
      })
      .select()
      .single();

    if (bidError) throw bidError;

    const { data: currentAuction, error: auctionError } = await supabase
      .from('auctions')
      .select('total_bids, current_bid, base_price')
      .eq('id', auctionId)
      .single();

    if (!auctionError && currentAuction) {
      await supabase
        .from('auctions')
        .update({
          current_bid: amount,
          total_bids: Number(currentAuction.total_bids || 0) + 1,
        })
        .eq('id', auctionId);
    }

    return data;
  };

  const subscribeToAuction = (auctionId: string, callback: (auction: any) => void) => {
    const channel = supabase
      .channel(`auction-${auctionId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bids',
          filter: `auction_id=eq.${auctionId}`,
        },
        async () => {
          const updatedAuction = await getAuction(auctionId);
          callback(updatedAuction);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  useEffect(() => {
    fetchAuctions();

    const timer = setInterval(() => {
      setAuctions((prev) => prev.map((auction) => ({ ...auction, timeLeft: calculateTimeLeft(auction.ends_at) })));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return {
    auctions,
    loading,
    error,
    getAuction,
    placeBid,
    subscribeToAuction,
    refetch: fetchAuctions,
  };
}
