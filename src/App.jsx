//App.jsx
import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';
import WelcomePage from './pages/WelcomePage';
import LoginPage from './pages/LoginPage';
import UserDashboard from './pages/UserDashboard';

const AppContent = () => {
  const { user, isAuthenticated, loading, logout, login } = useAuth();
  const [page, setPage] = useState('welcome');

  useEffect(() => {
    if (isAuthenticated && user) {
      setPage('dashboard');
    } else {
      setPage('welcome');
    }
  }, [isAuthenticated, user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-cyan-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated && user) {
    return <UserDashboard user={user} onLogout={logout} />;
  }

  if (page === 'login' || page === 'signup') {
    const handleLogin = (userData) => {
      login(userData);  
      setPage('dashboard'); 
    };

    return <LoginPage onNavigate={setPage} onLogin={handleLogin} />;
  }

  return <WelcomePage onNavigate={setPage} />;
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
