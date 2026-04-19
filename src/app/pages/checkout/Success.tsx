import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Header } from '../../components/Header';
import { Footer } from '../../components/Footer';
import { CheckCircle2, Package, ArrowRight, MapPin, Truck, CreditCard } from 'lucide-react';
import { motion } from 'motion/react';
import { useOrders, Order } from '../../hooks/useOrders';
import { toast } from 'sonner';

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
        } else {
          toast.error('No recent order found');
        }
      } catch (error) {
        console.error('Failed to load order:', error);
        toast.error('Could not load order details');
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, []);

  const trackingNumber = localStorage.getItem('trackingNumber') || order?.tracking?.[0]?.tracking_number || 'N/A';
  const deliveryDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#f9fafb]">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto" />
            <p className="mt-4 text-gray-600">Loading order details...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f9fafb]">
      <Header />

      <main className="flex-1 py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', duration: 0.6 }} className="bg-white rounded-2xl shadow-lg p-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-12 h-12 text-green-600" />
            </div>

            <h1 className="text-3xl font-bold text-gray-900 text-center mb-2">Order Placed Successfully!</h1>
            <p className="text-gray-600 text-center mb-8">Thank you for your purchase. Your order has been confirmed.</p>

            {order && (
              <>
                <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
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
                      <p className="font-semibold text-gray-900">₹{Number(order.final_amount || 0).toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Payment Method</p>
                      <p className="font-semibold text-gray-900 capitalize">{order.payment_method}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  <h3 className="font-semibold text-gray-900 text-left">Order Items</h3>
                  {order.items?.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                      <Package className="w-10 h-10 text-gray-400" />
                      <div className="flex-1 text-left">
                        <p className="font-medium text-gray-900">{item.product?.name || 'Product'}</p>
                        <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                      </div>
                      <p className="font-semibold text-gray-900">₹{Number(item.total_price || 0).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </>
            )}

            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#16a34a] flex items-center justify-center flex-shrink-0">
                  <Truck className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">Estimated Delivery</p>
                  <p className="text-[#16a34a] font-semibold text-sm mt-0.5">{deliveryDate}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <Link to={`/track-order?tracking=${trackingNumber}`} className="flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
                <MapPin className="w-5 h-5" />
                Track Order
              </Link>
              <Link to="/" className="flex items-center justify-center gap-2 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition">
                Continue Shopping
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>

            <div className="text-center text-gray-400 text-sm flex items-center justify-center gap-2">
              <CreditCard className="w-4 h-4" />
              Secure payment completed
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
