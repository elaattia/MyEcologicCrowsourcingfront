// components/SignalWasteContent.jsx
import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Upload, Camera, CheckCircle, AlertCircle, Loader, X } from 'lucide-react';
import wasteApi from '../services/api/wasteApi';
import { LIMITS, ACCEPTED_FORMATS } from '../utils/constants';
import WasteDetectionModal from './WasteDetectionModal';

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
  
  // States pour la modale
  const [showModal, setShowModal] = useState(false);
  const [detectedWaste, setDetectedWaste] = useState(null);

  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

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

  // Gérer l'upload d'image
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
  };

  // Démarrer la caméra
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

  // Arrêter la caméra
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
    setCameraReady(false);
    setCameraError('');
  };

  // Capturer une photo depuis la caméra
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
      }, 'image/jpeg', 0.95);
    } catch (err) {
      setError('Erreur lors de la capture : ' + err.message);
      console.error('Erreur capture:', err);
    }
  };

  // Afficher la modale d'analyse
  const handleAnalyzeWaste = () => {
    if (!selectedImage) {
      setError('Veuillez sélectionner une image');
      return;
    }

    if (!location.latitude || !location.longitude) {
      setError('Position GPS non disponible. Veuillez autoriser la géolocalisation.');
      return;
    }

    setShowModal(true);
  };

  // Confirmer et envoyer le signalement depuis la modale
  const handleConfirmWaste = async (wasteData) => {
    setLoading(true);
    setError('');

    try {
      const result = await wasteApi.signalWaste(
        selectedImage, 
        location.latitude, 
        location.longitude,
        wasteData
      );
      
      setDetectedWaste(wasteData);
      setSuccess(true);
      setShowModal(false);
      
      // Réinitialiser après 2 secondes
      setTimeout(() => {
        handleReset();
        setSuccess(false);
      }, 2000);
    } catch (err) {
      setError(err.message || 'Erreur lors du signalement du déchet');
      console.error('Erreur:', err);
      setShowModal(false);
    } finally {
      setLoading(false);
    }
  };

  // Réinitialiser le formulaire
  const handleReset = () => {
    setSelectedImage(null);
    setPreview(null);
    setError('');
    setSuccess(false);
    setDetectedWaste(null);
    stopCamera();
  };

  // Fermer la modale
  const handleCloseModal = () => {
    setShowModal(false);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-3xl shadow-2xl p-8 mb-6">
        {/* En-tête */}
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

        {/* Contenu principal */}
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

                {/* Overlay guide */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-64 h-64 border-4 border-emerald-400 rounded-2xl opacity-50"></div>
                </div>

                {/* Chargement */}
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

          {/* SECTION CHOIX (si pas de caméra, pas d'aperçu) */}
          {!isCameraActive && !preview && (
            <div className="grid grid-cols-2 gap-4">
              {/* Option 1: Upload d'image */}
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

              {/* Option 2: Prendre une photo */}
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
              {success && (
                <div className="p-4 bg-emerald-50 text-emerald-700 rounded-xl flex items-center gap-3 border border-emerald-200">
                  <CheckCircle size={20} />
                  <p className="text-sm font-medium">
                    Signalement envoyé avec succès ! Merci pour votre contribution.
                  </p>
                </div>
              )}

              {/* Boutons d'action */}
              <div className="flex gap-4">
                <button
                  onClick={handleAnalyzeWaste}
                  disabled={loading || !selectedImage || !location.latitude}
                  className="flex-1 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white px-6 py-4 rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2 font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader className="animate-spin" size={20} />
                      Analyse en cours...
                    </>
                  ) : (
                    <>
                      <Upload size={20} />
                      Analyser et envoyer
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
              </div>
            </div>
          )}

          {/* Messages d'erreur (quand aucune image) */}
          {error && !preview && !isCameraActive && (
            <div className="p-4 bg-red-50 text-red-700 rounded-xl flex items-center gap-3 border border-red-200">
              <AlertCircle size={20} />
              <p className="text-sm">{error}</p>
            </div>
          )}
        </div>
      </div>

      {/* Modale d'analyse du déchet */}
      {showModal && (
        <WasteDetectionModal
          imagePreview={preview}
          location={location}
          selectedImage={selectedImage}
          onClose={handleCloseModal}
          onConfirm={handleConfirmWaste}
        />
      )}
    </div>
  );
};

export default SignalWasteContent;