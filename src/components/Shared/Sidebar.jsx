// components/Shared/Sidebar.jsx
import React from 'react';
import { Home, Plus, Map, BarChart3, User, LogOut, MapPin } from 'lucide-react';

const Sidebar = ({ currentPage, setCurrentPage, user, onLogout }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Tableau de bord', icon: Home },
    { id: 'signal', label: 'Signaler un déchet', icon: Plus },
    { id: 'map', label: 'Carte', icon: Map },
    { id: 'stats', label: 'Statistiques', icon: BarChart3 },
    { id: 'profile', label: 'Profil', icon: User },
  ];

  const getUserInitials = () => {
    if (user?.username) {
      return user.username.charAt(0).toUpperCase();
    }
    return 'U';
  };

  return (
    <aside className="w-64 h-screen bg-white text-gray-800 flex flex-col fixed left-0 top-0 shadow-2xl">
      {}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-center gap-2">
          <div className="bg-gradient-to-br from-emerald-400 to-cyan-500 p-2 rounded-xl">
            <MapPin className="text-white" size={24} />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
            EcoMap
          </h1>
        </div>
        <p className="text-gray-600 text-sm text-center mt-2">
          {user?.role === 1 ? 'Organisation' : 'Citoyen'}
        </p>
      </div>

      {}
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
                      ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-lg'
                      : 'hover:bg-emerald-50 text-gray-700'
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

      {}
      <div className="border-t border-gray-200 p-4 bg-gray-50">
        <div className="flex items-center gap-3 mb-4 px-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-lg font-bold text-white shadow-lg">
            {getUserInitials()}
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