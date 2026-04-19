import { useState } from "react";
import { X, Upload, FileText, CheckCircle, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";

interface UploadCertificateProps {
  isOpen: boolean;
  onClose: () => void;
  productName: string;
}

export function UploadCertificate({
  isOpen,
  onClose,
  productName,
}: UploadCertificateProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [grade, setGrade] = useState("A");

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    // Simulate file upload
    setUploadedFile("certificate_sample.pdf");
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0].name);
    }
  };

  const handleSubmit = () => {
    // Simulate upload
    toast.success("Certificate uploaded successfully!");
    onClose();
  };

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
              className="bg-white rounded-2xl shadow-2xl max-w-lg w-full"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-[#16a34a] to-[#15803d] px-6 py-4 flex items-center justify-between rounded-t-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <Upload className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="font-bold text-white text-lg">Upload Grading Certificate</h2>
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
              <div className="p-6">
                {/* Info Alert */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-900">
                    <p className="font-semibold mb-1">Certificate Requirements:</p>
                    <ul className="text-xs space-y-1 text-blue-700">
                      <li>• Accepted formats: PDF, JPG, PNG</li>
                      <li>• Maximum file size: 5MB</li>
                      <li>• Must be issued by certified grading authority</li>
                    </ul>
                  </div>
                </div>

                {/* Grade Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Product Grade
                  </label>
                  <div className="flex gap-3">
                    {["A", "B", "C"].map((g) => (
                      <button
                        key={g}
                        onClick={() => setGrade(g)}
                        className={`flex-1 py-3 rounded-xl font-bold text-lg transition-all ${
                          grade === g
                            ? "bg-[#16a34a] text-white shadow-md shadow-green-200"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        Grade {g}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Select the quality grade as per certification standards
                  </p>
                </div>

                {/* Upload Area */}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                    isDragging
                      ? "border-[#16a34a] bg-green-50"
                      : uploadedFile
                      ? "border-green-300 bg-green-50"
                      : "border-gray-300 bg-gray-50"
                  }`}
                >
                  {uploadedFile ? (
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-[#16a34a] rounded-2xl flex items-center justify-center mb-4">
                        <CheckCircle className="w-8 h-8 text-white" />
                      </div>
                      <p className="font-semibold text-gray-900 mb-1">File Uploaded</p>
                      <p className="text-sm text-gray-600 mb-4 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-[#16a34a]" />
                        {uploadedFile}
                      </p>
                      <button
                        onClick={() => setUploadedFile(null)}
                        className="text-sm text-red-600 hover:text-red-700 font-medium"
                      >
                        Remove File
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="w-16 h-16 bg-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Upload className="w-8 h-8 text-gray-500" />
                      </div>
                      <p className="font-semibold text-gray-700 mb-1">
                        Drag & drop your certificate here
                      </p>
                      <p className="text-sm text-gray-500 mb-4">or</p>
                      <label className="inline-block">
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={handleFileSelect}
                          className="hidden"
                        />
                        <span className="inline-block bg-[#16a34a] text-white px-6 py-2.5 rounded-xl font-semibold text-sm cursor-pointer hover:bg-[#15803d] transition-colors">
                          Browse Files
                        </span>
                      </label>
                      <p className="text-xs text-gray-400 mt-3">
                        PDF, JPG or PNG (Max 5MB)
                      </p>
                    </>
                  )}
                </div>
              </div>

              {/* Footer Actions */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex gap-3 rounded-b-2xl">
                <button
                  onClick={onClose}
                  className="flex-1 py-3 rounded-xl border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!uploadedFile}
                  className={`flex-1 py-3 rounded-xl font-semibold transition-colors ${
                    uploadedFile
                      ? "bg-[#16a34a] text-white hover:bg-[#15803d] shadow-md shadow-green-200"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  Upload Certificate
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
