import { useState } from 'react';
import { DashboardSidebar } from '../../components/DashboardSidebar';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';
import { useAdminData } from '../../hooks/useAdminData';
import { CheckCircle2, XCircle, Eye, Award, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';

export function AdminProducts() {
  const { products, loading, approveProduct, rejectProduct, deleteProduct } = useAdminData();
  const [filter, setFilter] = useState('All');

  const filtered = products.filter((product) => filter === 'All' || String(product.status).toLowerCase() === filter.toLowerCase());

  const handleApprove = async (id: string) => { try { await approveProduct(id); toast.success('Product approved'); } catch { toast.error('Failed to approve product'); } };
  const handleReject = async (id: string) => { try { await rejectProduct(id); toast.success('Product rejected'); } catch { toast.error('Failed to reject product'); } };
  const handleDelete = async (id: string) => { toast.warning('Permanently delete this product?', { description: 'This action cannot be undone.', action: { label: 'Delete', onClick: async () => { try { await deleteProduct(id); toast.success('Product deleted'); } catch { toast.error('Failed to delete product'); } } }, cancel: { label: 'Cancel', onClick: () => {} } }); };

  if (loading) {
    return <div className="flex min-h-screen bg-[#f9fafb]"><DashboardSidebar type="admin" /><div className="flex-1 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600" /></div></div>;
  }

  return (
    <div className="flex min-h-screen bg-[#f9fafb]">
      <DashboardSidebar type="admin" />
      <div className="flex-1 overflow-auto">
        <div className="bg-white border-b border-gray-200 px-8 py-6"><div className="flex items-center justify-between"><div><h1 className="text-3xl font-bold text-gray-900">Product Management</h1><p className="text-gray-600 mt-1">Review and approve farmer product listings</p></div><div className="bg-yellow-100 text-yellow-700 px-4 py-2 rounded-xl font-semibold text-sm">{products.filter(p => String(p.status).toLowerCase() === 'pending').length} Pending Approval</div></div></div>
        <div className="p-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6 flex items-center gap-3 flex-wrap"><span className="text-sm font-semibold text-gray-600">Filter:</span>{['All', 'pending', 'approved', 'rejected'].map((status) => <button key={status} onClick={() => setFilter(status)} className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${filter === status ? 'bg-[#16a34a] text-white shadow-sm' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>{status}</button>)}<div className="ml-auto text-sm text-gray-500">{filtered.length} {filtered.length === 1 ? 'product' : 'products'}</div></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((product: any, index) => (
              <motion.div key={product.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                <div className="relative aspect-video bg-gray-100"><ImageWithFallback src={product.image_url || product.image || 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=400'} alt={product.name} className="w-full h-full object-cover" /><div className="absolute top-3 left-3"><span className={`px-3 py-1 rounded-full text-xs font-bold ${String(product.status).toLowerCase() === 'approved' ? 'bg-green-500 text-white' : String(product.status).toLowerCase() === 'pending' ? 'bg-yellow-500 text-white' : 'bg-red-500 text-white'}`}>{product.status}</span></div>{product.grade && <div className="absolute top-3 right-3"><div className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-semibold text-xs ${product.grade === 'A' ? 'bg-green-500 text-white' : product.grade === 'B' ? 'bg-blue-500 text-white' : 'bg-gray-500 text-white'}`}><Award className="w-3 h-3" /> Grade {product.grade}</div></div>}</div>
                <div className="p-5"><div className="mb-3"><h3 className="font-bold text-gray-900 mb-1">{product.name}</h3><p className="text-xs text-gray-500">by {product.farmer?.full_name || product.farmer?.name || 'Farmer'}</p></div><div className="grid grid-cols-2 gap-3 mb-4"><div className="bg-gray-50 rounded-xl p-3"><p className="text-xs text-gray-500 mb-1">Category</p><p className="font-semibold text-gray-900 text-sm">{product.category}</p></div><div className="bg-gray-50 rounded-xl p-3"><p className="text-xs text-gray-500 mb-1">Quantity</p><p className="font-semibold text-gray-900 text-sm">{product.quantity} {product.unit}</p></div></div><div className="bg-green-50 rounded-xl p-3 mb-4"><p className="text-xs text-gray-500 mb-1">Price</p><p className="text-lg font-bold text-[#16a34a]">₹{Number(product.price_per_unit || 0)}/{product.unit}</p></div>{String(product.status).toLowerCase() === 'pending' ? <div className="flex gap-2"><button onClick={() => handleApprove(product.id)} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#16a34a] text-white rounded-xl font-semibold text-sm hover:bg-[#15803d] transition-colors"><CheckCircle2 className="w-4 h-4" /> Approve</button><button onClick={() => handleReject(product.id)} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-500 text-white rounded-xl font-semibold text-sm hover:bg-red-600 transition-colors"><XCircle className="w-4 h-4" /> Reject</button></div> : <div className="flex gap-2"><button className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-semibold text-sm hover:bg-gray-200 transition-colors"><Eye className="w-4 h-4" /> View</button><button onClick={() => handleDelete(product.id)} className="w-10 h-10 flex items-center justify-center bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors"><Trash2 className="w-4 h-4" /></button></div>}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
