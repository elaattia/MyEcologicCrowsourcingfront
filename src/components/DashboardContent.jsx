// ===================================================================
// src/components/DashboardContent.jsx - VERSION DYNAMIQUE
// ===================================================================
import React, { useEffect, useState } from 'react';
import { MapPin, TrendingUp, Award, AlertCircle, Loader } from 'lucide-react';
import wasteApi from '../services/api/wasteApi';

const DashboardContent = ({ user }) => {
  const [stats, setStats] = useState({
    totalDechets: 0,
    totalSignales: 0,
    totalNettoyés: 0,
    pourcentageNettoyage: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError('');
        
        const data = await wasteApi.getMyStatistics();
        
        setStats({
          totalDechets: data.totalDechets || 0,
          totalSignales: data.totalSignales || 0,
          totalNettoyés: data.totalNettoyés || 0,
          pourcentageNettoyage: data.pourcentageNettoyage || 0
        });
      } catch (err) {
        console.error('Erreur stats:', err);
        setError(err.message || 'Erreur de chargement');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Bonjour, {user?.username || 'Utilisateur'} 👋
          </h2>
          <p className="text-gray-600">Bienvenue sur votre tableau de bord écologique</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-white/95 backdrop-blur rounded-xl shadow-lg">
          <MapPin size={20} className="text-emerald-600" />
          <span className="text-emerald-700 font-medium">Espace personnel</span>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-2 border-red-200 text-red-700 px-6 py-4 rounded-xl flex items-center gap-3">
          <AlertCircle size={20} />
          <p>{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/95 backdrop-blur rounded-2xl p-6 shadow-xl text-center">
          <div className="bg-emerald-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <MapPin className="text-emerald-600" size={36} />
          </div>
          <p className="text-5xl font-bold text-emerald-600 mb-2">
            {loading ? <Loader className="animate-spin mx-auto" size={40} /> : stats.totalDechets}
          </p>
          <p className="text-gray-600 font-medium">Signalements effectués</p>
        </div>

        <div className="bg-white/95 backdrop-blur rounded-2xl p-6 shadow-xl text-center">
          <div className="bg-amber-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="text-amber-600" size={36} />
          </div>
          <p className="text-5xl font-bold text-amber-600 mb-2">
            {loading ? <Loader className="animate-spin mx-auto" size={40} /> : stats.totalSignales}
          </p>
          <p className="text-gray-600 font-medium">En attente</p>
        </div>

        <div className="bg-white/95 backdrop-blur rounded-2xl p-6 shadow-xl text-center">
          <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="text-blue-600" size={36} />
          </div>
          <p className="text-5xl font-bold text-blue-600 mb-2">
            {loading ? <Loader className="animate-spin mx-auto" size={40} /> : stats.totalNettoyés}
          </p>
          <p className="text-gray-600 font-medium">Déchets nettoyés</p>
        </div>
      </div>

      {!loading && stats.totalDechets > 0 && (
        <div className="bg-white/95 backdrop-blur rounded-2xl p-6 shadow-xl">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Taux de nettoyage</h3>
          <div className="flex items-center gap-4">
            <div className="flex-1 bg-gray-200 rounded-full h-6 overflow-hidden">
              <div
                className="bg-gradient-to-r from-emerald-500 to-cyan-500 h-full transition-all duration-500"
                style={{ width: `${stats.pourcentageNettoyage}%` }}
              ></div>
            </div>
            <span className="text-2xl font-bold text-emerald-600">
              {stats.pourcentageNettoyage.toFixed(1)}%
            </span>
          </div>
        </div>
      )}

      <div className="bg-white/95 backdrop-blur rounded-2xl shadow-xl p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-6">Actions rapides</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-emerald-50 rounded-xl p-6 hover:shadow-md transition cursor-pointer border border-emerald-200">
            <div className="bg-gradient-to-br from-emerald-400 to-emerald-500 w-12 h-12 rounded-full flex items-center justify-center mb-4 shadow-lg">
              <MapPin className="text-white" size={24} />
            </div>
            <h4 className="text-lg font-semibold text-gray-800 mb-2">Signaler un déchet</h4>
            <p className="text-gray-600 text-sm">Prenez une photo et localisez un nouveau déchet</p>
          </div>

          <div className="bg-blue-50 rounded-xl p-6 hover:shadow-md transition cursor-pointer border border-blue-200">
            <div className="bg-gradient-to-br from-blue-400 to-blue-500 w-12 h-12 rounded-full flex items-center justify-center mb-4 shadow-lg">
              <MapPin className="text-white" size={24} />
            </div>
            <h4 className="text-lg font-semibold text-gray-800 mb-2">Voir la carte</h4>
            <p className="text-gray-600 text-sm">Explorez les déchets signalés dans votre région</p>
          </div>

          <div className="bg-amber-50 rounded-xl p-6 hover:shadow-md transition cursor-pointer border border-amber-200">
            <div className="bg-gradient-to-br from-amber-400 to-amber-500 w-12 h-12 rounded-full flex items-center justify-center mb-4 shadow-lg">
              <Award className="text-white" size={24} />
            </div>
            <h4 className="text-lg font-semibold text-gray-800 mb-2">Mes statistiques</h4>
            <p className="text-gray-600 text-sm">Suivez votre impact environnemental</p>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-500 rounded-2xl shadow-xl p-6 text-white">
        <div className="flex items-start gap-4">
          <div className="bg-white/20 backdrop-blur p-3 rounded-xl">
            <AlertCircle size={24} />
          </div>
          <div>
            <h3 className="text-xl font-bold mb-2">💡 Conseil du jour</h3>
            <p className="text-white/90">
              Chaque signalement compte ! En participant activement, vous contribuez à créer un environnement plus propre pour tous.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardContent;