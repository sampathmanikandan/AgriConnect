import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Auth from './components/Auth';
import Navbar from './components/Navbar';
import FarmerDashboard from './components/FarmerDashboard';
import Marketplace from './components/Marketplace';
import Orders from './components/Orders';

function AppContent() {
  const { user, profile, loading } = useAuth();
  const [currentView, setCurrentView] = useState('dashboard');

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400 text-lg">Loading AgriConnect...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return <Auth />;
  }

  const renderView = () => {
    if (profile.user_type === 'farmer') {
      switch (currentView) {
        case 'dashboard':
          return <FarmerDashboard />;
        case 'orders':
          return <Orders />;
        default:
          return <FarmerDashboard />;
      }
    } else {
      switch (currentView) {
        case 'marketplace':
          return <Marketplace />;
        case 'orders':
          return <Orders />;
        default:
          return <Marketplace />;
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
      <Navbar onNavigate={setCurrentView} currentView={currentView} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        {renderView()}
      </main>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
