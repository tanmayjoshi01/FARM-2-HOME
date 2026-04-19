import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../context/AuthContext';

export function useAdminData() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingProducts: 0,
  });
  const [users, setUsers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      setLoading(false);
      return;
    }

    fetchAdminData();
  }, [user]);

  const fetchAdminData = async () => {
    try {
      setLoading(true);

      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (usersError) throw usersError;
      setUsers(usersData || []);

      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*, farmer:users!products_farmer_id_fkey(id, full_name, email)')
        .order('created_at', { ascending: false });

      if (productsError) throw productsError;
      setProducts(productsData || []);

      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          buyer_user:users!orders_buyer_id_fkey(full_name, email),
          user_user:users!orders_user_id_fkey(full_name, email),
          farmer_user:users!orders_farmer_id_fkey(full_name, email),
          address:addresses!orders_address_id_fkey(*),
          delivery_address:addresses!orders_delivery_address_id_fkey(*),
          tracking:tracking(*),
          items:order_items(
            *,
            product:products(name, unit)
          )
        `)
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;
      setOrders(ordersData || []);

      const totalUsers = usersData?.length || 0;
      const totalProducts = productsData?.length || 0;
      const totalOrders = ordersData?.length || 0;
      const totalRevenue = ordersData?.reduce((sum: number, order: any) => {
        const amount = Number(order.final_amount || order.total || order.total_amount || 0);
        return sum + amount;
      }, 0) || 0;
      const pendingProducts = productsData?.filter((product: any) => product.status === 'pending').length || 0;

      setStats({
        totalUsers,
        totalProducts,
        totalOrders,
        totalRevenue,
        pendingProducts,
      });
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const approveProduct = async (productId: string) => {
    const { error } = await supabase
      .from('products')
      .update({ status: 'approved' })
      .eq('id', productId);

    if (error) throw error;
    await fetchAdminData();
  };

  const rejectProduct = async (productId: string) => {
    const { error } = await supabase
      .from('products')
      .update({ status: 'rejected' })
      .eq('id', productId);

    if (error) throw error;
    await fetchAdminData();
  };

  const deleteProduct = async (productId: string) => {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId);

    if (error) throw error;
    await fetchAdminData();
  };

  const updateUserRole = async (userId: string, role: string) => {
    const { error } = await supabase
      .from('users')
      .update({ role })
      .eq('id', userId);

    if (error) throw error;
    await fetchAdminData();
  };

  const deleteUser = async (userId: string) => {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);

    if (error) throw error;
    await fetchAdminData();
  };

  const updateOrderDeliveryStatus = async (orderId: string, status: string, note?: string) => {
    const normalizedStatus = String(status || '').trim();
    if (!normalizedStatus) throw new Error('Status is required');

    const { data: updatedOrders, error: orderError } = await supabase
      .from('orders')
      .update({
        status: normalizedStatus,
        order_status: normalizedStatus,
      })
      .eq('id', orderId)
      .select('id');

    if (orderError) throw orderError;
    if (!updatedOrders || updatedOrders.length === 0) {
      throw new Error('Order status update failed for this order.');
    }

    const { data: trackingRows, error: trackingFetchError } = await supabase
      .from('tracking')
      .select('id')
      .eq('order_id', orderId)
      .order('updated_at', { ascending: false })
      .limit(1);

    if (trackingFetchError) throw trackingFetchError;

    const message = note || `Status updated to ${normalizedStatus.replace(/_/g, ' ')} by admin`;

    if ((trackingRows || []).length > 0) {
      const { error: trackingUpdateError } = await supabase
        .from('tracking')
        .update({
          status: normalizedStatus,
          message,
          updated_at: new Date().toISOString(),
        })
        .eq('order_id', orderId);

      if (trackingUpdateError) throw trackingUpdateError;
    } else {
      const { error: trackingInsertError } = await supabase
        .from('tracking')
        .insert({
          order_id: orderId,
          tracking_number: `F2H${Date.now().toString().slice(-8)}`,
          status: normalizedStatus,
          location: 'Farm2Home Hub',
          message,
        });

      if (trackingInsertError) throw trackingInsertError;
    }

    await fetchAdminData();
  };

  return {
    stats,
    users,
    products,
    orders,
    loading,
    approveProduct,
    rejectProduct,
    deleteProduct,
    updateUserRole,
    deleteUser,
    updateOrderDeliveryStatus,
    refetch: fetchAdminData,
  };
}
