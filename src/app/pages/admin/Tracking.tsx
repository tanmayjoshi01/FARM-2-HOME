import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { DashboardSidebar } from '../../components/DashboardSidebar';
import { useAdminData } from '../../hooks/useAdminData';
import { CheckCircle2, Circle, Clock, MapPin, Package, RotateCcw, Truck } from 'lucide-react';
import { toast } from 'sonner';

const deliveryFlow = [
  { key: 'received', label: 'Received' },
  { key: 'packing', label: 'Packing' },
  { key: 'in_transit', label: 'In Transit' },
  { key: 'out_for_delivery', label: 'Out for Delivery' },
  { key: 'delivered', label: 'Delivered' },
];

const deliveryStatuses = [
  { value: 'received', label: 'Received' },
  { value: 'packing', label: 'Packing' },
  { value: 'in_transit', label: 'In Transit' },
  { value: 'out_for_delivery', label: 'Out for Delivery' },
  { value: 'delivered', label: 'Delivered' },
];

function normalizeDeliveryStatus(status: string | null | undefined) {
  const value = String(status || '').toLowerCase();
  if (['pending', 'received', 'confirmed', 'order received', 'order_placed'].includes(value)) return 'received';
  if (['packing', 'packed', 'processing'].includes(value)) return 'packing';
  if (['in transit', 'in_transit', 'shipped', 'dispatched'].includes(value)) return 'in_transit';
  if (['out for delivery', 'out_for_delivery'].includes(value)) return 'out_for_delivery';
  if (['delivered'].includes(value)) return 'delivered';
  return value || 'received';
}

export function AdminTracking() {
  const [searchParams] = useSearchParams();
  const { orders, loading, updateOrderDeliveryStatus } = useAdminData();
  const selectedOrderId = searchParams.get('order') || '';
  const [pendingStatusByOrder, setPendingStatusByOrder] = useState<Record<string, string>>({});
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  const selectedOrder = useMemo(() => {
    if (selectedOrderId) {
      return orders.find((order: any) => String(order.id) === selectedOrderId) || orders[0] || null;
    }
    return orders[0] || null;
  }, [orders, selectedOrderId]);

  const currentStatus = normalizeDeliveryStatus(selectedOrder?.order_status || selectedOrder?.status || selectedOrder?.tracking?.[0]?.status);
  const currentIndex = deliveryFlow.findIndex((stage) => stage.key === currentStatus);

  const handleStatusUpdate = async (orderId: string) => {
    const selectedStatus = pendingStatusByOrder[orderId] || normalizeDeliveryStatus(selectedOrder?.order_status || selectedOrder?.status);

    try {
      setUpdatingOrderId(orderId);
      await updateOrderDeliveryStatus(orderId, selectedStatus);
      toast.success('Delivery status updated by admin');
    } catch (error: any) {
      toast.error(error?.message || 'Failed to update status');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f9fafb]">
      <DashboardSidebar type="admin" />

      <div className="flex-1 overflow-auto">
        <div className="bg-white border-b border-gray-200 px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Tracking Control</h1>
          <p className="text-gray-600 mt-1">Admin authority to monitor and update delivery status for all orders</p>
        </div>

        <div className="p-8">
          <div className="grid lg:grid-cols-[340px_minmax(0,1fr)] gap-6">
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
                <div className="space-y-3 max-h-[70vh] overflow-auto pr-1">
                  {orders.map((order: any) => {
                    const normalized = normalizeDeliveryStatus(order.order_status || order.status || order.tracking?.[0]?.status);
                    const active = String(order.id) === String(selectedOrder?.id);
                    return (
                      <Link
                        key={order.id}
                        to={`/admin/tracking?order=${order.id}`}
                        className={`block rounded-xl border p-4 transition-colors ${active ? 'border-[#16a34a] bg-green-50' : 'border-gray-100 hover:border-gray-300'}`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-gray-900">Order #{String(order.id).slice(0, 8).toUpperCase()}</p>
                            <p className="text-xs text-gray-500 mt-1">{order.buyer_user?.full_name || order.user_user?.full_name || 'Customer'}</p>
                          </div>
                          <span className="text-[11px] px-2 py-1 rounded-full bg-gray-100 text-gray-700 capitalize">
                            {normalized.replace(/_/g, ' ')}
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
              {!selectedOrder ? (
                <div className="text-center py-10 text-gray-500">Select an order to manage tracking.</div>
              ) : (
                <>
                  <div className="flex items-center justify-between gap-4 flex-wrap mb-6">
                    <div>
                      <p className="text-sm text-gray-500">Selected Order</p>
                      <h3 className="text-2xl font-bold text-gray-900">#{String(selectedOrder.id).slice(0, 8).toUpperCase()}</h3>
                      <p className="text-sm text-gray-600 mt-1">Buyer: {selectedOrder.buyer_user?.full_name || selectedOrder.user_user?.full_name || 'Customer'}</p>
                    </div>
                    <div className="w-full md:w-auto flex items-center gap-2">
                      <select
                        value={pendingStatusByOrder[selectedOrder.id] || normalizeDeliveryStatus(selectedOrder.order_status || selectedOrder.status)}
                        onChange={(e) => setPendingStatusByOrder((prev) => ({ ...prev, [selectedOrder.id]: e.target.value }))}
                        className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#16a34a]"
                      >
                        {deliveryStatuses.map((status) => (
                          <option key={status.value} value={status.value}>
                            {status.label}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => handleStatusUpdate(selectedOrder.id)}
                        disabled={updatingOrderId === selectedOrder.id}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#16a34a] px-4 py-2 text-sm font-semibold text-white hover:bg-[#15803d] disabled:opacity-60"
                      >
                        <RotateCcw className="w-4 h-4" />
                        {updatingOrderId === selectedOrder.id ? 'Updating...' : 'Update'}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-5">
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
                              <div className={`w-0.5 h-12 ${completed ? 'bg-[#16a34a]' : 'bg-gray-200'}`} />
                            )}
                          </div>
                          <div className="flex-1 pt-1">
                            <h4 className={`font-semibold ${completed ? 'text-gray-900' : 'text-gray-400'}`}>{stage.label}</h4>
                            <p className="text-sm text-gray-500">{completed ? 'Completed' : 'Pending'}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-8 grid md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-xs text-gray-500 mb-1">Amount</p>
                      <p className="font-semibold text-gray-900">₹{Number(selectedOrder.final_amount || selectedOrder.total || selectedOrder.total_amount || 0).toFixed(2)}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-xs text-gray-500 mb-1">Tracking Number</p>
                      <p className="font-semibold text-gray-900">{selectedOrder.tracking?.[0]?.tracking_number || 'N/A'}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4 md:col-span-2">
                      <p className="text-xs text-gray-500 mb-1">Delivery Address</p>
                      <p className="font-semibold text-gray-900">
                        {selectedOrder.address?.address_line || selectedOrder.delivery_address?.address_line || 'Address not available'}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {[selectedOrder.address?.city || selectedOrder.delivery_address?.city, selectedOrder.address?.state || selectedOrder.delivery_address?.state, selectedOrder.address?.pincode || selectedOrder.delivery_address?.pincode].filter(Boolean).join(', ')}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4 md:col-span-2">
                      <p className="text-xs text-gray-500 mb-2">Latest Note</p>
                      <p className="text-sm text-gray-700 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        {selectedOrder.tracking?.[0]?.message || 'No tracking note yet'}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
