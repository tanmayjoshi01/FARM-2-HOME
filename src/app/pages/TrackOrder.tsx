import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { supabase } from '../../lib/supabase';
import { useOrders } from '../hooks/useOrders';
import { MapPin, Phone, Truck, Package, CheckCircle2, Circle, Home, ArrowLeft, Clock, Search } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';

const deliveryFlow = [
  { key: 'received', label: 'Received' },
  { key: 'packing', label: 'Packing' },
  { key: 'in_transit', label: 'In Transit' },
  { key: 'out_for_delivery', label: 'Out for Delivery' },
  { key: 'delivered', label: 'Delivered' },
];

const normalizeTrackingStatus = (value: string | null | undefined) => {
  const status = String(value || 'received').toLowerCase();

  if (['confirmed', 'pending', 'received', 'order_received', 'order placed'].includes(status)) return 'received';
  if (['packed', 'packing', 'ready', 'processing'].includes(status)) return 'packing';
  if (['shipped', 'in_transit', 'in transit', 'dispatched'].includes(status)) return 'in_transit';
  if (['out_for_delivery', 'out for delivery'].includes(status)) return 'out_for_delivery';
  if (['delivered', 'completed'].includes(status)) return 'delivered';

  return status;
};

export function TrackOrder() {
  const [searchParams] = useSearchParams();
  const trackingNumberParam = searchParams.get('tracking') || '';
  const [trackingNumber, setTrackingNumber] = useState(trackingNumberParam);
  const [trackingData, setTrackingData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { orders, loading: ordersLoading } = useOrders();

  const handleTrack = async (e?: React.FormEvent, trackingOverride?: string) => {
    e?.preventDefault();
    const resolvedTracking = (trackingOverride ?? trackingNumber).trim();

    if (!resolvedTracking) {
      toast.error('Please enter a tracking number');
      return;
    }

    if (trackingOverride) {
      setTrackingNumber(resolvedTracking);
    }

    setLoading(true);
    setError(null);

    try {
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
            address:addresses!orders_address_id_fkey(*)
          )
        `)
        .eq('tracking_number', resolvedTracking)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      if (!data || data.length === 0) {
        setError('Tracking number not found');
        setTrackingData(null);
        toast.error('Tracking number not found');
      } else {
        setTrackingData(data);
        toast.success('Tracking details loaded');
      }
    } catch (err: any) {
      console.error('Error fetching tracking:', err);
      setError('Failed to fetch tracking information');
      setTrackingData(null);
      toast.error('Failed to fetch tracking information');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (trackingNumberParam) {
      setTrackingNumber(trackingNumberParam);
      handleTrack();
    }
  }, [trackingNumberParam]);

  const trackingEntry = trackingData?.[0];
  const order = trackingEntry?.order;
  const currentTrackingStatus = normalizeTrackingStatus(order?.order_status || order?.status || trackingEntry?.status);

  return (
    <div className="min-h-screen flex flex-col bg-[#f9fafb]">
      <Header />

      <div className="flex-1 px-4 py-6 md:py-8">
        <div className="max-w-5xl mx-auto">
          <Link to="/checkout/success" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back to Order Details</span>
          </Link>

          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">Track Your Order</h1>
            <p className="text-sm text-gray-500">Enter your tracking number to see the latest status.</p>
          </div>

          <form onSubmit={handleTrack} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-5 mb-6 flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="Enter tracking number e.g. F2H12345678"
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#16a34a]"
              />
            </div>
            <button type="submit" disabled={loading} className="px-6 py-3 bg-[#16a34a] text-white rounded-xl font-semibold hover:bg-[#15803d] transition-colors disabled:opacity-60">
              {loading ? 'Searching...' : 'Track Order'}
            </button>
          </form>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-5 mb-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold text-gray-900">My Previous Orders</h2>
              <span className="text-xs text-gray-500">{orders.length} total</span>
            </div>

            {ordersLoading ? (
              <p className="text-sm text-gray-500">Loading orders...</p>
            ) : orders.length === 0 ? (
              <p className="text-sm text-gray-500">No previous orders found.</p>
            ) : (
              <div className="space-y-3">
                {orders.slice(0, 10).map((o: any) => {
                  const orderTracking = o?.tracking?.[0]?.tracking_number;
                  const orderAmount = Number(o?.final_amount || o?.total || o?.total_amount || 0);
                  const orderStatus = o?.order_status || o?.status || 'pending';
                  return (
                    <div key={o.id} className="border border-gray-100 rounded-xl p-3 md:p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">Order #{String(o.id).slice(0, 8).toUpperCase()}</p>
                        <p className="text-xs text-gray-500">{new Date(o.created_at).toLocaleString()}</p>
                        <p className="text-sm text-gray-700 mt-1">Status: <span className="font-medium capitalize">{String(orderStatus).replace(/_/g, ' ')}</span></p>
                      </div>
                      <div className="md:text-right">
                        <p className="text-sm font-semibold text-gray-900">₹{orderAmount.toFixed(2)}</p>
                        {orderTracking ? (
                          <button
                            onClick={() => handleTrack(undefined, orderTracking)}
                            className="mt-1 text-xs font-medium text-[#16a34a] hover:text-[#15803d]"
                          >
                            Track {orderTracking}
                          </button>
                        ) : (
                          <p className="mt-1 text-xs text-gray-400">Tracking pending</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-6">{error}</div>
          )}

          {trackingEntry && order ? (
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-r from-[#16a34a] to-[#15803d] rounded-2xl p-5 md:p-6 text-white shadow-lg">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0 backdrop-blur-sm">
                        <Clock className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-green-100 mb-1">Current Status</p>
                        <p className="text-3xl font-bold capitalize">{deliveryFlow.find((step) => step.key === currentTrackingStatus)?.label || 'Received'}</p>
                        <p className="text-sm text-green-100 mt-1">Tracking: {trackingEntry.tracking_number}</p>
                      </div>
                    </div>
                    <div className="text-right hidden md:block">
                      <p className="text-sm text-green-100">Location</p>
                      <p className="text-xl font-bold">{trackingEntry.location || 'In transit'}</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
                  <div className="px-5 py-4 border-b border-gray-100 bg-gray-50">
                    <div className="flex items-center justify-between">
                      <h2 className="font-semibold text-gray-900 flex items-center gap-2"><MapPin className="w-5 h-5 text-[#16a34a]" />Live Location</h2>
                      <div className="flex items-center gap-2"><div className="w-2 h-2 bg-[#16a34a] rounded-full animate-pulse" /><span className="text-xs text-gray-500">Updating live</span></div>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-gray-500 text-xs mb-1">Order ID</p>
                        <p className="font-semibold text-gray-900">{order.id.slice(0, 8).toUpperCase()}</p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-gray-500 text-xs mb-1">Payment Method</p>
                        <p className="font-semibold text-gray-900 capitalize">{order.payment_method}</p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-gray-500 text-xs mb-1">Current Location</p>
                        <p className="font-semibold text-gray-900">{trackingEntry.location || 'Order received'}</p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-gray-500 text-xs mb-1">Amount</p>
                        <p className="font-semibold text-gray-900">₹{Number(order.final_amount || 0).toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-2xl shadow-md border border-gray-100 p-5 md:p-6">
                  <h2 className="font-semibold text-gray-900 mb-5">Order Status</h2>
                  <div className="space-y-4">
                    {deliveryFlow.map((stage, index, list) => {
                      const currentIndex = deliveryFlow.findIndex((item) => item.key === currentTrackingStatus);
                      const completed = currentIndex >= index;

                      return (
                      <div key={stage.label} className="flex items-start gap-4">
                        <div className="relative">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${completed ? 'bg-[#16a34a] text-white' : 'bg-gray-100 text-gray-400'}`}>
                            {completed ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                          </div>
                          {index < list.length - 1 && <div className={`absolute left-5 top-10 w-0.5 h-8 ${completed ? 'bg-[#16a34a]' : 'bg-gray-200'}`} />}
                        </div>
                        <div className="flex-1 pt-2">
                          <div className="flex items-center justify-between gap-4">
                            <div>
                              <h3 className={`font-semibold ${completed ? 'text-gray-900' : 'text-gray-500'}`}>{stage.label}</h3>
                              <p className="text-sm text-gray-500">{completed ? 'Completed' : 'Pending'}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      );
                    })}
                  </div>
                </motion.div>
              </div>

              <div className="space-y-4">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                  <h3 className="font-bold text-gray-900 mb-3 text-sm">Delivery Address</h3>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p className="font-semibold text-gray-900">{order.address?.name || 'Customer'}</p>
                    <p className="flex items-center gap-1 text-gray-500"><Phone className="w-3 h-3" />{order.address?.phone || 'N/A'}</p>
                    <p>{order.address?.address_line || 'Address not available'}</p>
                    <p>{order.address?.city || ''} {order.address?.state ? `, ${order.address.state}` : ''}</p>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                  <h3 className="font-bold text-gray-900 mb-3 text-sm">Order Items</h3>
                  <div className="space-y-3">
                    {order.items?.map((item: any) => (
                      <div key={item.id} className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center"><Package className="w-5 h-5 text-gray-400" /></div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">{item.product?.name || 'Product'}</p>
                          <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                  <h3 className="font-bold text-gray-900 mb-3 text-sm">Tracking Number</h3>
                  <p className="text-sm font-mono text-gray-700">{trackingEntry.tracking_number}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center text-gray-500">
              Enter a tracking number to view the shipment details.
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
