import { Link } from 'react-router';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { useOrders } from '../hooks/useOrders';
import { Package, ChevronRight, Truck, CreditCard, MapPin, Calendar } from 'lucide-react';

function formatCurrency(value: number | string | null | undefined) {
  const amount = Number(value || 0);
  return `₹${amount.toFixed(2)}`;
}

function formatStatus(value: string | null | undefined) {
  return String(value || 'pending').replace(/_/g, ' ');
}

export function BuyerOrders() {
  const { orders, loading, error } = useOrders();

  return (
    <div className="min-h-screen flex flex-col bg-[#f9fafb]">
      <Header />

      <div className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-1.5 text-sm text-gray-500">
            <Link to="/" className="hover:text-[#16a34a] transition-colors">
              Home
            </Link>
            <ChevronRight className="w-4 h-4 text-gray-300" />
            <span className="text-gray-900 font-medium">My Orders</span>
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Package className="w-6 h-6 text-[#16a34a]" />
          My Orders
        </h1>

        {loading ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 text-sm text-gray-500">
            Loading orders...
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4">
            {error}
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
            <p className="text-gray-600 mb-4">You have no orders yet.</p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 bg-[#16a34a] text-white px-5 py-2.5 rounded-xl hover:bg-[#15803d] transition-colors font-semibold text-sm"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order: any) => {
              const amount = Number(order?.final_amount || order?.total || order?.total_amount || 0);
              const subtotal = Number(order?.total_amount || order?.subtotal || amount || 0);
              const platformFee = Number(order?.platform_fee || 0);
              const gst = Number(order?.gst || 0);
              const deliveryFee = Number(order?.delivery_fee || order?.delivery_charge || 0);
              const status = formatStatus(order?.order_status || order?.status);
              const paymentStatus = formatStatus(order?.payment_status);
              const trackingEntries = Array.isArray(order?.tracking) ? order.tracking : [];
              const latestTracking = [...trackingEntries].sort((a: any, b: any) => {
                const aTime = new Date(a?.updated_at || 0).getTime();
                const bTime = new Date(b?.updated_at || 0).getTime();
                return bTime - aTime;
              })[0];
              const trackingNumber = latestTracking?.tracking_number;
              const items = Array.isArray(order?.items) ? order.items : [];
              const address = order?.address;

              return (
                <div key={order.id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-gray-900">Order #{String(order.id).slice(0, 8).toUpperCase()}</p>
                      <p className="text-xs text-gray-500 mt-1 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(order.created_at).toLocaleString()}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <span className="text-xs px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 font-medium capitalize">
                          {status}
                        </span>
                        <span className="text-xs px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 font-medium capitalize">
                          Payment: {paymentStatus}
                        </span>
                      </div>
                    </div>

                    <div className="lg:text-right">
                      <p className="text-lg font-bold text-[#16a34a]">{formatCurrency(amount)}</p>
                      {trackingNumber ? (
                        <Link
                          to={`/track-order?tracking=${trackingNumber}`}
                          className="inline-flex items-center gap-1 text-xs font-medium text-[#16a34a] hover:text-[#15803d] mt-1"
                        >
                          <Truck className="w-3.5 h-3.5" />
                          Track {trackingNumber}
                        </Link>
                      ) : (
                        <p className="text-xs text-gray-400 mt-1">Tracking pending</p>
                      )}
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div className="lg:col-span-2 rounded-xl border border-gray-100 p-4">
                      <h3 className="text-sm font-semibold text-gray-900 mb-3">Items</h3>
                      {items.length === 0 ? (
                        <p className="text-sm text-gray-500">No item details found for this order.</p>
                      ) : (
                        <div className="space-y-3">
                          {items.map((item: any) => {
                            const productName =
                              item?.product_name ||
                              item?.product?.name ||
                              'Product';
                            const quantity = Number(item?.quantity || 0);
                            const unit = item?.unit || item?.product?.unit || 'unit';
                            const unitPrice = Number(item?.price_per_unit || 0);
                            const totalPrice = Number(item?.total_price || quantity * unitPrice);

                            return (
                              <div key={item.id} className="flex items-center justify-between gap-3 text-sm border-b border-gray-100 pb-3 last:pb-0 last:border-b-0">
                                <div>
                                  <p className="font-medium text-gray-900">{productName}</p>
                                  <p className="text-xs text-gray-500 mt-0.5">
                                    {quantity} {unit} x {formatCurrency(unitPrice)}
                                  </p>
                                </div>
                                <p className="font-semibold text-gray-900">{formatCurrency(totalPrice)}</p>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div className="rounded-xl border border-gray-100 p-4">
                        <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-[#16a34a]" />
                          Delivery Address
                        </h3>
                        {address ? (
                          <div className="text-sm text-gray-700 space-y-1">
                            <p className="font-medium text-gray-900">{address?.name || 'Address'}</p>
                            <p>{address?.phone || '-'}</p>
                            <p>{address?.address_line || '-'}</p>
                            <p>{[address?.city, address?.state, address?.pincode].filter(Boolean).join(', ') || '-'}</p>
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500">Address not available</p>
                        )}
                      </div>

                      <div className="rounded-xl border border-gray-100 p-4">
                        <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <CreditCard className="w-4 h-4 text-[#16a34a]" />
                          Payment Summary
                        </h3>
                        <div className="text-sm text-gray-700 space-y-2">
                          <div className="flex justify-between"><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
                          <div className="flex justify-between"><span>Platform Fee</span><span>{formatCurrency(platformFee)}</span></div>
                          <div className="flex justify-between"><span>GST</span><span>{formatCurrency(gst)}</span></div>
                          <div className="flex justify-between"><span>Delivery</span><span>{formatCurrency(deliveryFee)}</span></div>
                          <div className="border-t border-gray-100 pt-2 flex justify-between font-semibold text-gray-900">
                            <span>Total</span>
                            <span>{formatCurrency(amount)}</span>
                          </div>
                          <p className="text-xs text-gray-500 pt-1 capitalize">Method: {order?.payment_method || 'upi'}</p>
                          {latestTracking ? (
                            <p className="text-xs text-gray-500 capitalize">Latest tracking: {formatStatus(latestTracking?.status)}</p>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
