// components/WasteHistory.jsx - VERSION COMPLÈTE AVEC RECOMMANDATIONS
import React, { useState, useEffect } from 'react';
import { 
  Trash2, MapPin, Calendar, Filter, Search, Eye, 
  CheckCircle, Clock, AlertCircle, Download, Loader, X, Leaf
} from 'lucide-react';
import wasteApi from '../services/api/wasteApi';
import EcologicalRecommendations from './User/EcologicalRecommendations';

const WasteHistory = ({ user }) => {
  const [wastes, setWastes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filtres
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [sortBy, setSortBy] = useState('Date');
  const [descending, setDescending] = useState(true);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  
  // Modale
  const [selectedWaste, setSelectedWaste] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Charger les données
  useEffect(() => {
    fetchWastes();
  }, [currentPage, selectedType, selectedStatus, sortBy, descending, searchTerm]);

  const fetchWastes = async () => {
    setLoading(true);
    setError('');
    
    try {
      const filters = {
        page: currentPage,
        pageSize: 10,
        search: searchTerm,
        type: selectedType,
        statut: selectedStatus,
        sortBy: sortBy,
        descending: descending
      };

      const response = await wasteApi.getMyWastes(filters);
      
      setWastes(response.data || []);
      setTotalPages(response.totalPages || 1);
      setTotalCount(response.totalCount || 0);
    } catch (err) {
      console.error('Erreur fetchWastes:', err);
      setError(err.message || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  // Mapping des statuts backend → frontend
  const getStatusDisplay = (statut) => {
    const statusMap = {
      'Signale': 'Signalé',
      'Nettoye': 'Nettoyé'
    };
    return statusMap[statut] || statut;
  };

  // Couleurs des statuts
  const getStatusColor = (status) => {
    const colors = {
      'Signalé': 'bg-amber-100 text-amber-800 border-amber-300',
      'Signale': 'bg-amber-100 text-amber-800 border-amber-300',
      'En cours': 'bg-blue-100 text-blue-800 border-blue-300',
      'Nettoyé': 'bg-emerald-100 text-emerald-800 border-emerald-300',
      'Nettoye': 'bg-emerald-100 text-emerald-800 border-emerald-300'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  // Icônes des statuts
  const getStatusIcon = (status) => {
    if (status === 'Signalé' || status === 'Signale') return <AlertCircle size={18} />;
    if (status === 'En cours') return <Clock size={18} />;
    if (status === 'Nettoyé' || status === 'Nettoye') return <CheckCircle size={18} />;
    return <AlertCircle size={18} />;
  };

  // Couleurs des types
  const getTypeColor = (type) => {
    const colors = {
      'Plastique': 'bg-blue-50 border-blue-200 text-blue-800',
      'Verre': 'bg-purple-50 border-purple-200 text-purple-800',
      'Metale': 'bg-gray-50 border-gray-200 text-gray-800',
      'Pile': 'bg-red-50 border-red-200 text-red-800',
      'Papier': 'bg-amber-50 border-amber-200 text-amber-800',
      'Autre': 'bg-gray-50 border-gray-200 text-gray-800'
    };
    return colors[type] || 'bg-gray-50 border-gray-200 text-gray-800';
  };

  const handleViewDetails = (waste) => {
    setSelectedWaste(waste);
    setShowModal(true);
  };

  // Statistiques
  const stats = {
    total: totalCount,
    reported: wastes.filter(w => w.statut === 'Signale').length,
    cleaned: wastes.filter(w => w.statut === 'Nettoye').length
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
        <Trash2 size={32} className="text-emerald-600" />
        Historique de mes signalements
      </h2>

      {/* Statistiques */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-blue-600 mb-1">{stats.total}</div>
          <p className="text-sm text-blue-700 font-medium">Total signalements</p>
        </div>
        <div className="bg-gradient-to-br from-amber-50 to-amber-100 border-2 border-amber-200 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-amber-600 mb-1">{stats.reported}</div>
          <p className="text-sm text-amber-700 font-medium">En attente</p>
        </div>
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-2 border-emerald-200 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-emerald-600 mb-1">{stats.cleaned}</div>
          <p className="text-sm text-emerald-700 font-medium">Nettoyés</p>
        </div>
      </div>

      {/* Contrôles de recherche et filtrage */}
      <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
        <h3 className="font-bold text-gray-800 flex items-center gap-2">
          <Filter size={20} />
          Filtres et recherche
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {/* Recherche */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Recherche</label>
            <div className="relative">
              <Search size={18} className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Zone, pays..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
            <select
              value={selectedType}
              onChange={(e) => {
                setSelectedType(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">Tous</option>
              <option value="Plastique">Plastique</option>
              <option value="Verre">Verre</option>
              <option value="Metale">Métal</option>
              <option value="Pile">Pile</option>
              <option value="Papier">Papier</option>
              <option value="Autre">Autre</option>
            </select>
          </div>

          {/* Statut */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">Tous</option>
              <option value="Signale">Signalé</option>
              <option value="Nettoye">Nettoyé</option>
            </select>
          </div>

          {/* Tri */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tri</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
            >
              <option value="Date">Date</option>
              <option value="Type">Type</option>
              <option value="Statut">Statut</option>
              <option value="Zone">Zone</option>
            </select>
          </div>
        </div>

        {/* Ordre croissant/décroissant */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="descending"
            checked={descending}
            onChange={(e) => setDescending(e.target.checked)}
            className="w-4 h-4"
          />
          <label htmlFor="descending" className="text-sm text-gray-700">
            Ordre décroissant
          </label>
        </div>
      </div>

      {/* Message d'erreur */}
      {error && (
        <div className="bg-red-50 border-2 border-red-200 text-red-700 px-6 py-4 rounded-xl flex items-center gap-3">
          <AlertCircle size={20} />
          <p>{error}</p>
        </div>
      )}

      {/* Liste des déchets */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader className="animate-spin text-emerald-600" size={40} />
          <p className="ml-4 text-gray-600">Chargement...</p>
        </div>
      ) : wastes.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
          <Trash2 size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 text-lg">Aucun déchet trouvé</p>
          <p className="text-gray-500 text-sm mt-2">
            Modifiez vos filtres ou signalez votre premier déchet
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b-2 border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Image</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Type</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Localisation</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Date</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Statut</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {wastes.map((waste) => (
                  <tr key={waste.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <img
                        src={`http://localhost:5008${waste.url}`}
                        alt="Déchet"
                        className="w-16 h-16 object-cover rounded-lg shadow"
                        onError={(e) => {
                          e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="64" height="64"%3E%3Crect fill="%23f0f0f0" width="64" height="64"/%3E%3C/svg%3E';
                        }}
                      />
                    </td>
                    <td className="px-6 py-4">
                      {waste.type ? (
                        <span className={`px-3 py-1 rounded-lg border-2 text-xs font-bold ${getTypeColor(waste.type)}`}>
                          {waste.type}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-sm">Non classifié</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-2">
                        <MapPin size={16} className="text-gray-400 flex-shrink-0 mt-1" />
                        <div className="text-sm">
                          <p className="font-medium text-gray-800">{waste.zone}</p>
                          <p className="text-gray-500">{waste.pays}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-gray-400" />
                        <span className="text-sm text-gray-700">
                          {new Date(waste.date).toLocaleDateString()}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-lg border-2 text-xs font-bold flex items-center gap-2 w-fit ${getStatusColor(waste.statut)}`}>
                        {getStatusIcon(waste.statut)}
                        {getStatusDisplay(waste.statut)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleViewDetails(waste)}
                        className="flex items-center gap-2 px-3 py-2 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition text-sm font-medium"
                      >
                        <Eye size={16} />
                        Détails
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t-2 border-gray-200">
              <div className="text-sm text-gray-700">
                Page {currentPage} sur {totalPages} • {totalCount} résultat(s)
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
                >
                  Précédent
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
                >
                  Suivant
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal de détails avec recommandations écologiques */}
      {showModal && selectedWaste && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-emerald-500 to-cyan-500 p-6 flex justify-between items-center z-10">
              <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                <Trash2 size={28} />
                Détails du déchet
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-white/20 rounded-lg transition"
              >
                <X className="text-white" size={28} />
              </button>
            </div>

            <div className="p-8 space-y-6">
              {/* Image */}
              <div>
                <img
                  src={`http://localhost:5008${selectedWaste.url}`}
                  alt="Déchet"
                  className="w-full h-64 object-cover rounded-xl shadow-lg"
                  onError={(e) => {
                    e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23f0f0f0" width="400" height="300"/%3E%3C/svg%3E';
                  }}
                />
              </div>

              {/* Informations */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">Type</p>
                  <p className="font-bold text-gray-800">
                    {selectedWaste.type || 'Non classifié'}
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">Statut</p>
                  <span className={`inline-block px-3 py-1 rounded-lg text-sm font-bold ${getStatusColor(selectedWaste.statut)}`}>
                    {getStatusDisplay(selectedWaste.statut)}
                  </span>
                </div>

                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">Zone</p>
                  <p className="font-bold text-gray-800">{selectedWaste.zone}</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">Pays</p>
                  <p className="font-bold text-gray-800">{selectedWaste.pays}</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">Latitude</p>
                  <p className="font-bold text-gray-800">{selectedWaste.latitude.toFixed(6)}</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">Longitude</p>
                  <p className="font-bold text-gray-800">{selectedWaste.longitude.toFixed(6)}</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-xl col-span-2">
                  <p className="text-sm text-gray-600 mb-1">Date de signalement</p>
                  <p className="font-bold text-gray-800">
                    {new Date(selectedWaste.date).toLocaleDateString()} à{' '}
                    {new Date(selectedWaste.date).toLocaleTimeString()}
                  </p>
                </div>

                {selectedWaste.volumeEstime && (
                  <div className="bg-gray-50 p-4 rounded-xl col-span-2">
                    <p className="text-sm text-gray-600 mb-1">Volume estimé</p>
                    <p className="font-bold text-gray-800">{selectedWaste.volumeEstime} kg</p>
                  </div>
                )}
              </div>

              {/* Section des recommandations écologiques */}
              <div className="border-t-2 border-gray-200 pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <Leaf className="text-emerald-600" size={24} />
                  <h4 className="text-xl font-bold text-gray-800">
                    Recommandations écologiques
                  </h4>
                </div>
                <EcologicalRecommendations wastePointId={selectedWaste.id} />
              </div>

              <button
                onClick={() => setShowModal(false)}
                className="w-full px-6 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-xl hover:shadow-lg transition font-bold"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WasteHistory;