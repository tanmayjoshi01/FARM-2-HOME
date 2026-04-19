import { useMemo } from "react";
import { Link, useSearchParams } from "react-router";
import { DashboardSidebar } from "../../components/DashboardSidebar";
import { MapPin, Truck, Package, CheckCircle2, Clock, Circle, ChevronRight } from "lucide-react";
import { useFarmerData } from "../../hooks/useFarmerData";

const deliveryFlow = [
  { key: 'received', label: 'Received' },
  { key: 'packing', label: 'Packing' },
  { key: 'in_transit', label: 'In Transit' },
  { key: 'out_for_delivery', label: 'Out for Delivery' },
  { key: 'delivered', label: 'Delivered' },
];

const normalizeDeliveryStatus = (status: string | null | undefined) => {
  const value = String(status || '').toLowerCase();
  if (['pending', 'received', 'confirmed', 'order received'].includes(value)) return 'received';
  if (['packing', 'packed', 'processing'].includes(value)) return 'packing';
  if (['in transit', 'in_transit', 'shipped', 'dispatched'].includes(value)) return 'in_transit';
  if (['out for delivery', 'out_for_delivery'].includes(value)) return 'out_for_delivery';
  if (['delivered'].includes(value)) return 'delivered';
  return value || 'received';
};

export function FarmerTracking() {
  const [searchParams] = useSearchParams();
  const selectedOrderId = searchParams.get('order') || '';
  const { orders, loading } = useFarmerData();

  const selectedOrder = useMemo(() => {
    if (selectedOrderId) {
      return orders.find((order) => String(order.id) === selectedOrderId) || orders[0] || null;
    }
    return orders[0] || null;
  }, [orders, selectedOrderId]);

  const currentStatus = normalizeDeliveryStatus(selectedOrder?.trackingStatus || selectedOrder?.status);
  const currentIndex = deliveryFlow.findIndex((stage) => stage.key === currentStatus);

  return (
    <div className="flex min-h-screen bg-[#f9fafb]">
      <DashboardSidebar type="farmer" />
      
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-8 py-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Order Tracking</h1>
              <p className="text-gray-600 mt-1">Real-time tracking for each customer order</p>
            </div>
            {selectedOrder ? (
              <div className="text-sm text-gray-600 text-right">
                <p className="font-semibold text-gray-900">Order #{String(selectedOrder.id).slice(0, 8).toUpperCase()}</p>
                <p>{selectedOrder.product} · {selectedOrder.buyer}</p>
              </div>
            ) : null}
          </div>
        </div>

        {/* Main Content */}
        <div className="p-8">
          <div className="grid lg:grid-cols-[320px_minmax(0,1fr)] gap-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 h-fit">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-gray-900">Orders</h2>
                <span className="text-xs text-gray-500">{orders.length} total</span>
              </div>

              {loading ? (
                <p className="text-sm text-gray-500">Loading orders...</p>
              ) : orders.length === 0 ? (
                <p className="text-sm text-gray-500">No orders found.</p>
              ) : (
                <div className="space-y-3">
                  {orders.map((order) => {
                    const normalized = normalizeDeliveryStatus(order.trackingStatus || order.status);
                    const isActive = String(order.id) === String(selectedOrder?.id);
                    return (
                      <Link
                        key={order.id}
                        to={`/farmer/tracking?order=${order.id}`}
                        className={`block rounded-xl border p-4 transition-colors ${isActive ? 'border-[#16a34a] bg-green-50' : 'border-gray-100 hover:border-gray-300'}`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-gray-900">Order #{String(order.id).slice(0, 8).toUpperCase()}</p>
                            <p className="text-xs text-gray-500 mt-1">{order.product}</p>
                            <p className="text-xs text-gray-500">{order.buyer}</p>
                          </div>
                          <span className="text-[11px] px-2 py-1 rounded-full bg-gray-100 text-gray-700 capitalize">
                            {normalized.replace(/_/g, ' ')}
                          </span>
                        </div>
                        <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                          <ChevronRight className="w-3 h-3" />
                          View tracking
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              {!selectedOrder ? (
                <div className="text-center py-10 text-gray-500">
                  <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p>Select an order to view tracking.</p>
                </div>
              ) : (
                <div className="max-w-3xl mx-auto">
                  <div className="mb-6 flex items-center justify-between gap-4 flex-wrap">
                    <div>
                      <p className="text-sm text-gray-500">Selected Order</p>
                      <h3 className="text-2xl font-bold text-gray-900">{selectedOrder.product}</h3>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Buyer</p>
                      <p className="font-semibold text-gray-900">{selectedOrder.buyer}</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {deliveryFlow.map((stage, index) => {
                      const completed = currentIndex >= index;
                      return (
                        <div key={stage.key} className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${completed ? 'bg-[#16a34a]' : 'bg-gray-200'}`}>
                              {completed ? (
                                stage.key === 'packing' ? <Package className="w-5 h-5 text-white" /> : stage.key === 'in_transit' ? <Truck className="w-5 h-5 text-white" /> : <CheckCircle2 className="w-5 h-5 text-white" />
                              ) : (
                                <Circle className="w-5 h-5 text-gray-400" />
                              )}
                            </div>
                            {index < deliveryFlow.length - 1 && (
                              <div className={`w-0.5 h-16 ${completed ? 'bg-[#16a34a]' : 'bg-gray-200'}`} />
                            )}
                          </div>
                          <div className="flex-1 pb-8">
                            <h3 className={`font-bold ${completed ? 'text-gray-900' : 'text-gray-400'}`}>{stage.label}</h3>
                            <p className="text-sm text-gray-500">{completed ? 'Completed' : 'Pending'}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-8 bg-gray-100 rounded-xl h-64 flex items-center justify-center">
                    <div className="text-center">
                      <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">Live GPS Tracking</p>
                      <p className="text-sm text-gray-400 mt-1">Tracking number: {selectedOrder.trackingNumber || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
