// src/components/Challenges/SubmitProof.jsx
import React, { useState } from 'react';
import { X, Upload, MapPin, Loader, CheckCircle, AlertCircle, Image as ImageIcon } from 'lucide-react';
import { challengeApi } from '../../services/api/challengeApi';

const SubmitProof = ({ challenge, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    proofUrl: '',
    description: '',
    location: '',
    latitude: null,
    longitude: null
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert('La géolocalisation n\'est pas supportée par votre navigateur');
      return;
    }

    setGettingLocation(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData(prev => ({
          ...prev,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          location: `${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`
        }));
        setGettingLocation(false);
      },
      (error) => {
        console.error('Erreur géolocalisation:', error);
        alert('Impossible d\'obtenir votre position');
        setGettingLocation(false);
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    // Validation
    if (!formData.proofUrl.trim()) {
      setError('Veuillez fournir une URL de preuve');
      return;
    }

    try {
      new URL(formData.proofUrl);
    } catch {
      setError('L\'URL de la preuve n\'est pas valide');
      return;
    }

    if (formData.description.length > 1000) {
      setError('La description ne peut pas dépasser 1000 caractères');
      return;
    }

    setLoading(true);

    try {
      await challengeApi.createSubmission({
        challengeId: challenge.id,
        proofType: challenge.requiredProofType,
        proofUrl: formData.proofUrl.trim(),
        description: formData.description.trim() || null,
        location: formData.location.trim() || null,
        latitude: formData.latitude,
        longitude: formData.longitude
      });

      setSuccess(true);
      
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 2000);
    } catch (err) {
      console.error('Erreur soumission:', err);
      setError(err.message || 'Erreur lors de la soumission');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-8 my-8">
        {/* En-tête */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              Soumettre une preuve
            </h2>
            <p className="text-gray-600">{challenge.title}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
            disabled={loading}
          >
            <X size={24} />
          </button>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 text-red-700 rounded-xl flex items-center gap-3">
            <AlertCircle size={20} />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-emerald-50 border-2 border-emerald-200 text-emerald-700 rounded-xl flex items-center gap-3">
            <CheckCircle size={20} />
            <p className="text-sm">Soumission envoyée avec succès ! Redirection...</p>
          </div>
        )}

        {/* Info sur le type de preuve */}
        <div className="mb-6 p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
          <p className="text-blue-900 font-medium mb-2">
            📸 Type de preuve requis : {challenge.requiredProofType}
          </p>
          {challenge.verificationCriteria && (
            <p className="text-blue-800 text-sm">
              {challenge.verificationCriteria}
            </p>
          )}
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* URL de la preuve */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <ImageIcon size={16} className="inline mr-2" />
              URL de la preuve * ({challenge.requiredProofType})
            </label>
            <input
              type="url"
              value={formData.proofUrl}
              onChange={(e) => setFormData({ ...formData, proofUrl: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
              placeholder="https://exemple.com/ma-photo.jpg"
              required
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-1">
              Utilisez un service d'hébergement d'images comme Imgur, Cloudinary, etc.
            </p>

            {/* Aperçu de l'image */}
            {formData.proofUrl && (
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-2">Aperçu :</p>
                <img
                  src={formData.proofUrl}
                  alt="Aperçu"
                  className="w-full max-h-64 object-contain rounded-xl border-2 border-gray-200"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description (optionnel)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
              rows="4"
              placeholder="Décrivez votre action, ce que vous avez fait, où, quand..."
              disabled={loading}
              maxLength={1000}
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.description.length}/1000 caractères
            </p>
          </div>

          {/* Localisation */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin size={16} className="inline mr-2" />
              Localisation (optionnel)
            </label>
            
            <div className="flex gap-2">
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                placeholder="Ex: Paris, France ou coordonnées GPS"
                disabled={loading}
              />
              <button
                type="button"
                onClick={handleGetLocation}
                disabled={loading || gettingLocation}
                className="px-6 py-3 bg-emerald-100 text-emerald-700 rounded-xl hover:bg-emerald-200 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {gettingLocation ? (
                  <>
                    <Loader className="animate-spin" size={18} />
                    GPS...
                  </>
                ) : (
                  <>
                    <MapPin size={18} />
                    GPS
                  </>
                )}
              </button>
            </div>

            {formData.latitude && formData.longitude && (
              <p className="text-xs text-emerald-600 mt-2 flex items-center gap-1">
                <CheckCircle size={14} />
                Position GPS enregistrée
              </p>
            )}
          </div>

          {/* Points potentiels */}
          <div className="p-4 bg-amber-50 border-2 border-amber-200 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-900 font-bold">
                  Points à gagner :
                </p>
                <p className="text-amber-800 text-sm">
                  Points de base : {challenge.points}
                  {challenge.bonusPoints > 0 && ` + Bonus possible : ${challenge.bonusPoints}`}
                </p>
              </div>
              <div className="text-4xl">
                🏆
              </div>
            </div>
          </div>

          {/* Conseils */}
          {challenge.tips && (
            <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
              <p className="text-blue-900 font-medium mb-2">💡 Conseils :</p>
              <p className="text-blue-800 text-sm whitespace-pre-wrap">
                {challenge.tips}
              </p>
            </div>
          )}

          {/* Boutons */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition font-medium"
              disabled={loading}
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-xl hover:shadow-lg transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader className="animate-spin" size={18} />
                  Envoi en cours...
                </>
              ) : (
                <>
                  <Upload size={18} />
                  Soumettre la preuve
                </>
              )}
            </button>
          </div>

          {/* Note de vérification */}
          <div className="text-center text-xs text-gray-500">
            <p>
              Votre soumission sera vérifiée {challenge.verificationMethod === 'AIAutomatic' && 'automatiquement par IA'}
              {challenge.verificationMethod === 'ManualReview' && 'manuellement par notre équipe'}
              {challenge.verificationMethod === 'CommunityVoting' && 'par vote de la communauté'}
              {challenge.verificationMethod === 'Hybrid' && 'par IA puis par notre équipe si nécessaire'}
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubmitProof;