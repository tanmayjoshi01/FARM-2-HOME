import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";

export interface Product {
  id: string;
  name: string;
  farmer: string;
  farmer_id: string;
  auction_id?: string;
  price: number;
  unit: string;
  image: string;
  category: string;
  grade?: "A" | "B" | "C";
  description?: string;
  quantity: number;
  has_certificate: boolean;
  location?: string;
}

export function useProducts(filter?: "all" | "auction" | "direct", searchQuery?: string) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isTransientAuthLockError = (err: any) => {
    const message = String(err?.message || "").toLowerCase();
    return message.includes("auth-token") && message.includes("stole it");
  };

  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  useEffect(() => {
    loadProducts();
  }, [filter, searchQuery]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          // Build query for approved products only
          let query = supabase
            .from("products")
            .select(`
              *,
              users!products_farmer_id_fkey (
                full_name,
                id
              )
            `)
            .eq("status", "approved");

          // Apply search filter
          if (searchQuery) {
            query = query.or(`name.ilike.%${searchQuery}%,category.ilike.%${searchQuery}%`);
          }

          const { data, error: queryError } = await query.order("created_at", { ascending: false });

          if (queryError) throw queryError;

          // Check which products are in active auctions
          const { data: auctionData } = await supabase
            .from("auctions")
            .select("id, product_id")
            .in("status", ["scheduled", "live"]);

          const auctionMap = new Map<string, string>((auctionData || []).map((a: any) => [String(a.product_id), String(a.id)]));

          // Format products
          let formattedProducts: Product[] = (data || []).map((p: any) => {
            const farmerProfile = p.users || {};

            return {
              id: p.id,
              name: p.name,
              farmer: farmerProfile.full_name || "Farmer",
              farmer_id: farmerProfile.id || p.farmer_id,
              auction_id: auctionMap.get(String(p.id)),
              price: parseFloat(p.price_per_unit),
              unit: p.unit,
              image: p.image_url || "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400",
              category: p.category,
              grade: p.grade,
              description: p.description,
              quantity: p.quantity,
              has_certificate: p.has_certificate,
              location: p.location,
              type: auctionMap.has(String(p.id)) ? "auction" : "direct",
            };
          });

          // Apply filter
          if (filter && filter !== "all") {
            formattedProducts = formattedProducts.filter((p: any) => p.type === filter);
          }

          setProducts(formattedProducts);
          setError(null);
          return;
        } catch (innerError: any) {
          if (attempt === 0 && isTransientAuthLockError(innerError)) {
            await sleep(120);
            continue;
          }
          throw innerError;
        }
      }
    } catch (err: any) {
      console.error("Error loading products:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { products, loading, error, refetch: loadProducts };
}
