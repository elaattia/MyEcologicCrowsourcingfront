// src/components/Organisation/OrgDashboardContent.jsx
import React, { useEffect, useState } from 'react';
import { Building2, Truck, MapPin, TrendingUp, AlertCircle, Loader } from 'lucide-react';
import wasteApi from '../../services/api/wasteApi';
import { vehiculeApi, depotApi } from '../../services/api/organisationApis';

const OrgDashboardContent = ({ user }) => {
  const [stats, setStats] = useState({
    totalDechets: 0,
    totalSignales: 0,
    totalNettoyés: 0,
    pourcentageNettoyage: 0
  });
  const [vehiculesCount, setVehiculesCount] = useState(0);
  const [depotsCount, setDepotsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        
        // Récupérer les statistiques des déchets
        const statsData = await wasteApi.getStatistics();
        setStats({
          totalDechets: statsData.totalDechets || 0,
          totalSignales: statsData.totalSignales || 0,
          totalNettoyés: statsData.totalNettoyés || 0,
          pourcentageNettoyage: statsData.pourcentageNettoyage || 0
        });

        // Récupérer le nombre de véhicules
        try {
          const vehicules = await vehiculeApi.getAll();
          setVehiculesCount(Array.isArray(vehicules) ? vehicules.length : 0);
        } catch (err) {
          console.error('Erreur véhicules:', err);
          setVehiculesCount(0);
        }

        // Récupérer le nombre de dépôts
        try {
          const depots = await depotApi.getAll();
          setDepotsCount(Array.isArray(depots) ? depots.length : 0);
        } catch (err) {
          console.error('Erreur dépôts:', err);
          setDepotsCount(0);
        }

      } catch (err) {
        console.error('Erreur chargement dashboard:', err);
        setError(err.message || 'Erreur de chargement');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="space-y-8">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Tableau de bord Organisation 🏢
          </h2>
          <p className="text-gray-600">
            Bienvenue, {user?.username || 'Organisation'}
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-blue-100 rounded-xl shadow-lg">
          <Building2 size={20} className="text-blue-600" />
          <span className="text-blue-700 font-medium">Espace Organisation</span>
        </div>
      </div>

      {/* Messages d'erreur */}
      {error && (
        <div className="bg-red-50 border-2 border-red-200 text-red-700 px-6 py-4 rounded-xl flex items-center gap-3">
          <AlertCircle size={20} />
          <p>{error}</p>
        </div>
      )}

      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Total déchets signalés */}
        <div className="bg-white rounded-2xl p-6 shadow-xl text-center border-l-4 border-emerald-500">
          <div className="bg-emerald-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <MapPin className="text-emerald-600" size={32} />
          </div>
          <p className="text-4xl font-bold text-emerald-600 mb-2">
            {loading ? <Loader className="animate-spin mx-auto" size={32} /> : stats.totalDechets}
          </p>
          <p className="text-gray-600 font-medium">Déchets dans la zone</p>
        </div>

        {/* En attente */}
        <div className="bg-white rounded-2xl p-6 shadow-xl text-center border-l-4 border-amber-500">
          <div className="bg-amber-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="text-amber-600" size={32} />
          </div>
          <p className="text-4xl font-bold text-amber-600 mb-2">
            {loading ? <Loader className="animate-spin mx-auto" size={32} /> : stats.totalSignales}
          </p>
          <p className="text-gray-600 font-medium">En attente de collecte</p>
        </div>

        {/* Véhicules */}
        <div className="bg-white rounded-2xl p-6 shadow-xl text-center border-l-4 border-blue-500">
          <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Truck className="text-blue-600" size={32} />
          </div>
          <p className="text-4xl font-bold text-blue-600 mb-2">
            {loading ? <Loader className="animate-spin mx-auto" size={32} /> : vehiculesCount}
          </p>
          <p className="text-gray-600 font-medium">Véhicules disponibles</p>
        </div>

        {/* Dépôts */}
        <div className="bg-white rounded-2xl p-6 shadow-xl text-center border-l-4 border-purple-500">
          <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Building2 className="text-purple-600" size={32} />
          </div>
          <p className="text-4xl font-bold text-purple-600 mb-2">
            {loading ? <Loader className="animate-spin mx-auto" size={32} /> : depotsCount}
          </p>
          <p className="text-gray-600 font-medium">Dépôts actifs</p>
        </div>
      </div>

      {/* Taux de nettoyage */}
      {!loading && stats.totalDechets > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-xl">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <TrendingUp size={20} className="text-emerald-600" />
            Performance de nettoyage
          </h3>
          <div className="flex items-center gap-4">
            <div className="flex-1 bg-gray-200 rounded-full h-6 overflow-hidden">
              <div
                className="bg-gradient-to-r from-emerald-500 to-cyan-500 h-full transition-all duration-500"
                style={{ width: `${stats.pourcentageNettoyage}%` }}
              ></div>
            </div>
            <span className="text-2xl font-bold text-emerald-600 min-w-[80px] text-right">
              {stats.pourcentageNettoyage.toFixed(1)}%
            </span>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            {stats.totalNettoyés} déchets nettoyés sur {stats.totalDechets} signalés
          </p>
        </div>
      )}

      {/* Actions rapides */}
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-6">Actions rapides</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-xl p-6 hover:shadow-md transition cursor-pointer border border-blue-200">
            <div className="bg-gradient-to-br from-blue-400 to-blue-500 w-12 h-12 rounded-full flex items-center justify-center mb-4 shadow-lg">
              <MapPin className="text-white" size={24} />
            </div>
            <h4 className="text-lg font-semibold text-gray-800 mb-2">
              Voir la cartographie
            </h4>
            <p className="text-gray-600 text-sm">
              Visualisez tous les déchets signalés sur la carte
            </p>
          </div>

          <div className="bg-emerald-50 rounded-xl p-6 hover:shadow-md transition cursor-pointer border border-emerald-200">
            <div className="bg-gradient-to-br from-emerald-400 to-emerald-500 w-12 h-12 rounded-full flex items-center justify-center mb-4 shadow-lg">
              <Truck className="text-white" size={24} />
            </div>
            <h4 className="text-lg font-semibold text-gray-800 mb-2">
              Optimiser les tournées
            </h4>
            <p className="text-gray-600 text-sm">
              Planifiez les itinéraires de collecte optimaux
            </p>
          </div>

          <div className="bg-purple-50 rounded-xl p-6 hover:shadow-md transition cursor-pointer border border-purple-200">
            <div className="bg-gradient-to-br from-purple-400 to-purple-500 w-12 h-12 rounded-full flex items-center justify-center mb-4 shadow-lg">
              <TrendingUp className="text-white" size={24} />
            </div>
            <h4 className="text-lg font-semibold text-gray-800 mb-2">
              Statistiques détaillées
            </h4>
            <p className="text-gray-600 text-sm">
              Analysez les performances de votre organisation
            </p>
          </div>
        </div>
      </div>

      {/* Conseil du jour */}
      <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl shadow-xl p-6 text-white">
        <div className="flex items-start gap-4">
          <div className="bg-white/20 backdrop-blur p-3 rounded-xl">
            <AlertCircle size={24} />
          </div>
          <div>
            <h3 className="text-xl font-bold mb-2">💡 Astuce d'optimisation</h3>
            <p className="text-white/90">
              Planifiez vos tournées de collecte aux heures creuses pour réduire les temps de trajet 
              et améliorer l'efficacité de votre organisation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrgDashboardContent;