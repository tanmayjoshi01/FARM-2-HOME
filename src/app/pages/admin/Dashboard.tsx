import { DashboardSidebar } from '../../components/DashboardSidebar';
import { useAdminData } from '../../hooks/useAdminData';
import { Users, Package, ShoppingCart, IndianRupee, TrendingUp, TrendingDown, Gavel, Clock } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router';

export function AdminDashboard() {
  const { stats, loading, products, orders } = useAdminData();

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#f9fafb]">
        <DashboardSidebar type="admin" />
        <div className="flex-1 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600" /></div>
      </div>
    );
  }

  const dashboardStats = [
    { label: 'Total Users', value: stats.totalUsers.toString(), icon: Users, color: 'bg-blue-500', change: '' },
    { label: 'Total Products', value: stats.totalProducts.toString(), icon: Package, color: 'bg-purple-500', change: '' },
    { label: 'Total Orders', value: stats.totalOrders.toString(), icon: ShoppingCart, color: 'bg-orange-500', change: '' },
    { label: 'Revenue', value: `₹${stats.totalRevenue.toLocaleString()}`, icon: IndianRupee, color: 'bg-green-500', change: '' },
  ];

  const pendingApprovals = products.filter((product) => String(product.status).toLowerCase() === 'pending');
  const recentOrders = orders.slice(0, 4).map((order: any) => ({
    id: order.id,
    buyer: order.buyer_user?.full_name || order.user_user?.full_name || 'Customer',
    seller: order.farmer_user?.full_name || 'Farmer',
    product: order.items?.[0]?.product?.name || 'Product',
    amount: Number(order.final_amount || order.total || order.total_amount || 0),
    status: order.order_status || order.status || 'pending',
  }));

  return (
    <div className="flex min-h-screen bg-[#f9fafb]">
      <DashboardSidebar type="admin" />
      <div className="flex-1 overflow-auto">
        <div className="bg-white border-b border-gray-200 px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Monitor and manage Farm2Home platform</p>
        </div>

        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {dashboardStats.map((stat, index) => {
              const Icon = stat.icon;
              const TrendIcon = index === 3 ? TrendingDown : TrendingUp;
              return (
                <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4"><div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center`}><Icon className="w-6 h-6 text-white" /></div><TrendIcon className={`w-5 h-5 ${index === 3 ? 'text-red-500' : 'text-green-500'}`} /></div>
                  <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</p>
                  <p className="text-xs text-gray-500">{stat.change}</p>
                </motion.div>
              );
            })}
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                  <h2 className="font-bold text-gray-900 text-lg">Pending Approvals</h2>
                  <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-semibold">{pendingApprovals.length} Pending</span>
                </div>
                <div className="p-6 space-y-3">
                  {pendingApprovals.map((item: any) => (
                    <div key={item.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                      <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center"><Clock className="w-5 h-5 text-yellow-600" /></div>
                      <div className="flex-1"><p className="font-semibold text-gray-900">{item.name}</p><p className="text-xs text-gray-500">by {item.farmer?.full_name || item.farmer?.name || 'Farmer'} • {item.quantity} {item.unit}</p></div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100"><h2 className="font-bold text-gray-900 text-lg">Recent Orders</h2></div>
                <div className="overflow-x-auto"><table className="w-full"><thead className="bg-gray-50"><tr><th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Order ID</th><th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Buyer</th><th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Seller</th><th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Product</th><th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Amount</th><th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th><th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Action</th></tr></thead><tbody className="divide-y divide-gray-100">{recentOrders.map((order) => (<tr key={order.id} className="hover:bg-gray-50 transition-colors"><td className="px-6 py-4 whitespace-nowrap"><span className="font-mono text-sm font-semibold text-gray-700">{String(order.id).slice(0, 8).toUpperCase()}</span></td><td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{order.buyer}</td><td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{order.seller}</td><td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.product}</td><td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">₹{order.amount.toLocaleString()}</td><td className="px-6 py-4 whitespace-nowrap"><span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">{order.status}</span></td><td className="px-6 py-4 whitespace-nowrap"><Link to={`/admin/tracking?order=${order.id}`} className="text-[#16a34a] hover:text-[#15803d] text-sm font-semibold hover:underline">Track</Link></td></tr>))}</tbody></table></div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between"><h2 className="font-bold text-gray-900 text-lg">Pending Products</h2><span className="flex items-center gap-1 text-xs text-red-600 font-semibold"><span className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />LIVE</span></div>
                <div className="p-6 space-y-4">
                  {pendingApprovals.slice(0, 3).map((product: any) => (
                    <div key={product.id} className="p-4 border border-gray-200 rounded-xl hover:border-[#16a34a] transition-colors">
                      <div className="flex items-start justify-between mb-3"><div className="flex-1"><p className="font-semibold text-gray-900">{product.name}</p><p className="text-xs text-gray-500">{product.quantity} {product.unit}</p></div><Gavel className="w-5 h-5 text-[#16a34a]" /></div>
                      <div className="flex items-center justify-between"><div><p className="text-xs text-gray-500">Price</p><p className="font-bold text-[#16a34a]">₹{Number(product.price_per_unit || 0).toLocaleString()}</p></div><div className="text-right"><p className="text-xs text-gray-500">Status</p><p className="font-bold text-yellow-600 text-sm">Pending</p></div></div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gradient-to-br from-[#16a34a] to-[#15803d] rounded-2xl p-6 text-white">
                <h3 className="font-bold text-lg mb-4">Platform Overview</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between"><span className="text-green-100 text-sm">Active Farmers</span><span className="font-bold">{stats.totalUsers}</span></div>
                  <div className="flex items-center justify-between"><span className="text-green-100 text-sm">Pending Products</span><span className="font-bold">{stats.pendingProducts}</span></div>
                  <div className="flex items-center justify-between"><span className="text-green-100 text-sm">Success Rate</span><span className="font-bold">98.5%</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
