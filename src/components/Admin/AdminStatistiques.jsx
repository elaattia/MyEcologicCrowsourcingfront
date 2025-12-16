import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Users, 
  Trophy, 
  MessageSquare, 
  FileCheck, 
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  Trash2,
  Activity
} from 'lucide-react';
import adminApi from '../../services/api/adminApi';

const AdminStatistiques = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Loading statistics...');
      const data = await adminApi.getDetailedStats();
      console.log('Statistics loaded:', data);
      setStats(data);
    } catch (err) {
      console.error('Erreur chargement statistiques:', err);
      setError(err.message || 'Erreur lors du chargement des statistiques');
    } finally {
      setLoading(false);
    }
  };

  const handleRecalculateRanks = async () => {
    try {
      await adminApi.recalculateRanks();
      alert('✅ Classements recalculés avec succès');
      await loadStatistics();
    } catch (err) {
      console.error('Erreur recalcul classements:', err);
      alert('❌ Erreur lors du recalcul des classements: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Activity className="h-12 w-12 text-emerald-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Chargement des statistiques...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <AlertCircle className="h-8 w-8 text-red-500" />
          <div>
            <h3 className="text-lg font-bold text-red-700">Erreur de chargement</h3>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        </div>
        <button
          onClick={loadStatistics}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Réessayer
        </button>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">📊 Statistiques Globales</h2>
          <p className="text-gray-600 mt-1">Vue d'ensemble de la plateforme</p>
        </div>
        <button
          onClick={handleRecalculateRanks}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
        >
          <Activity className="h-5 w-5" />
          Recalculer Rangs
        </button>
      </div>

      {/* Cartes de statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Users}
          title="Utilisateurs"
          value={stats.users?.total || 0}
          subtitle={`${stats.users?.active || 0} actifs`}
          color="blue"
        />

        <StatCard
          icon={Trophy}
          title="Challenges"
          value={stats.challenges?.total || 0}
          subtitle={`${stats.challenges?.active || 0} actifs`}
          color="emerald"
        />

        <StatCard
          icon={FileCheck}
          title="Soumissions"
          value={stats.submissions?.total || 0}
          subtitle={`${stats.submissions?.pending || 0} en attente`}
          color="orange"
        />

        <StatCard
          icon={MessageSquare}
          title="Forum"
          value={stats.forum?.totalPosts || 0}
          subtitle={`${stats.forum?.activePosts || 0} actifs`}
          color="purple"
        />
      </div>

      {/* Détails Utilisateurs */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <Users className="h-6 w-6 text-blue-600" />
          <h3 className="text-xl font-bold text-gray-800">👥 Utilisateurs Détaillés</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <p className="text-sm text-blue-600 font-medium mb-1">Total</p>
            <p className="text-3xl font-bold text-blue-700">{stats.users?.total || 0}</p>
            <p className="text-sm text-blue-600 mt-2">{stats.users?.active || 0} actifs</p>
          </div>

          <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
            <p className="text-sm text-emerald-600 font-medium mb-1">Citoyens</p>
            <p className="text-3xl font-bold text-emerald-700">{stats.users?.byRole?.users || 0}</p>
            <p className="text-sm text-emerald-600 mt-2">Rôle: User</p>
          </div>

          <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
            <p className="text-sm text-purple-600 font-medium mb-1">Représentants</p>
            <p className="text-3xl font-bold text-purple-700">{stats.users?.byRole?.representatives || 0}</p>
            <p className="text-sm text-purple-600 mt-2">Organisations</p>
          </div>
        </div>
      </div>

      {/* Détails Soumissions */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <FileCheck className="h-6 w-6 text-orange-600" />
          <h3 className="text-xl font-bold text-gray-800">📋 Soumissions</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <FileCheck className="h-5 w-5 text-gray-600" />
              <p className="text-sm text-gray-600 font-medium">Total</p>
            </div>
            <p className="text-2xl font-bold text-gray-700">{stats.submissions?.total || 0}</p>
          </div>

          <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              <p className="text-sm text-yellow-600 font-medium">En attente</p>
            </div>
            <p className="text-2xl font-bold text-yellow-700">{stats.submissions?.pending || 0}</p>
          </div>

          <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-5 w-5 text-emerald-600" />
              <p className="text-sm text-emerald-600 font-medium">Approuvées</p>
            </div>
            <p className="text-2xl font-bold text-emerald-700">{stats.submissions?.approved || 0}</p>
          </div>

          <div className="bg-red-50 rounded-lg p-4 border border-red-200">
            <div className="flex items-center gap-2 mb-2">
              <XCircle className="h-5 w-5 text-red-600" />
              <p className="text-sm text-red-600 font-medium">Rejetées</p>
            </div>
            <p className="text-2xl font-bold text-red-700">{stats.submissions?.rejected || 0}</p>
          </div>
        </div>
      </div>

      {/* Points de Déchets */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <Trash2 className="h-6 w-6 text-green-600" />
          <h3 className="text-xl font-bold text-gray-800">🗑️ Points de Déchets</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <p className="text-sm text-gray-600 font-medium mb-1">Total signalé</p>
            <p className="text-3xl font-bold text-gray-700">{stats.wastePoints?.total || 0}</p>
          </div>

          <div className="bg-red-50 rounded-lg p-4 border border-red-200">
            <p className="text-sm text-red-600 font-medium mb-1">En attente</p>
            <p className="text-3xl font-bold text-red-700">{stats.wastePoints?.reported || 0}</p>
            <p className="text-sm text-red-600 mt-2">À nettoyer</p>
          </div>

          <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
            <p className="text-sm text-emerald-600 font-medium mb-1">Nettoyés</p>
            <p className="text-3xl font-bold text-emerald-700">{stats.wastePoints?.cleaned || 0}</p>
            <p className="text-sm text-emerald-600 mt-2">
              {stats.wastePoints?.total > 0 
                ? Math.round((stats.wastePoints?.cleaned / stats.wastePoints?.total) * 100) 
                : 0}% complété
            </p>
          </div>
        </div>
      </div>

      {/* Bouton de rafraîchissement */}
      <div className="flex justify-center">
        <button
          onClick={loadStatistics}
          className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
        >
          <Activity className="h-5 w-5" />
          Actualiser les Statistiques
        </button>
      </div>
    </div>
  );
};

// Composant StatCard
const StatCard = ({ icon: Icon, title, value, subtitle, color }) => {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 text-blue-600',
    emerald: 'bg-emerald-50 border-emerald-200 text-emerald-600',
    orange: 'bg-orange-50 border-orange-200 text-orange-600',
    purple: 'bg-purple-50 border-purple-200 text-purple-600'
  };

  const iconColorClasses = {
    blue: 'text-blue-600',
    emerald: 'text-emerald-600',
    orange: 'text-orange-600',
    purple: 'text-purple-600'
  };

  return (
    <div className={`${colorClasses[color]} rounded-lg p-6 border shadow-sm`}>
      <div className="flex items-center gap-3 mb-4">
        <Icon className={`h-8 w-8 ${iconColorClasses[color]}`} />
        <h3 className="font-bold text-gray-800">{title}</h3>
      </div>
      <p className="text-4xl font-bold text-gray-900 mb-2">{value}</p>
      <p className="text-sm text-gray-600">{subtitle}</p>
    </div>
  );
};

export default AdminStatistiques;