import { DashboardSidebar } from '../../components/DashboardSidebar';
import { useAdminData } from '../../hooks/useAdminData';
import { CheckCircle2, Clock, Truck } from 'lucide-react';
import { Link } from 'react-router';

export function AdminOrders() {
  const { orders, loading } = useAdminData();

  const getLatestTracking = (order: any) => {
    const entries = Array.isArray(order?.tracking) ? order.tracking : [];
    return [...entries].sort((a: any, b: any) => {
      const aTime = new Date(a?.updated_at || a?.created_at || 0).getTime();
      const bTime = new Date(b?.updated_at || b?.created_at || 0).getTime();
      return bTime - aTime;
    })[0];
  };

  const formatAddress = (address: any) => {
    if (!address) return 'Not available';
    const parts = [address.address_line, address.city, address.state, address.pincode].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : 'Not available';
  };

  if (loading) {
    return <div className="flex min-h-screen bg-[#f9fafb]"><DashboardSidebar type="admin" /><div className="flex-1 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600" /></div></div>;
  }

  return (
    <div className="flex min-h-screen bg-[#f9fafb]">
      <DashboardSidebar type="admin" />
      <div className="flex-1 overflow-auto">
        <div className="bg-white border-b border-gray-200 px-8 py-6"><h1 className="text-3xl font-bold text-gray-900">All Orders</h1><p className="text-gray-600 mt-1">Monitor all platform transactions</p></div>
        <div className="p-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Order ID</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Buyer</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Seller</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Product</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Amount</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {orders.map((order: any) => {
                    const statusValue = String(order.order_status || order.status || 'pending').toLowerCase();
                    const amount = Number(order.final_amount || order.total || order.total_amount || 0);
                    const sellerName = order.farmer_user?.full_name || 'Farmer';
                    const sellerEmail = order.farmer_user?.email || 'Not available';
                    const buyerName = order.buyer_user?.full_name || order.user_user?.full_name || 'Customer';
                    const buyerEmail = order.buyer_user?.email || order.user_user?.email || 'Not available';
                    const latestTracking = getLatestTracking(order);
                    const address = formatAddress(order.delivery_address || order.address);

                    return (
                      <tr key={order.id} className="hover:bg-gray-50 align-top">
                        <td className="px-6 py-4 font-mono text-sm font-semibold">{String(order.id).slice(0, 8).toUpperCase()}</td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          <div className="font-medium text-gray-900">{buyerName}</div>
                          <div className="text-xs text-gray-500">{buyerEmail}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          <div className="font-medium text-gray-900">{sellerName}</div>
                          <div className="text-xs text-gray-500">{sellerEmail}</div>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium">{order.items?.[0]?.product?.name || 'Product'}</td>
                        <td className="px-6 py-4 text-sm font-semibold">₹{amount.toLocaleString()}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${statusValue === 'delivered' ? 'bg-green-100 text-green-700' : statusValue === 'shipped' || statusValue === 'processing' || statusValue === 'in_transit' || statusValue === 'out_for_delivery' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'}`}>
                            {statusValue === 'delivered' ? <CheckCircle2 className="w-3 h-3" /> : statusValue === 'shipped' || statusValue === 'in_transit' || statusValue === 'out_for_delivery' ? <Truck className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                            {order.order_status || order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-2">
                            <Link to={`/admin/tracking?order=${order.id}`} className="text-[#16a34a] hover:text-[#15803d] text-sm font-semibold hover:underline">Track</Link>
                            <details>
                              <summary className="cursor-pointer text-xs font-semibold text-gray-600 hover:text-gray-900">Full Details</summary>
                              <div className="mt-3 w-[420px] max-w-[70vw] rounded-lg border border-gray-200 bg-gray-50 p-3 text-xs text-gray-700 space-y-3">
                                <div>
                                  <div className="font-semibold text-gray-900">Order Summary</div>
                                  <div>Order Number: {order.order_number || 'Not available'}</div>
                                  <div>Created: {order.created_at ? new Date(order.created_at).toLocaleString() : 'Not available'}</div>
                                  <div>Payment Method: {order.payment_method || 'Not specified'}</div>
                                  <div>Payment Status: {order.payment_status || 'pending'}</div>
                                </div>
                                <div>
                                  <div className="font-semibold text-gray-900">Delivery Address</div>
                                  <div>{address}</div>
                                </div>
                                <div>
                                  <div className="font-semibold text-gray-900">Items</div>
                                  {(order.items || []).length === 0 ? (
                                    <div>No items available</div>
                                  ) : (
                                    <div className="space-y-1">
                                      {(order.items || []).map((item: any) => (
                                        <div key={item.id}>
                                          {item.product?.name || 'Product'} - Qty: {item.quantity || 0}{item.product?.unit ? ` ${item.product.unit}` : ''} - ₹{Number(item.total_price || 0).toLocaleString()}
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                                <div>
                                  <div className="font-semibold text-gray-900">Latest Tracking</div>
                                  <div>Status: {latestTracking?.status || order.order_status || order.status || 'pending'}</div>
                                  <div>Location: {latestTracking?.location || 'Not available'}</div>
                                  <div>Message: {latestTracking?.message || 'No tracking message'}</div>
                                </div>
                              </div>
                            </details>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
