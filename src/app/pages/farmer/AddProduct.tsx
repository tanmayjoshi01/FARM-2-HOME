import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { DashboardSidebar } from '../../components/DashboardSidebar';
import { useFarmerData } from '../../hooks/useFarmerData';
import { uploadProductImage, uploadCertificate } from '../../../lib/supabase';
import { motion } from 'motion/react';
import { Upload, FileText, CheckCircle2, X } from 'lucide-react';
import { toast } from 'sonner';

export function FarmerAddProduct() {
  const FALLBACK_IMAGE_URL = 'https://via.placeholder.com/600x400?text=Farm2Home+Product';
  const navigate = useNavigate();
  const { addProduct } = useFarmerData();
  const [submitting, setSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [certificateFile, setCertificateFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [certificateName, setCertificateName] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    quantity: '',
    unit: 'kg',
    description: '',
    grade: 'A',
    organic: false,
  });

  const handleImageChange = (file: File | null) => {
    setImageFile(file);
    setImagePreview(file ? URL.createObjectURL(file) : null);
  };

  const handleCertificateChange = (file: File | null) => {
    setCertificateFile(file);
    setCertificateName(file ? file.name : null);
  };

  const canSubmit = useMemo(() => {
    return formData.name && formData.category && formData.price && formData.quantity;
  }, [formData]);

  const withTimeout = async <T,>(promise: Promise<T>, timeoutMs: number, timeoutMessage: string): Promise<T> => {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        setTimeout(() => reject(new Error(timeoutMessage)), timeoutMs);
      }),
    ]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      let imageUrl = '';
      // Image upload is optional - only attempt if file is provided
      if (imageFile) {
        try {
          imageUrl = await withTimeout(
            uploadProductImage(imageFile),
            12000,
            'Image upload timed out. Continuing without image.'
          );
        } catch (uploadError) {
          console.warn('Image upload failed, continuing without image:', uploadError);
          toast.warning('Image upload failed, but product will be created');
        }
      }

      const product = await withTimeout(
        addProduct({
          name: formData.name,
          category: formData.organic ? 'Organic' : formData.category,
          price_per_unit: parseFloat(formData.price),
          quantity: parseFloat(formData.quantity),
          unit: formData.unit,
          description: formData.description,
          grade: formData.grade,
          image_url: imageUrl || FALLBACK_IMAGE_URL,
          has_certificate: !!certificateFile,
        }),
        15000,
        'Submit timed out. Please check network and try again.'
      );

      if (certificateFile) {
        try {
          await withTimeout(
            uploadCertificate(certificateFile, product.id),
            12000,
            'Certificate upload timed out. Product already created.'
          );
        } catch (certError) {
          console.warn('Certificate upload failed:', certError);
          toast.warning('Certificate upload failed, but product was created');
        }
      }

      toast.success('Product submitted for approval successfully');
      navigate('/farmer/products');
    } catch (error) {
      console.error('Failed to add product:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to add product');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const target = e.target as HTMLInputElement;
    setFormData((prev) => ({
      ...prev,
      [target.name]: target.type === 'checkbox' ? target.checked : target.value,
    }));
  };

  return (
    <div className="flex min-h-screen bg-[#f9fafb]">
      <DashboardSidebar type="farmer" />
      <div className="flex-1 overflow-auto">
        <div className="bg-white border-b border-gray-200 px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Add New Product</h1>
          <p className="text-gray-600 mt-1">List your fresh produce on the marketplace</p>
        </div>

        <div className="p-8">
          <div className="max-w-4xl">
            <form onSubmit={handleSubmit} className="space-y-6">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="font-bold text-gray-900 text-lg mb-4">Product Image</h2>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center transition-all">
                  {imagePreview ? (
                    <div className="flex flex-col items-center gap-3">
                      <img src={imagePreview} alt="Preview" className="max-h-64 rounded-xl" />
                      <button type="button" onClick={() => handleImageChange(null)} className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-1"><X className="w-4 h-4" /> Remove Image</button>
                    </div>
                  ) : (
                    <div>
                      <div className="w-20 h-20 bg-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-4"><Upload className="w-10 h-10 text-gray-500" /></div>
                      <p className="font-semibold text-gray-700 mb-2">Upload product image</p>
                      <input type="file" accept="image/*" onChange={(e) => handleImageChange(e.target.files?.[0] || null)} className="block mx-auto text-sm text-gray-500" />
                    </div>
                  )}
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="font-bold text-gray-900 text-lg mb-4">Product Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Product Name *</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#16a34a]" required />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Category *</label>
                    <select name="category" value={formData.category} onChange={handleChange} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#16a34a]" required>
                      <option value="">Select category</option>
                      <option value="Vegetables">Vegetables</option>
                      <option value="Fruits">Fruits</option>
                      <option value="Grains">Grains</option>
                      <option value="Dairy">Dairy</option>
                      <option value="Organic">Organic</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Grade</label>
                    <select name="grade" value={formData.grade} onChange={handleChange} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#16a34a]">
                      <option value="A">Grade A</option>
                      <option value="B">Grade B</option>
                      <option value="C">Grade C</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Price per Unit (₹) *</label>
                    <input type="number" name="price" value={formData.price} onChange={handleChange} min="0" step="0.01" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#16a34a]" required />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Quantity Available *</label>
                    <input type="number" name="quantity" value={formData.quantity} onChange={handleChange} min="0" step="0.1" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#16a34a]" required />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Unit *</label>
                    <select name="unit" value={formData.unit} onChange={handleChange} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#16a34a]">
                      <option value="kg">Kilograms (kg)</option>
                      <option value="quintal">Quintal</option>
                      <option value="bundle">Bundle</option>
                      <option value="piece">Piece</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                    <textarea name="description" value={formData.description} onChange={handleChange} rows={4} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#16a34a] resize-none" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" name="organic" checked={formData.organic} onChange={handleChange} className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500" />
                      <span className="text-sm font-medium text-gray-700">Organic Product</span>
                    </label>
                  </div>
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="font-bold text-gray-900 text-lg mb-4">Quality Certificate</h2>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center">
                  {certificateName ? (
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 bg-[#16a34a] rounded-2xl flex items-center justify-center"><CheckCircle2 className="w-8 h-8 text-white" /></div>
                      <p className="font-semibold text-gray-900">Certificate Selected</p>
                      <p className="text-sm text-gray-600 flex items-center gap-2"><FileText className="w-4 h-4 text-[#16a34a]" />{certificateName}</p>
                      <button type="button" onClick={() => handleCertificateChange(null)} className="text-sm text-red-600 hover:text-red-700 font-medium">Remove Certificate</button>
                    </div>
                  ) : (
                    <div>
                      <p className="font-semibold text-gray-700 mb-2">Upload quality certificate (optional)</p>
                      <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => handleCertificateChange(e.target.files?.[0] || null)} className="block mx-auto text-sm text-gray-500" />
                    </div>
                  )}
                </div>
              </motion.div>

              <div className="flex gap-4">
                <button type="button" onClick={() => navigate('/farmer/products')} className="flex-1 py-4 rounded-xl border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors">Cancel</button>
                <button type="submit" disabled={submitting || !canSubmit} className="flex-1 py-4 rounded-xl bg-[#16a34a] text-white font-semibold hover:bg-[#15803d] transition-colors disabled:opacity-50 shadow-md shadow-green-200">{submitting ? 'Submitting...' : 'Submit for Approval'}</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
