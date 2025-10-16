import { useState, useEffect } from 'react';
import { Package, Clock, CheckCircle, XCircle, User, MapPin } from 'lucide-react';
import { supabase, Order } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'rejected' | 'completed'>('all');
  const { user, profile } = useAuth();

  useEffect(() => {
    if (user) {
      loadOrders();
    }
  }, [user]);

  const loadOrders = async () => {
    try {
      const isFarmer = profile?.user_type === 'farmer';
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          products (*),
          retailer:profiles!orders_retailer_id_fkey (*),
          farmer:profiles!orders_farmer_id_fkey (*)
        `)
        .eq(isFarmer ? 'farmer_id' : 'retailer_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId: string, status: Order['status']) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', orderId);

      if (error) throw error;
      setOrders(orders.map((o) => (o.id === orderId ? { ...o, status } : o)));
    } catch (error) {
      console.error('Error updating order:', error);
      alert('Failed to update order status');
    }
  };

  const filteredOrders = filter === 'all' ? orders : orders.filter((o) => o.status === filter);

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'accepted':
        return <CheckCircle className="w-5 h-5 text-blue-500" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-500" />;
    }
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200';
      case 'accepted':
        return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200';
      case 'completed':
        return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
      case 'rejected':
        return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Orders</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          {profile?.user_type === 'farmer' ? 'Manage incoming orders' : 'Track your purchases'}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {['all', 'pending', 'accepted', 'completed', 'rejected'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status as typeof filter)}
            className={`px-4 py-2 rounded-lg font-medium capitalize transition-all duration-200 ${
              filter === status
                ? 'bg-green-500 text-white shadow-lg scale-105'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {filteredOrders.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No orders found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {filter === 'all' ? 'No orders yet' : `No ${filter} orders`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300"
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex-1 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        {order.products?.name}
                      </h3>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(order.status)}
                        <span
                          className={`px-3 py-1 text-xs font-bold rounded-full ${getStatusColor(
                            order.status
                          )}`}
                        >
                          {order.status}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                        ₹{order.total_price}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {order.quantity} {order.products?.unit}
                      </p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 pt-4 border-t dark:border-gray-700">
                    <div className="flex items-start space-x-3">
                      <User className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {profile?.user_type === 'farmer' ? 'Retailer' : 'Farmer'}
                        </p>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {profile?.user_type === 'farmer'
                            ? order.retailer?.full_name
                            : order.farmer?.full_name}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Delivery Address</p>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {order.delivery_address}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <Package className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Payment Method</p>
                        <p className="font-semibold text-gray-900 dark:text-white capitalize">
                          {order.payment_method.replace('_', ' ')}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Order Date</p>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {new Date(order.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {order.notes && (
                    <div className="pt-4 border-t dark:border-gray-700">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Notes:</p>
                      <p className="text-gray-900 dark:text-white">{order.notes}</p>
                    </div>
                  )}
                </div>

                {profile?.user_type === 'farmer' && order.status === 'pending' && (
                  <div className="flex lg:flex-col gap-2">
                    <button
                      onClick={() => handleUpdateStatus(order.id, 'accepted')}
                      className="flex-1 lg:w-32 px-4 py-2 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 hover:shadow-lg hover:scale-105 transition-all duration-200"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(order.id, 'rejected')}
                      className="flex-1 lg:w-32 px-4 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 hover:shadow-lg hover:scale-105 transition-all duration-200"
                    >
                      Reject
                    </button>
                  </div>
                )}

                {profile?.user_type === 'farmer' && order.status === 'accepted' && (
                  <button
                    onClick={() => handleUpdateStatus(order.id, 'completed')}
                    className="lg:w-32 px-4 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 hover:shadow-lg hover:scale-105 transition-all duration-200"
                  >
                    Complete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
