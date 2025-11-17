// src/components/Organisation/OrgItineraires.jsx - VERSION CORRIGÉE
import React, { useState, useEffect } from 'react';
import { Route, Truck, MapPin, Loader, AlertCircle, CheckCircle, TrendingUp } from 'lucide-react';
import { optimisationApi, vehiculeApi, depotApi } from '../../services/api/organisationApis';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const OrgItineraires = ({ user }) => {
  const [vehicules, setVehicules] = useState([]);
  const [depots, setDepots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [optimisationResult, setOptimisationResult] = useState(null);
  
  const [formData, setFormData] = useState({
    nombreVehicules: '',
    depotId: '',
    zoneGeographique: '',
    tempsMaxParTrajet: 480
  });

  useEffect(() => {
    console.log('🗺️ OrgItineraires - User:', user);
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [vehiculesData, depotsData] = await Promise.all([
        vehiculeApi.getAll(),
        depotApi.getAll()
      ]);
      
      console.log('📦 Véhicules chargés:', vehiculesData);
      console.log('🏭 Dépôts chargés:', depotsData);
      
      setVehicules(vehiculesData || []);
      setDepots(depotsData || []);
      
      // Sélectionner le premier dépôt par défaut
      if (depotsData && depotsData.length > 0) {
        setFormData(prev => ({ ...prev, depotId: depotsData[0].id }));
      }
    } catch (err) {
      console.error('Erreur chargement données:', err);
      setError(err.message || 'Erreur de chargement');
    }
  };

  const handleOptimiser = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    setOptimisationResult(null);

    // VALIDATION
    if (!user?.organisationId) {
      setError('OrganisationId manquant. Veuillez vous reconnecter.');
      setLoading(false);
      return;
    }

    try {
      // Construire la requête selon ce que le backend attend
      const requestData = {
        organisationId: user.organisationId
      };

      // Ajouter les champs optionnels SEULEMENT s'ils sont remplis
      if (formData.nombreVehicules && formData.nombreVehicules > 0) {
        requestData.nombreVehicules = parseInt(formData.nombreVehicules, 10);
      }

      if (formData.depotId) {
        requestData.depotId = formData.depotId;
      }

      if (formData.zoneGeographique && formData.zoneGeographique.trim() !== '') {
        requestData.zoneGeographique = formData.zoneGeographique.trim();
      }

      if (formData.tempsMaxParTrajet) {
        requestData.tempsMaxParTrajet = parseInt(formData.tempsMaxParTrajet, 10);
      }

      console.log('📤 Envoi requête optimisation:', requestData);
      console.log('📊 Types des champs:', {
        organisationId: typeof requestData.organisationId,
        nombreVehicules: typeof requestData.nombreVehicules,
        depotId: typeof requestData.depotId,
        tempsMaxParTrajet: typeof requestData.tempsMaxParTrajet
      });

      const result = await optimisationApi.optimiserTournees(requestData);
      
      console.log('✅ Résultat optimisation:', result);
      
      setOptimisationResult(result);
      setSuccess(`${result.nombreItineraires} itinéraires générés avec succès !`);
    } catch (err) {
      console.error('❌ Erreur optimisation complète:', err);
      console.error('Response data:', err.response?.data);
      console.error('Response status:', err.response?.status);
      
      // Message d'erreur détaillé
      let errorMessage = 'Erreur lors de l\'optimisation';
      
      if (err.response?.data?.errors) {
        // Erreurs de validation ASP.NET
        const validationErrors = Object.entries(err.response.data.errors)
          .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
          .join('\n');
        errorMessage = `Erreurs de validation:\n${validationErrors}`;
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data?.info) {
        errorMessage = err.response.data.info;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const vehiculesDisponibles = vehicules.filter(v => v.estDisponible);

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <Route size={32} className="text-emerald-600" />
          Optimisation des itinéraires
        </h2>
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

      {/* Debug info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 space-y-2">
          <p className="text-xs font-mono">
            <strong>Debug:</strong>
          </p>
          <p className="text-xs font-mono">
            OrganisationId: {user?.organisationId || 'NULL'}
          </p>
          <p className="text-xs font-mono">
            Véhicules disponibles: {vehiculesDisponibles.length}
          </p>
          <p className="text-xs font-mono">
            Dépôts: {depots.length}
          </p>
        </div>
      )}

      {/* Formulaire d'optimisation */}
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <h3 className="text-xl font-bold text-gray-800 mb-6">Paramètres d'optimisation</h3>
        
        <form onSubmit={handleOptimiser} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nombre de véhicules */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre de véhicules
              </label>
              <input
                type="number"
                min="1"
                max={vehiculesDisponibles.length || 1}
                value={formData.nombreVehicules}
                onChange={(e) => setFormData({ ...formData, nombreVehicules: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                placeholder={`Maximum: ${vehiculesDisponibles.length} disponibles`}
              />
              <p className="text-xs text-gray-500 mt-1">
                Laissez vide pour utiliser tous les véhicules disponibles ({vehiculesDisponibles.length})
              </p>
            </div>

            {/* Dépôt de départ */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dépôt de départ
              </label>
              <select
                value={formData.depotId}
                onChange={(e) => setFormData({ ...formData, depotId: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
              >
                <option value="">Dépôt par défaut</option>
                {depots.map(depot => (
                  <option key={depot.id} value={depot.id}>
                    {depot.nom} ({depot.latitude.toFixed(4)}, {depot.longitude.toFixed(4)})
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Sélectionnez le point de départ des tournées
              </p>
            </div>

            {/* Zone géographique */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Zone géographique (optionnel)
              </label>
              <input
                type="text"
                value={formData.zoneGeographique}
                onChange={(e) => setFormData({ ...formData, zoneGeographique: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                placeholder="Ex: Tunis, Ariana..."
              />
              <p className="text-xs text-gray-500 mt-1">
                Filtrer les déchets par zone
              </p>
            </div>

            {/* Temps maximum par trajet */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Temps maximum par trajet (minutes)
              </label>
              <input
                type="number"
                min="60"
                max="720"
                value={formData.tempsMaxParTrajet}
                onChange={(e) => setFormData({ ...formData, tempsMaxParTrajet: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                Durée maximale d'une tournée (60-720 min)
              </p>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || vehiculesDisponibles.length === 0}
            className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-xl hover:shadow-lg transition font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader className="animate-spin" size={20} />
                Optimisation en cours...
              </>
            ) : (
              <>
                <TrendingUp size={20} />
                Optimiser les tournées
              </>
            )}
          </button>

          {vehiculesDisponibles.length === 0 && (
            <p className="text-center text-red-600 text-sm">
              ⚠️ Aucun véhicule disponible. Ajoutez des véhicules pour commencer.
            </p>
          )}
        </form>
      </div>

      {/* Résultats de l'optimisation */}
      {optimisationResult && (
        <div className="space-y-6">
          {/* Statistiques globales */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-lg text-center border-l-4 border-emerald-500">
              <div className="text-4xl font-bold text-emerald-600 mb-2">
                {optimisationResult.nombreItineraires}
              </div>
              <p className="text-gray-600 font-medium">Itinéraires générés</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg text-center border-l-4 border-blue-500">
              <div className="text-4xl font-bold text-blue-600 mb-2">
                {optimisationResult.distanceTotale.toFixed(1)}
              </div>
              <p className="text-gray-600 font-medium">Distance totale (km)</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg text-center border-l-4 border-amber-500">
              <div className="text-4xl font-bold text-amber-600 mb-2">
                {optimisationResult.carburantTotal.toFixed(1)}
              </div>
              <p className="text-gray-600 font-medium">Carburant estimé (L)</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg text-center border-l-4 border-purple-500">
              <div className="text-4xl font-bold text-purple-600 mb-2">
                {optimisationResult.scoreEfficacite.toFixed(0)}
              </div>
              <p className="text-gray-600 font-medium">Score d'efficacité</p>
            </div>
          </div>

          {/* Liste des itinéraires */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Itinéraires détaillés</h3>
            
            <div className="space-y-6">
              {optimisationResult.itineraires && optimisationResult.itineraires.map((itineraire, index) => (
                <div
                  key={itineraire.id}
                  className="border-2 border-gray-200 rounded-xl p-6 hover:shadow-lg transition"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-gradient-to-br from-emerald-400 to-cyan-500 p-3 rounded-xl">
                        <Truck className="text-white" size={24} />
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-gray-800">
                          Véhicule #{itineraire.vehiculeNumero}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {itineraire.nombrePoints} points de collecte
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-2xl font-bold text-emerald-600">
                        {itineraire.distanceKm} km
                      </p>
                      <p className="text-sm text-gray-600">
                        Durée: {itineraire.dureeEstimee}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-600 mb-1">Carburant</p>
                      <p className="text-lg font-bold text-blue-600">
                        {itineraire.carburantLitres} L
                      </p>
                    </div>

                    <div className="bg-emerald-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-600 mb-1">Points collectés</p>
                      <p className="text-lg font-bold text-emerald-600">
                        {itineraire.nombrePoints}
                      </p>
                    </div>

                    <div className="bg-amber-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-600 mb-1">Distance moyenne</p>
                      <p className="text-lg font-bold text-amber-600">
                        {(itineraire.distanceKm / itineraire.nombrePoints).toFixed(2)} km/point
                      </p>
                    </div>
                  </div>

                  <details className="cursor-pointer">
                    <summary className="text-sm font-medium text-gray-700 hover:text-emerald-600 transition">
                      Voir les {itineraire.nombrePoints} points de collecte →
                    </summary>
                    <div className="mt-4 space-y-2">
                      {itineraire.points && itineraire.points.map((point, idx) => (
                        <div
                          key={point.id}
                          className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                        >
                          <div className="bg-emerald-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
                            {idx + 1}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-800">
                              {point.type || 'Non classifié'} - {point.zone}
                            </p>
                            <p className="text-xs text-gray-600">
                              📍 {point.latitude.toFixed(4)}, {point.longitude.toFixed(4)} • 
                              Volume: {point.volume} kg
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </details>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrgItineraires;