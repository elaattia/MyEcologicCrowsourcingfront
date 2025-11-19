// src/App.jsx - CORRECTION NAVIGATION LOGIN/SIGNUP
import React, { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import WelcomePage from './pages/WelcomePage';
import LoginPage from './pages/LoginPage';
import UserDashboard from './pages/UserDashboard';
import OrganisationDashboard from './pages/OrganisationDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AuthService from './services/auth/AuthService';

const App = () => {
  const [currentView, setCurrentView] = useState('welcome');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const currentUser = AuthService.getCurrentUser();
      const token = AuthService.getToken();

      if (currentUser && token) {
        console.log('🔐 Utilisateur connecté:', {
          ...currentUser,
          roleType: typeof currentUser.role,
          roleText: AuthService.getRoleText(currentUser.role)
        });
        
        if (typeof currentUser.role !== 'number') {
          console.error('❌ ERREUR: Le rôle n\'est pas un number:', currentUser.role);
          AuthService.logout();
          setCurrentView('welcome');
          setLoading(false);
          return;
        }
        
        setUser(currentUser);
        setCurrentView('dashboard');
      } else {
        setCurrentView('welcome');
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const handleNavigate = (view) => {
    console.log('🧭 Navigation vers:', view);
    setCurrentView(view);
  };

  const handleLogin = (userData) => {
    console.log('🎯 handleLogin appelé avec:', userData);
    console.log('📊 Type de userData.role:', typeof userData.role, 'Valeur:', userData.role);
    
    if (!userData || typeof userData.role !== 'number') {
      console.error('❌ userData invalide ou role pas un number:', userData);
      return;
    }
    
    setUser(userData);
    setCurrentView('dashboard');
    
    console.log('✅ User state mis à jour, redirection vers dashboard...');
    console.log('🔍 Role détecté:', userData.role, '→', 
      userData.role === 2 ? 'Admin' : 
      userData.role === 1 ? 'Representant' : 
      'User');
  };

  const handleLogout = () => {
    AuthService.logout();
    setUser(null);
    setCurrentView('welcome');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-cyan-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-emerald-600"></div>
          <p className="mt-4 text-gray-600 font-medium">Chargement...</p>
        </div>
      </div>
    );
  }

  // Page d'accueil
  if (currentView === 'welcome') {
    return <WelcomePage onNavigate={handleNavigate} />;
  }

  // Page de connexion (isLogin = true)
  if (currentView === 'login') {
    return (
      <LoginPage 
        onNavigate={handleNavigate} 
        onLogin={handleLogin}
        initialMode="login"
      />
    );
  }

  // Page d'inscription (isLogin = false)
  if (currentView === 'signup') {
    return (
      <LoginPage 
        onNavigate={handleNavigate} 
        onLogin={handleLogin}
        initialMode="signup"
      />
    );
  }

  // Dashboards
  if (currentView === 'dashboard' && user) {
    console.log('🎨 Rendu dashboard pour:', {
      role: user.role,
      roleType: typeof user.role,
      username: user.username,
      organisationId: user.organisationId
    });
    
    if (typeof user.role !== 'number') {
      console.error('❌ ERREUR CRITIQUE: Le rôle n\'est pas un number:', user.role);
      return (
        <div className="min-h-screen flex items-center justify-center bg-red-50">
          <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md">
            <div className="text-red-600 mb-4">
              <AlertCircle size={48} className="mx-auto" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Erreur de session</h2>
            <p className="text-gray-600 mb-6">
              Une erreur s'est produite avec votre session. Veuillez vous reconnecter.
            </p>
            <button
              onClick={handleLogout}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              Se reconnecter
            </button>
          </div>
        </div>
      );
    }
    
    switch (user.role) {
      case 2:
        console.log('📋 Affichage: AdminDashboard');
        return <AdminDashboard user={user} onLogout={handleLogout} />;
      
      case 1:
        console.log('🏢 Affichage: OrganisationDashboard');
        return <OrganisationDashboard user={user} onLogout={handleLogout} />;
      
      case 0:
        console.log('👤 Affichage: UserDashboard');
        return <UserDashboard user={user} onLogout={handleLogout} />;
      
      default:
        console.error('❌ Rôle inconnu (number):', user.role);
        return (
          <div className="min-h-screen flex items-center justify-center bg-red-50">
            <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Rôle inconnu</h2>
              <p className="text-gray-600 mb-4">
                Erreur: Rôle utilisateur inconnu ({user.role})
              </p>
              <button
                onClick={handleLogout}
                className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Se déconnecter
              </button>
            </div>
          </div>
        );
    }
  }

  return <WelcomePage onNavigate={handleNavigate} />;
};

export default App;