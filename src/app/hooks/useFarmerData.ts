import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../context/AuthContext';

export function useFarmerData() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalRevenue: 0,
    totalOrders: 0,
    pendingApproval: 0,
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const normalizeDeliveryStatus = (status: string | null | undefined) => {
    const value = String(status || '').toLowerCase();
    if (['pending', 'received', 'confirmed', 'order received', 'order_placed'].includes(value)) return 'received';
    if (['packing', 'packed', 'processing'].includes(value)) return 'packing';
    if (['in transit', 'in_transit', 'shipped', 'dispatched'].includes(value)) return 'in_transit';
    if (['out for delivery', 'out_for_delivery'].includes(value)) return 'out_for_delivery';
    if (['delivered'].includes(value)) return 'delivered';
    return value || 'received';
  };

  useEffect(() => {
    if (!user || user.role !== 'farmer') {
      setLoading(false);
      return;
    }

    fetchFarmerData();
  }, [user]);

  useEffect(() => {
    if (!user || user.role !== 'farmer') return;

    const interval = window.setInterval(() => {
      fetchFarmerData();
    }, 8000);

    return () => window.clearInterval(interval);
  }, [user]);

  const fetchFarmerData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('farmer_id', user.id)
        .order('created_at', { ascending: false });

      if (productsError) throw productsError;
      setProducts(productsData || []);

      const productIds = (productsData || []).map((product: any) => product.id);
      let orderItemsData: any[] = [];

      if (productIds.length > 0) {
        // Fetch order_items to get order IDs
        const { data: itemsData, error: itemsError } = await supabase
          .from('order_items')
          .select('*,order_id,product:products(*)')
          .in('product_id', productIds);

        if (itemsError) throw itemsError;
        orderItemsData = itemsData || [];

        // Extract unique order IDs
        const orderIds = [...new Set((orderItemsData || []).map((item: any) => item.order_id))];

        // Fetch full orders with buyer relations (similar to admin)
        if (orderIds.length > 0) {
          const { data: ordersData, error: ordersError } = await supabase
            .from('orders')
            .select(`
              *,
              buyer:users!orders_buyer_id_fkey(full_name, email),
              user_buyer:users!orders_user_id_fkey(full_name, email),
              address:addresses!orders_address_id_fkey(*),
              delivery_address:addresses!orders_delivery_address_id_fkey(*),
              tracking:tracking(*)
            `)
            .in('id', orderIds);

          if (ordersError) throw ordersError;

          // Map orders back into orderItemsData
          const ordersMap = new Map((ordersData || []).map((o: any) => [o.id, o]));
          orderItemsData = (orderItemsData || []).map((item: any) => ({
            ...item,
            order: ordersMap.get(item.order_id) || item.order,
          }));
        }
      }

      const totalProducts = productsData?.length || 0;
      const pendingApproval = productsData?.filter((product: any) => product.status === 'pending').length || 0;
      const totalOrders = orderItemsData.length;
      const totalRevenue = orderItemsData.reduce((sum, item) => sum + Number(item.total_price || 0), 0);

      const mappedOrders = orderItemsData.map((item) => {
        const resolvedAddress = item.order?.delivery_address || item.order?.address || null;
        const resolvedBuyer = item.order?.buyer || item.order?.user_buyer || null;
        const trackingEntries = Array.isArray(item.order?.tracking) ? item.order.tracking : [];
        const latestTracking = [...trackingEntries].sort((a: any, b: any) => {
          const aTime = new Date(a?.updated_at || 0).getTime();
          const bTime = new Date(b?.updated_at || 0).getTime();
          return bTime - aTime;
        })[0];

        const resolvedStatus = normalizeDeliveryStatus(item.order?.order_status || item.order?.status || latestTracking?.status || 'received');

        return {
          id: item.order?.id || item.id,
          orderNumber: item.order?.order_number,
          product: item.product?.name || 'Product',
          buyer: resolvedBuyer?.full_name || resolvedBuyer?.name || 'Customer',
          buyerEmail: resolvedBuyer?.email || null,
          city: resolvedAddress?.city || item.order?.delivery_city || 'Unknown',
          quantity: `${item.quantity}${item.product?.unit ? ` ${item.product.unit}` : ''}`,
          quantityValue: Number(item.quantity || 0),
          amount: Number(item.total_price || 0),
          status: resolvedStatus,
          trackingStatus: resolvedStatus,
          trackingNumber: latestTracking?.tracking_number,
          trackingMessage: latestTracking?.message || null,
          trackingLocation: latestTracking?.location || null,
          date: item.order?.created_at ? new Date(item.order.created_at).toLocaleDateString() : new Date(item.created_at).toLocaleDateString(),
          address: resolvedAddress ? [resolvedAddress.address_line, resolvedAddress.city, resolvedAddress.state, resolvedAddress.pincode].filter(Boolean).join(', ') : 'Unknown',
          addressDetails: resolvedAddress,
          orderDate: item.order?.created_at ? new Date(item.order.created_at).toLocaleDateString() : new Date(item.created_at).toLocaleDateString(),
          deliveryDate: item.order?.updated_at ? new Date(item.order.updated_at).toLocaleDateString() : undefined,
          unit: item.product?.unit || 'kg',
          paymentMethod: item.order?.payment_method || 'upi',
          paymentStatus: item.order?.payment_status || 'pending',
          createdAtRaw: item.order?.created_at || item.created_at,
        };
      });

      mappedOrders.sort((a, b) => {
        const timeA = new Date(a.createdAtRaw).getTime();
        const timeB = new Date(b.createdAtRaw).getTime();
        return timeB - timeA;
      });

      const recentOrdersData = mappedOrders.slice(0, 10);

      const revenueByProduct = new Map<string, { name: string; sold: number; revenue: number }>();
      orderItemsData.forEach((item) => {
        const productId = item.product_id;
        const current = revenueByProduct.get(productId) || {
          name: item.product?.name || 'Product',
          sold: 0,
          revenue: 0,
        };
        revenueByProduct.set(productId, {
          name: current.name,
          sold: current.sold + Number(item.quantity || 0),
          revenue: current.revenue + Number(item.total_price || 0),
        });
      });

      const topProductsData = Array.from(revenueByProduct.values())
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 3);

      setStats({
        totalProducts,
        totalRevenue,
        totalOrders,
        pendingApproval,
      });
      setOrders(mappedOrders);
      setRecentOrders(recentOrdersData);
      setTopProducts(topProductsData);
    } catch (error) {
      console.error('Error fetching farmer data:', error);
    } finally {
      setLoading(false);
    }
  };

  const addProduct = async (productData: any) => {
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('products')
      .insert({
        ...productData,
        farmer_id: user.id,
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      const message = (error.message || '').toLowerCase();
      const isRlsError =
        error.code === '42501' ||
        message.includes('row-level security') ||
        message.includes('violates row-level security policy');

      if (isRlsError) {
        throw new Error('Permission denied while creating product (RLS policy issue). Please run supabase/fix_products_rls.sql in Supabase SQL Editor, then try again.');
      }

      throw new Error(error.message || 'Failed to create product');
    }

    fetchFarmerData();
    return data;
  };

  const updateProduct = async (productId: string, updates: any) => {
    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', productId)
      .eq('farmer_id', user?.id)
      .select()
      .single();

    if (error) throw error;

    await fetchFarmerData();
    return data;
  };

  const updateOrderDeliveryStatus = async (orderId: string, status: string, note?: string) => {
    if (!user) throw new Error('Not authenticated');

    const normalizedStatus = String(status || '').trim();
    if (!normalizedStatus) throw new Error('Status is required');

    const { data: latestTrackingRows, error: trackingFetchError } = await supabase
      .from('tracking')
      .select('id, tracking_number')
      .eq('order_id', orderId)
      .order('updated_at', { ascending: false })
      .limit(1);

    if (trackingFetchError) throw trackingFetchError;

    const message = note || `Status updated to ${normalizedStatus.replace(/_/g, ' ')}`;

    const { data: updatedOrders, error: orderError } = await supabase
      .from('orders')
      .update({
        status: normalizedStatus,
        order_status: normalizedStatus,
      })
      .eq('id', orderId)
      .eq('farmer_id', user.id)
      .select('id');

    if (orderError) throw orderError;
    if (!updatedOrders || updatedOrders.length === 0) {
      throw new Error('Order status was not updated. Please make sure this order belongs to your farmer account.');
    }

    const latestTracking = latestTrackingRows?.[0];

    if (latestTracking?.id) {
      const { data: updatedTrackingRows, error: updateTrackingError } = await supabase
        .from('tracking')
        .update({
          status: normalizedStatus,
          message,
          updated_at: new Date().toISOString(),
        })
        .eq('order_id', orderId)
        .select('id');

      if (updateTrackingError) throw updateTrackingError;
      if (!updatedTrackingRows || updatedTrackingRows.length === 0) {
        throw new Error('Tracking status was not updated due to database permissions. Please apply the tracking UPDATE policy fix SQL.');
      }
    } else {
      const { error: insertTrackingError } = await supabase
        .from('tracking')
        .insert({
          order_id: orderId,
          tracking_number: `F2H${Date.now().toString().slice(-8)}`,
          status: normalizedStatus,
          location: 'Farm2Home Hub',
          message,
        });

      if (insertTrackingError) throw insertTrackingError;
    }

    await fetchFarmerData();
  };

  const deleteProduct = async (productId: string) => {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId)
      .eq('farmer_id', user?.id);

    if (error) throw error;

    await fetchFarmerData();
  };

  return {
    stats,
    recentOrders,
    orders,
    products,
    topProducts,
    loading,
    addProduct,
    updateProduct,
    deleteProduct,
    updateOrderDeliveryStatus,
    refetch: fetchFarmerData,
  };
}
