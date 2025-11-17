// src/components/Organisation/OrgVehicules.jsx - CORRECTION COMPLÈTE
import React, { useState, useEffect } from 'react';
import { Truck, Plus, Edit2, Trash2, Loader, AlertCircle, CheckCircle, X } from 'lucide-react';
import { vehiculeApi } from '../../services/api/organisationApis';

const OrgVehicules = ({ user }) => {
  const [vehicules, setVehicules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingVehicule, setEditingVehicule] = useState(null);
  const [formData, setFormData] = useState({
    immatriculation: '',
    type: 'Camion',
    capaciteMax: '',
    consommationMoyenne: '',
    estDisponible: true
  });

  useEffect(() => {
    console.log('🚛 OrgVehicules - User data:', user);
    fetchVehicules();
  }, []);

  const fetchVehicules = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await vehiculeApi.getAll();
      setVehicules(data || []);
    } catch (err) {
      console.error('Erreur chargement véhicules:', err);
      setError(err.message || 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (vehicule = null) => {
    if (vehicule) {
      setEditingVehicule(vehicule);
      setFormData({
        immatriculation: vehicule.immatriculation || '',
        type: vehicule.type || 'Camion',
        capaciteMax: vehicule.capaciteMax || '',
        consommationMoyenne: vehicule.consommationMoyenne || '',
        estDisponible: vehicule.estDisponible !== false
      });
    } else {
      setEditingVehicule(null);
      setFormData({
        immatriculation: '',
        type: 'Camion',
        capaciteMax: '',
        consommationMoyenne: '',
        estDisponible: true
      });
    }
    setShowModal(true);
    setError('');
    setSuccess('');
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingVehicule(null);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // VALIDATION: Vérifier user.organisationId
    if (!user?.organisationId) {
      console.error('❌ OrganisationId manquant:', user);
      setError('Erreur: Organisation non trouvée. Veuillez vous reconnecter.');
      return;
    }

    // VALIDATION: Vérifier les champs requis
    if (!formData.immatriculation || !formData.type || !formData.capaciteMax || !formData.consommationMoyenne) {
      setError('Tous les champs sont requis');
      return;
    }

    try {
      const vehiculeData = {
        immatriculation: formData.immatriculation.trim(),
        type: formData.type,
        capaciteMax: parseFloat(formData.capaciteMax),
        consommationMoyenne: parseFloat(formData.consommationMoyenne),
        estDisponible: formData.estDisponible,
        organisationId: user.organisationId
      };

      console.log('📤 Envoi données véhicule:', vehiculeData);

      if (editingVehicule) {
        await vehiculeApi.update(editingVehicule.id, vehiculeData);
        setSuccess('Véhicule modifié avec succès');
      } else {
        await vehiculeApi.create(vehiculeData);
        setSuccess('Véhicule ajouté avec succès');
      }

      await fetchVehicules();
      handleCloseModal();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Erreur sauvegarde véhicule:', err);
      
      // Afficher un message d'erreur plus détaillé
      let errorMessage = 'Erreur lors de la sauvegarde';
      
      if (err.response?.data?.errors) {
        // Erreurs de validation ASP.NET
        const validationErrors = Object.entries(err.response.data.errors)
          .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
          .join('\n');
        errorMessage = validationErrors;
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce véhicule ?')) {
      return;
    }

    try {
      await vehiculeApi.delete(id);
      setSuccess('Véhicule supprimé avec succès');
      await fetchVehicules();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Erreur suppression véhicule:', err);
      setError(err.message || 'Erreur lors de la suppression');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader className="animate-spin text-blue-600" size={40} />
        <p className="ml-4 text-gray-600">Chargement des véhicules...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <Truck size={32} className="text-blue-600" />
          Gestion des véhicules
        </h2>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:shadow-lg transition font-medium"
        >
          <Plus size={20} />
          Ajouter un véhicule
        </button>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-50 border-2 border-red-200 text-red-700 px-6 py-4 rounded-xl">
          <div className="flex items-start gap-3">
            <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium mb-1">Erreur</p>
              <pre className="text-sm whitespace-pre-wrap">{error}</pre>
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-emerald-50 border-2 border-emerald-200 text-emerald-700 px-6 py-4 rounded-xl flex items-center gap-3">
          <CheckCircle size={20} />
          <p>{success}</p>
        </div>
      )}

      {/* Debug info (à retirer en production) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
          <p className="text-xs font-mono">
            <strong>Debug:</strong> OrganisationId = {user?.organisationId || 'NULL'}
          </p>
        </div>
      )}

      {/* Liste des véhicules */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vehicules.length === 0 ? (
          <div className="col-span-3 bg-white rounded-2xl shadow-lg p-12 text-center">
            <Truck size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 text-lg">Aucun véhicule enregistré</p>
            <p className="text-gray-500 text-sm mt-2">Ajoutez votre premier véhicule pour commencer</p>
          </div>
        ) : (
          vehicules.map(vehicule => (
            <div
              key={vehicule.id}
              className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-blue-500 hover:shadow-xl transition"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-3 rounded-xl">
                    <Truck className="text-blue-600" size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">{vehicule.immatriculation}</h3>
                    <p className="text-sm text-gray-600">{vehicule.type}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  vehicule.estDisponible
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  {vehicule.estDisponible ? '🟢 Disponible' : '🔴 Indisponible'}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Capacité max:</span>
                  <span className="font-bold text-gray-800">{vehicule.capaciteMax} kg</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Consommation:</span>
                  <span className="font-bold text-gray-800">{vehicule.consommationMoyenne} L/100km</span>
                </div>
                {vehicule.derniereUtilisation && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Dernière utilisation:</span>
                    <span className="font-bold text-gray-800">
                      {new Date(vehicule.derniereUtilisation).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleOpenModal(vehicule)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition"
                >
                  <Edit2 size={16} />
                  Modifier
                </button>
                <button
                  onClick={() => handleDelete(vehicule.id)}
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
                {editingVehicule ? 'Modifier le véhicule' : 'Nouveau véhicule'}
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
                  Immatriculation *
                </label>
                <input
                  type="text"
                  value={formData.immatriculation}
                  onChange={(e) => setFormData({ ...formData, immatriculation: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  required
                  placeholder="Ex: 123 TUN 456"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type de véhicule *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  required
                >
                  <option value="Camion">Camion</option>
                  <option value="Camionnette">Camionnette</option>
                  <option value="Fourgon">Fourgon</option>
                  <option value="Utilitaire">Utilitaire</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Capacité maximale (kg) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.capaciteMax}
                  onChange={(e) => setFormData({ ...formData, capaciteMax: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  required
                  placeholder="Ex: 1000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Consommation moyenne (L/100km) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={formData.consommationMoyenne}
                  onChange={(e) => setFormData({ ...formData, consommationMoyenne: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  required
                  placeholder="Ex: 8.5"
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="estDisponible"
                  checked={formData.estDisponible}
                  onChange={(e) => setFormData({ ...formData, estDisponible: e.target.checked })}
                  className="w-5 h-5 rounded"
                />
                <label htmlFor="estDisponible" className="text-sm text-gray-700 cursor-pointer">
                  Véhicule disponible pour les tournées
                </label>
              </div>

              {error && (
                <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                  <pre className="whitespace-pre-wrap">{error}</pre>
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
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:shadow-lg transition font-medium"
                >
                  {editingVehicule ? 'Modifier' : 'Ajouter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrgVehicules;