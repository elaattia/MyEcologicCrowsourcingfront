import React, { useState, useEffect } from 'react';
import { Route, Truck, MapPin, Loader, AlertCircle, CheckCircle, TrendingUp, Map as MapIcon, Clock, Fuel, Package, Navigation } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix pour les icônes Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Icônes personnalisées
const depotIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const wasteIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Composant pour centrer la carte
const MapCenter = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);
  return null;
};

// Composant pour afficher un itinéraire avec routage réel via OSRM
const RouteLayer = ({ waypoints, color, itineraireIndex, vehiculeInfo }) => {
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [routeInfo, setRouteInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!waypoints || waypoints.length < 2) {
      setLoading(false);
      return;
    }

    const fetchRoute = async () => {
      try {
        setLoading(true);
        setError(false);

        // Construire l'URL OSRM - format: lon,lat
        const coordinates = waypoints
          .map(w => `${w[1]},${w[0]}`)
          .join(';');
        
        const url = `https://router.project-osrm.org/route/v1/driving/${coordinates}?overview=full&geometries=geojson&steps=true`;
        
        console.log(`🗺️ Fetching route for itinéraire ${itineraireIndex}...`);
        
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`OSRM error: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.code === 'Ok' && data.routes && data.routes[0]) {
          // Convertir les coordonnées GeoJSON [lon, lat] en Leaflet [lat, lon]
          const coords = data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);
          setRouteCoordinates(coords);
          
          // Extraire les informations de la route
          setRouteInfo({
            distance: (data.routes[0].distance / 1000).toFixed(2), // en km
            duration: Math.round(data.routes[0].duration / 60) // en minutes
          });
          
          console.log(`✅ Route ${itineraireIndex} chargée: ${coords.length} points`);
        } else {
          throw new Error('Aucune route trouvée');
        }
      } catch (err) {
        console.error(`❌ Erreur routing itinéraire ${itineraireIndex}:`, err);
        setError(true);
        // Fallback: ligne droite
        setRouteCoordinates(waypoints);
      } finally {
        setLoading(false);
      }
    };

    fetchRoute();
  }, [waypoints, itineraireIndex]);

  if (loading) {
    return null; // Ou afficher un loader
  }

  if (routeCoordinates.length === 0) {
    return null;
  }

  return (
    <>
      <Polyline
        positions={routeCoordinates}
        color={color}
        weight={error ? 3 : 5}
        opacity={error ? 0.4 : 0.8}
        dashArray={error ? '10, 10' : null}
      />
      {error && (
        <Marker position={waypoints[0]}>
          <Popup>
            <div className="text-amber-600 text-sm">
              ⚠️ Route approximative (ligne droite)<br/>
              Service de routing indisponible
            </div>
          </Popup>
        </Marker>
      )}
    </>
  );
};

// Import des vraies APIs
import { vehiculeApi, depotApi, optimisationApi } from '../../services/api/organisationApis';

const OrgItineraires = ({ user }) => {
  const [vehicules, setVehicules] = useState([]);
  const [depots, setDepots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [optimisationResult, setOptimisationResult] = useState(null);
  const [selectedTab, setSelectedTab] = useState('form');
  const [loadingRoutes, setLoadingRoutes] = useState(false);
  
  const [formData, setFormData] = useState({
    vehiculesIds: [],
    depotId: '',
    tempsMaxParTrajet: 240
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoadingData(true);
    try {
      const [vehiculesData, depotsData] = await Promise.all([
        vehiculeApi.getAll(),
        depotApi.getAll()
      ]);
      
      setVehicules(vehiculesData || []);
      setDepots(depotsData || []);
      
      const depotActif = depotsData?.find(d => d.estActif);
      if (depotActif) {
        setFormData(prev => ({ ...prev, depotId: depotActif.id }));
      }
    } catch (err) {
      console.error('❌ Erreur chargement données:', err);
      setError('Erreur lors du chargement des données: ' + (err.message || 'Erreur inconnue'));
    } finally {
      setLoadingData(false);
    }
  };

  const handleVehiculeToggle = (vehiculeId) => {
    setFormData(prev => {
      const isSelected = prev.vehiculesIds.includes(vehiculeId);
      return {
        ...prev,
        vehiculesIds: isSelected
          ? prev.vehiculesIds.filter(id => id !== vehiculeId)
          : [...prev.vehiculesIds, vehiculeId]
      };
    });
  };

  const handleOptimiser = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    setOptimisationResult(null);

    if (!user?.organisationId) {
      setError('OrganisationId manquant. Veuillez vous reconnecter.');
      setLoading(false);
      return;
    }

    try {
      const requestData = {
        organisationId: user.organisationId
      };

      if (formData.vehiculesIds.length > 0) {
        requestData.vehiculesIds = formData.vehiculesIds;
      }

      if (formData.depotId) {
        requestData.depotId = formData.depotId;
      }

      if (formData.tempsMaxParTrajet) {
        const heures = Math.floor(formData.tempsMaxParTrajet / 60);
        const minutes = formData.tempsMaxParTrajet % 60;
        requestData.tempsMaxParTrajet = `${heures.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`;
      }

      console.log('📤 Requête optimisation:', requestData);

      const result = await optimisationApi.optimiserTournees(requestData);
      
      console.log('✅ Résultat optimisation:', result);
      
      setOptimisationResult(result);
      setSuccess(`✅ ${result.nombreItineraires} itinéraire(s) généré(s) avec succès ! ${result.nombrePointsCollectes} points de collecte dans la zone "${result.zoneGeographique}"`);
      setSelectedTab('results');
    } catch (err) {
      console.error('❌ Erreur optimisation:', err);
      
      let errorMessage = 'Erreur lors de l\'optimisation';
      
      if (err.response?.data) {
        const data = err.response.data;
        
        if (data.errors) {
          const validationErrors = Object.entries(data.errors)
            .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
            .join('\n');
          errorMessage = `Erreurs de validation:\n${validationErrors}`;
        } 
        else if (data.message) {
          errorMessage = data.message;
          if (data.info) {
            errorMessage += '\n\nℹ️ ' + data.info;
          }
          if (data.depotZone) {
            errorMessage += `\n\n📍 Zone du dépôt: ${data.depotZone}`;
          }
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const vehiculesDisponibles = vehicules.filter(v => v.estDisponible);
  const depotsActifs = depots.filter(d => d.estActif);

  const getMapCenter = () => {
    if (!optimisationResult) return [36.8065, 10.1815];
    
    const depot = depots.find(d => d.nom === optimisationResult.depotUtilise);
    if (depot) {
      return [depot.latitude, depot.longitude];
    }
    
    return [36.8065, 10.1815];
  };

  if (loadingData) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader className="animate-spin mx-auto mb-4 text-emerald-600" size={48} />
          <p className="text-gray-600">Chargement des données...</p>
        </div>
      </div>
    );
  }

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
              <pre className="text-sm whitespace-pre-wrap font-sans">{error}</pre>
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

      {vehiculesDisponibles.length === 0 && (
        <div className="bg-amber-50 border-2 border-amber-200 text-amber-700 px-6 py-4 rounded-xl flex items-center gap-3">
          <AlertCircle size={20} />
          <p>⚠️ Aucun véhicule disponible. Veuillez ajouter des véhicules avant de lancer l'optimisation.</p>
        </div>
      )}

      {depotsActifs.length === 0 && (
        <div className="bg-amber-50 border-2 border-amber-200 text-amber-700 px-6 py-4 rounded-xl flex items-center gap-3">
          <AlertCircle size={20} />
          <p>⚠️ Aucun dépôt actif. Veuillez créer un dépôt avant de lancer l'optimisation.</p>
        </div>
      )}

      {/* Onglets */}
      <div className="flex gap-2 border-b-2 border-gray-200">
        <button
          onClick={() => setSelectedTab('form')}
          className={`px-6 py-3 font-medium transition ${
            selectedTab === 'form'
              ? 'text-emerald-600 border-b-2 border-emerald-600 -mb-0.5'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          ⚙️ Configuration
        </button>
        <button
          onClick={() => setSelectedTab('results')}
          disabled={!optimisationResult}
          className={`px-6 py-3 font-medium transition ${
            selectedTab === 'results'
              ? 'text-emerald-600 border-b-2 border-emerald-600 -mb-0.5'
              : 'text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed'
          }`}
        >
          📊 Résultats ({optimisationResult?.nombreItineraires || 0})
        </button>
        <button
          onClick={() => setSelectedTab('map')}
          disabled={!optimisationResult}
          className={`px-6 py-3 font-medium transition ${
            selectedTab === 'map'
              ? 'text-emerald-600 border-b-2 border-emerald-600 -mb-0.5'
              : 'text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed'
          }`}
        >
          🗺️ Carte {loadingRoutes && <Loader className="inline animate-spin ml-2" size={16} />}
        </button>
      </div>

      {/* ONGLET CONFIGURATION */}
      {selectedTab === 'form' && (
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h3 className="text-xl font-bold text-gray-800 mb-6">Paramètres d'optimisation</h3>
          
          <form onSubmit={handleOptimiser} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                📍 Dépôt de départ *
              </label>
              <select
                value={formData.depotId}
                onChange={(e) => setFormData({ ...formData, depotId: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                required
              >
                <option value="">Sélectionner un dépôt</option>
                {depotsActifs.map(depot => (
                  <option key={depot.id} value={depot.id}>
                    {depot.nom} - {depot.adresse}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                L'algorithme cherchera automatiquement les déchets dans la zone géographique du dépôt
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                🚛 Véhicules à utiliser ({formData.vehiculesIds.length} sélectionné{formData.vehiculesIds.length > 1 ? 's' : ''})
              </label>
              {vehiculesDisponibles.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {vehiculesDisponibles.map(vehicule => (
                      <div
                        key={vehicule.id}
                        onClick={() => handleVehiculeToggle(vehicule.id)}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition ${
                          formData.vehiculesIds.includes(vehicule.id)
                            ? 'border-emerald-500 bg-emerald-50'
                            : 'border-gray-300 hover:border-emerald-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                            formData.vehiculesIds.includes(vehicule.id)
                              ? 'border-emerald-500 bg-emerald-500'
                              : 'border-gray-400'
                          }`}>
                            {formData.vehiculesIds.includes(vehicule.id) && (
                              <CheckCircle size={16} className="text-white" />
                            )}
                          </div>
                          <Truck size={20} className="text-emerald-600" />
                          <div className="flex-1">
                            <p className="font-bold text-gray-800">{vehicule.immatriculation}</p>
                            <p className="text-sm text-gray-600">
                              {vehicule.type} • Capacité: {vehicule.capaciteMax} kg
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    ℹ️ Laissez vide pour utiliser tous les véhicules disponibles ({vehiculesDisponibles.length})
                  </p>
                </>
              ) : (
                <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-6 text-center">
                  <Truck className="mx-auto mb-2 text-gray-400" size={32} />
                  <p className="text-gray-600">Aucun véhicule disponible</p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ⏱️ Temps maximum par trajet
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="60"
                  max="480"
                  step="30"
                  value={formData.tempsMaxParTrajet}
                  onChange={(e) => setFormData({ ...formData, tempsMaxParTrajet: parseInt(e.target.value) })}
                  className="flex-1"
                />
                <div className="bg-emerald-100 px-4 py-2 rounded-lg min-w-[120px] text-center">
                  <p className="text-2xl font-bold text-emerald-700">
                    {Math.floor(formData.tempsMaxParTrajet / 60)}h {formData.tempsMaxParTrajet % 60}min
                  </p>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Durée maximale d'une tournée (1h - 8h)
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || vehiculesDisponibles.length === 0 || depotsActifs.length === 0}
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
          </form>
        </div>
      )}

      {/* ONGLET RÉSULTATS */}
      {selectedTab === 'results' && optimisationResult && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-lg text-center border-l-4 border-emerald-500">
              <Route className="mx-auto mb-2 text-emerald-600" size={32} />
              <div className="text-4xl font-bold text-emerald-600 mb-2">
                {optimisationResult.nombreItineraires}
              </div>
              <p className="text-gray-600 font-medium">Itinéraires</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg text-center border-l-4 border-blue-500">
              <MapIcon className="mx-auto mb-2 text-blue-600" size={32} />
              <div className="text-4xl font-bold text-blue-600 mb-2">
                {optimisationResult.distanceTotale.toFixed(1)}
              </div>
              <p className="text-gray-600 font-medium">km totaux</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg text-center border-l-4 border-amber-500">
              <Fuel className="mx-auto mb-2 text-amber-600" size={32} />
              <div className="text-4xl font-bold text-amber-600 mb-2">
                {optimisationResult.carburantTotal.toFixed(1)}
              </div>
              <p className="text-gray-600 font-medium">L carburant</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg text-center border-l-4 border-purple-500">
              <TrendingUp className="mx-auto mb-2 text-purple-600" size={32} />
              <div className="text-4xl font-bold text-purple-600 mb-2">
                {optimisationResult.scoreEfficacite.toFixed(0)}
              </div>
              <p className="text-gray-600 font-medium">Score efficacité</p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-emerald-50 to-cyan-50 rounded-2xl p-6 border-2 border-emerald-200">
            <div className="flex items-center gap-4">
              <MapPin size={32} className="text-emerald-600" />
              <div className="flex-1">
                <p className="text-sm text-gray-600">Dépôt utilisé</p>
                <p className="text-xl font-bold text-gray-800">{optimisationResult.depotUtilise}</p>
                <p className="text-sm text-gray-600">{optimisationResult.depotAdresse}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Zone géographique</p>
                <p className="text-xl font-bold text-emerald-600">{optimisationResult.zoneGeographique}</p>
                <p className="text-sm text-gray-600">{optimisationResult.nombrePointsCollectes} points signalés</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-800">📋 Détails des itinéraires</h3>
            {optimisationResult.itineraires.map((itineraire, index) => (
              <div
                key={itineraire.id}
                className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:shadow-lg transition"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-br from-emerald-400 to-cyan-500 p-3 rounded-xl">
                      <Truck className="text-white" size={24} />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-gray-800">
                        Itinéraire #{index + 1} - {itineraire.vehiculeInfo}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {itineraire.vehiculeType} • {itineraire.nombrePoints} points à collecter
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-2xl font-bold text-emerald-600">
                      {itineraire.distanceKm} km
                    </p>
                    <p className="text-sm text-gray-600">
                      <Clock size={14} className="inline mr-1" />
                      {itineraire.dureeEstimee}
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
                    <p className="text-xs text-gray-600 mb-1">Points</p>
                    <p className="text-lg font-bold text-emerald-600">
                      {itineraire.nombrePoints}
                    </p>
                  </div>

                  <div className="bg-amber-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Moy./point</p>
                    <p className="text-lg font-bold text-amber-600">
                      {(itineraire.distanceKm / itineraire.nombrePoints).toFixed(2)} km
                    </p>
                  </div>
                </div>

                <details className="cursor-pointer">
                  <summary className="text-sm font-medium text-gray-700 hover:text-emerald-600 transition">
                    👁️ Voir les {itineraire.nombrePoints} points de collecte →
                  </summary>
                  <div className="mt-4 space-y-2">
                    {itineraire.points.map((point, idx) => (
                      <div
                        key={point.id}
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="bg-emerald-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
                          {idx + 1}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-800">
                            {point.type || 'Non classifié'} • {point.zone}
                          </p>
                          <p className="text-xs text-gray-600">
                            📍 {point.latitude.toFixed(4)}, {point.longitude.toFixed(4)} • 
                            <Package size={12} className="inline mx-1" />
                            {point.volume} kg
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
      )}

      {/* ONGLET CARTE */}
      {selectedTab === 'map' && optimisationResult && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Navigation size={24} className="text-emerald-600" />
              Visualisation cartographique
            </h3>
            <div className="bg-blue-50 px-4 py-2 rounded-lg text-sm text-blue-700">
              ℹ️ Routes réelles calculées via OSRM
            </div>
          </div>
          
          <div className="h-[600px] rounded-xl overflow-hidden border-2 border-gray-200">
            <MapContainer
              center={getMapCenter()}
              zoom={12}
              style={{ height: '100%', width: '100%' }}
            >
              <MapCenter center={getMapCenter()} zoom={12} />
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />

              {/* Marker pour le dépôt */}
              {(() => {
                const depot = depots.find(d => d.nom === optimisationResult.depotUtilise);
                if (depot) {
                  return (
                    <Marker position={[depot.latitude, depot.longitude]} icon={depotIcon}>
                      <Popup>
                        <div className="font-bold text-emerald-600">🏢 {depot.nom}</div>
                        <div className="text-sm">{depot.adresse}</div>
                        <div className="text-xs text-gray-600 mt-1">Point de départ/retour</div>
                      </Popup>
                    </Marker>
                  );
                }
              })()}

              {/* Itinéraires avec routes réelles */}
              {optimisationResult.itineraires.map((itineraire, idx) => {
                const colors = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444'];
                const color = colors[idx % colors.length];
                
                const depot = depots.find(d => d.nom === optimisationResult.depotUtilise);
                if (!depot) return null;

                // Créer les waypoints: dépôt -> points -> dépôt
                const waypoints = [
                  [depot.latitude, depot.longitude],
                  ...itineraire.points.map(p => [p.latitude, p.longitude]),
                  [depot.latitude, depot.longitude]
                ];

                return (
                  <React.Fragment key={itineraire.id}>
                    {/* Route réelle avec OSRM */}
                    <RouteLayer
                      waypoints={waypoints}
                      color={color}
                      itineraireIndex={idx + 1}
                      vehiculeInfo={itineraire.vehiculeInfo}
                    />

                    {/* Markers pour chaque point */}
                    {itineraire.points.map((point, pointIdx) => (
                      <Marker
                        key={point.id}
                        position={[point.latitude, point.longitude]}
                        icon={wasteIcon}
                      >
                        <Popup>
                          <div className="min-w-[200px]">
                            <div className="font-bold" style={{ color }}>
                              📍 Point #{pointIdx + 1} - Itinéraire #{idx + 1}
                            </div>
                            <div className="text-sm mt-1">
                              <strong>Type:</strong> {point.type || 'Non classifié'}
                            </div>
                            <div className="text-sm">
                              <strong>Volume:</strong> {point.volume} kg
                            </div>
                            <div className="text-sm">
                              <strong>Zone:</strong> {point.zone}
                            </div>
                            <div className="text-xs text-gray-600 mt-2">
                              {point.latitude.toFixed(6)}, {point.longitude.toFixed(6)}
                            </div>
                            <div className="text-xs mt-2 px-2 py-1 rounded" style={{ backgroundColor: color, color: 'white' }}>
                              Véhicule: {itineraire.vehiculeInfo}
                            </div>
                          </div>
                        </Popup>
                      </Marker>
                    ))}
                  </React.Fragment>
                );
              })}
            </MapContainer>
          </div>

          {/* Légende */}
          <div className="mt-6 bg-gray-50 rounded-xl p-4">
            <h4 className="font-bold text-gray-800 mb-3">🗺️ Légende</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                <span className="text-sm">Dépôt</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                <span className="text-sm">Point de collecte</span>
              </div>
              {optimisationResult.itineraires.map((itineraire, idx) => {
                const colors = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444'];
                const color = colors[idx % colors.length];
                return (
                  <div key={itineraire.id} className="flex items-center gap-2">
                    <div className="w-8 h-1" style={{ backgroundColor: color }}></div>
                    <span className="text-sm">Itinéraire #{idx + 1} ({itineraire.vehiculeInfo})</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Statistiques de la carte */}
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-emerald-50 rounded-lg p-3 text-center">
              <p className="text-xs text-gray-600">Dépôt</p>
              <p className="font-bold text-emerald-600">{optimisationResult.depotUtilise}</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-3 text-center">
              <p className="text-xs text-gray-600">Zone</p>
              <p className="font-bold text-blue-600">{optimisationResult.zoneGeographique}</p>
            </div>
            <div className="bg-amber-50 rounded-lg p-3 text-center">
              <p className="text-xs text-gray-600">Points totaux</p>
              <p className="font-bold text-amber-600">{optimisationResult.nombrePointsCollectes}</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-3 text-center">
              <p className="text-xs text-gray-600">Véhicules</p>
              <p className="font-bold text-purple-600">{optimisationResult.nombreVehicules}</p>
            </div>
          </div>

          {/* Informations sur les routes */}
          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertCircle size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">ℹ️ À propos des itinéraires</p>
                <p>Les routes affichées sont calculées en temps réel via le service OSRM (Open Source Routing Machine) qui utilise les données OpenStreetMap. Elles représentent les vrais trajets routiers que les véhicules emprunteront, et non des lignes droites.</p>
                <p className="mt-2">
                  <strong>Distance optimisée backend:</strong> {optimisationResult.distanceTotale.toFixed(2)} km (ligne droite) • 
                  <strong> Distance réelle:</strong> calculée sur la carte (suivant les routes)
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrgItineraires;