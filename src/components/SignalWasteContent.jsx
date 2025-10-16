// components/SignalWasteContent.jsx
import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Upload, Camera, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import wasteApi from '../services/api/wasteApi';
import { LIMITS, ACCEPTED_FORMATS } from '../utils/constants';

const SignalWasteContent = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [location, setLocation] = useState({ latitude: null, longitude: null });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [locationError, setLocationError] = useState('');
  const fileInputRef = useRef(null);

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
  };

  const handleSubmit = async () => {
    setError('');
    setSuccess(false);

    if (!selectedImage) {
      setError('Veuillez sélectionner une image');
      return;
    }

    if (!location.latitude || !location.longitude) {
      setError('Position GPS non disponible. Veuillez autoriser la géolocalisation.');
      return;
    }

    setLoading(true);

    try {
      await wasteApi.signalWaste(selectedImage, location.latitude, location.longitude);
      
      setSuccess(true);
      setSelectedImage(null);
      setPreview(null);
      
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err) {
      setError(err.message || 'Erreur lors du signalement du déchet');
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedImage(null);
    setPreview(null);
    setError('');
    setSuccess(false);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-3xl shadow-2xl p-8">
        {}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-2">
            <div className="bg-gradient-to-br from-emerald-400 to-emerald-500 p-2 rounded-xl shadow-lg">
              <MapPin size={28} className="text-white" />
            </div>
            Signaler un déchet
          </h2>
          <p className="text-gray-600">
            Prenez une photo et aidez-nous à localiser les déchets sauvages
          </p>
        </div>

        {}
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

        {}
        <div className="space-y-6">
          <div
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all ${
              preview
                ? 'border-emerald-500 bg-emerald-50'
                : 'border-gray-300 hover:border-emerald-500 hover:bg-emerald-50'
            }`}
          >
            {preview ? (
              <div className="text-center">
                <img
                  src={preview}
                  alt="Aperçu"
                  className="w-64 h-64 object-cover rounded-xl shadow-lg mb-4"
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleReset();
                  }}
                  className="text-sm text-gray-600 hover:text-gray-800 underline"
                >
                  Changer l'image
                </button>
              </div>
            ) : (
              <>
                <Upload size={48} className="text-emerald-600 mb-4" />
                <p className="text-gray-700 font-medium mb-2">
                  Cliquez ici pour télécharger une image
                </p>
                <p className="text-sm text-gray-500">
                  JPG, PNG ou WebP (max. 5MB)
                </p>
              </>
            )}
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {}
          {error && (
            <div className="p-4 bg-red-50 text-red-700 rounded-xl flex items-center gap-3 border border-red-200">
              <AlertCircle size={20} />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="p-4 bg-emerald-50 text-emerald-700 rounded-xl flex items-center gap-3 border border-emerald-200">
              <CheckCircle size={20} />
              <p className="text-sm font-medium">
                Signalement envoyé avec succès ! Merci pour votre contribution.
              </p>
            </div>
          )}

          {}
          <div className="flex gap-4">
            <button
              onClick={handleSubmit}
              disabled={loading || !selectedImage || !location.latitude}
              className="flex-1 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white px-6 py-4 rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader className="animate-spin" size={20} />
                  Envoi en cours...
                </>
              ) : (
                <>
                  <Camera size={20} />
                  Envoyer le signalement
                </>
              )}
            </button>

            {selectedImage && !loading && (
              <button
                onClick={handleReset}
                className="px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-medium"
              >
                Annuler
              </button>
            )}
          </div>
        </div>

        {}
        <div className="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-200">
          <p className="text-sm text-blue-800">
            <strong>💡 Conseil :</strong> Prenez une photo claire du déchet pour faciliter
            son identification et sa classification automatique.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignalWasteContent;