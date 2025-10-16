import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Package } from 'lucide-react';
import { supabase, Product } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import AddProductModal from './AddProductModal';

export default function FarmerDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadProducts();
    }
  }, [user]);

  const loadProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('farmer_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      setProducts(products.filter((p) => p.id !== id));
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product');
    }
  };

  const handleToggleAvailability = async (product: Product) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ is_available: !product.is_available })
        .eq('id', product.id);

      if (error) throw error;
      setProducts(
        products.map((p) =>
          p.id === product.id ? { ...p, is_available: !p.is_available } : p
        )
      );
    } catch (error) {
      console.error('Error updating product:', error);
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Products</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your product listings
          </p>
        </div>
        <button
          onClick={() => {
            setEditingProduct(null);
            setShowAddModal(true);
          }}
          className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
        >
          <Plus className="w-5 h-5" />
          <span>Add Product</span>
        </button>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No products yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Start selling by adding your first product
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 group"
            >
              <div className="relative h-48 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-gray-700 dark:to-gray-600 overflow-hidden">
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Package className="w-16 h-16 text-green-300 dark:text-gray-500" />
                  </div>
                )}
                {!product.is_available && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <span className="text-white font-bold text-lg">Unavailable</span>
                  </div>
                )}
              </div>

              <div className="p-5 space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                    {product.name}
                  </h3>
                  <span className="inline-block px-3 py-1 text-xs font-semibold bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full">
                    {product.category}
                  </span>
                </div>

                {product.description && (
                  <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">
                    {product.description}
                  </p>
                )}

                <div className="flex justify-between items-center pt-2 border-t dark:border-gray-700">
                  <div>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      ₹{product.price}
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        /{product.unit}
                      </span>
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Stock: {product.quantity_available} {product.unit}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t dark:border-gray-700">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={product.is_available}
                      onChange={() => handleToggleAvailability(product)}
                      className="w-5 h-5 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 dark:focus:ring-green-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 cursor-pointer"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Available
                    </span>
                  </label>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setEditingProduct(product);
                        setShowAddModal(true);
                      }}
                      className="p-2 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 hover:scale-110 transition-all duration-200"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="p-2 bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-800 hover:scale-110 transition-all duration-200"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAddModal && (
        <AddProductModal
          product={editingProduct}
          onClose={() => {
            setShowAddModal(false);
            setEditingProduct(null);
          }}
          onSave={() => {
            setShowAddModal(false);
            setEditingProduct(null);
            loadProducts();
          }}
        />
      )}
    </div>
  );
}
