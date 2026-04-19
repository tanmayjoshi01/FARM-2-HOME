import { AlertCircle, ExternalLink, X } from "lucide-react";
import { useState, useEffect } from "react";

export function SupabaseSetupNotice() {
  const [isDismissed, setIsDismissed] = useState(false);
  
  const isConfigured = 
    import.meta.env.VITE_SUPABASE_URL && 
    import.meta.env.VITE_SUPABASE_ANON_KEY &&
    import.meta.env.VITE_SUPABASE_URL.startsWith('http') &&
    !import.meta.env.VITE_SUPABASE_URL.includes('YOUR_SUPABASE');

  // Check if user previously dismissed the notice
  useEffect(() => {
    const dismissed = localStorage.getItem('supabase-notice-dismissed');
    if (dismissed === 'true') {
      setIsDismissed(true);
    }
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem('supabase-notice-dismissed', 'true');
  };

  if (isConfigured || isDismissed) return null;

  return (
    <div className="bg-orange-50 border-l-4 border-orange-500 p-4 mb-6 relative">
      <button
        onClick={handleDismiss}
        className="absolute top-4 right-4 text-orange-700 hover:text-orange-900 transition-colors"
        aria-label="Dismiss"
      >
        <X className="w-5 h-5" />
      </button>
      
      <div className="flex items-start gap-3 pr-8">
        <AlertCircle className="w-6 h-6 text-orange-500 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="font-bold text-orange-900 mb-1">
            ⚙️ Demo Mode Active
          </h3>
          <p className="text-sm text-orange-800 mb-3">
            Running without backend. To enable authentication & data persistence, set up Supabase.
          </p>
          <div className="bg-white rounded-lg p-3 text-sm text-gray-700 mb-3 border border-orange-200">
            <p className="font-semibold mb-2">Quick Setup:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Create free account at <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-green-700 underline">supabase.com</a></li>
              <li>Copy <code className="bg-gray-100 px-1 rounded">.env.example</code> to <code className="bg-gray-100 px-1 rounded">.env</code></li>
              <li>Add credentials & run SQL migrations</li>
            </ol>
          </div>
          <a
            href="/QUICK_START.md"
            target="_blank"
            className="inline-flex items-center gap-2 text-sm font-semibold text-orange-700 hover:text-orange-900"
          >
            <ExternalLink className="w-4 h-4" />
            View Setup Guide
          </a>
        </div>
      </div>
    </div>
  );
}