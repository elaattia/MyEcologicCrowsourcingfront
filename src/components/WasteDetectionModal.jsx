// components/WasteDetectionModal.jsx
import React, { useState, useEffect } from 'react';
import { 
  X, AlertCircle, CheckCircle, TrendingUp, MapPin, Users, 
  AlertTriangle, Info, Loader
} from 'lucide-react';

const WasteDetectionModal = ({ imagePreview, onClose, onConfirm, location, selectedImage }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [wasteData, setWasteData] = useState(null);

  // Simuler l'appel API pour récupérer les informations du déchet
  useEffect(() => {
    const fetchWasteData = async () => {
      setIsLoading(true);
      try {
        // Simulation - à remplacer par votre API réelle
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Données statiques pour la démo
        const mockData = {
          type: 'Plastique',
          confidence: 94,
          imageUrl: imagePreview,
          zoneStats: {
            totalInZone: 47,
            cleanedThisMonth: 12,
            reportedToday: 3,
            zoneStatus: 'critical'
          },
          wasteInfo: {
            isDangerous: false,
            decompositionTime: '100-400 ans',
            recyclable: true,
            category: 'Bouteille en plastique',
            material: 'PET (Polyéthylène téréphthalate)',
            impacts: [
              'Pollution des océans',
              'Ingestion par la faune',
              'Libération de microplastiques'
            ]
          },
          healthRisks: {
            level: 'Moyen',
            risks: [
              'Blessures si cassé',
              'Contaminé possiblement'
            ]
          },
          recommendations: {
            priority: 'Haute',
            action: 'Signalé pour nettoyage',
            estimatedCleanupTime: '2-3 jours'
          }
        };

        setWasteData(mockData);
        setError('');
      } catch (err) {
        setError('Erreur lors de l\'analyse du déchet. Veuillez réessayer.');
        console.error('Erreur:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWasteData();
  }, [imagePreview]);

  const getTypeColor = (type) => {
    const colors = {
      'Plastique': 'bg-blue-100 text-blue-800 border-blue-300',
      'Verre': 'bg-purple-100 text-purple-800 border-purple-300',
      'Metale': 'bg-gray-100 text-gray-800 border-gray-300',
      'Pile': 'bg-red-100 text-red-800 border-red-300',
      'Papier': 'bg-amber-100 text-amber-800 border-amber-300',
      'Autre': 'bg-gray-100 text-gray-800 border-gray-300',
    };
    return colors[type] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const getZoneStatusColor = (status) => {
    const colors = {
      'critical': 'bg-red-100 border-red-300 text-red-800',
      'warning': 'bg-amber-100 border-amber-300 text-amber-800',
      'normal': 'bg-emerald-100 border-emerald-300 text-emerald-800'
    };
    return colors[status] || 'bg-gray-100 border-gray-300 text-gray-800';
  };

  const getRiskLevelBgColor = (level) => {
    const colors = {
      'Élevé': 'bg-red-50 border-red-200',
      'Moyen': 'bg-amber-50 border-amber-200',
      'Faible': 'bg-emerald-50 border-emerald-200'
    };
    return colors[level] || 'bg-gray-50 border-gray-200';
  };

  const getRiskLevelTextColor = (level) => {
    const colors = {
      'Élevé': 'text-red-800',
      'Moyen': 'text-amber-800',
      'Faible': 'text-emerald-800'
    };
    return colors[level] || 'text-gray-800';
  };

  if (!wasteData && !isLoading && error) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Erreur d'analyse</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <X size={28} />
            </button>
          </div>
          <div className="p-6 bg-red-50 border-2 border-red-300 rounded-xl">
            <p className="text-red-800">{error}</p>
          </div>
          <div className="flex gap-4 mt-6">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-100 text-gray-800 rounded-xl hover:bg-gray-200 transition font-bold"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        
        {/* En-tête */}
        <div className="sticky top-0 bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-500 p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">Analyse du déchet</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition"
          >
            <X className="text-white" size={28} />
          </button>
        </div>

        {/* Contenu */}
        <div className="p-8 space-y-6">
          
          {/* Chargement */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="relative w-16 h-16 mb-4">
                <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
                <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-emerald-500 border-r-emerald-500 animate-spin"></div>
              </div>
              <p className="text-lg font-medium text-gray-600">Analyse en cours...</p>
              <p className="text-sm text-gray-500 mt-2">Classification du déchet par IA</p>
            </div>
          )}

          {/* Données du déchet */}
          {wasteData && !isLoading && (
            <div className="space-y-6">
              
              {/* Image et type */}
              <div className="grid grid-cols-3 gap-6">
                <div className="col-span-1">
                  {imagePreview && (
                    <img
                      src={imagePreview}
                      alt="Déchet"
                      className="w-full h-40 object-cover rounded-xl shadow-lg"
                      onError={(e) => {
                        e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23f0f0f0" width="100" height="100"/%3E%3C/svg%3E';
                      }}
                    />
                  )}
                </div>

                <div className="col-span-2 space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Type de déchet</p>
                    <div className={`inline-block px-4 py-2 rounded-lg border-2 font-bold text-lg ${getTypeColor(wasteData.type)}`}>
                      {wasteData.type || 'Non détecté'}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-2">Confiance de l'IA</p>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-emerald-500 to-cyan-500 h-full transition-all"
                          style={{ width: `${wasteData.confidence || 0}%` }}
                        ></div>
                      </div>
                      <span className="font-bold text-emerald-600 text-lg">{wasteData.confidence || 0}%</span>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-2">Catégorie détaillée</p>
                    <p className="font-medium text-gray-800">{wasteData.wasteInfo?.category || 'N/A'}</p>
                    <p className="text-xs text-gray-500 mt-1">{wasteData.wasteInfo?.material || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Statistiques de la zone */}
              {wasteData.zoneStats && (
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border-2 border-blue-200">
                  <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center gap-2">
                    <MapPin size={20} />
                    Statistiques de la zone
                  </h3>

                  <div className={`p-4 rounded-xl mb-4 border-2 ${getZoneStatusColor(wasteData.zoneStats.zoneStatus || 'normal')}`}>
                    <div className="flex items-center gap-2">
                      {(wasteData.zoneStats.zoneStatus === 'critical') && <AlertTriangle size={20} />}
                      {(wasteData.zoneStats.zoneStatus === 'warning') && <AlertCircle size={20} />}
                      {(wasteData.zoneStats.zoneStatus === 'normal' || !wasteData.zoneStats.zoneStatus) && <CheckCircle size={20} />}
                      <span className="font-bold">
                        {wasteData.zoneStats.zoneStatus === 'critical' && 'Zone critique - Priorité haute'}
                        {wasteData.zoneStats.zoneStatus === 'warning' && 'Zone en alerte'}
                        {(wasteData.zoneStats.zoneStatus === 'normal' || !wasteData.zoneStats.zoneStatus) && 'Zone normale'}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-white rounded-lg p-4 text-center border-l-4 border-blue-500">
                      <Users size={24} className="mx-auto mb-2 text-blue-600" />
                      <div className="text-2xl font-bold text-gray-800">{wasteData.zoneStats.totalInZone || 0}</div>
                      <p className="text-xs text-gray-600 mt-1">Déchets en zone</p>
                    </div>

                    <div className="bg-white rounded-lg p-4 text-center border-l-4 border-emerald-500">
                      <CheckCircle size={24} className="mx-auto mb-2 text-emerald-600" />
                      <div className="text-2xl font-bold text-gray-800">{wasteData.zoneStats.cleanedThisMonth || 0}</div>
                      <p className="text-xs text-gray-600 mt-1">Nettoyés ce mois</p>
                    </div>

                    <div className="bg-white rounded-lg p-4 text-center border-l-4 border-amber-500">
                      <TrendingUp size={24} className="mx-auto mb-2 text-amber-600" />
                      <div className="text-2xl font-bold text-gray-800">{wasteData.zoneStats.reportedToday || 0}</div>
                      <p className="text-xs text-gray-600 mt-1">Signalés aujourd'hui</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Informations du déchet */}
              {wasteData.wasteInfo && (
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border-2 border-purple-200">
                  <h3 className="text-lg font-bold text-purple-900 mb-4 flex items-center gap-2">
                    <Info size={20} />
                    Informations du déchet
                  </h3>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                      <span className="text-gray-700 font-medium">Temps de décomposition</span>
                      <span className="text-purple-600 font-bold">{wasteData.wasteInfo.decompositionTime || 'N/A'}</span>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                      <span className="text-gray-700 font-medium">Recyclable</span>
                      <span className="flex items-center gap-2">
                        {wasteData.wasteInfo.recyclable ? (
                          <CheckCircle className="text-emerald-600" size={20} />
                        ) : (
                          <X className="text-red-600" size={20} />
                        )}
                      </span>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                      <span className="text-gray-700 font-medium">Dangereux</span>
                      <span className="flex items-center gap-2">
                        {wasteData.wasteInfo.isDangerous ? (
                          <AlertTriangle className="text-red-600" size={20} />
                        ) : (
                          <CheckCircle className="text-emerald-600" size={20} />
                        )}
                      </span>
                    </div>
                  </div>

                  {wasteData.wasteInfo.impacts && wasteData.wasteInfo.impacts.length > 0 && (
                    <div className="mt-4 p-3 bg-white rounded-lg">
                      <p className="text-sm font-bold text-gray-700 mb-2">Impacts environnementaux</p>
                      <ul className="space-y-1">
                        {wasteData.wasteInfo.impacts.map((impact, idx) => (
                          <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                            <span className="text-purple-600 mt-1">•</span>
                            {impact}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Risques sanitaires */}
              {wasteData.healthRisks && (
                <div className={`rounded-2xl p-6 border-2 ${getRiskLevelBgColor(wasteData.healthRisks.level)}`}>
                  <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${getRiskLevelTextColor(wasteData.healthRisks.level)}`}>
                    <AlertCircle size={20} />
                    Risques sanitaires
                  </h3>

                  <div className={`inline-block px-4 py-2 rounded-lg font-bold mb-4 ${getRiskLevelBgColor(wasteData.healthRisks.level)} ${getRiskLevelTextColor(wasteData.healthRisks.level)}`}>
                    {wasteData.healthRisks.level}
                  </div>

                  {wasteData.healthRisks.risks && wasteData.healthRisks.risks.length > 0 && (
                    <ul className="space-y-2">
                      {wasteData.healthRisks.risks.map((risk, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <AlertCircle size={18} className="flex-shrink-0 mt-1" />
                          <span>{risk}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {/* Recommandations */}
              {wasteData.recommendations && (
                <div className="bg-gradient-to-br from-emerald-50 to-cyan-50 rounded-2xl p-6 border-2 border-emerald-200">
                  <h3 className="text-lg font-bold text-emerald-900 mb-4">Recommandations</h3>

                  <div className="space-y-3">
                    <div className="p-4 bg-white rounded-lg border-l-4 border-emerald-500">
                      <p className="text-sm text-gray-600 mb-1">Priorité</p>
                      <p className="font-bold text-emerald-700 text-lg">{wasteData.recommendations.priority || 'N/A'}</p>
                    </div>

                    <div className="p-4 bg-white rounded-lg border-l-4 border-blue-500">
                      <p className="text-sm text-gray-600 mb-1">Action suggérée</p>
                      <p className="font-bold text-blue-700">{wasteData.recommendations.action || 'N/A'}</p>
                    </div>

                    <div className="p-4 bg-white rounded-lg border-l-4 border-amber-500">
                      <p className="text-sm text-gray-600 mb-1">Délai estimé de nettoyage</p>
                      <p className="font-bold text-amber-700">{wasteData.recommendations.estimatedCleanupTime || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Boutons d'action */}
          {!isLoading && wasteData && (
            <div className="flex gap-4 pt-6 border-t-2 border-gray-200">
              <button
                onClick={onClose}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-bold"
              >
                Annuler
              </button>
              <button
                onClick={() => onConfirm(wasteData)}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-xl hover:shadow-lg transition-all font-bold"
              >
                Confirmer et envoyer
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WasteDetectionModal;