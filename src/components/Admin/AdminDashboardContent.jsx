// src/components/Admin/AdminDashboardContent.jsx
import React, { useEffect, useState } from 'react';
import { Users, MessageCircle, Award, Shield, TrendingUp, AlertCircle, Loader } from 'lucide-react';
import api from '../../services/api/axiosConfig';

const AdminDashboardContent = ({ user }) => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    citoyens: 0,
    representants: 0,
    totalPosts: 0,
    totalChallenges: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    setError('');

    try {
      // Récupérer les utilisateurs
      const usersResponse = await api.get('/api/users');
      const users = usersResponse.data || [];

      setStats({
        totalUsers: users.length,
        citoyens: users.filter(u => u.role === 'User' || u.role === 0).length,
        representants: users.filter(u => u.role === 'Representant' || u.role === 1).length,
        totalPosts: 0, // À compléter avec votre API
        totalChallenges: 0 // À compléter avec votre API
      });
    } catch (err) {
      console.error('Erreur chargement stats:', err);
      setError(err.message || 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader className="animate-spin text-purple-600" size={40} />
        <p className="ml-4 text-gray-600">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-2">
            <Shield size={32} className="text-purple-600" />
            Tableau de bord Administrateur
          </h2>
          <p className="text-gray-600">
            Bienvenue, {user?.username || 'Admin'} 👑
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-purple-100 rounded-xl shadow-lg">
          <Shield size={20} className="text-purple-600" />
          <span className="text-purple-700 font-medium">Administrateur</span>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-2 border-red-200 text-red-700 px-6 py-4 rounded-xl flex items-center gap-3">
          <AlertCircle size={20} />
          <p>{error}</p>
        </div>
      )}

      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total utilisateurs */}
        <div className="bg-white rounded-2xl p-6 shadow-xl text-center border-l-4 border-purple-500">
          <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="text-purple-600" size={32} />
          </div>
          <p className="text-4xl font-bold text-purple-600 mb-2">
            {stats.totalUsers}
          </p>
          <p className="text-gray-600 font-medium">Total utilisateurs</p>
        </div>

        {/* Citoyens */}
        <div className="bg-white rounded-2xl p-6 shadow-xl text-center border-l-4 border-emerald-500">
          <div className="bg-emerald-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="text-emerald-600" size={32} />
          </div>
          <p className="text-4xl font-bold text-emerald-600 mb-2">
            {stats.citoyens}
          </p>
          <p className="text-gray-600 font-medium">Citoyens</p>
        </div>

        {/* Représentants */}
        <div className="bg-white rounded-2xl p-6 shadow-xl text-center border-l-4 border-blue-500">
          <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="text-blue-600" size={32} />
          </div>
          <p className="text-4xl font-bold text-blue-600 mb-2">
            {stats.representants}
          </p>
          <p className="text-gray-600 font-medium">Représentants</p>
        </div>
      </div>

      {/* Actions rapides */}
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <TrendingUp size={24} className="text-purple-600" />
          Actions rapides
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-purple-50 rounded-xl p-6 hover:shadow-md transition cursor-pointer border border-purple-200">
            <div className="bg-gradient-to-br from-purple-400 to-purple-500 w-12 h-12 rounded-full flex items-center justify-center mb-4 shadow-lg">
              <Users className="text-white" size={24} />
            </div>
            <h4 className="text-lg font-semibold text-gray-800 mb-2">
              Gérer les utilisateurs
            </h4>
            <p className="text-gray-600 text-sm">
              Ajouter, modifier ou supprimer des comptes
            </p>
          </div>

          <div className="bg-blue-50 rounded-xl p-6 hover:shadow-md transition cursor-pointer border border-blue-200">
            <div className="bg-gradient-to-br from-blue-400 to-blue-500 w-12 h-12 rounded-full flex items-center justify-center mb-4 shadow-lg">
              <MessageCircle className="text-white" size={24} />
            </div>
            <h4 className="text-lg font-semibold text-gray-800 mb-2">
              Modérer le forum
            </h4>
            <p className="text-gray-600 text-sm">
              Gérer les posts et commentaires signalés
            </p>
          </div>

          <div className="bg-amber-50 rounded-xl p-6 hover:shadow-md transition cursor-pointer border border-amber-200">
            <div className="bg-gradient-to-br from-amber-400 to-amber-500 w-12 h-12 rounded-full flex items-center justify-center mb-4 shadow-lg">
              <Award className="text-white" size={24} />
            </div>
            <h4 className="text-lg font-semibold text-gray-800 mb-2">
              Gérer les défis
            </h4>
            <p className="text-gray-600 text-sm">
              Créer et modérer les défis écologiques
            </p>
          </div>
        </div>
      </div>

      {/* Activité récente */}
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">
          Activité récente
        </h3>
        <div className="space-y-3">
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
            <p className="text-sm text-gray-600">
              Fonctionnalité en développement...
            </p>
          </div>
        </div>
      </div>

      {/* Message important */}
      <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 rounded-2xl shadow-xl p-6 text-white">
        <div className="flex items-start gap-4">
          <div className="bg-white/20 backdrop-blur p-3 rounded-xl">
            <Shield size={24} />
          </div>
          <div>
            <h3 className="text-xl font-bold mb-2">⚠️ Rappel important</h3>
            <p className="text-white/90">
              En tant qu'administrateur, vous avez accès à toutes les fonctionnalités sensibles. 
              Utilisez vos pouvoirs avec responsabilité pour maintenir une communauté saine et respectueuse.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardContent;