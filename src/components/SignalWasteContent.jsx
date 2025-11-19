import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Upload, Camera, CheckCircle, AlertCircle, Loader, X, Eye } from 'lucide-react';

const SignalWasteContent = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [location, setLocation] = useState({ latitude: null, longitude: null });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [locationError, setLocationError] = useState('');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [cameraReady, setCameraReady] = useState(false);
  
  // États pour la modale et l'analyse
  const [showModal, setShowModal] = useState(false);
  const [createdPointDechetId, setCreatedPointDechetId] = useState(null);
  const [imageSent, setImageSent] = useState(false);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);

  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const LIMITS = {
    MAX_FILE_SIZE: 5 * 1024 * 1024,
    MIN_FILE_SIZE: 10 * 1024,
  };

  const ACCEPTED_FORMATS = {
    IMAGES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  };

  // Récupérer la géolocalisation
  useEffect(() => {
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
        setLocationError('');
        setLoading(false);
      },
      (err) => {
        setLocationError('Impossible d\'obtenir votre position GPS. Veuillez autoriser la géolocalisation.');
        setLoading(false);
        console.error('Erreur de géolocalisation:', err);
      }
    );

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const validateImage = (file) => {
    if (!ACCEPTED_FORMATS.IMAGES.includes(file.type)) {
      return 'Format d\'image non supporté. Utilisez JPG, PNG ou WebP.';
    }
    if (file.size > LIMITS.MAX_FILE_SIZE) {
      return `Le fichier est trop volumineux. Taille maximale : ${LIMITS.MAX_FILE_SIZE / (1024 * 1024)}MB`;
    }
    return null;
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validationError = validateImage(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setSelectedImage(file);
    setPreview(URL.createObjectURL(file));
    setError('');
    setSuccess(false);
    setImageSent(false);
    setCreatedPointDechetId(null);
  };

  const startCamera = async () => {
    setCameraError('');
    setCameraReady(false);
    setIsCameraActive(true);

    try {
      const constraints = {
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play()
            .then(() => {
              setCameraReady(true);
            })
            .catch(err => {
              console.error('Erreur de lecture vidéo:', err);
              setCameraError('Impossible de lire le flux vidéo.');
            });
        };
      }
    } catch (err) {
      console.error('Erreur caméra complète:', err);
      let message = 'Impossible d\'accéder à la caméra.';
      
      if (err.name === 'NotAllowedError') {
        message = 'Permission caméra refusée. Veuillez accepter l\'accès dans les paramètres du navigateur.';
      } else if (err.name === 'NotFoundError') {
        message = 'Aucune caméra trouvée sur cet appareil.';
      } else if (err.name === 'NotReadableError') {
        message = 'La caméra est déjà utilisée par une autre application.';
      } else if (err.name === 'OverconstrainedError') {
        message = 'Les paramètres de caméra ne sont pas supportés.';
      }
      
      setCameraError(message);
      setIsCameraActive(false);
      setCameraReady(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
    setCameraReady(false);
    setCameraError('');
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current || !cameraReady) {
      setError('La caméra n\'est pas prête. Veuillez attendre quelques secondes.');
      return;
    }

    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      if (canvas.width === 0 || canvas.height === 0) {
        setError('Erreur: dimensions vidéo invalides.');
        return;
      }
      
      context.drawImage(video, 0, 0);
      
      canvas.toBlob((blob) => {
        if (!blob) {
          setError('Erreur lors de la capture de la photo.');
          return;
        }

        const file = new File([blob], 'photo-dechet.jpg', { type: 'image/jpeg' });
        const validationError = validateImage(file);
        
        if (validationError) {
          setError(validationError);
          return;
        }

        setSelectedImage(file);
        setPreview(canvas.toDataURL('image/jpeg'));
        stopCamera();
        setError('');
        setSuccess(false);
        setImageSent(false);
        setCreatedPointDechetId(null);
      }, 'image/jpeg', 0.95);
    } catch (err) {
      setError('Erreur lors de la capture : ' + err.message);
      console.error('Erreur capture:', err);
    }
  };

  // ÉTAPE 1: Envoyer l'image uniquement (sans analyse)
  const handleSendImage = async () => {
    if (!selectedImage) {
      setError('Veuillez sélectionner une image');
      return;
    }

    if (!location.latitude || !location.longitude) {
      setError('Position GPS non disponible. Veuillez autoriser la géolocalisation.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('Envoi de l\'image au serveur...');
      
      // Simuler l'appel API (remplacer par votre vraie API)
      const formData = new FormData();
      formData.append('Image', selectedImage);
      formData.append('Latitude', location.latitude.toString());
      formData.append('Longitude', location.longitude.toString());

      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5008/api/pointdechet/signaler', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'envoi de l\'image');
      }

      const result = await response.json();
      console.log('Point de déchet créé:', result);
      
      const pointDechetId = result.id || result.pointDechetId;
      
      if (!pointDechetId) {
        throw new Error('ID du point de déchet non reçu');
      }

      setCreatedPointDechetId(pointDechetId);
      setImageSent(true);
      setSuccess(true);
      setLoading(false);

    } catch (err) {
      setError(err.message || 'Erreur lors de l\'envoi de l\'image');
      console.error('Erreur:', err);
      setLoading(false);
    }
  };

  // ÉTAPE 2: Afficher l'analyse (appeler l'API et ouvrir la modale)
  const handleShowAnalysis = async () => {
    if (!createdPointDechetId) {
      setError('Aucun point de déchet créé');
      return;
    }

    setLoadingAnalysis(true);
    setError('');

    try {
      console.log('Analyse du déchet en cours...');
      
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5008/api/wasteclassification/classify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          pointDechetId: createdPointDechetId
        })
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'analyse du déchet');
      }

      const analysisResult = await response.json();
      console.log('Analyse terminée:', analysisResult);
      
      setShowModal(true);
      setLoadingAnalysis(false);

    } catch (err) {
      setError(err.message || 'Erreur lors de l\'analyse');
      console.error('Erreur:', err);
      setLoadingAnalysis(false);
    }
  };

  const handleReset = () => {
    setSelectedImage(null);
    setPreview(null);
    setError('');
    setSuccess(false);
    setCreatedPointDechetId(null);
    setImageSent(false);
    stopCamera();
  };

  const handleCloseModal = () => {
    setShowModal(false);
    handleReset();
  };

  const handleConfirmFromModal = () => {
    setSuccess(true);
    setShowModal(false);
    
    setTimeout(() => {
      handleReset();
      setSuccess(false);
    }, 2000);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-3xl shadow-2xl p-8 mb-6">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-2">
            <div className="bg-gradient-to-br from-emerald-400 to-emerald-500 p-2 rounded-xl shadow-lg">
              <MapPin size={28} className="text-white" />
            </div>
            Signaler un déchet
          </h2>
          <p className="text-gray-600">
            Prenez une photo ou téléchargez une image pour signaler un déchet
          </p>
        </div>

        {/* État GPS */}
        {location.latitude ? (
          <div className="mb-6 p-4 bg-emerald-50 rounded-xl flex items-center gap-3 border border-emerald-200">
            <MapPin className="text-emerald-600" size={20} />
            <div>
              <p className="text-sm font-medium text-gray-700">Position GPS détectée</p>
              <p className="text-xs text-gray-600">
                {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
              </p>
            </div>
          </div>
        ) : locationError ? (
          <div className="mb-6 p-4 bg-red-50 rounded-xl flex items-center gap-3 border border-red-200">
            <AlertCircle className="text-red-600" size={20} />
            <p className="text-sm text-red-700">{locationError}</p>
          </div>
        ) : (
          <div className="mb-6 p-4 bg-gray-50 rounded-xl flex items-center gap-3">
            <Loader className="text-gray-600 animate-spin" size={20} />
            <p className="text-sm text-gray-600">Récupération de votre position...</p>
          </div>
        )}

        <div className="space-y-6">
          {/* SECTION CAMÉRA */}
          {isCameraActive && (
            <div className="space-y-4 border-4 border-emerald-200 bg-emerald-50 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-emerald-900 flex items-center gap-2">
                <Camera className="text-emerald-600" />
                Caméra active
              </h3>

              {cameraError && (
                <div className="p-4 bg-red-100 text-red-800 rounded-xl flex items-start gap-3 border border-red-300">
                  <AlertCircle size={24} className="flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-medium">Erreur caméra</p>
                    <p className="text-sm mt-1">{cameraError}</p>
                  </div>
                </div>
              )}

              {!cameraError && !cameraReady && (
                <div className="p-4 bg-blue-100 text-blue-800 rounded-xl flex items-center gap-3 border border-blue-300">
                  <Loader className="animate-spin" size={20} />
                  <p className="text-sm">Initialisation de la caméra...</p>
                </div>
              )}

              <div className="relative bg-black rounded-2xl overflow-hidden shadow-xl border-4 border-gray-800">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  style={{
                    width: '100%',
                    height: '500px',
                    objectFit: 'cover',
                    display: 'block',
                    backgroundColor: '#000'
                  }}
                />
                <canvas ref={canvasRef} className="hidden" />

                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-64 h-64 border-4 border-emerald-400 rounded-2xl opacity-50"></div>
                </div>

                {!cameraReady && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="text-center">
                      <Loader className="animate-spin text-white mx-auto mb-3" size={40} />
                      <p className="text-white font-medium">Initialisation...</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={capturePhoto}
                  disabled={!cameraReady}
                  className="flex-1 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white px-6 py-4 rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2 font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Camera size={24} />
                  Capturer la photo
                </button>
                <button
                  onClick={stopCamera}
                  className="px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-medium"
                >
                  Annuler
                </button>
              </div>
            </div>
          )}

          {/* SECTION CHOIX */}
          {!isCameraActive && !preview && (
            <div className="grid grid-cols-2 gap-4">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-blue-300 hover:border-blue-500 hover:bg-blue-50 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all"
              >
                <Upload size={48} className="text-blue-600 mb-4" />
                <p className="text-gray-700 font-bold mb-2">Choisir une image</p>
                <p className="text-sm text-gray-500 text-center">
                  Sélectionnez une image depuis votre galerie
                </p>
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              <div
                onClick={startCamera}
                className="border-2 border-dashed border-emerald-300 hover:border-emerald-500 hover:bg-emerald-50 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all"
              >
                <Camera size={48} className="text-emerald-600 mb-4" />
                <p className="text-gray-700 font-bold mb-2">Prendre une photo</p>
                <p className="text-sm text-gray-500 text-center">
                  Utilisez votre caméra
                </p>
              </div>
            </div>
          )}

          {/* SECTION APERÇU */}
          {preview && !isCameraActive && (
            <div className="space-y-4">
              <div className="rounded-2xl overflow-hidden shadow-lg border-4 border-emerald-200">
                <img
                  src={preview}
                  alt="Aperçu"
                  className="w-full h-96 object-cover"
                />
              </div>

              <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                <p className="text-sm text-blue-800">
                  <strong>💡 Conseil :</strong> Assurez-vous que la photo montre clairement le déchet
                  pour faciliter son identification automatique.
                </p>
              </div>

              {/* Messages d'erreur */}
              {error && (
                <div className="p-4 bg-red-50 text-red-700 rounded-xl flex items-center gap-3 border border-red-200">
                  <AlertCircle size={20} />
                  <p className="text-sm">{error}</p>
                </div>
              )}

              {/* Message de succès */}
              {success && !showModal && (
                <div className="p-4 bg-emerald-50 text-emerald-700 rounded-xl flex items-center gap-3 border border-emerald-200">
                  <CheckCircle size={20} />
                  <p className="text-sm font-medium">
                    Image envoyée avec succès ! Vous pouvez maintenant afficher l'analyse.
                  </p>
                </div>
              )}

              {/* Boutons d'action */}
              <div className="flex gap-4">
                {!imageSent ? (
                  <>
                    <button
                      onClick={handleSendImage}
                      disabled={loading || !selectedImage || !location.latitude}
                      className="flex-1 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white px-6 py-4 rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2 font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <Loader className="animate-spin" size={20} />
                          Envoi en cours...
                        </>
                      ) : (
                        <>
                          <Upload size={20} />
                          Envoyer
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleReset}
                      disabled={loading}
                      className="px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-medium disabled:opacity-50"
                    >
                      Recommencer
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleShowAnalysis}
                      disabled={loadingAnalysis}
                      className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-4 rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2 font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loadingAnalysis ? (
                        <>
                          <Loader className="animate-spin" size={20} />
                          Analyse en cours...
                        </>
                      ) : (
                        <>
                          <Eye size={20} />
                          Afficher l'analyse
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleReset}
                      disabled={loadingAnalysis}
                      className="px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-medium disabled:opacity-50"
                    >
                      Recommencer
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          {error && !preview && !isCameraActive && (
            <div className="p-4 bg-red-50 text-red-700 rounded-xl flex items-center gap-3 border border-red-200">
              <AlertCircle size={20} />
              <p className="text-sm">{error}</p>
            </div>
          )}
        </div>
      </div>

      {/* Modale d'analyse */}
      {showModal && createdPointDechetId && (
        <WasteDetectionModal
          imagePreview={preview}
          location={location}
          pointDechetId={createdPointDechetId}
          onClose={handleCloseModal}
          onConfirm={handleConfirmFromModal}
        />
      )}
    </div>
  );
};

// Modale d'analyse avec données réelles
const WasteDetectionModal = ({ imagePreview, location, pointDechetId, onClose, onConfirm }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [wasteData, setWasteData] = useState(null);

  useEffect(() => {
    const fetchAnalysis = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5008/api/wasteclassification/classify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ pointDechetId })
        });

        if (!response.ok) {
          throw new Error('Erreur lors de la récupération de l\'analyse');
        }

        const data = await response.json();
        console.log('Données d\'analyse reçues:', data);

        // Mapper les données de l'API vers le format attendu
        const mappedData = {
          type: data.category || 'Autre',
          confidence: Math.round((data.confidence || 0) * 100),
          imageUrl: imagePreview,
          roboflowClass: data.roboflowClass,
          detectedObjects: data.detectedObjects,
          processingTime: data.processingTime,
          fromCache: data.fromCache,
          wasteInfo: {
            category: data.category || 'Non identifié',
            material: 'Analysé par IA',
            decompositionTime: getDecompositionTime(data.category),
            recyclable: isRecyclable(data.category),
            isDangerous: isDangerous(data.category),
            impacts: getImpacts(data.category)
          },
          zoneStats: {
            totalInZone: 0,
            cleanedThisMonth: 0,
            reportedToday: 1,
            zoneStatus: 'normal'
          },
          healthRisks: {
            level: getHealthRiskLevel(data.category),
            risks: getHealthRisks(data.category)
          },
          recommendations: {
            priority: data.confidence > 0.8 ? 'Haute' : 'Moyenne',
            action: 'Signalé pour nettoyage',
            estimatedCleanupTime: '2-3 jours'
          }
        };

        setWasteData(mappedData);
        setError('');
      } catch (err) {
        console.error('Erreur fetchAnalysis:', err);
        setError('Erreur lors de la récupération de l\'analyse');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalysis();
  }, [pointDechetId, imagePreview]);

  const getDecompositionTime = (category) => {
    const times = {
      'Plastique': '100-400 ans',
      'Verre': '4000 ans',
      'Metale': '50-200 ans',
      'Pile': '1000 ans',
      'Papier': '2-6 mois',
      'Autre': 'Variable'
    };
    return times[category] || 'Non déterminé';
  };

  const isRecyclable = (category) => {
    return ['Plastique', 'Verre', 'Metale', 'Papier'].includes(category);
  };

  const isDangerous = (category) => {
    return ['Pile'].includes(category);
  };

  const getImpacts = (category) => {
    const impacts = {
      'Plastique': ['Pollution des océans', 'Ingestion par la faune', 'Libération de microplastiques'],
      'Verre': ['Risque de blessure', 'Pollution visuelle', 'Non biodégradable'],
      'Metale': ['Contamination du sol', 'Risque de rouille', 'Pollution des nappes'],
      'Pile': ['Contamination chimique', 'Métaux lourds toxiques', 'Pollution des sols'],
      'Papier': ['Déforestation', 'Consommation d\'eau', 'Émissions de méthane'],
      'Autre': ['Impact environnemental variable']
    };
    return impacts[category] || ['Impact à évaluer'];
  };

  const getHealthRiskLevel = (category) => {
    if (category === 'Pile') return 'Élevé';
    if (['Plastique', 'Metale'].includes(category)) return 'Moyen';
    return 'Faible';
  };

  const getHealthRisks = (category) => {
    const risks = {
      'Plastique': ['Blessures si cassé', 'Contaminants possibles'],
      'Verre': ['Coupures graves', 'Blessures aux pieds'],
      'Metale': ['Coupures', 'Tétanos possible'],
      'Pile': ['Brûlures chimiques', 'Intoxication'],
      'Papier': ['Risque minimal'],
      'Autre': ['À évaluer']
    };
    return risks[category] || ['Risque à évaluer'];
  };

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

  if (error && !isLoading) {
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
                    />
                  )}
                </div>

                <div className="col-span-2 space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Type de déchet</p>
                    <div className={`inline-block px-4 py-2 rounded-lg border-2 font-bold text-lg ${getTypeColor(wasteData.type)}`}>
                      {wasteData.type}
                    </div>
                    {wasteData.fromCache && (
                      <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                        Cache
                      </span>
                    )}
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-2">Confiance de l'IA</p>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-emerald-500 to-cyan-500 h-full transition-all"
                          style={{ width: `${wasteData.confidence}%` }}
                        ></div>
                      </div>
                      <span className="font-bold text-emerald-600 text-lg">{wasteData.confidence}%</span>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-2">Catégorie détaillée</p>
                    <p className="font-medium text-gray-800">{wasteData.wasteInfo?.category}</p>
                    {wasteData.roboflowClass && (
                      <p className="text-xs text-gray-500 mt-1">Roboflow: {wasteData.roboflowClass}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Informations du déchet */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border-2 border-purple-200">
                <h3 className="text-lg font-bold text-purple-900 mb-4 flex items-center gap-2">
                  <AlertCircle size={20} />
                  Informations du déchet
                </h3>

                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                    <span className="text-gray-700 font-medium">Temps de décomposition</span>
                    <span className="text-purple-600 font-bold">{wasteData.wasteInfo.decompositionTime}</span>
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
                        <AlertCircle className="text-red-600" size={20} />
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

              {/* Risques sanitaires */}
              {wasteData.healthRisks && (
                <div className={`rounded-2xl p-6 border-2 ${getRiskLevelBgColor(wasteData.healthRisks.level)}`}>
                  <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${getRiskLevelTextColor(wasteData.healthRisks.level)}`}>
                    <AlertCircle size={20} />
                    Risques sanitaires
                  </h3>

                  <div className={`inline-block px-4 py-2 rounded-lg font-bold mb-4 ${getRiskLevelTextColor(wasteData.healthRisks.level)}`}>
                    Niveau: {wasteData.healthRisks.level}
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
                      <p className="font-bold text-emerald-700 text-lg">{wasteData.recommendations.priority}</p>
                    </div>

                    <div className="p-4 bg-white rounded-lg border-l-4 border-blue-500">
                      <p className="text-sm text-gray-600 mb-1">Action suggérée</p>
                      <p className="font-bold text-blue-700">{wasteData.recommendations.action}</p>
                    </div>

                    <div className="p-4 bg-white rounded-lg border-l-4 border-amber-500">
                      <p className="text-sm text-gray-600 mb-1">Délai estimé</p>
                      <p className="font-bold text-amber-700">{wasteData.recommendations.estimatedCleanupTime}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Infos techniques */}
              {(wasteData.detectedObjects || wasteData.processingTime) && (
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <p className="text-xs text-gray-600">
                    {wasteData.detectedObjects && `${wasteData.detectedObjects} objet(s) détecté(s)`}
                    {wasteData.processingTime && ` • Temps de traitement: ${wasteData.processingTime}ms`}
                  </p>
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
                Fermer
              </button>
              <button
                onClick={() => onConfirm(wasteData)}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-xl hover:shadow-lg transition-all font-bold"
              >
                Confirmer
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SignalWasteContent;