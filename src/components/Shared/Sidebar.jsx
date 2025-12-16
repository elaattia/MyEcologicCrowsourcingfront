// src/components/Shared/Sidebar.jsx - SUPPORT ADMIN
import React from 'react';
import { 
  MapPin, Upload, CheckCircle, Trophy, Home, Plus, Map as MapIcon, BarChart3, User, LogOut, 
  Trash2, Truck, Route, Building2, MessageCircle, Award, Users, Shield, Settings
} from 'lucide-react'; 

const Sidebar = ({ currentPage, setCurrentPage, user, onLogout }) => {
  // Vérifier les rôles : 0 = Citoyen, 1 = Representant, 2 = Admin
  const isAdmin = user?.role === 2;
  const isOrganisation = user?.role === 1;
  const isCitoyen = user?.role === 0;
  
  // Menus par rôle
  const citoyenMenuItems = [
    { id: 'dashboard', label: 'Tableau de bord', icon: Home },
    { id: 'signal', label: 'Signaler un déchet', icon: Plus },
    { id: 'map', label: 'Carte', icon: MapIcon },
    { id: 'challenges', label: 'Défis', icon: Award },
    { id: 'forum', label: 'Forum', icon: MessageCircle },
    { id: 'stats', label: 'Statistiques', icon: BarChart3 },
    { id: 'history', label: 'Historique', icon: Trash2 },
    { id: 'profile', label: 'Profil', icon: User },
  ];

  const orgMenuItems = [
    { id: 'dashboard', label: 'Tableau de bord', icon: Home },
    { id: 'map', label: 'Cartographie', icon: MapIcon },
    { id: 'submissions', label: 'Soumissions', icon: Upload },
    { id: 'itinerary', label: 'Itinéraires', icon: Route },
    { id: 'vehicles', label: 'Véhicules', icon: Truck },
    { id: 'depots', label: 'Dépôts', icon: Building2 },
    { id: 'forum', label: 'Forum', icon: MessageCircle },
    { id: 'stats', label: 'Statistiques', icon: BarChart3 },
    { id: 'profile', label: 'Profil', icon: User },
  ];

  const adminMenuItems = [
    { id: 'dashboard', label: 'Tableau de bord', icon: Home },
    { id: 'users', label: 'Utilisateurs', icon: Users },
    { id: 'submissions', label: 'Soumissions', icon: CheckCircle }, // NOUVEAU
    //{ id: 'moderation', label: 'Modération', icon: Shield }, // NOUVEAU
    { id: 'challenges', label: 'Challenges', icon: Trophy }, // NOUVEAU
    { id: 'achievements', label: 'Achievements', icon: Award }, // NOUVEAU
    { id: 'statistiques', label: 'Statistiques', icon: BarChart3 }, // NOUVEAU
    { id: 'forum', label: 'Gestion Forum', icon: MessageCircle },
    //{ id: 'challenges', label: 'Gestion Défis', icon: Award },
    //{ id: 'stats', label: 'Statistiques', icon: BarChart3 },
    //{ id: 'settings', label: 'Paramètres', icon: Settings },
    { id: 'profile', label: 'Profil', icon: User },
  ];

  const menuItems = isAdmin ? adminMenuItems : isOrganisation ? orgMenuItems : citoyenMenuItems;

  // Couleurs par rôle
  const getColors = () => {
    if (isAdmin) {
      return {
        gradient: 'from-purple-400 to-pink-500',
        text: 'from-purple-600 to-pink-600',
        button: 'from-purple-500 to-pink-500',
        bg: 'from-purple-400 to-pink-500',
        label: '👑 Administrateur'
      };
    } else if (isOrganisation) {
      return {
        gradient: 'from-blue-400 to-purple-500',
        text: 'from-blue-600 to-purple-600',
        button: 'from-blue-500 to-purple-500',
        bg: 'from-blue-400 to-purple-500',
        label: '🏢 Organisation'
      };
    } else {
      return {
        gradient: 'from-emerald-400 to-cyan-500',
        text: 'from-emerald-600 to-cyan-600',
        button: 'from-emerald-500 to-cyan-500',
        bg: 'from-emerald-400 to-cyan-500',
        label: '👤 Citoyen'
      };
    }
  };

  const colors = getColors();

  return (
    <aside className="w-64 h-screen bg-white text-gray-800 flex flex-col fixed left-0 top-0 shadow-2xl z-40">
      {/* Logo et titre */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-center gap-2">
          <div className={`p-2 rounded-xl bg-gradient-to-br ${colors.gradient}`}>
            {isAdmin ? (
              <Shield className="text-white" size={24} />
            ) : (
              <MapPin className="text-white" size={24} />
            )}
          </div>
          <h1 className={`text-2xl font-bold bg-gradient-to-r ${colors.text} bg-clip-text text-transparent`}>
            EcoClean 
          </h1>
        </div>
        <p className="text-gray-600 text-sm text-center mt-2">
          {colors.label}
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto mt-4 px-3">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => setCurrentPage(item.id)}
                  className={`flex items-center gap-3 px-4 py-3 w-full text-left rounded-xl transition-all duration-200 ${
                    isActive
                      ? `bg-gradient-to-r ${colors.button} text-white shadow-lg`
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Profil utilisateur et déconnexion */}
      <div className="border-t border-gray-200 p-4 bg-gray-50">
        <div className="flex items-center gap-3 mb-4 px-2">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold text-white shadow-lg bg-gradient-to-br ${colors.bg}`}>
            {user?.username?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-800 truncate">
              {user?.username || 'Utilisateur'}
            </p>
            <p className="text-sm text-gray-600 truncate">
              {user?.email || ''}
            </p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="flex items-center justify-center gap-2 bg-gray-400 hover:bg-gray-500 w-full py-2.5 rounded-lg transition-colors font-medium shadow-lg text-white"
        >
          <LogOut size={18} />
          Déconnexion
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;