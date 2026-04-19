import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase, calculateOrderTotals, generateOrderNumber } from "../../lib/supabase";
import { useAuth } from "./AuthContext";

export interface CartItem {
  id: string; // cart_item id
  product_id: string;
  name: string;
  farmer: string;
  price: number;
  unit: string;
  image: string;
  category: string;
  quantity: number;
}

interface CartContextType {
  cartItems: CartItem[];
  loading: boolean;
  addItem: (productId: string, quantity?: number) => Promise<void>;
  removeItem: (cartItemId: string) => Promise<void>;
  updateQuantity: (cartItemId: string, qty: number) => Promise<void>;
  clearCart: () => Promise<void>;
  totalItems: number;
  checkout: (addressId: string) => Promise<{ success: boolean; orderId?: string; orderNumber?: string }>;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [cartId, setCartId] = useState<string | null>(null);

  // Load cart when user logs in
  useEffect(() => {
    if (isAuthenticated && user) {
      loadCart();
      
      // Subscribe to cart changes for real-time sync
      const subscription = supabase
        .channel('cart_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'cart_items',
          },
          () => {
            loadCart(); // Reload on any cart change
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    } else {
      setCartItems([]);
      setCartId(null);
    }
  }, [isAuthenticated, user]);

  const ensureCart = async (): Promise<string> => {
    if (!user) {
      throw new Error("Please log in to add items to cart");
    }

    const { data: existingCart, error: existingCartError } = await supabase
      .from("carts")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (existingCartError) {
      throw existingCartError;
    }

    if (existingCart?.id) {
      setCartId(existingCart.id);
      return existingCart.id;
    }

    const { data: newCart, error: createCartError } = await supabase
      .from("carts")
      .insert({ user_id: user.id })
      .select("id")
      .single();

    if (createCartError) {
      throw createCartError;
    }

    setCartId(newCart.id);
    return newCart.id;
  };

  const loadCart = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const resolvedCartId = await ensureCart();

      // Load cart items with product details
      const { data: items, error: itemsError } = await supabase
        .from("cart_items")
        .select(`
          id,
          quantity,
          product_id,
          products (
            id,
            name,
              farmer_id,
            price_per_unit,
            unit,
            image_url,
            category,
            users!products_farmer_id_fkey (
                full_name,
                email
            )
          )
        `)
        .eq("cart_id", resolvedCartId);

      if (itemsError) throw itemsError;

      const formattedItems: CartItem[] = (items || [])
        .map((item: any) => {
          const product = item.products;
          if (!product) return null;

          return {
            id: item.id,
            product_id: product.id,
            name: product.name,
            farmer: product.users?.full_name || "Farmer",
            price: parseFloat(product.price_per_unit),
            unit: product.unit,
            image: product.image_url,
            category: product.category,
            quantity: item.quantity,
          } as CartItem;
        })
        .filter(Boolean) as CartItem[];

      setCartItems(formattedItems);
    } catch (error) {
      console.error("Error loading cart:", error);
    } finally {
      setLoading(false);
    }
  };

  const addItem = async (productId: string, quantity: number = 1) => {
    if (!user) {
      throw new Error("Please log in to add items to cart");
    }

    try {
      const resolvedCartId = await ensureCart();

      const { data: existingItem, error: existingError } = await supabase
        .from("cart_items")
        .select("id, quantity")
        .eq("cart_id", resolvedCartId)
        .eq("product_id", productId)
        .maybeSingle();

      if (existingError) throw existingError;

      if (existingItem) {
        // Update quantity
        const { error: updateError } = await supabase
          .from("cart_items")
          .update({ quantity: Number(existingItem.quantity) + quantity })
          .eq("id", existingItem.id);

        if (updateError) throw updateError;
      } else {
        // Insert new item
        const { error } = await supabase.from("cart_items").insert({
          cart_id: resolvedCartId,
          product_id: productId,
          quantity,
        });

        if (error) throw error;
      }

      await loadCart();
    } catch (error) {
      console.error("Error adding to cart:", error);
      throw error;
    }
  };

  const removeItem = async (cartItemId: string) => {
    try {
      const { error } = await supabase
        .from("cart_items")
        .delete()
        .eq("id", cartItemId);

      if (error) throw error;
      setCartItems((prev) => prev.filter((item) => item.id !== cartItemId));
    } catch (error) {
      console.error("Error removing item:", error);
      throw error;
    }
  };

  const updateQuantity = async (cartItemId: string, qty: number) => {
    if (qty < 1) {
      await removeItem(cartItemId);
      return;
    }

    try {
      const { error } = await supabase
        .from("cart_items")
        .update({ quantity: qty })
        .eq("id", cartItemId);

      if (error) throw error;
      
      setCartItems((prev) =>
        prev.map((item) =>
          item.id === cartItemId ? { ...item, quantity: qty } : item
        )
      );
    } catch (error) {
      console.error("Error updating quantity:", error);
      throw error;
    }
  };

  const clearCart = async () => {
    if (!cartId) return;

    try {
      const { error } = await supabase
        .from("cart_items")
        .delete()
        .eq("cart_id", cartId);

      if (error) throw error;
      setCartItems([]);
    } catch (error) {
      console.error("Error clearing cart:", error);
      throw error;
    }
  };

  const checkout = async (addressId: string) => {
    if (!user) throw new Error("User not authenticated");
    if (cartItems.length === 0) throw new Error("Cart is empty");

    try {
      // Group items by farmer
      const itemsByFarmer = cartItems.reduce((acc, item) => {
        // We need to get farmer_id from the product
        const key = item.farmer; // Using farmer name as key for now
        if (!acc[key]) acc[key] = [];
        acc[key].push(item);
        return acc;
      }, {} as Record<string, CartItem[]>);

      // For simplicity, create one order per farmer
      // In production, you'd use the checkout_cart RPC function
      const orderIds: string[] = [];

      for (const [farmerName, items] of Object.entries(itemsByFarmer)) {
        // Get farmer_id from first item
        const { data: productData } = await supabase
          .from("products")
          .select("farmer_id")
          .eq("id", items[0].product_id)
          .single();

        if (!productData) continue;

        const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const { platformFee, gst, delivery, total } = calculateOrderTotals(subtotal);
        const orderNumber = generateOrderNumber();

        // Create order
        const { data: orderData, error: orderError } = await supabase
          .from("orders")
          .insert({
            order_number: orderNumber,
            buyer_id: user.id,
            farmer_id: productData.farmer_id,
            address_id: addressId,
            order_type: "direct",
            subtotal,
            platform_fee: platformFee,
            gst,
            delivery_charge: delivery,
            total,
            status: "pending",
            payment_status: "completed",
          })
          .select("id")
          .single();

        if (orderError) throw orderError;

        // Create order items
        const orderItems = items.map((item) => ({
          order_id: orderData.id,
          product_id: item.product_id,
          product_name: item.name,
          quantity: item.quantity,
          unit: item.unit,
          price_per_unit: item.price,
          total_price: item.price * item.quantity,
        }));

        const { error: itemsError } = await supabase
          .from("order_items")
          .insert(orderItems);

        if (itemsError) throw itemsError;

        // Optional side effects: do not fail checkout if policies block these.
        const { error: trackingError } = await supabase.from("tracking").insert({
          order_id: orderData.id,
          status: "received",
          location: "Farm2Home Hub",
          message: "Your order has been received",
        });

        if (trackingError) {
          console.warn("Tracking insert skipped:", trackingError.message);
        }

        const { error: notificationError } = await supabase.from("notifications").insert({
          user_id: productData.farmer_id,
          title: "New Order Received!",
          message: `Order ${orderNumber} - ₹${total}`,
          type: "order",
          related_id: orderData.id,
        });

        if (notificationError) {
          console.warn("Notification insert skipped:", notificationError.message);
        }

        orderIds.push(orderData.id);
      }

      // Clear cart
      await clearCart();

      return {
        success: true,
        orderId: orderIds[0],
        orderNumber: cartItems.length > 0 ? "Multiple orders created" : undefined,
      };
    } catch (error) {
      console.error("Error during checkout:", error);
      throw error;
    }
  };

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        loading,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        checkout,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
