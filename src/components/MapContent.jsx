// components/MapContent.jsx
import React, { useState, useEffect } from 'react';
import { Map as MapIcon, Filter, Loader, Navigation } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

const MapContent = () => {
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [wastes, setWastes] = useState([]);
  const [locationError, setLocationError] = useState('');
  const [mapZoom, setMapZoom] = useState(15);
  const [filters, setFilters] = useState({
    types: ['Plastique', 'Verre', 'Metale', 'Pile', 'Papier', 'Autre'],
    status: ['Signalé', 'En cours', 'Nettoyé']
  });

  // Obtenir la localisation de l'utilisateur
  useEffect(() => {
    const getUserLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const location = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            };
            console.log('Position obtenue:', location);
            setUserLocation(location);
            setLocationError('');
            setLoading(false);
          },
          (error) => {
            console.error('Erreur de géolocalisation:', error);
            setLocationError('Position non disponible. Localisation par défaut.');
            setUserLocation({
              latitude: 36.8065,
              longitude: 10.1686
            });
            setLoading(false);
          }
        );
      } else {
        setLocationError('Géolocalisation non supportée.');
        setUserLocation({
          latitude: 36.8065,
          longitude: 10.1686
        });
        setLoading(false);
      }
    };

    getUserLocation();
  }, []);

  // Charger les données des déchets
  useEffect(() => {
    const mockWastes = [
      {
        id: 1,
        latitude: 36.8065,
        longitude: 10.1686,
        type: 'Plastique',
        status: 'Signalé',
        address: 'Avenue Habib Bourguiba',
        date: '2024-01-15',
        quantity: '3-5 items'
      },
      {
        id: 2,
        latitude: 36.7969,
        longitude: 10.1712,
        type: 'Verre',
        status: 'Nettoyé',
        address: 'Rue de Carthage',
        date: '2024-01-14',
        quantity: '1-2 items'
      },
      {
        id: 3,
        latitude: 36.8020,
        longitude: 10.1760,
        type: 'Metale',
        status: 'En cours',
        address: 'Place du 7 Novembre',
        date: '2024-01-13',
        quantity: '2-3 items'
      },
      {
        id: 4,
        latitude: 36.8100,
        longitude: 10.1610,
        type: 'Papier',
        status: 'Signalé',
        address: 'Rue Mohamed Ali',
        date: '2024-01-15',
        quantity: '5-10 items'
      },
      {
        id: 5,
        latitude: 36.7950,
        longitude: 10.1750,
        type: 'Plastique',
        status: 'Signalé',
        address: 'Avenue de Paris',
        date: '2024-01-15',
        quantity: '2-4 items'
      }
    ];

    setWastes(mockWastes);
  }, []);

  const getMarkerColor = (status) => {
    const statusColors = {
      'Signalé': '#FFA500',
      'En cours': '#3B82F6',
      'Nettoyé': '#10B981'
    };
    return statusColors[status] || '#808080';
  };

  const getTypeEmoji = (type) => {
    const emojis = {
      'Plastique': '🧴',
      'Verre': '🍾',
      'Metale': '🔩',
      'Pile': '🔋',
      'Papier': '📄',
      'Autre': '🗑️'
    };
    return emojis[type] || '🗑️';
  };

  // Créer un élément HTML personnalisé pour le marqueur
  const createCustomElement = (emoji, color) => {
    const div = document.createElement('div');
    div.innerHTML = `
      <div style="
        background-color: ${color};
        border-radius: 50%;
        width: 50px;
        height: 50px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        border: 3px solid white;
        cursor: pointer;
      ">
        ${emoji}
      </div>
    `;
    return div.firstChild;
  };

  const getStatusBgColor = (status) => {
    const colors = {
      'Signalé': '#FFF3CD',
      'En cours': '#D1ECF1',
      'Nettoyé': '#D4EDDA'
    };
    return colors[status] || '#F8F9FA';
  };

  const getStatusTextColor = (status) => {
    const colors = {
      'Signalé': '#856404',
      'En cours': '#0C5460',
      'Nettoyé': '#155724'
    };
    return colors[status] || '#383D41';
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
    filters.types.includes(w.type) && 
    filters.status.includes(w.status)
  );

  if (loading || !userLocation) {
    return (
      <div className="space-y-6">
        <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <MapIcon size={28} className="text-blue-600" />
          Cartographie des déchets
        </h2>
        <div className="bg-white rounded-2xl shadow-lg p-12 h-[600px] flex items-center justify-center flex-col gap-4">
          <Loader className="animate-spin text-emerald-600" size={40} />
          <p className="text-gray-600">Initialisation de la carte...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
        <MapIcon size={28} className="text-blue-600" />
        Cartographie des déchets
      </h2>

      <div className="grid grid-cols-4 gap-6">
        {/* Sidebar filtres */}
        <div className="bg-white rounded-2xl shadow-lg p-6 h-fit">
          <div className="flex items-center gap-2 mb-6">
            <Filter className="text-emerald-600" size={24} />
            <h3 className="text-xl font-bold">Filtres</h3>
          </div>

          {/* Information de localisation */}
          {userLocation && (
            <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
              <div className="flex items-start gap-2">
                <Navigation className="text-blue-600 flex-shrink-0 mt-1" size={20} />
                <div>
                  <p className="text-sm font-bold text-blue-900 mb-1">Votre position</p>
                  <p className="text-xs text-blue-700">
                    {userLocation.latitude.toFixed(4)}, {userLocation.longitude.toFixed(4)}
                  </p>
                  <p className="text-xs text-blue-600 mt-1">Zoom: {mapZoom}</p>
                </div>
              </div>
            </div>
          )}

          {locationError && (
            <div className="mb-6 p-4 bg-amber-50 rounded-xl border border-amber-200">
              <p className="text-xs text-amber-700">{locationError}</p>
            </div>
          )}

          <div className="space-y-6">
            {/* Filtre par type */}
            <div>
              <h4 className="font-bold text-gray-800 mb-3">Type de déchet</h4>
              <div className="flex flex-wrap gap-2">
                {['Plastique', 'Verre', 'Metale', 'Pile', 'Papier', 'Autre'].map(type => (
                  <button
                    key={type}
                    onClick={() => toggleFilter('types', type)}
                    className={`px-3 py-2 rounded-full text-sm font-medium transition ${
                      filters.types.includes(type)
                        ? 'bg-emerald-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Filtre par statut */}
            <div>
              <h4 className="font-bold text-gray-800 mb-3">Statut</h4>
              <div className="space-y-2">
                {['Signalé', 'En cours', 'Nettoyé'].map(status => (
                  <label key={status} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.status.includes(status)}
                      onChange={() => toggleFilter('status', status)}
                      className="w-4 h-4 rounded"
                    />
                    <span className="text-sm text-gray-700">
                      <span
                        className="inline-block w-3 h-3 rounded-full mr-2"
                        style={{
                          backgroundColor:
                            status === 'Signalé'
                              ? '#FFA500'
                              : status === 'En cours'
                              ? '#3B82F6'
                              : '#10B981'
                        }}
                      ></span>
                      {status}
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
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <span className="text-gray-600">Signalé récemment</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="text-gray-600">En cours de traitement</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                  <span className="text-gray-600">Nettoyé</span>
                </div>
              </div>
            </div>

            {/* Stats rapides */}
            <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200">
              <p className="text-sm font-bold text-emerald-900 mb-2">Total sur la carte</p>
              <p className="text-2xl font-bold text-emerald-600">
                {filteredWastes.length}
              </p>
            </div>
          </div>
        </div>

        {/* Carte */}
        <div className="col-span-3 bg-white rounded-2xl shadow-lg overflow-hidden relative">
          <MapContainer
            center={[userLocation.latitude, userLocation.longitude]}
            zoom={mapZoom}
            onZoomEnd={(e) => setMapZoom(e.target.getZoom())}
            style={{ height: '600px', width: '100%' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; OpenStreetMap contributors'
            />

            {/* Marqueur de l'utilisateur - Simple sans icon */}
            <Marker position={[userLocation.latitude, userLocation.longitude]}>
              <Popup>
                <div className="text-sm font-bold">Votre position</div>
              </Popup>
            </Marker>

            {/* Marqueurs des déchets */}
            {filteredWastes.map(waste => (
              <Marker
                key={waste.id}
                position={[waste.latitude, waste.longitude]}
              >
                <Popup>
                  <div className="p-2 text-sm">
                    <div className="font-bold mb-2">{waste.type}</div>
                    <div className="mb-1">
                      <strong>Adresse:</strong> {waste.address}
                    </div>
                    <div className="mb-1">
                      <strong>Quantité:</strong> {waste.quantity}
                    </div>
                    <div className="mb-1">
                      <strong>Date:</strong> {waste.date}
                    </div>
                    <div>
                      <strong>Statut:</strong> 
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '2px 8px',
                          borderRadius: '12px',
                          marginLeft: '4px',
                          backgroundColor: getStatusBgColor(waste.status),
                          color: getStatusTextColor(waste.status),
                          fontWeight: 'bold',
                          fontSize: '11px'
                        }}
                      >
                        {waste.status}
                      </span>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>

          {/* Contrôles de zoom */}
          <div style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <button
              onClick={() => setMapZoom(Math.min(mapZoom + 1, 19))}
              className="bg-white p-2 rounded-lg shadow-lg hover:bg-gray-100 transition border border-gray-300 font-bold text-lg w-10 h-10 flex items-center justify-center"
              title="Agrandir"
            >
              +
            </button>
            <button
              onClick={() => setMapZoom(Math.max(mapZoom - 1, 1))}
              className="bg-white p-2 rounded-lg shadow-lg hover:bg-gray-100 transition border border-gray-300 font-bold text-lg w-10 h-10 flex items-center justify-center"
              title="Réduire"
            >
              −
            </button>
            <button
              onClick={() => setMapZoom(15)}
              className="bg-emerald-500 text-white p-2 rounded-lg shadow-lg hover:bg-emerald-600 transition w-10 h-10 flex items-center justify-center"
              title="Centrer"
            >
              <Navigation size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapContent;