// src/components/Organisation/OrgStatistiques.jsx
import React, { useState, useEffect } from 'react';
import { BarChart3, Download, Loader, AlertCircle, TrendingUp, MapPin, Users } from 'lucide-react';
import wasteApi from '../../services/api/wasteApi';

const OrgStatistiques = ({ user }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    dateDebut: '',
    dateFin: '',
    zone: '',
    pays: ''
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
      if (filters.zone) params.zone = filters.zone;
      if (filters.pays) params.pays = filters.pays;

      const data = await wasteApi.getStatistics(params);
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
        <Loader className="animate-spin text-blue-600" size={40} />
        <p className="ml-4 text-gray-600">Chargement des statistiques...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <BarChart3 size={32} className="text-purple-600" />
          Statistiques détaillées
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

      {error && (
        <div className="bg-red-50 border-2 border-red-200 text-red-700 px-6 py-4 rounded-xl flex items-center gap-3">
          <AlertCircle size={20} />
          <p>{error}</p>
        </div>
      )}

      {/* Filtres */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="font-bold text-gray-800 mb-4">Filtres</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date début
            </label>
            <input
              type="date"
              value={filters.dateDebut}
              onChange={(e) => setFilters({ ...filters, dateDebut: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border-2 border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
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
              className="w-full px-4 py-2 rounded-lg border-2 border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Zone
            </label>
            <input
              type="text"
              value={filters.zone}
              onChange={(e) => setFilters({ ...filters, zone: e.target.value })}
              placeholder="Ex: Tunis"
              className="w-full px-4 py-2 rounded-lg border-2 border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pays
            </label>
            <input
              type="text"
              value={filters.pays}
              onChange={(e) => setFilters({ ...filters, pays: e.target.value })}
              placeholder="Ex: Tunisie"
              className="w-full px-4 py-2 rounded-lg border-2 border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
            />
          </div>
        </div>

        <button
          onClick={fetchStats}
          className="mt-4 w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition font-medium"
        >
          Appliquer les filtres
        </button>
      </div>

      {stats && (
        <>
          {/* Résumé global */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-lg text-center border-l-4 border-emerald-500">
              <div className="text-4xl font-bold text-emerald-600 mb-2">
                {stats.totalDechets}
              </div>
              <p className="text-gray-600 font-medium">Total déchets</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg text-center border-l-4 border-amber-500">
              <div className="text-4xl font-bold text-amber-600 mb-2">
                {stats.totalSignales}
              </div>
              <p className="text-gray-600 font-medium">Signalés</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg text-center border-l-4 border-blue-500">
              <div className="text-4xl font-bold text-blue-600 mb-2">
                {stats.totalNettoyés}
              </div>
              <p className="text-gray-600 font-medium">Nettoyés</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg text-center border-l-4 border-purple-500">
              <div className="text-4xl font-bold text-purple-600 mb-2">
                {stats.pourcentageNettoyage}%
              </div>
              <p className="text-gray-600 font-medium">Taux nettoyage</p>
            </div>
          </div>

          {/* Par statut */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <TrendingUp size={20} className="text-emerald-600" />
              Répartition par statut
            </h3>
            <div className="space-y-3">
              {stats.parStatut?.map((item) => (
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

          {/* Par type */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Répartition par type
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {stats.parType?.map((item) => (
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

          {/* Top zones */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <MapPin size={20} className="text-blue-600" />
              Top 10 zones
            </h3>
            <div className="space-y-3">
              {stats.parZone?.slice(0, 10).map((item, index) => (
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
                      {item.signales} signalés • {item.nettoyés} nettoyés • 
                      {item.pourcentageNettoyage.toFixed(1)}% traités
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-blue-600">{item.nombre}</p>
                    <p className="text-xs text-gray-600">déchets</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top utilisateurs */}
          {stats.topUtilisateurs && stats.topUtilisateurs.length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Users size={20} className="text-purple-600" />
                Top contributeurs
              </h3>
              <div className="space-y-3">
                {stats.topUtilisateurs.slice(0, 10).map((item, index) => (
                  <div
                    key={item.userId}
                    className="flex items-center gap-4 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200"
                  >
                    <div className="bg-purple-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">{item.userName}</p>
                      <p className="text-xs text-gray-600">
                        {item.nombreDechetsSignales} signalés • 
                        {item.nombreDechetsNettoyés} nettoyés
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-purple-600">
                        {item.nombreDechetsSignales + item.nombreDechetsNettoyés}
                      </p>
                      <p className="text-xs text-gray-600">total</p>
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

export default OrgStatistiques;