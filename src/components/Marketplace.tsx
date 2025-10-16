import { useState, useEffect } from 'react';
import { Search, Filter, MapPin, Package, User } from 'lucide-react';
import { supabase, Product } from '../lib/supabase';
import ProductDetailModal from './ProductDetailModal';

const categories = ['All', 'Vegetables', 'Fruits', 'Grains', 'Pulses', 'Dairy', 'Spices', 'Organic', 'Other'];

export default function Marketplace() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, searchQuery, selectedCategory]);

  const loadProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*, profiles(*)')
        .eq('is_available', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = products;

    if (selectedCategory !== 'All') {
      filtered = filtered.filter((p) => p.category === selectedCategory);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.description?.toLowerCase().includes(query) ||
          p.location?.toLowerCase().includes(query)
      );
    }

    setFilteredProducts(filtered);
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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Marketplace</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Browse fresh produce directly from farmers
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 space-y-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products, locations..."
            className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white transition-all duration-200"
          />
        </div>

        <div className="flex items-center space-x-2 overflow-x-auto pb-2">
          <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400 flex-shrink-0" />
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all duration-200 ${
                selectedCategory === category
                  ? 'bg-green-500 text-white shadow-lg scale-105'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No products found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Try adjusting your search or filters
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 group cursor-pointer"
              onClick={() => setSelectedProduct(product)}
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
                <div className="absolute top-3 right-3">
                  <span className="px-3 py-1 text-xs font-bold bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-full shadow-lg">
                    {product.category}
                  </span>
                </div>
              </div>

              <div className="p-5 space-y-3">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors duration-200">
                    {product.name}
                  </h3>
                  {product.description && (
                    <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">
                      {product.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 text-sm">
                  <User className="w-4 h-4" />
                  <span className="font-medium">{product.profiles?.full_name}</span>
                </div>

                {product.location && (
                  <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 text-sm">
                    <MapPin className="w-4 h-4" />
                    <span>{product.location}</span>
                  </div>
                )}

                <div className="flex justify-between items-center pt-3 border-t dark:border-gray-700">
                  <div>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      ₹{product.price}
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        /{product.unit}
                      </span>
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Available: {product.quantity_available} {product.unit}
                    </p>
                  </div>
                </div>

                <button className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 opacity-0 group-hover:opacity-100">
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
}
