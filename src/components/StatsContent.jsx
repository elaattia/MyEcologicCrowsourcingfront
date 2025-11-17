// components/StatsContent.jsx - VERSION DYNAMIQUE COMPLÈTE
import React, { useState, useEffect } from 'react';
import { 
  BarChart3, Download, TrendingUp, MapPin, Users, 
  Calendar, Loader, AlertCircle, Filter 
} from 'lucide-react';
import wasteApi from '../services/api/wasteApi';

const StatsContent = ({ user }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    dateDebut: '',
    dateFin: ''
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    setError('');
    
    try {
      const params = {};
      if (filters.dateDebut) params.dateDebut = filters.dateDebut;
      if (filters.dateFin) params.dateFin = filters.dateFin;

      const data = await wasteApi.getMyStatistics(
        filters.dateDebut || null,
        filters.dateFin || null
      );
      
      setStats(data);
    } catch (err) {
      console.error('Erreur chargement stats:', err);
      setError(err.message || 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (format) => {
    try {
      await wasteApi.downloadStatistics(format, filters);
    } catch (err) {
      console.error('Erreur téléchargement:', err);
      alert('Erreur lors du téléchargement');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader className="animate-spin text-emerald-600" size={40} />
        <p className="ml-4 text-gray-600">Chargement des statistiques...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-2 border-red-200 text-red-700 px-6 py-4 rounded-xl flex items-center gap-3">
        <AlertCircle size={20} />
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <BarChart3 size={32} className="text-amber-600" />
          Mes statistiques détaillées
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => handleDownload('csv')}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
          >
            <Download size={18} />
            CSV
          </button>
          <button
            onClick={() => handleDownload('excel')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <Download size={18} />
            Excel
          </button>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Filter size={20} />
          Filtrer par période
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date début
            </label>
            <input
              type="date"
              value={filters.dateDebut}
              onChange={(e) => setFilters({ ...filters, dateDebut: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border-2 border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date fin
            </label>
            <input
              type="date"
              value={filters.dateFin}
              onChange={(e) => setFilters({ ...filters, dateFin: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border-2 border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={fetchStats}
              className="w-full px-6 py-2 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-lg hover:shadow-lg transition font-medium"
            >
              Appliquer
            </button>
          </div>
        </div>
      </div>

      {stats && (
        <>
          {/* Résumé global */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-lg text-center border-l-4 border-emerald-500">
              <div className="text-4xl font-bold text-emerald-600 mb-2">
                {stats.totalDechets}
              </div>
              <p className="text-gray-600 font-medium">Total signalements</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg text-center border-l-4 border-amber-500">
              <div className="text-4xl font-bold text-amber-600 mb-2">
                {stats.totalSignales}
              </div>
              <p className="text-gray-600 font-medium">En attente</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg text-center border-l-4 border-blue-500">
              <div className="text-4xl font-bold text-blue-600 mb-2">
                {stats.totalNettoyés}
              </div>
              <p className="text-gray-600 font-medium">Traités</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg text-center border-l-4 border-purple-500">
              <div className="text-4xl font-bold text-purple-600 mb-2">
                {stats.pourcentageNettoyage.toFixed(1)}%
              </div>
              <p className="text-gray-600 font-medium">Taux nettoyage</p>
            </div>
          </div>

          {/* Taux de nettoyage */}
          {stats.totalDechets > 0 && (
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <TrendingUp size={20} className="text-emerald-600" />
                Performance
              </h3>
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

          {/* Par statut */}
          {stats.parStatut && stats.parStatut.length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                Répartition par statut
              </h3>
              <div className="space-y-3">
                {stats.parStatut.map((item) => (
                  <div key={item.statut} className="flex items-center gap-4">
                    <div className="w-32 text-sm font-medium text-gray-700">
                      {item.statut}
                    </div>
                    <div className="flex-1 bg-gray-200 rounded-full h-8 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-emerald-500 to-cyan-500 h-full flex items-center justify-end pr-3 text-white text-sm font-bold transition-all"
                        style={{ width: `${item.pourcentage}%` }}
                      >
                        {item.nombre}
                      </div>
                    </div>
                    <div className="w-20 text-right text-sm font-bold text-gray-800">
                      {item.pourcentage.toFixed(1)}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Par type */}
          {stats.parType && stats.parType.length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                Répartition par type
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {stats.parType.map((item) => (
                  <div
                    key={item.type}
                    className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-200"
                  >
                    <p className="text-sm text-gray-600 mb-1">{item.type}</p>
                    <p className="text-2xl font-bold text-blue-600 mb-1">{item.nombre}</p>
                    <p className="text-xs text-gray-500">{item.pourcentage.toFixed(1)}%</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Par zone */}
          {stats.parZone && stats.parZone.length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <MapPin size={20} className="text-blue-600" />
                Top zones
              </h3>
              <div className="space-y-3">
                {stats.parZone.slice(0, 5).map((item, index) => (
                  <div
                    key={item.zone}
                    className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                  >
                    <div className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">{item.zone}</p>
                      <p className="text-xs text-gray-600">
                        {item.signales} signalés • {item.nettoyés} nettoyés
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-blue-600">{item.nombre}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Évolution temporelle */}
          {stats.parDate && stats.parDate.length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Calendar size={20} className="text-purple-600" />
                Évolution dans le temps
              </h3>
              <div className="space-y-2">
                {stats.parDate.slice(-10).map((item) => (
                  <div key={item.date} className="flex items-center gap-3 text-sm">
                    <span className="text-gray-600 w-32">
                      {new Date(item.date).toLocaleDateString()}
                    </span>
                    <div className="flex-1 flex gap-2">
                      <div className="flex-1 bg-amber-200 rounded h-6 flex items-center justify-center text-amber-800 font-bold text-xs">
                        {item.signales}
                      </div>
                      <div className="flex-1 bg-emerald-200 rounded h-6 flex items-center justify-center text-emerald-800 font-bold text-xs">
                        {item.nettoyés}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default StatsContent;