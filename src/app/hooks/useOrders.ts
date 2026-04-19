import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../context/AuthContext';

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price_per_unit: number;
  total_price: number;
  product?: any;
}

export interface Order {
  id: string;
  user_id: string;
  total_amount: number;
  platform_fee: number;
  gst: number;
  delivery_fee: number;
  final_amount: number;
  delivery_address_id: string;
  payment_method: string;
  payment_status: 'pending' | 'completed' | 'failed';
  order_status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  created_at: string;
  items?: OrderItem[];
  address?: any;
  tracking?: any[];
  tracking_number?: string;
}

function generateTrackingNumber() {
  return `F2H${Date.now().toString().slice(-8)}`;
}

export function useOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const mapOrder = (order: any): Order => {
    const resolvedFinalAmount = Number(
      order?.final_amount ?? order?.total ?? order?.total_amount ?? 0
    );

    const resolvedAddress =
      (Array.isArray(order?.address) ? order.address[0] : order?.address) ||
      (Array.isArray(order?.delivery_address) ? order.delivery_address[0] : order?.delivery_address) ||
      null;

    const trackingEntries = Array.isArray(order?.tracking) ? order.tracking : [];
    const latestTracking = [...trackingEntries].sort((a: any, b: any) => {
      const aTime = new Date(a?.updated_at || 0).getTime();
      const bTime = new Date(b?.updated_at || 0).getTime();
      return bTime - aTime;
    })[0];

    return {
      ...order,
      user_id: order?.user_id || order?.buyer_id,
      total_amount: Number(order?.total_amount ?? order?.subtotal ?? 0),
      delivery_fee: Number(order?.delivery_fee ?? order?.delivery_charge ?? 0),
      final_amount: resolvedFinalAmount,
      delivery_address_id: order?.delivery_address_id || order?.address_id,
      payment_method: order?.payment_method || 'upi',
      order_status: (order?.order_status || order?.status || 'pending') as Order['order_status'],
      payment_status: (order?.payment_status || 'pending') as Order['payment_status'],
      address: resolvedAddress,
      tracking: trackingEntries,
      tracking_number: latestTracking?.tracking_number,
    } as Order;
  };

  const fetchOrders = async () => {
    if (!user) {
      setOrders([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          items:order_items(
            *,
            product:products(*)
          ),
          address:addresses!orders_address_id_fkey(*),
          delivery_address:addresses!orders_delivery_address_id_fkey(*),
          tracking:tracking(*)
        `)
        .or(`user_id.eq.${user.id},buyer_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders((data || []).map(mapOrder));
      setError(null);
    } catch (err: any) {
      console.error('Error fetching orders:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createOrder = async (orderData: {
    items: Array<{ product_id: string; quantity: number; price_per_unit: number }>;
    total_amount: number;
    platform_fee: number;
    gst: number;
    delivery_fee: number;
    final_amount: number;
    delivery_address_id: string;
    payment_method: string;
  }) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          total_amount: orderData.total_amount,
          platform_fee: orderData.platform_fee,
          gst: orderData.gst,
          delivery_fee: orderData.delivery_fee,
          final_amount: orderData.final_amount,
          delivery_address_id: orderData.delivery_address_id,
          payment_method: orderData.payment_method,
          payment_status: 'completed',
          order_status: 'pending',
        })
        .select()
        .single();

      if (orderError) throw orderError;

      const orderItems = orderData.items.map((item) => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price_per_unit: item.price_per_unit,
        total_price: item.quantity * item.price_per_unit,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      const trackingNumber = generateTrackingNumber();
      const { error: trackingError } = await supabase
        .from('tracking')
        .insert({
          order_id: order.id,
          tracking_number: trackingNumber,
          status: 'received',
          location: 'Order received',
        });

      if (trackingError) throw trackingError;

      return { ...order, tracking_number: trackingNumber };
    } catch (err: any) {
      console.error('Error creating order:', err);
      throw err;
    }
  };

  const getOrder = async (orderId: string) => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          items:order_items(
            *,
            product:products(*)
          ),
          address:addresses!orders_address_id_fkey(*),
          delivery_address:addresses!orders_delivery_address_id_fkey(*),
          tracking:tracking(*)
        `)
        .eq('id', orderId)
        .single();

      if (error) throw error;
      return mapOrder(data);
    } catch (err: any) {
      console.error('Error fetching order:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const interval = window.setInterval(() => {
      fetchOrders();
    }, 8000);

    return () => window.clearInterval(interval);
  }, [user]);

  return {
    orders,
    loading,
    error,
    createOrder,
    getOrder,
    refetch: fetchOrders,
  };
}
