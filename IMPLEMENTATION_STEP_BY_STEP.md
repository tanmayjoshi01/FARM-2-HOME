# 📝 STEP-BY-STEP IMPLEMENTATION
## Exact Code Changes for Each Phase

**Follow this guide sequentially. Each section gives you the EXACT code to add/modify.**

---

## 🔨 PHASE 1: CHECKOUT & ORDERS

### Step 1.1: Create Order Hook

**CREATE NEW FILE**: `/src/app/hooks/useOrders.ts`

```typescript
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../context/AuthContext';

export interface Order {
  id: string;
  user_id: string;
  total_amount: number;
  platform_fee: number;
  gst: number;
  delivery_fee: number;
  final_amount: number;
  delivery_address_id: string;
  payment_method: string;
  payment_status: 'pending' | 'completed' | 'failed';
  order_status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  created_at: string;
  items?: OrderItem[];
  address?: any;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price_per_unit: number;
  total_price: number;
  product?: any;
}

export function useOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user's orders
  const fetchOrders = async () => {
    if (!user) {
      setOrders([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          items:order_items(
            *,
            product:products(*)
          ),
          address:addresses(*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching orders:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Create new order
  const createOrder = async (orderData: {
    items: Array<{ product_id: string; quantity: number; price_per_unit: number }>;
    total_amount: number;
    platform_fee: number;
    gst: number;
    delivery_fee: number;
    final_amount: number;
    delivery_address_id: string;
    payment_method: string;
  }) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          total_amount: orderData.total_amount,
          platform_fee: orderData.platform_fee,
          gst: orderData.gst,
          delivery_fee: orderData.delivery_fee,
          final_amount: orderData.final_amount,
          delivery_address_id: orderData.delivery_address_id,
          payment_method: orderData.payment_method,
          payment_status: 'completed',
          order_status: 'pending',
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = orderData.items.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price_per_unit: item.price_per_unit,
        total_price: item.quantity * item.price_per_unit,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Create tracking entry
      const trackingNumber = `F2H${Date.now().toString().slice(-8)}`;
      const { error: trackingError } = await supabase
        .from('tracking')
        .insert({
          order_id: order.id,
          tracking_number: trackingNumber,
          status: 'order_placed',
          location: 'Order received',
        });

      if (trackingError) throw trackingError;

      return { ...order, tracking_number: trackingNumber };
    } catch (err: any) {
      console.error('Error creating order:', err);
      throw err;
    }
  };

  // Get single order by ID
  const getOrder = async (orderId: string) => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          items:order_items(
            *,
            product:products(*)
          ),
          address:addresses(*),
          tracking:tracking(*)
        `)
        .eq('id', orderId)
        .single();

      if (error) throw error;
      return data;
    } catch (err: any) {
      console.error('Error fetching order:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [user]);

  return {
    orders,
    loading,
    error,
    createOrder,
    getOrder,
    refetch: fetchOrders,
  };
}
```

---

### Step 1.2: Connect Payment Page

**MODIFY FILE**: `/src/app/pages/checkout/Payment.tsx`

Find the `handlePayment` function and replace it with:

```typescript
const handlePayment = async () => {
  if (!selectedMethod) {
    alert('Please select a payment method');
    return;
  }

  setProcessing(true);

  try {
    // Get cart items and address from localStorage
    const cartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');
    const selectedAddress = JSON.parse(localStorage.getItem('selectedAddress') || '{}');

    if (!cartItems.length || !selectedAddress.id) {
      alert('Cart or address not found');
      setProcessing(false);
      return;
    }

    // Calculate totals
    const subtotal = cartItems.reduce((sum: number, item: any) => 
      sum + (item.price * item.quantity), 0
    );
    const platformFee = subtotal * 0.03;
    const gst = subtotal * 0.18;
    const deliveryFee = subtotal > 500 ? 0 : 49;
    const finalAmount = subtotal + platformFee + gst + deliveryFee;

    // Create order in database
    const { createOrder } = useOrders();
    const order = await createOrder({
      items: cartItems.map((item: any) => ({
        product_id: item.id,
        quantity: item.quantity,
        price_per_unit: item.price,
      })),
      total_amount: subtotal,
      platform_fee: platformFee,
      gst: gst,
      delivery_fee: deliveryFee,
      final_amount: finalAmount,
      delivery_address_id: selectedAddress.id,
      payment_method: selectedMethod,
    });

    // Store order ID for success page
    localStorage.setItem('lastOrderId', order.id);
    localStorage.setItem('trackingNumber', order.tracking_number);

    // Clear cart after successful order
    await clearCart();

    // Navigate to success page
    navigate('/checkout/success');
  } catch (error) {
    console.error('Payment failed:', error);
    alert('Payment failed. Please try again.');
  } finally {
    setProcessing(false);
  }
};
```

**ADD IMPORTS** at the top:

```typescript
import { useOrders } from '../hooks/useOrders';
import { useCart } from '../context/CartContext';
```

**ADD CART HOOK** after useState declarations:

```typescript
const { clearCart } = useCart();
```

---

### Step 1.3: Connect Success Page

**MODIFY FILE**: `/src/app/pages/checkout/Success.tsx`

Replace the entire component with:

```typescript
import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { CheckCircle2, Package, MapPin, CreditCard } from 'lucide-react';
import { motion } from 'motion/react';
import { useOrders, Order } from '../hooks/useOrders';

export function Success() {
  const { getOrder } = useOrders();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrder = async () => {
      try {
        const orderId = localStorage.getItem('lastOrderId');
        if (orderId) {
          const orderData = await getOrder(orderId);
          setOrder(orderData);
        }
      } catch (error) {
        console.error('Failed to load order:', error);
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, []);

  const trackingNumber = localStorage.getItem('trackingNumber') || 'N/A';

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading order details...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 py-12">
        <div className="max-w-3xl mx-auto px-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.6 }}
            className="bg-white rounded-2xl shadow-lg p-8 text-center"
          >
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-12 h-12 text-green-600" />
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Placed Successfully!</h1>
            <p className="text-gray-600 mb-8">Thank you for your purchase. Your order has been confirmed.</p>

            {order && (
              <>
                <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
                  <div className="grid grid-cols-2 gap-4 text-left">
                    <div>
                      <p className="text-sm text-gray-600">Order ID</p>
                      <p className="font-semibold text-gray-900">{order.id.slice(0, 8).toUpperCase()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Tracking Number</p>
                      <p className="font-semibold text-gray-900">{trackingNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total Amount</p>
                      <p className="font-semibold text-gray-900">₹{order.final_amount.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Payment Method</p>
                      <p className="font-semibold text-gray-900 capitalize">{order.payment_method}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  <h3 className="font-semibold text-gray-900 text-left">Order Items:</h3>
                  {order.items?.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                      <Package className="w-10 h-10 text-gray-400" />
                      <div className="flex-1 text-left">
                        <p className="font-medium text-gray-900">{item.product?.name || 'Product'}</p>
                        <p className="text-sm text-gray-600">Quantity: {item.quantity}kg</p>
                      </div>
                      <p className="font-semibold text-gray-900">₹{item.total_price.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link
                to={`/track-order?tracking=${trackingNumber}`}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                <MapPin className="w-5 h-5" />
                Track Order
              </Link>
              <Link
                to="/"
                className="flex items-center justify-center gap-2 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Continue Shopping
              </Link>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
```

---

### Step 1.4: Connect Track Order Page

**MODIFY FILE**: `/src/app/pages/TrackOrder.tsx`

Replace the mock data section with real data fetching:

**ADD IMPORTS**:
```typescript
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';
import { supabase } from '../lib/supabase';
```

**REPLACE THE COMPONENT** with:

```typescript
export function TrackOrder() {
  const [searchParams] = useSearchParams();
  const trackingNumberParam = searchParams.get('tracking');
  
  const [trackingNumber, setTrackingNumber] = useState(trackingNumberParam || '');
  const [trackingData, setTrackingData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTrack = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!trackingNumber.trim()) return;

    setLoading(true);
    setError(null);

    try {
      // Fetch tracking data
      const { data, error } = await supabase
        .from('tracking')
        .select(`
          *,
          order:orders(
            *,
            items:order_items(
              *,
              product:products(*)
            ),
            address:addresses(*)
          )
        `)
        .eq('tracking_number', trackingNumber.trim())
        .order('timestamp', { ascending: false });

      if (error) throw error;

      if (!data || data.length === 0) {
        setError('Tracking number not found');
        setTrackingData(null);
      } else {
        setTrackingData(data);
      }
    } catch (err: any) {
      console.error('Error fetching tracking:', err);
      setError('Failed to fetch tracking information');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (trackingNumberParam) {
      handleTrack();
    }
  }, []);

  // Rest of the component rendering logic...
  // Keep existing JSX but use trackingData instead of mock data
}
```

---

## ✅ PHASE 1 TESTING

Test your checkout flow:

```bash
npm run dev

# 1. Add items to cart
# 2. Go to checkout
# 3. Select address
# 4. Complete payment
# 5. Check Success page - should show real order
# 6. Check Supabase → orders table - should see order
# 7. Track order - should work
```

**If everything works, proceed to Phase 2!**

---

## 🏗️ PHASE 2: AUCTIONS INTEGRATION

### Step 2.1: Enhance Auction Hook

**MODIFY FILE**: `/src/app/hooks/useAuctions.ts`

Replace entire file with:

```typescript
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../context/AuthContext';

export interface Auction {
  id: string;
  product_id: string;
  farmer_id: string;
  base_price: number;
  current_price: number;
  min_bid_increment: number;
  start_time: string;
  end_time: string;
  status: 'draft' | 'active' | 'ended' | 'cancelled';
  winner_id: string | null;
  total_bids: number;
  created_at: string;
  product?: any;
  farmer?: any;
  bids?: Bid[];
}

export interface Bid {
  id: string;
  auction_id: string;
  user_id: string;
  amount: number;
  created_at: string;
  user?: any;
}

export function useAuctions() {
  const { user } = useAuth();
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch active auctions
  const fetchAuctions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('auctions')
        .select(`
          *,
          product:products(*),
          farmer:users!auctions_farmer_id_fkey(id, name, location),
          bids:bids(count)
        `)
        .in('status', ['active', 'draft'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAuctions(data || []);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching auctions:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Get single auction with bids
  const getAuction = async (auctionId: string) => {
    try {
      const { data, error } = await supabase
        .from('auctions')
        .select(`
          *,
          product:products(*),
          farmer:users!auctions_farmer_id_fkey(*),
          bids:bids(
            *,
            user:users(id, name)
          )
        `)
        .eq('id', auctionId)
        .single();

      if (error) throw error;
      return data;
    } catch (err: any) {
      console.error('Error fetching auction:', err);
      throw err;
    }
  };

  // Place bid
  const placeBid = async (auctionId: string, amount: number) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      const { data, error } = await supabase
        .from('bids')
        .insert({
          auction_id: auctionId,
          user_id: user.id,
          amount: amount,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err: any) {
      console.error('Error placing bid:', err);
      throw err;
    }
  };

  // Subscribe to auction updates
  const subscribeToAuction = (auctionId: string, callback: (auction: Auction) => void) => {
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
          // Refetch auction when bids change
          const auction = await getAuction(auctionId);
          callback(auction);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  useEffect(() => {
    fetchAuctions();
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
```

---

### Step 2.2: Connect Auctions Page

**MODIFY FILE**: `/src/app/pages/Auctions.tsx`

**ADD IMPORTS**:
```typescript
import { useAuctions } from '../hooks/useAuctions';
```

**REPLACE THE MOCK DATA** section with:

```typescript
export function Auctions() {
  const { auctions, loading, error } = useAuctions();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedStatus, setSelectedStatus] = useState('All Status');

  // Filter auctions
  const filteredAuctions = auctions.filter(auction => {
    const matchesSearch = auction.product?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All Categories' || 
      auction.product?.category === selectedCategory;
    const matchesStatus = selectedStatus === 'All Status' || 
      auction.status === selectedStatus.toLowerCase();
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading auctions...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-red-600">Error loading auctions: {error}</p>
        </div>
        <Footer />
      </div>
    );
  }

  // Rest of component stays the same, but map over filteredAuctions
  // Update the auction cards to use real data:
}
```

**UPDATE AUCTION CARD** to use real data:

```typescript
{filteredAuctions.map((auction) => (
  <motion.div
    key={auction.id}
    className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition"
  >
    <div className="relative h-48">
      <ImageWithFallback
        src={auction.product?.image_url || ''}
        alt={auction.product?.name || 'Product'}
        className="w-full h-full object-cover"
      />
      <div className="absolute top-4 right-4">
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
          auction.status === 'active' ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'
        }`}>
          {auction.status === 'active' ? 'Live' : 'Ended'}
        </span>
      </div>
    </div>

    <div className="p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-2">{auction.product?.name}</h3>
      <p className="text-sm text-gray-600 flex items-center gap-2 mb-4">
        <MapPin className="w-4 h-4" />
        {auction.farmer?.location || 'Unknown'}
      </p>

      <div className="space-y-3 mb-6">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Current Bid:</span>
          <span className="text-2xl font-bold text-green-600">
            ₹{auction.current_price?.toFixed(2) || auction.base_price?.toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600">Base Price:</span>
          <span className="font-semibold">₹{auction.base_price?.toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600 flex items-center gap-1">
            <Users className="w-4 h-4" />
            Total Bids:
          </span>
          <span className="font-semibold">{auction.total_bids || 0}</span>
        </div>
      </div>

      <Link
        to={`/auctions/${auction.id}`}
        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
      >
        <Gavel className="w-5 h-5" />
        {auction.status === 'active' ? 'Join Auction' : 'View Details'}
      </Link>
    </div>
  </motion.div>
))}
```

---

### Step 2.3: Connect Live Auction Page

**MODIFY FILE**: `/src/app/pages/LiveAuction.tsx`

**REPLACE ENTIRE FILE** with real-time bidding:

```typescript
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { 
  Gavel, 
  Users, 
  Clock, 
  TrendingUp, 
  MapPin,
  AlertCircle,
  Trophy
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { useAuctions, Auction } from '../hooks/useAuctions';
import { useAuth } from '../context/AuthContext';

export function LiveAuction() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getAuction, placeBid, subscribeToAuction } = useAuctions();
  
  const [auction, setAuction] = useState<Auction | null>(null);
  const [loading, setLoading] = useState(true);
  const [bidAmount, setBidAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState('');

  // Load auction data
  useEffect(() => {
    if (!id) return;

    const loadAuction = async () => {
      try {
        const data = await getAuction(id);
        setAuction(data);
        const minBid = (data.current_price || data.base_price) + data.min_bid_increment;
        setBidAmount(minBid.toString());
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadAuction();

    // Subscribe to real-time updates
    const unsubscribe = subscribeToAuction(id, (updatedAuction) => {
      setAuction(updatedAuction);
      const minBid = (updatedAuction.current_price || updatedAuction.base_price) + 
        updatedAuction.min_bid_increment;
      setBidAmount(minBid.toString());
    });

    return unsubscribe;
  }, [id]);

  // Calculate time left
  useEffect(() => {
    if (!auction?.end_time) return;

    const interval = setInterval(() => {
      const now = new Date();
      const end = new Date(auction.end_time);
      const diff = end.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft('Auction Ended');
        clearInterval(interval);
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
    }, 1000);

    return () => clearInterval(interval);
  }, [auction]);

  // Handle bid submission
  const handleBid = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      alert('Please login to place a bid');
      navigate('/login');
      return;
    }

    if (!auction) return;

    const amount = parseFloat(bidAmount);
    const minBid = (auction.current_price || auction.base_price) + auction.min_bid_increment;

    if (amount < minBid) {
      alert(`Minimum bid is ₹${minBid.toFixed(2)}`);
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await placeBid(auction.id, amount);
      alert('Bid placed successfully!');
    } catch (err: any) {
      setError(err.message);
      alert(`Failed to place bid: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading auction...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !auction) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <p className="text-red-600">Failed to load auction</p>
            <button 
              onClick={() => navigate('/auctions')}
              className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Back to Auctions
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const currentBid = auction.current_price || auction.base_price;
  const minBid = currentBid + auction.min_bid_increment;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 py-8">
        <div className="max-w-7xl mx-auto px-4">
          {/* Live Badge */}
          <div className="flex items-center gap-3 mb-6">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="w-4 h-4 bg-red-500 rounded-full"
            />
            <span className="text-2xl font-bold text-gray-900">LIVE AUCTION</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Product Details */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="relative h-96">
                  <ImageWithFallback
                    src={auction.product?.image_url || ''}
                    alt={auction.product?.name || 'Product'}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="p-6">
                  <h1 className="text-3xl font-bold text-gray-900 mb-4">
                    {auction.product?.name}
                  </h1>
                  
                  <div className="flex items-center gap-2 text-gray-600 mb-4">
                    <MapPin className="w-5 h-5" />
                    <span>{auction.farmer?.location || 'Unknown'}</span>
                  </div>

                  <p className="text-gray-700 mb-6">
                    {auction.product?.description || 'No description available'}
                  </p>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">Quantity</p>
                      <p className="text-xl font-bold text-gray-900">
                        {auction.product?.quantity || 0}kg
                      </p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">Category</p>
                      <p className="text-xl font-bold text-gray-900">
                        {auction.product?.category || 'N/A'}
                      </p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">Total Bids</p>
                      <p className="text-xl font-bold text-gray-900">
                        {auction.total_bids || 0}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bid History */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Trophy className="w-6 h-6 text-yellow-500" />
                  Recent Bids
                </h2>
                
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {auction.bids && auction.bids.length > 0 ? (
                    auction.bids
                      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                      .map((bid, index) => (
                        <motion.div
                          key={bid.id}
                          initial={{ x: -20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          className={`flex items-center justify-between p-4 rounded-lg ${
                            index === 0 ? 'bg-green-50 border-2 border-green-500' : 'bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            {index === 0 && <Trophy className="w-5 h-5 text-yellow-500" />}
                            <div>
                              <p className="font-semibold text-gray-900">
                                {bid.user?.name || 'Anonymous'}
                              </p>
                              <p className="text-sm text-gray-600">
                                {new Date(bid.created_at).toLocaleString()}
                              </p>
                            </div>
                          </div>
                          <p className="text-xl font-bold text-green-600">
                            ₹{bid.amount.toFixed(2)}
                          </p>
                        </motion.div>
                      ))
                  ) : (
                    <p className="text-gray-600 text-center py-8">No bids yet. Be the first!</p>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Bidding Panel */}
            <div className="space-y-6">
              {/* Timer */}
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="w-6 h-6" />
                  <h3 className="text-lg font-semibold">Time Remaining</h3>
                </div>
                <p className="text-4xl font-bold">{timeLeft}</p>
              </div>

              {/* Current Bid */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <p className="text-gray-600 mb-2">Current Highest Bid</p>
                <p className="text-4xl font-bold text-green-600 mb-4">
                  ₹{currentBid.toFixed(2)}
                </p>
                
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <TrendingUp className="w-4 h-4" />
                  <span>Minimum increment: ₹{auction.min_bid_increment.toFixed(2)}</span>
                </div>
                
                <p className="text-sm text-gray-600">
                  Next minimum bid: <span className="font-bold text-gray-900">₹{minBid.toFixed(2)}</span>
                </p>
              </div>

              {/* Bid Form */}
              {auction.status === 'active' ? (
                <form onSubmit={handleBid} className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Place Your Bid</h3>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bid Amount (₹)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min={minBid}
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                  >
                    <Gavel className="w-5 h-5" />
                    {submitting ? 'Placing Bid...' : 'Place Bid'}
                  </button>

                  <p className="text-xs text-gray-500 mt-3 text-center">
                    By bidding, you agree to purchase if you win
                  </p>
                </form>
              ) : (
                <div className="bg-gray-100 rounded-xl p-6 text-center">
                  <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">This auction has ended</p>
                </div>
              )}

              {/* Participants */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Users className="w-5 h-5 text-gray-600" />
                  <h3 className="font-semibold text-gray-900">Active Participants</h3>
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  {auction.total_bids || 0}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
```

---

## ✅ PHASE 2 TESTING

Test your auctions:

```bash
# 1. Create test auction in Supabase:
# Go to Table Editor → auctions → Insert row
# Fill in:
#   - product_id: (existing product)
#   - farmer_id: (existing farmer user)
#   - base_price: 100
#   - current_price: 100
#   - min_bid_increment: 10
#   - start_time: (now)
#   - end_time: (1 hour from now)
#   - status: 'active'

# 2. Visit /auctions - should see your auction
# 3. Click to join - should open live auction
# 4. Place a bid - should save to database
# 5. Open in another browser - should see bid update in real-time
```

---

**Continue to PHASE 3 in next message (Farmer Dashboard)...**

Would you like me to continue with Phases 3-8, or would you like to test Phases 1-2 first?

