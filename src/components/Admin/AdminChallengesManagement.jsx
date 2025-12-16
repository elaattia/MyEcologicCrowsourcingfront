import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Plus, 
  Edit2, 
  Trash2, 
  Sparkles, 
  Star,
  Calendar,
  Target,
  X,
  Save,
  AlertCircle
} from 'lucide-react';
import adminApi from '../../services/api/adminApi';

// ENUMS STRING du backend C#
const CHALLENGE_TYPES = {
  'Recycling': 'Recyclage',
  'LitterPickup': 'Ramassage déchets',
  'Planting': 'Plantation',
  'PlantIdentification': 'Identification plantes',
  'WasteReduction': 'Réduction déchets',
  'EnergyConservation': 'Conservation énergie',
  'WaterConservation': 'Conservation eau',
  'Composting': 'Compostage',
  'SustainableTransport': 'Transport durable',
  'Education': 'Éducation'
};

const DIFFICULTY_LEVELS = {
  'Easy': { label: 'Facile', color: 'bg-green-100 text-green-700' },
  'Medium': { label: 'Moyen', color: 'bg-yellow-100 text-yellow-700' },
  'Hard': { label: 'Difficile', color: 'bg-orange-100 text-orange-700' },
  'Expert': { label: 'Expert', color: 'bg-red-100 text-red-700' }
};

const AdminChallengesManagement = () => {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [showAIModal, setShowAIModal] = useState(false);
  const [showBatchModal, setShowBatchModal] = useState(false);

  useEffect(() => {
    loadChallenges();
  }, []);

  const loadChallenges = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Loading challenges...');
      const data = await adminApi.getChallenges();
      console.log('Challenges loaded:', data);
      setChallenges(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Erreur chargement challenges:', err);
      setError('Erreur lors du chargement des challenges: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateChallenge = async (challengeData) => {
    try {
      console.log('Creating challenge with data:', challengeData);
      await adminApi.createChallenge(challengeData);
      alert('✅ Challenge créé avec succès');
      setShowCreateModal(false);
      await loadChallenges();
    } catch (err) {
      console.error('Erreur création challenge:', err);
      const errorMsg = err.response?.data?.message || err.response?.data || err.message;
      alert('❌ Erreur création: ' + errorMsg);
    }
  };

  const handleUpdateChallenge = async (challengeData) => {
    try {
      console.log('Updating challenge:', selectedChallenge.id, 'with data:', challengeData);
      await adminApi.updateChallenge(selectedChallenge.id, challengeData);
      alert('✅ Challenge modifié avec succès');
      setShowEditModal(false);
      setSelectedChallenge(null);
      await loadChallenges();
    } catch (err) {
      console.error('Erreur modification challenge:', err);
      const errorMsg = err.response?.data?.message || err.response?.data || err.message;
      alert('❌ Erreur: ' + errorMsg);
    }
  };

  const handleDeleteChallenge = async (challengeId) => {
    if (!window.confirm('⚠️ Supprimer ce challenge ?')) return;

    try {
      console.log('Deleting challenge:', challengeId);
      await adminApi.deleteChallenge(challengeId);
      alert('✅ Challenge supprimé');
      await loadChallenges();
    } catch (err) {
      console.error('Erreur suppression:', err);
      const errorMsg = err.response?.data?.message || err.response?.data || err.message;
      alert('❌ Erreur: ' + errorMsg);
    }
  };

  const handleGenerateAI = async (prompt) => {
    try {
      console.log('Generating AI challenge with prompt:', prompt);
      const result = await adminApi.generateAIChallenge(prompt);
      
      setShowAIModal(false);
      alert('✅ Challenge généré avec IA!');
      await loadChallenges();
    } catch (err) {
      console.error('Erreur génération IA:', err);
      const errorMsg = err.response?.data?.message || err.response?.data || err.message;
      alert('❌ Erreur génération: ' + errorMsg);
    }
  };

  const handleGenerateBatch = async (count) => {
    try {
      console.log('Generating batch of', count, 'challenges');
      const result = await adminApi.generateAIChallengesBatch(count);
      
      setShowBatchModal(false);
      alert(`✅ ${count} challenges générés avec IA!`);
      await loadChallenges();
    } catch (err) {
      console.error('Erreur génération batch:', err);
      const errorMsg = err.response?.data?.message || err.response?.data || err.message;
      alert('❌ Erreur génération: ' + errorMsg);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Trophy className="h-12 w-12 text-emerald-500 animate-pulse" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <AlertCircle className="h-8 w-8 text-red-500" />
          <div>
            <h3 className="text-lg font-bold text-red-700">Erreur de chargement</h3>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        </div>
        <button
          onClick={loadChallenges}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">🏆 Gestion des Challenges</h2>
          <p className="text-gray-600 mt-1">{challenges.length} challenges</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowAIModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            <Sparkles className="h-5 w-5" />
            Générer 1 avec IA
          </button>
          <button
            onClick={() => setShowBatchModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            <Sparkles className="h-5 w-5" />
            Générer Batch
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
          >
            <Plus className="h-5 w-5" />
            Nouveau Challenge
          </button>
        </div>
      </div>

      {/* Liste des challenges */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {challenges.map((challenge) => (
          <div key={challenge.id} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="font-bold text-lg text-gray-800 mb-2">{challenge.title || challenge.titre}</h3>
                <p className="text-sm text-gray-600 line-clamp-2">{challenge.description}</p>
              </div>
              {challenge.isFeatured && (
                <Star className="h-5 w-5 text-yellow-500 fill-yellow-500 flex-shrink-0 ml-2" />
              )}
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm">
                <Target className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">{CHALLENGE_TYPES[challenge.type] || challenge.type}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${DIFFICULTY_LEVELS[challenge.difficulty]?.color || 'bg-gray-100 text-gray-700'}`}>
                  {DIFFICULTY_LEVELS[challenge.difficulty]?.label || challenge.difficulty}
                </span>
                <span className="text-sm text-emerald-600 font-bold">
                  +{challenge.points} pts
                </span>
              </div>
              {challenge.startDate && (
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Calendar className="h-3 w-3" />
                  {new Date(challenge.startDate).toLocaleDateString()}
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-4 border-t border-gray-200">
              <button
                onClick={() => {
                  setSelectedChallenge(challenge);
                  setShowEditModal(true);
                }}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-emerald-50 text-emerald-600 rounded hover:bg-emerald-100"
              >
                <Edit2 className="h-4 w-4" />
                Modifier
              </button>
              <button
                onClick={() => handleDeleteChallenge(challenge.id)}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-50 text-red-600 rounded hover:bg-red-100"
              >
                <Trash2 className="h-4 w-4" />
                Supprimer
              </button>
            </div>
          </div>
        ))}

        {challenges.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-500">
            Aucun challenge disponible
          </div>
        )}
      </div>

      {/* Modals */}
      {showCreateModal && (
        <ChallengeFormModal
          title="Créer un Challenge"
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateChallenge}
        />
      )}

      {showEditModal && selectedChallenge && (
        <ChallengeFormModal
          title="Modifier le Challenge"
          challenge={selectedChallenge}
          onClose={() => {
            setShowEditModal(false);
            setSelectedChallenge(null);
          }}
          onSubmit={handleUpdateChallenge}
          isEdit
        />
      )}

      {showAIModal && (
        <AIGenerateModal
          onClose={() => setShowAIModal(false)}
          onGenerate={handleGenerateAI}
        />
      )}

      {showBatchModal && (
        <BatchGenerateModal
          onClose={() => setShowBatchModal(false)}
          onGenerate={handleGenerateBatch}
        />
      )}
    </div>
  );
};

// MODAL DE FORMULAIRE CHALLENGE
const ChallengeFormModal = ({ title, challenge = null, onClose, onSubmit, isEdit = false }) => {
  const [formData, setFormData] = useState({
    titre: challenge?.title || challenge?.titre || '',
    description: challenge?.description || '',
    type: challenge?.type || 'Recycling',
    difficulte: challenge?.difficulty || challenge?.difficulte || 'Easy',
    pointsRecompense: challenge?.points || challenge?.pointsRecompense || 50,
    dateDebut: challenge?.startDate ? new Date(challenge.startDate).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16),
    objectif: challenge?.tips || challenge?.objectif || '',
    imageUrl: challenge?.imageUrl || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.titre || !formData.description) {
      alert('⚠️ Veuillez remplir tous les champs obligatoires');
      return;
    }

    const dataToSend = {
      ...formData,
      pointsRecompense: parseInt(formData.pointsRecompense),
      dateDebut: new Date(formData.dateDebut).toISOString()
    };

    console.log('Submitting challenge data:', dataToSend);
    onSubmit(dataToSend);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-800">{title}</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Titre <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.titre}
                onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                >
                  {Object.entries(CHALLENGE_TYPES).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Difficulté</label>
                <select
                  value={formData.difficulte}
                  onChange={(e) => setFormData({ ...formData, difficulte: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                >
                  {Object.entries(DIFFICULTY_LEVELS).map(([value, { label }]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Points de récompense</label>
              <input
                type="number"
                value={formData.pointsRecompense}
                onChange={(e) => setFormData({ ...formData, pointsRecompense: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date de début</label>
              <input
                type="datetime-local"
                value={formData.dateDebut}
                onChange={(e) => setFormData({ ...formData, dateDebut: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Objectif / Conseils</label>
              <input
                type="text"
                value={formData.objectif}
                onChange={(e) => setFormData({ ...formData, objectif: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                placeholder="Ex: Collecter 50kg de déchets"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">URL de l'image</label>
              <input
                type="url"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                placeholder="https://..."
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
              >
                <Save className="h-4 w-4" />
                {isEdit ? 'Enregistrer' : 'Créer'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// MODAL GÉNÉRATION IA (1 challenge)
const AIGenerateModal = ({ onClose, onGenerate }) => {
  const [prompt, setPrompt] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!prompt.trim()) {
      alert('⚠️ Veuillez entrer un prompt');
      return;
    }
    onGenerate(prompt);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-lg w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-800">🤖 Générer avec IA</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Décrivez le challenge que vous souhaitez
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows="4"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              placeholder="Ex: Un challenge pour encourager le compostage à la maison"
              required
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              <Sparkles className="h-4 w-4" />
              Générer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// MODAL GÉNÉRATION BATCH
const BatchGenerateModal = ({ onClose, onGenerate }) => {
  const [count, setCount] = useState(3);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (count < 1 || count > 10) {
      alert('⚠️ Veuillez choisir entre 1 et 10 challenges');
      return;
    }
    onGenerate(count);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-800">🚀 Générer en lot</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre de challenges à générer (1-10)
            </label>
            <input
              type="number"
              value={count}
              onChange={(e) => setCount(parseInt(e.target.value) || 1)}
              min="1"
              max="10"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-700">
              ℹ️ L'IA générera {count} challenge{count > 1 ? 's' : ''} diversifié{count > 1 ? 's' : ''} automatiquement
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              <Sparkles className="h-4 w-4" />
              Générer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminChallengesManagement;