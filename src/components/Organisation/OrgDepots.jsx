// src/components/Organisation/OrgDepots.jsx
import React, { useState, useEffect } from 'react';
import { Building2, Plus, Edit2, Trash2, Loader, AlertCircle, CheckCircle, X, MapPin } from 'lucide-react';
import { depotApi } from '../../services/api/organisationApis';

const OrgDepots = ({ user }) => {
  const [depots, setDepots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingDepot, setEditingDepot] = useState(null);
  const [formData, setFormData] = useState({
    nom: '',
    latitude: '',
    longitude: '',
    capaciteMax: '',
    estActif: true
  });

  useEffect(() => {
    fetchDepots();
  }, []);

  const fetchDepots = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await depotApi.getAll();
      setDepots(data || []);
    } catch (err) {
      console.error('Erreur chargement dépôts:', err);
      setError(err.message || 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (depot = null) => {
    if (depot) {
      setEditingDepot(depot);
      setFormData({
        nom: depot.nom || '',
        latitude: depot.latitude || '',
        longitude: depot.longitude || '',
        capaciteMax: depot.capaciteMax || '',
        estActif: depot.estActif !== false
      });
    } else {
      setEditingDepot(null);
      setFormData({
        nom: '',
        latitude: '',
        longitude: '',
        capaciteMax: '',
        estActif: true
      });
    }
    setShowModal(true);
    setError('');
    setSuccess('');
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingDepot(null);
    setError('');
  };

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData({
            ...formData,
            latitude: position.coords.latitude.toFixed(6),
            longitude: position.coords.longitude.toFixed(6)
          });
        },
        (error) => {
          console.error('Erreur géolocalisation:', error);
          alert('Impossible d\'obtenir votre position. Veuillez autoriser la géolocalisation.');
        }
      );
    } else {
      alert('La géolocalisation n\'est pas supportée par votre navigateur');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const depotData = {
        ...formData,
        organisationId: user.organisationId,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        capaciteMax: parseFloat(formData.capaciteMax)
      };

      if (editingDepot) {
        await depotApi.update(editingDepot.id, depotData);
        setSuccess('Dépôt modifié avec succès');
      } else {
        await depotApi.create(depotData);
        setSuccess('Dépôt ajouté avec succès');
      }

      await fetchDepots();
      handleCloseModal();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Erreur sauvegarde dépôt:', err);
      setError(err.message || 'Erreur lors de la sauvegarde');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce dépôt ?')) {
      return;
    }

    try {
      await depotApi.delete(id);
      setSuccess('Dépôt supprimé avec succès');
      await fetchDepots();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Erreur suppression dépôt:', err);
      setError(err.message || 'Erreur lors de la suppression');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader className="animate-spin text-blue-600" size={40} />
        <p className="ml-4 text-gray-600">Chargement des dépôts...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <Building2 size={32} className="text-purple-600" />
          Gestion des dépôts
        </h2>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition font-medium"
        >
          <Plus size={20} />
          Ajouter un dépôt
        </button>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-50 border-2 border-red-200 text-red-700 px-6 py-4 rounded-xl flex items-center gap-3">
          <AlertCircle size={20} />
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-emerald-50 border-2 border-emerald-200 text-emerald-700 px-6 py-4 rounded-xl flex items-center gap-3">
          <CheckCircle size={20} />
          <p>{success}</p>
        </div>
      )}

      {/* Liste des dépôts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {depots.length === 0 ? (
          <div className="col-span-3 bg-white rounded-2xl shadow-lg p-12 text-center">
            <Building2 size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 text-lg">Aucun dépôt enregistré</p>
            <p className="text-gray-500 text-sm mt-2">Ajoutez votre premier dépôt pour commencer</p>
          </div>
        ) : (
          depots.map(depot => (
            <div
              key={depot.id}
              className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-purple-500 hover:shadow-xl transition"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-purple-100 p-3 rounded-xl">
                    <Building2 className="text-purple-600" size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">{depot.nom}</h3>
                    <p className="text-sm text-gray-600 flex items-center gap-1">
                      <MapPin size={14} />
                      {depot.latitude.toFixed(4)}, {depot.longitude.toFixed(4)}
                    </p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  depot.estActif
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  {depot.estActif ? '🟢 Actif' : '🔴 Inactif'}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Capacité max:</span>
                  <span className="font-bold text-gray-800">{depot.capaciteMax} unités</span>
                </div>
                {depot.dateCreation && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Créé le:</span>
                    <span className="font-bold text-gray-800">
                      {new Date(depot.dateCreation).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleOpenModal(depot)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition"
                >
                  <Edit2 size={16} />
                  Modifier
                </button>
                <button
                  onClick={() => handleDelete(depot.id)}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal d'ajout/modification */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-800">
                {editingDepot ? 'Modifier le dépôt' : 'Nouveau dépôt'}
              </h3>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom du dépôt *
                </label>
                <input
                  type="text"
                  value={formData.nom}
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  required
                  placeholder="Ex: Dépôt Central Tunis"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Latitude *
                  </label>
                  <input
                    type="number"
                    step="0.000001"
                    value={formData.latitude}
                    onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                    required
                    placeholder="36.8065"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Longitude *
                  </label>
                  <input
                    type="number"
                    step="0.000001"
                    value={formData.longitude}
                    onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                    required
                    placeholder="10.1815"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleGetCurrentLocation}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition text-sm"
              >
                <MapPin size={16} />
                Utiliser ma position actuelle
              </button>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Capacité maximale (unités) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.capaciteMax}
                  onChange={(e) => setFormData({ ...formData, capaciteMax: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  required
                  placeholder="Ex: 5000"
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="estActif"
                  checked={formData.estActif}
                  onChange={(e) => setFormData({ ...formData, estActif: e.target.checked })}
                  className="w-5 h-5 rounded"
                />
                <label htmlFor="estActif" className="text-sm text-gray-700 cursor-pointer">
                  Dépôt actif et opérationnel
                </label>
              </div>

              {error && (
                <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                  {error}
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition font-medium"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition font-medium"
                >
                  {editingDepot ? 'Modifier' : 'Ajouter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrgDepots;