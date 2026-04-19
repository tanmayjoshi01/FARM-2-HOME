import { useState } from 'react';
import { Link } from 'react-router';
import { DashboardSidebar } from '../../components/DashboardSidebar';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';
import { useFarmerData } from '../../hooks/useFarmerData';
import { Edit, Trash2, Eye, Award, MoreVertical, Plus } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';

export function FarmerProducts() {
  const { products, loading, deleteProduct } = useFarmerData();
  const [filter, setFilter] = useState('All');

  const filtered = products.filter((product) => filter === 'All' || String(product.status).toLowerCase() === filter.toLowerCase());

  const handleDelete = async (productId: string) => {
    toast.warning('Delete this product?', {
      description: 'This action cannot be undone.',
      action: {
        label: 'Delete',
        onClick: async () => {
          try {
            await deleteProduct(productId);
            toast.success('Product deleted successfully');
          } catch (error) {
            toast.error('Failed to delete product');
          }
        },
      },
      cancel: {
        label: 'Cancel',
        onClick: () => {},
      },
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#f9fafb]">
        <DashboardSidebar type="farmer" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto" />
            <p className="mt-4 text-gray-600">Loading products...</p>
          </div>
        </div>
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
              <h1 className="text-3xl font-bold text-gray-900">My Products</h1>
              <p className="text-gray-600 mt-1">Manage your product listings</p>
            </div>
            <Link to="/farmer/add-product" className="bg-[#16a34a] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#15803d] transition-colors shadow-md shadow-green-200 flex items-center gap-2">
              <Plus className="w-5 h-5" /> Add New Product
            </Link>
          </div>
        </div>

        <div className="p-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6 flex items-center gap-3 flex-wrap">
            <span className="text-sm font-semibold text-gray-600">Filter:</span>
            {['All', 'pending', 'approved', 'rejected'].map((status) => (
              <button key={status} onClick={() => setFilter(status)} className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${filter === status ? 'bg-[#16a34a] text-white shadow-sm' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                {status}
              </button>
            ))}
            <div className="ml-auto text-sm text-gray-500">{filtered.length} {filtered.length === 1 ? 'product' : 'products'}</div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((product, index) => (
              <motion.div key={product.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                <div className="relative aspect-video bg-gray-100">
                  <ImageWithFallback src={product.image_url || product.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400'} alt={product.name} className="w-full h-full object-cover" />
                  <div className="absolute top-3 left-3"><span className={`px-3 py-1 rounded-full text-xs font-bold ${String(product.status).toLowerCase() === 'approved' ? 'bg-green-500 text-white' : String(product.status).toLowerCase() === 'pending' ? 'bg-yellow-500 text-white' : 'bg-red-500 text-white'}`}>{product.status}</span></div>
                  {product.grade && <div className="absolute top-3 right-3"><div className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-semibold text-xs ${product.grade === 'A' ? 'bg-green-500 text-white' : product.grade === 'B' ? 'bg-blue-500 text-white' : 'bg-gray-500 text-white'}`}><Award className="w-3 h-3" /> Grade {product.grade}</div></div>}
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 mb-1">{product.name}</h3>
                      <p className="text-xs text-gray-500">{product.category}</p>
                    </div>
                    <button className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors"><MoreVertical className="w-4 h-4 text-gray-600" /></button>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-gray-50 rounded-xl p-3"><p className="text-xs text-gray-500 mb-1">Quantity</p><p className="font-semibold text-gray-900">{product.quantity} {product.unit}</p></div>
                    <div className="bg-gray-50 rounded-xl p-3"><p className="text-xs text-gray-500 mb-1">Price</p><p className="font-semibold text-gray-900">₹{Number(product.price_per_unit || product.price || 0)}/{product.unit}</p></div>
                  </div>

                  <div className="flex gap-2">
                    <button className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-semibold text-sm hover:bg-gray-200 transition-colors"><Eye className="w-4 h-4" /> View</button>
                    <button className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#16a34a] text-white rounded-xl font-semibold text-sm hover:bg-[#15803d] transition-colors"><Edit className="w-4 h-4" /> Edit</button>
                    <button onClick={() => handleDelete(product.id)} className="w-10 h-10 flex items-center justify-center bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
