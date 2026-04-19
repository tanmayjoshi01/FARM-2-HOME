import { DashboardSidebar } from "../../components/DashboardSidebar";
import { 
  TrendingUp, 
  Package, 
  ShoppingBag, 
  IndianRupee,
  Clock,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Eye,
  Plus
} from "lucide-react";
import { motion } from "motion/react";
import { Link } from "react-router";
import { useFarmerData } from "../../hooks/useFarmerData";

const normalizeDeliveryStatus = (status: string) => {
  const value = String(status || '').toLowerCase();
  if (['pending', 'received', 'confirmed', 'order received', 'order_placed'].includes(value)) return 'received';
  if (['packing', 'packed', 'processing'].includes(value)) return 'packing';
  if (['in transit', 'in_transit', 'shipped', 'dispatched'].includes(value)) return 'in_transit';
  if (['out for delivery', 'out_for_delivery'].includes(value)) return 'out_for_delivery';
  if (['delivered'].includes(value)) return 'delivered';
  return value || 'received';
};

export function FarmerDashboard() {
  const { stats, recentOrders, topProducts, loading } = useFarmerData();

  const formatAddress = (order: any) => {
    if (order.address && order.address !== 'Unknown') return order.address;
    if (!order.addressDetails) return 'Not available';
    const parts = [
      order.addressDetails.address_line,
      order.addressDetails.city,
      order.addressDetails.state,
      order.addressDetails.pincode,
    ].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : 'Not available';
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#f9fafb]">
        <DashboardSidebar type="farmer" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto" />
            <p className="mt-4 text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  const dashboardStats = [
    { label: "Total Products", value: stats.totalProducts.toString(), icon: Package, color: "bg-blue-500", change: `${stats.pendingApproval} pending` },
    { label: "Revenue This Month", value: `₹${stats.totalRevenue.toLocaleString()}`, icon: IndianRupee, color: "bg-green-500", change: "" },
    { label: "Orders Received", value: stats.totalOrders.toString(), icon: ShoppingBag, color: "bg-orange-500", change: "" },
    { label: "Pending Approval", value: stats.pendingApproval.toString(), icon: Clock, color: "bg-yellow-500", change: "" },
  ];

  const recentBuyers = recentOrders;

  return (
    <div className="flex min-h-screen bg-[#f9fafb]">
      <DashboardSidebar type="farmer" />
      
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600 mt-1">Good morning, Ramesh! 🌾 You have 3 pending orders today.</p>
            </div>
            <Link 
              to="/farmer/add-product"
              className="flex items-center gap-2 bg-[#16a34a] text-white px-6 py-3 rounded-full hover:bg-[#15803d] transition-colors font-semibold shadow-sm"
            >
              <Plus className="w-5 h-5" />
              Add New Product
            </Link>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {dashboardStats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                            <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xs text-green-600 font-semibold bg-green-50 px-2 py-1 rounded-full">
                      {stat.change.includes("+") ? "↑" : ""} {stat.change}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                </motion.div>
              );
            })}
          </div>

          {/* Who Bought From You Section */}
          <div className="mb-8">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-green-50 to-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-bold text-gray-900 text-lg">Who Bought From You</h2>
                    <p className="text-sm text-gray-600 mt-1">Recent order buyers and their details</p>
                  </div>
                  <Link 
                    to="/farmer/orders"
                    className="text-sm text-[#16a34a] font-semibold hover:underline flex items-center gap-1"
                  >
                    View All Orders
                    <Eye className="w-4 h-4" />
                  </Link>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Order ID</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Product</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Buyer Name</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Buyer City</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Quantity</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {recentBuyers.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="font-mono text-sm font-semibold text-gray-700">{order.id}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <p className="text-sm font-medium text-gray-900">{order.product}</p>
                          <p className="text-xs text-gray-500">{order.date}</p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-[#16a34a] rounded-full flex items-center justify-center text-white text-xs font-semibold">
                              {order.buyer.split(" ").map(n => n[0]).join("")}
                            </div>
                            <span className="text-sm text-gray-900">{order.buyer}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <MapPin className="w-3 h-3" />
                            {order.city}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{order.quantity}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">₹{order.amount.toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                            normalizeDeliveryStatus(order.status) === "delivered" 
                              ? "bg-green-100 text-green-700" 
                              : normalizeDeliveryStatus(order.status) === "in_transit" || normalizeDeliveryStatus(order.status) === "out_for_delivery"
                              ? "bg-blue-100 text-blue-700"
                              : normalizeDeliveryStatus(order.status) === "packing"
                              ? "bg-purple-100 text-purple-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}>
                            {normalizeDeliveryStatus(order.status) === "delivered" ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                            {normalizeDeliveryStatus(order.status).replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col gap-2">
                            <Link
                              to={`/farmer/tracking?order=${order.id}`}
                              className="text-[#16a34a] hover:text-[#15803d] text-sm font-semibold hover:underline flex items-center gap-1"
                            >
                              View Tracking
                            </Link>
                            <details>
                              <summary className="cursor-pointer text-xs font-semibold text-gray-600 hover:text-gray-900">Order Details</summary>
                              <div className="mt-3 w-[420px] max-w-[70vw] rounded-lg border border-gray-200 bg-gray-50 p-3 text-xs text-gray-700 space-y-3">
                                <div>
                                  <div className="font-semibold text-gray-900">Buyer Details</div>
                                  <div>Name: {order.buyer}</div>
                                  <div>Email: {order.buyerEmail || 'Not available'}</div>
                                  <div>City: {order.city || 'Not available'}</div>
                                </div>
                                <div>
                                  <div className="font-semibold text-gray-900">Order Summary</div>
                                  <div>Order Number: {order.orderNumber || 'Not available'}</div>
                                  <div>Quantity: {order.quantity}</div>
                                  <div>Amount: ₹{Number(order.amount || 0).toLocaleString()}</div>
                                  <div>Order Date: {order.orderDate || order.date}</div>
                                  <div>Status: {normalizeDeliveryStatus(order.status).replace(/_/g, ' ')}</div>
                                </div>
                                <div>
                                  <div className="font-semibold text-gray-900">Address & Payment</div>
                                  <div>Address: {formatAddress(order)}</div>
                                  <div>Payment Method: {order.paymentMethod || 'Not specified'}</div>
                                  <div>Payment Status: {order.paymentStatus || 'pending'}</div>
                                </div>
                                <div>
                                  <div className="font-semibold text-gray-900">Latest Tracking</div>
                                  <div>Tracking Number: {order.trackingNumber || 'Not available'}</div>
                                  <div>Location: {order.trackingLocation || 'Not available'}</div>
                                  <div>Message: {order.trackingMessage || 'No message yet'}</div>
                                </div>
                              </div>
                            </details>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Top Products Chart */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="font-bold text-gray-900 text-lg mb-6">Top Products</h2>
                <div className="space-y-6">
                  {topProducts.map((product, index) => (
                    <div key={product.name}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white ${
                            index === 0 ? "bg-yellow-500" : index === 1 ? "bg-gray-400" : "bg-orange-600"
                          }`}>
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{product.name}</p>
                            <p className="text-xs text-gray-500">{product.sold} units sold</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900">₹{product.revenue.toLocaleString()}</p>
                          <div className="flex items-center gap-1 text-xs text-green-600">
                            <TrendingUp className="w-3 h-3" />
                            Revenue
                          </div>
                        </div>
                      </div>
                      {/* Progress Bar */}
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            index === 0 ? "bg-yellow-500" : index === 1 ? "bg-gray-400" : "bg-orange-600"
                          }`}
                          style={{ width: `${(product.sold / 250) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-[#16a34a] to-[#15803d] rounded-2xl p-6 text-white">
                <h3 className="font-bold text-lg mb-2">Quick Actions</h3>
                <p className="text-green-100 text-sm mb-4">Manage your products and orders</p>
                <div className="space-y-3">
                  <Link 
                    to="/farmer/add-product"
                    className="w-full bg-white text-[#16a34a] py-3 rounded-xl font-semibold hover:bg-green-50 transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    Add New Product
                  </Link>
                  <Link 
                    to="/farmer/orders"
                    className="w-full bg-green-900/40 backdrop-blur-sm border-2 border-green-600/50 py-3 rounded-xl font-semibold hover:bg-green-900/60 transition-colors flex items-center justify-center gap-2"
                  >
                    View All Orders
                  </Link>
                  <Link 
                    to="/farmer/tracking"
                    className="w-full bg-green-900/40 backdrop-blur-sm border-2 border-green-600/50 py-3 rounded-xl font-semibold hover:bg-green-900/60 transition-colors flex items-center justify-center"
                  >
                    Track Deliveries
                  </Link>
                </div>
              </div>

              {/* Revenue Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="font-bold text-gray-900 mb-4">Revenue Analytics</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-600">This Month</span>
                      <span className="text-sm font-semibold text-green-600">+15%</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">₹45,680</div>
                  </div>
                  <div className="pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-gray-500">Last Month</span>
                      <span className="text-xs text-gray-900">₹39,720</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">This Year</span>
                      <span className="text-xs text-gray-900">₹4,23,560</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}