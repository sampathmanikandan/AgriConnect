import { useState } from 'react';
import { Menu, X, Sun, Moon, Sprout, ShoppingBag, MessageSquare, Package, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

interface NavbarProps {
  onNavigate: (view: string) => void;
  currentView: string;
}

export default function Navbar({ onNavigate, currentView }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { profile, signOut } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const navItems = profile?.user_type === 'farmer'
    ? [
        { id: 'dashboard', label: 'My Products', icon: Package },
        { id: 'orders', label: 'Orders', icon: ShoppingBag },
        { id: 'messages', label: 'Messages', icon: MessageSquare },
      ]
    : [
        { id: 'marketplace', label: 'Marketplace', icon: Sprout },
        { id: 'orders', label: 'My Orders', icon: ShoppingBag },
        { id: 'messages', label: 'Messages', icon: MessageSquare },
      ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 shadow-lg transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform duration-200">
              <Sprout className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-400 dark:to-emerald-400 bg-clip-text text-transparent">
              AgriConnect
            </span>
          </div>

          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  currentView === item.id
                    ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 shadow-md'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:shadow-md'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            ))}
          </div>

          <div className="hidden md:flex items-center space-x-3">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200 hover:shadow-lg hover:scale-110"
              aria-label="Toggle theme"
            >
              {isDark ? (
                <Sun className="w-5 h-5 text-yellow-500" />
              ) : (
                <Moon className="w-5 h-5 text-gray-700" />
              )}
            </button>

            <div className="flex items-center space-x-3 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <div className="flex flex-col items-end">
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {profile?.full_name}
                </span>
                <span className="text-xs text-gray-600 dark:text-gray-400 capitalize">
                  {profile?.user_type}
                </span>
              </div>
              <button
                onClick={handleSignOut}
                className="p-2 rounded-lg bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-800 transition-all duration-200 hover:shadow-lg hover:scale-110"
                aria-label="Sign out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      <div
        className={`md:hidden bg-white dark:bg-gray-900 border-t dark:border-gray-800 transition-all duration-300 ease-in-out ${
          isMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
        }`}
      >
        <div className="px-4 py-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onNavigate(item.id);
                setIsMenuOpen(false);
              }}
              className={`flex items-center space-x-3 w-full px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                currentView === item.id
                  ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          ))}

          <div className="pt-4 border-t dark:border-gray-800 space-y-2">
            <button
              onClick={toggleTheme}
              className="flex items-center space-x-3 w-full px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
            </button>

            <button
              onClick={handleSignOut}
              className="flex items-center space-x-3 w-full px-4 py-3 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200"
            >
              <LogOut className="w-5 h-5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
