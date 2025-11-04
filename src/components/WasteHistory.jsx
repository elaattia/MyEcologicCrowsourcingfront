// components/WasteHistory.jsx - Partie 1
import React, { useState, useEffect } from 'react';
import { 
  Trash2, MapPin, Calendar, Filter, Search, Eye, 
  CheckCircle, Clock, AlertCircle, Download, Loader
} from 'lucide-react';
import wasteApi from '../services/api/wasteApi';

const WasteHistory = () => {
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

  // Statistiques
  const stats = {
    total: totalCount,
    reported: wastes.filter(w => w.statut === 'Signale').length,
    cleaning: wastes.filter(w => w.statut === 'En cours').length,
    cleaned: wastes.filter(w => w.statut === 'Nettoye').length
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
        <Trash2 size={32} className="text-emerald-600" />
        Historique de mes signalements
      </h2>

      {/* Statistiques */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-blue-600 mb-1">{stats.total}</div>
          <p className="text-sm text-blue-700 font-medium">Total signalements</p>
        </div>
        <div className="bg-gradient-to-br from-amber-50 to-amber-100 border-2 border-amber-200 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-amber-600 mb-1">{stats.reported}</div>
          <p className="text-sm text-amber-700 font-medium">En attente</p>
        </div>
        <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 border-2 border-cyan-200 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-cyan-600 mb-1">{stats.cleaning}</div>
          <p className="text-sm text-cyan-700 font-medium">En cours</p>
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

      
    </div>
  );
};

export default WasteHistory;