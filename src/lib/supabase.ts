import { createClient } from '@supabase/supabase-js';

// These will be set via environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  '';

// Check if environment variables are set
const isSupabaseConfigured = supabaseUrl && supabaseAnonKey && 
  supabaseUrl.startsWith('http') && 
  !supabaseUrl.includes('YOUR_SUPABASE');

// Create a mock client for development when Supabase is not configured
let hasWarnedOnce = false;

const createMockQuery = (result: { data: any; error: Error }) => {
  const query: any = {
    select: () => query,
    insert: () => query,
    update: () => query,
    delete: () => query,
    eq: () => query,
    in: () => query,
    or: () => query,
    order: () => query,
    limit: () => query,
    range: () => query,
    maybeSingle: async () => result,
    single: async () => result,
    then: (resolve: any, reject: any) => Promise.resolve(result).then(resolve, reject),
    catch: (reject: any) => Promise.resolve(result).catch(reject),
    finally: (handler: any) => Promise.resolve(result).finally(handler),
  };

  return query;
};

const createMockClient = () => {
  // Only show warning once to avoid console spam (unless in explicit demo mode)
  const isDemoMode = import.meta.env.VITE_MODE === 'demo';
  
  if (!hasWarnedOnce && !isDemoMode) {
    console.info('ℹ️ Running in demo mode - Supabase not configured');
    console.info('💡 To enable backend features, see QUICK_START.md');
    console.info('💡 To hide this message, set VITE_MODE=demo in .env.local');
    hasWarnedOnce = true;
  }
  
  // Return a minimal mock that won't crash the app
  return {
    auth: {
      signUp: async () => ({ data: null, error: new Error('Supabase not configured') }),
      signInWithPassword: async () => ({ data: null, error: new Error('Supabase not configured') }),
      signOut: async () => ({ error: null }),
      getSession: async () => ({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    },
    from: () => createMockQuery({ data: null, error: new Error('Supabase not configured') }),
    storage: {
      from: () => ({
        upload: async () => ({ data: null, error: new Error('Supabase not configured') }),
        getPublicUrl: () => ({ data: { publicUrl: 'https://via.placeholder.com/400' } }),
        createSignedUrl: async () => ({ data: null, error: new Error('Supabase not configured') }),
      }),
    },
    channel: () => ({
      on: () => ({ subscribe: () => ({}) }),
      subscribe: () => ({}),
      unsubscribe: () => {},
    }),
    removeChannel: () => ({}),
  } as any;
};

export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createMockClient();

// Helper to upload product images
export async function uploadProductImage(file: File): Promise<string> {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `products/${fileName}`;

    const { error } = await supabase.storage
      .from('farm2home-products')
      .upload(filePath, file);

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('farm2home-products')
      .getPublicUrl(filePath);

    return publicUrl;
  } catch (error: any) {
    console.error('Image upload failed:', error);
    throw new Error(`Failed to upload image: ${error.message}`);
  }
}

// Helper to upload certificates
export async function uploadCertificate(file: File, productId: string): Promise<string> {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${productId}_${Date.now()}.${fileExt}`;
    const filePath = `certificates/${fileName}`;

    const { error } = await supabase.storage
      .from('farm2home-certificates')
      .upload(filePath, file);

    if (error) throw error;

    const { data: signedData, error: signedError } = await supabase.storage
      .from('farm2home-certificates')
      .createSignedUrl(filePath, 60 * 60 * 24 * 365);

    if (signedError) throw signedError;

    return signedData.signedUrl;
  } catch (error: any) {
    console.error('Certificate upload failed:', error);
    throw new Error(`Failed to upload certificate: ${error.message}`);
  }
}

// Helper to get signed URL for certificate
export async function getCertificateUrl(path: string, expiresIn: number = 3600) {
  const { data, error } = await supabase.storage
    .from('certificates')
    .createSignedUrl(path, expiresIn);

  if (error) throw error;
  return data.signedUrl;
}

// Helper to generate order number
export function generateOrderNumber(): string {
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  const num = Math.floor(Math.random() * 1000);
  return `F2H${random}${num}`;
}

// Helper to calculate order totals
export function calculateOrderTotals(subtotal: number) {
  const platformFee = Math.round(subtotal * 0.03 * 100) / 100;
  const gst = Math.round(subtotal * 0.18 * 100) / 100;
  const delivery = subtotal > 500 ? 0 : 49;
  const total = Math.round((subtotal + platformFee + gst + delivery) * 100) / 100;

  return {
    subtotal,
    platformFee,
    gst,
    delivery,
    total,
  };
}