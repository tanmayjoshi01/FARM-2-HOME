import { X, Download, CheckCircle, FileText } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface CertificatePreviewProps {
  isOpen: boolean;
  onClose: () => void;
  productName: string;
  grade: string;
  farmer: string;
  certificateUrl?: string;
}

export function CertificatePreview({
  isOpen,
  onClose,
  productName,
  grade,
  farmer,
  certificateUrl = "https://images.unsplash.com/photo-1554224311-beee4c27c9d0?w=800",
}: CertificatePreviewProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-[#16a34a] to-[#15803d] px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="font-bold text-white text-lg">Grading Certificate</h2>
                    <p className="text-green-100 text-sm">{productName}</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                {/* Certificate Info */}
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-[#16a34a] mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 mb-1">Certified Quality Product</p>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-gray-500">Grade: </span>
                          <span className="font-semibold text-gray-900">Grade {grade}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Farmer: </span>
                          <span className="font-semibold text-gray-900">{farmer}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Certified Date: </span>
                          <span className="font-semibold text-gray-900">March 18, 2026</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Valid Until: </span>
                          <span className="font-semibold text-gray-900">April 18, 2026</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Certificate Document Preview */}
                <div className="bg-gray-100 rounded-xl overflow-hidden border-2 border-gray-200">
                  <img
                    src={certificateUrl}
                    alt="Certificate Document"
                    className="w-full h-auto"
                  />
                </div>

                {/* Quality Metrics */}
                <div className="mt-6 grid grid-cols-3 gap-4">
                  <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-[#16a34a]">95%</div>
                    <div className="text-xs text-gray-500 mt-1">Quality Score</div>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-[#16a34a]">A+</div>
                    <div className="text-xs text-gray-500 mt-1">Freshness</div>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-[#16a34a]">✓</div>
                    <div className="text-xs text-gray-500 mt-1">Organic</div>
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 py-3 rounded-xl border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-100 transition-colors"
                >
                  Close
                </button>
                <button className="flex-1 py-3 rounded-xl bg-[#16a34a] text-white font-semibold hover:bg-[#15803d] transition-colors flex items-center justify-center gap-2 shadow-md shadow-green-200">
                  <Download className="w-4 h-4" />
                  Download PDF
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
