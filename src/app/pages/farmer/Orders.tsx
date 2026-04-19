import { useState } from 'react';
import { DashboardSidebar } from '../../components/DashboardSidebar';
import { useFarmerData } from '../../hooks/useFarmerData';
import { Package, CheckCircle2, Clock, Truck, MapPin, RotateCcw } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';

export function FarmerOrders() {
  const { orders, loading, updateOrderDeliveryStatus } = useFarmerData();
  const [filter, setFilter] = useState('All');
  const [pendingStatusByOrder, setPendingStatusByOrder] = useState<Record<string, string>>({});
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  const formatAddress = (order: any) => {
    if (order.address && order.address !== 'Unknown') return order.address;
    const details = order.addressDetails;
    if (!details) return 'Not available';
    const parts = [details.address_line, details.city, details.state, details.pincode].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : 'Not available';
  };

  const normalizeDeliveryStatus = (status: string) => {
    const value = String(status || '').toLowerCase();
    if (['pending', 'received', 'confirmed', 'order received'].includes(value)) return 'received';
    if (['packing', 'packed', 'processing'].includes(value)) return 'packing';
    if (['in transit', 'in_transit', 'shipped', 'dispatched'].includes(value)) return 'in_transit';
    if (['out for delivery', 'out_for_delivery'].includes(value)) return 'out_for_delivery';
    if (['delivered'].includes(value)) return 'delivered';
    return value || 'received';
  };

  const filtered = orders.filter((order) => filter === 'All' || normalizeDeliveryStatus(order.trackingStatus || order.status) === filter.toLowerCase());

  const deliveryStatuses = [
    { value: 'received', label: 'Received' },
    { value: 'packing', label: 'Packing' },
    { value: 'in_transit', label: 'In Transit' },
    { value: 'out_for_delivery', label: 'Out for Delivery' },
    { value: 'delivered', label: 'Delivered' },
  ];

  const getStatusColor = (status: string) => {
    const value = normalizeDeliveryStatus(status);
    if (value === 'delivered') return 'bg-green-100 text-green-700';
    if (value === 'in_transit' || value === 'out_for_delivery') return 'bg-blue-100 text-blue-700';
    if (value === 'packing') return 'bg-purple-100 text-purple-700';
    if (value === 'received') return 'bg-yellow-100 text-yellow-700';
    if (value === 'cancelled') return 'bg-red-100 text-red-700';
    return 'bg-gray-100 text-gray-700';
  };

  const getStatusIcon = (status: string) => {
    const value = normalizeDeliveryStatus(status);
    if (value === 'delivered') return <CheckCircle2 className="w-3 h-3" />;
    if (value === 'in_transit' || value === 'out_for_delivery') return <Truck className="w-3 h-3" />;
    if (value === 'packing' || value === 'received') return <Clock className="w-3 h-3" />;
    return <Package className="w-3 h-3" />;
  };

  const handleStatusUpdate = async (orderId: string) => {
    const nextStatus = pendingStatusByOrder[orderId];

    if (!nextStatus) {
      toast.error('Select a status first');
      return;
    }

    try {
      setUpdatingOrderId(orderId);
      await updateOrderDeliveryStatus(orderId, nextStatus);
      toast.success('Delivery status updated');
    } catch (error: any) {
      toast.error(error?.message || 'Failed to update delivery status');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#f9fafb]">
        <DashboardSidebar type="farmer" />
        <div className="flex-1 flex items-center justify-center"><div className="text-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto" /><p className="mt-4 text-gray-600">Loading orders...</p></div></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#f9fafb]">
      <DashboardSidebar type="farmer" />
      <div className="flex-1 overflow-auto">
        <div className="bg-white border-b border-gray-200 px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
              <p className="text-gray-600 mt-1">Manage your customer orders</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-yellow-100 text-yellow-700 px-4 py-2 rounded-xl font-semibold text-sm">{orders.filter(o => normalizeDeliveryStatus(o.trackingStatus || o.status) === 'received').length} Received</div>
              <div className="bg-blue-100 text-blue-700 px-4 py-2 rounded-xl font-semibold text-sm">{orders.filter(o => ['in_transit','out_for_delivery'].includes(normalizeDeliveryStatus(o.trackingStatus || o.status))).length} In Transit</div>
            </div>
          </div>
        </div>

        <div className="p-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6 flex items-center gap-3 flex-wrap">
            <span className="text-sm font-semibold text-gray-600">Filter:</span>
            {['All', 'received', 'packing', 'in_transit', 'out_for_delivery', 'delivered'].map((status) => (
              <button key={status} onClick={() => setFilter(status)} className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${filter === status ? 'bg-[#16a34a] text-white shadow-sm' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>{status}</button>
            ))}
            <div className="ml-auto text-sm text-gray-500">{filtered.length} {filtered.length === 1 ? 'order' : 'orders'}</div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50"><tr><th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Order ID</th><th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Product</th><th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Buyer</th><th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Quantity</th><th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Amount</th><th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th><th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th></tr></thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map((order: any, index) => (
                    <motion.tr key={order.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap"><span className="font-mono text-sm font-semibold text-gray-700">{String(order.id).slice(0, 8).toUpperCase()}</span></td>
                      <td className="px-6 py-4"><div><p className="text-sm font-medium text-gray-900">{order.product}</p><p className="text-xs text-gray-500">{order.orderDate}</p></div></td>
                      <td className="px-6 py-4"><div><p className="text-sm text-gray-900">{order.buyer}</p><p className="text-xs text-gray-500 flex items-center gap-1"><MapPin className="w-3 h-3" />{order.city || 'Unknown'}</p></div></td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{order.quantity}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">₹{Number(order.amount || 0).toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap"><span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.trackingStatus || order.status)}`}>{getStatusIcon(order.trackingStatus || order.status)}{normalizeDeliveryStatus(order.trackingStatus || order.status).replace(/_/g, ' ')}</span></td>
                      <td className="px-6 py-4 min-w-[260px]">
                        <div className="flex flex-col gap-2">
                          <select
                            value={pendingStatusByOrder[order.id] || normalizeDeliveryStatus(order.trackingStatus || order.status)}
                            onChange={(e) => setPendingStatusByOrder((prev) => ({ ...prev, [order.id]: e.target.value }))}
                            className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#16a34a]"
                          >
                            {deliveryStatuses.map((status) => (
                              <option key={status.value} value={status.value}>
                                {status.label}
                              </option>
                            ))}
                          </select>
                          <button
                            onClick={() => handleStatusUpdate(order.id)}
                            disabled={updatingOrderId === order.id}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#16a34a] px-3 py-2 text-sm font-semibold text-white hover:bg-[#15803d] disabled:opacity-60"
                          >
                            <RotateCcw className="w-4 h-4" />
                            {updatingOrderId === order.id ? 'Updating...' : 'Update Status'}
                          </button>
                          <details>
                            <summary className="cursor-pointer text-xs font-semibold text-gray-600 hover:text-gray-900">Full Order Details</summary>
                            <div className="mt-3 rounded-lg border border-gray-200 bg-gray-50 p-3 text-xs text-gray-700 space-y-3">
                              <div>
                                <div className="font-semibold text-gray-900">Buyer</div>
                                <div>Name: {order.buyer}</div>
                                <div>Email: {order.buyerEmail || 'Not available'}</div>
                              </div>
                              <div>
                                <div className="font-semibold text-gray-900">Order</div>
                                <div>Order Number: {order.orderNumber || 'Not available'}</div>
                                <div>Product: {order.product}</div>
                                <div>Quantity: {order.quantity}</div>
                                <div>Amount: ₹{Number(order.amount || 0).toLocaleString()}</div>
                                <div>Order Date: {order.orderDate || 'Not available'}</div>
                              </div>
                              <div>
                                <div className="font-semibold text-gray-900">Delivery</div>
                                <div>Address: {formatAddress(order)}</div>
                                <div>Current Status: {normalizeDeliveryStatus(order.trackingStatus || order.status).replace(/_/g, ' ')}</div>
                                <div>Tracking Number: {order.trackingNumber || 'Not available'}</div>
                                <div>Last Location: {order.trackingLocation || 'Not available'}</div>
                                <div>Tracking Note: {order.trackingMessage || 'No message yet'}</div>
                              </div>
                              <div>
                                <div className="font-semibold text-gray-900">Payment</div>
                                <div>Method: {order.paymentMethod || 'Not specified'}</div>
                                <div>Status: {order.paymentStatus || 'pending'}</div>
                              </div>
                            </div>
                          </details>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
