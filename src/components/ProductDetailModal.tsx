import { useState } from 'react';
import { X, MapPin, User, Package, MessageSquare, ShoppingCart } from 'lucide-react';
import { supabase, Product } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface ProductDetailModalProps {
  product: Product;
  onClose: () => void;
}

export default function ProductDetailModal({ product, onClose }: ProductDetailModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [orderData, setOrderData] = useState({
    quantity: '',
    payment_method: 'cash_on_delivery',
    delivery_address: '',
    notes: '',
  });

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const quantity = parseFloat(orderData.quantity);
      const totalPrice = quantity * product.price;

      const { error } = await supabase.from('orders').insert({
        product_id: product.id,
        retailer_id: user?.id,
        farmer_id: product.farmer_id,
        quantity,
        total_price: totalPrice,
        status: 'pending',
        payment_method: orderData.payment_method,
        delivery_address: orderData.delivery_address,
        notes: orderData.notes || null,
      });

      if (error) throw error;

      alert('Order placed successfully! The farmer will contact you soon.');
      onClose();
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  const handleContactSeller = async () => {
    alert('Direct messaging feature coming soon! For now, please place an order and the farmer will contact you.');
  };

  const totalPrice = orderData.quantity
    ? (parseFloat(orderData.quantity) * product.price).toFixed(2)
    : '0.00';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b dark:border-gray-700 px-6 py-4 flex justify-between items-center z-10">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Product Details</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="relative h-80 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-gray-700 dark:to-gray-600 rounded-xl overflow-hidden">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <Package className="w-24 h-24 text-green-300 dark:text-gray-500" />
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <span className="inline-block px-3 py-1 text-sm font-bold bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full mb-3">
                  {product.category}
                </span>
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {product.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">{product.description}</p>
              </div>

              <div className="space-y-3 pt-4 border-t dark:border-gray-700">
                <div className="flex items-center space-x-3 text-gray-700 dark:text-gray-300">
                  <User className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Farmer</p>
                    <p className="font-semibold">{product.profiles?.full_name}</p>
                  </div>
                </div>

                {product.location && (
                  <div className="flex items-center space-x-3 text-gray-700 dark:text-gray-300">
                    <MapPin className="w-5 h-5 text-green-600 dark:text-green-400" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Location</p>
                      <p className="font-semibold">{product.location}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-3 text-gray-700 dark:text-gray-300">
                  <Package className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Available Stock</p>
                    <p className="font-semibold">
                      {product.quantity_available} {product.unit}
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t dark:border-gray-700">
                <p className="text-4xl font-bold text-green-600 dark:text-green-400">
                  ₹{product.price}
                  <span className="text-xl text-gray-600 dark:text-gray-400">
                    /{product.unit}
                  </span>
                </p>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={handleContactSeller}
                  className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 border-2 border-green-500 text-green-600 dark:text-green-400 rounded-lg font-semibold hover:bg-green-50 dark:hover:bg-green-900/20 transition-all duration-200"
                >
                  <MessageSquare className="w-5 h-5" />
                  <span>Contact Seller</span>
                </button>
                <button
                  onClick={() => setShowOrderForm(!showOrderForm)}
                  className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
                >
                  <ShoppingCart className="w-5 h-5" />
                  <span>Place Order</span>
                </button>
              </div>
            </div>
          </div>

          {showOrderForm && (
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6 space-y-4 animate-in slide-in-from-top">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Order Details
              </h3>
              <form onSubmit={handlePlaceOrder} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Quantity ({product.unit})
                  </label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    min="0.01"
                    max={product.quantity_available}
                    value={orderData.quantity}
                    onChange={(e) => setOrderData({ ...orderData, quantity: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white transition-all duration-200"
                    placeholder="Enter quantity"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Payment Method
                  </label>
                  <select
                    value={orderData.payment_method}
                    onChange={(e) =>
                      setOrderData({
                        ...orderData,
                        payment_method: e.target.value as 'online' | 'cash_on_delivery',
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white transition-all duration-200"
                  >
                    <option value="cash_on_delivery">Cash on Delivery</option>
                    <option value="online">Online Payment</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Delivery Address
                  </label>
                  <textarea
                    required
                    value={orderData.delivery_address}
                    onChange={(e) =>
                      setOrderData({ ...orderData, delivery_address: e.target.value })
                    }
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white transition-all duration-200"
                    placeholder="Enter your delivery address"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Additional Notes (Optional)
                  </label>
                  <textarea
                    value={orderData.notes}
                    onChange={(e) => setOrderData({ ...orderData, notes: e.target.value })}
                    rows={2}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white transition-all duration-200"
                    placeholder="Any special instructions..."
                  />
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border-2 border-green-500">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-900 dark:text-white">
                      Total Amount:
                    </span>
                    <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                      ₹{totalPrice}
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-bold text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Placing Order...' : 'Confirm Order'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
