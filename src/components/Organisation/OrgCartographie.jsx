// src/components/Organisation/OrgCartographie.jsx
import React, { useState, useEffect } from 'react';
import { Map as MapIcon, Filter, Loader, MapPin, AlertCircle } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import wasteApi from '../../services/api/wasteApi';
import { depotApi } from '../../services/api/organisationApis';
import { STATUS_COLORS, TYPE_COLORS, MARKER_COLORS } from '../../utils/constants';

const OrgCartographie = ({ user }) => {
  const [wastes, setWastes] = useState([]);
  const [depots, setDepots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mapCenter] = useState([36.8065, 10.1815]); // Centre Tunisie
  const [mapZoom, setMapZoom] = useState(10);
  
  const [filters, setFilters] = useState({
    types: ['Plastique', 'Verre', 'Metale', 'Pile', 'Papier', 'Autre'],
    status: ['Signale', 'Nettoye']
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Récupérer tous les déchets
      const wastesData = await wasteApi.getAllWastes({ pageSize: 1000 });
      setWastes(wastesData.data || []);

      // Récupérer tous les dépôts
      try {
        const depotsData = await depotApi.getAll();
        setDepots(depotsData || []);
      } catch (err) {
        console.error('Erreur dépôts:', err);
        setDepots([]);
      }
    } catch (err) {
      console.error('Erreur chargement carte:', err);
      setError(err.message || 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  const toggleFilter = (category, value) => {
    setFilters(prev => ({
      ...prev,
      [category]: prev[category].includes(value)
        ? prev[category].filter(v => v !== value)
        : [...prev[category], value]
    }));
  };

  const filteredWastes = wastes.filter(w => 
    filters.types.includes(w.type || 'Autre') && 
    filters.status.includes(w.statut)
  );

  const getStatusDisplay = (statut) => {
    return statut === 'Signale' ? 'Signalé' : 
           statut === 'Nettoye' ? 'Nettoyé' : statut;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <MapIcon size={28} className="text-blue-600" />
          Cartographie des déchets
        </h2>
        <div className="bg-white rounded-2xl shadow-lg p-12 h-[600px] flex items-center justify-center flex-col gap-4">
          <Loader className="animate-spin text-blue-600" size={40} />
          <p className="text-gray-600">Chargement de la carte...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <MapIcon size={28} className="text-blue-600" />
          Cartographie des déchets
        </h2>
        <button
          onClick={fetchData}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
        >
          <Loader size={18} />
          Actualiser
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border-2 border-red-200 text-red-700 px-6 py-4 rounded-xl flex items-center gap-3">
          <AlertCircle size={20} />
          <p>{error}</p>
        </div>
      )}

      <div className="grid grid-cols-4 gap-6">
        {/* Sidebar filtres */}
        <div className="bg-white rounded-2xl shadow-lg p-6 h-fit">
          <div className="flex items-center gap-2 mb-6">
            <Filter className="text-blue-600" size={24} />
            <h3 className="text-xl font-bold">Filtres</h3>
          </div>

          {/* Stats rapides */}
          <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
            <p className="text-sm font-bold text-blue-900 mb-2">Total sur la carte</p>
            <p className="text-3xl font-bold text-blue-600">{filteredWastes.length}</p>
            <p className="text-xs text-blue-700 mt-1">déchets affichés</p>
          </div>

          <div className="space-y-6">
            {/* Filtre par type */}
            <div>
              <h4 className="font-bold text-gray-800 mb-3">Type de déchet</h4>
              <div className="space-y-2">
                {['Plastique', 'Verre', 'Metale', 'Pile', 'Papier', 'Autre'].map(type => (
                  <label key={type} className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded">
                    <input
                      type="checkbox"
                      checked={filters.types.includes(type)}
                      onChange={() => toggleFilter('types', type)}
                      className="w-4 h-4 rounded"
                    />
                    <span className="text-sm text-gray-700">{type}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Filtre par statut */}
            <div>
              <h4 className="font-bold text-gray-800 mb-3">Statut</h4>
              <div className="space-y-2">
                {['Signale', 'Nettoye'].map(status => (
                  <label key={status} className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded">
                    <input
                      type="checkbox"
                      checked={filters.status.includes(status)}
                      onChange={() => toggleFilter('status', status)}
                      className="w-4 h-4 rounded"
                    />
                    <span className="flex items-center gap-2 text-sm">
                      <span
                        className="inline-block w-3 h-3 rounded-full"
                        style={{ backgroundColor: MARKER_COLORS[status] }}
                      ></span>
                      {getStatusDisplay(status)}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Légende */}
            <div className="border-t pt-4">
              <h4 className="font-bold text-gray-800 mb-3">Légende</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-amber-500"></div>
                  <span className="text-gray-600">Déchets signalés</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-emerald-500"></div>
                  <span className="text-gray-600">Déchets nettoyés</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                  <span className="text-gray-600">Dépôts</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Carte */}
        <div className="col-span-3 bg-white rounded-2xl shadow-lg overflow-hidden">
          <MapContainer
            center={mapCenter}
            zoom={mapZoom}
            onZoomEnd={(e) => setMapZoom(e.target.getZoom())}
            style={{ height: '700px', width: '100%' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; OpenStreetMap contributors'
            />

            {/* Marqueurs des dépôts */}
            {depots.map(depot => (
              <React.Fragment key={depot.id}>
                <Marker position={[depot.latitude, depot.longitude]}>
                  <Popup>
                    <div className="p-2 text-sm">
                      <div className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                        <MapPin size={16} className="text-blue-600" />
                        Dépôt: {depot.nom}
                      </div>
                      <div className="mb-1">
                        <strong>Capacité:</strong> {depot.capaciteMax} unités
                      </div>
                      <div className="mb-1">
                        <strong>État:</strong> {depot.estActif ? '🟢 Actif' : '🔴 Inactif'}
                      </div>
                      <div>
                        <strong>Coordonnées:</strong> {depot.latitude.toFixed(4)}, {depot.longitude.toFixed(4)}
                      </div>
                    </div>
                  </Popup>
                </Marker>
                
                {/* Zone de couverture du dépôt (5km de rayon) */}
                <Circle
                  center={[depot.latitude, depot.longitude]}
                  radius={5000}
                  pathOptions={{
                    color: '#3B82F6',
                    fillColor: '#3B82F6',
                    fillOpacity: 0.1,
                    weight: 2
                  }}
                />
              </React.Fragment>
            ))}

            {/* Marqueurs des déchets */}
            {filteredWastes.map(waste => (
              <Marker
                key={waste.id}
                position={[waste.latitude, waste.longitude]}
              >
                <Popup>
                  <div className="p-2 text-sm min-w-[200px]">
                    <div className="font-bold mb-2">{waste.type || 'Non classifié'}</div>
                    <div className="mb-1">
                      <strong>Zone:</strong> {waste.zone}
                    </div>
                    <div className="mb-1">
                      <strong>Date:</strong> {new Date(waste.date).toLocaleDateString()}
                    </div>
                    <div className="mb-1">
                      <strong>Signalé par:</strong> {waste.userName || 'Utilisateur'}
                    </div>
                    <div>
                      <strong>Statut:</strong>{' '}
                      <span className={`inline-block px-2 py-1 rounded-lg text-xs font-bold ${STATUS_COLORS[waste.statut]}`}>
                        {getStatusDisplay(waste.statut)}
                      </span>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>
    </div>
  );
};

export default OrgCartographie;