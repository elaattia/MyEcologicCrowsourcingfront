import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Plus, 
  Award,
  Target,
  Star,
  X,
  Save,
  EyeOff,
  AlertCircle
} from 'lucide-react';
import adminApi from '../../services/api/adminApi';

// ENUMS STRING du backend C#
const ACHIEVEMENT_LEVELS = {
  'Bronze': { label: 'Bronze', color: 'bg-orange-100 text-orange-700', icon: '🥉' },
  'Silver': { label: 'Silver', color: 'bg-gray-100 text-gray-700', icon: '🥈' },
  'Gold': { label: 'Gold', color: 'bg-yellow-100 text-yellow-700', icon: '🥇' },
  'Platinum': { label: 'Platinum', color: 'bg-purple-100 text-purple-700', icon: '💎' }
};

const AdminAchievementsManagement = () => {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadAchievements();
  }, []);

  const loadAchievements = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Loading achievements...');
      const data = await adminApi.getAchievements();
      console.log('Achievements loaded:', data);
      setAchievements(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Erreur chargement achievements:', err);
      setError('Erreur lors du chargement des achievements: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAchievement = async (achievementData) => {
    try {
      console.log('Creating achievement with data:', achievementData);
      await adminApi.createAchievement(achievementData);
      alert('✅ Achievement créé avec succès');
      setShowCreateModal(false);
      await loadAchievements();
    } catch (err) {
      console.error('Erreur création achievement:', err);
      const errorMsg = err.response?.data?.message || err.response?.data || err.message;
      alert('❌ Erreur création: ' + errorMsg);
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
          onClick={loadAchievements}
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
          <h2 className="text-2xl font-bold text-gray-800">🏅 Gestion des Achievements</h2>
          <p className="text-gray-600 mt-1">{achievements.length} achievements</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
        >
          <Plus className="h-5 w-5" />
          Nouvel Achievement
        </button>
      </div>

      {/* Liste des achievements */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {achievements.map((achievement) => (
          <div key={achievement.id} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="text-4xl">{achievement.icone || '🏆'}</div>
                <div>
                  <h3 className="font-bold text-lg text-gray-800">{achievement.titre}</h3>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${ACHIEVEMENT_LEVELS[achievement.niveau]?.color || 'bg-gray-100 text-gray-700'}`}>
                    {ACHIEVEMENT_LEVELS[achievement.niveau]?.icon} {ACHIEVEMENT_LEVELS[achievement.niveau]?.label || achievement.niveau}
                  </span>
                </div>
              </div>
              {achievement.estCache && (
                <EyeOff className="h-5 w-5 text-gray-400" title="Achievement caché" />
              )}
            </div>

            <p className="text-sm text-gray-600 mb-4">{achievement.description}</p>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Target className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600 font-mono text-xs">{achievement.condition}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Star className="h-4 w-4 text-yellow-500" />
                <span className="text-emerald-600 font-bold">+{achievement.pointsRecompense} points</span>
              </div>
            </div>
          </div>
        ))}

        {achievements.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-500">
            Aucun achievement disponible
          </div>
        )}
      </div>

      {/* Modal Création */}
      {showCreateModal && (
        <AchievementFormModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateAchievement}
        />
      )}
    </div>
  );
};

// Modal de formulaire achievement
const AchievementFormModal = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    titre: '',
    description: '',
    icone: '🏆',
    condition: '',
    pointsRecompense: 100,
    niveau: 'Bronze',
    estCache: false
  });

  const conditionExamples = [
    'challenges_completed:10',
    'points_earned:1000',
    'waste_reported:50',
    'consecutive_days:7',
    'submissions_approved:5',
    'forum_posts:20'
  ];

  const popularIcons = ['🏆', '🥇', '🥈', '🥉', '⭐', '🌟', '💎', '👑', '🎖️', '🏅', '🎯', '🚀', '🌱', '♻️', '🌍'];

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.titre || !formData.description || !formData.condition) {
      alert('⚠️ Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (!formData.condition.includes(':')) {
      alert('⚠️ La condition doit être au format: type:valeur (ex: challenges_completed:10)');
      return;
    }

    const dataToSend = {
      ...formData,
      pointsRecompense: parseInt(formData.pointsRecompense)
    };
    const handleCheckAll = async () => {
        if (!confirm('Vérifier les achievements pour tous les utilisateurs?')) return;
        
        try {
            // Appeler l'endpoint qui vérifie tous les users
            await adminApi.checkAllAchievements();
            alert('✅ Vérification lancée pour tous les utilisateurs!');
        } catch (error) {
            alert('Erreur: ' + error.message);
        }
    };

    console.log('Submitting achievement data:', dataToSend);
    onSubmit(dataToSend);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-800">🏅 Créer un Achievement</h3>
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
                placeholder="Ex: Premier Pas Écologique"
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
                placeholder="Décrivez comment obtenir cet achievement..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Icône
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {popularIcons.map(icon => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => setFormData({ ...formData, icone: icon })}
                    className={`text-2xl p-2 rounded hover:bg-gray-100 transition-colors ${
                      formData.icone === icon ? 'bg-emerald-100 ring-2 ring-emerald-500' : ''
                    }`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
              <input
                type="text"
                value={formData.icone}
                onChange={(e) => setFormData({ ...formData, icone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                placeholder="Ou entrez votre propre emoji..."
                maxLength="4"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Condition <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.condition}
                onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 font-mono text-sm"
                placeholder="type:valeur (ex: challenges_completed:10)"
                required
              />
              <div className="mt-2">
                <p className="text-xs text-gray-500 mb-1">Exemples de conditions :</p>
                <div className="flex flex-wrap gap-1">
                  {conditionExamples.map(example => (
                    <button
                      key={example}
                      type="button"
                      onClick={() => setFormData({ ...formData, condition: example })}
                      className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors font-mono"
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Points de récompense
                </label>
                <input
                  type="number"
                  value={formData.pointsRecompense}
                  onChange={(e) => setFormData({ ...formData, pointsRecompense: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Niveau
                </label>
                <select
                  value={formData.niveau}
                  onChange={(e) => setFormData({ ...formData, niveau: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                >
                  {Object.entries(ACHIEVEMENT_LEVELS).map(([value, { label, icon }]) => (
                    <option key={value} value={value}>
                      {icon} {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="estCache"
                checked={formData.estCache}
                onChange={(e) => setFormData({ ...formData, estCache: e.target.checked })}
                className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
              />
              <label htmlFor="estCache" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <EyeOff className="h-4 w-4" />
                Achievement caché (surprise pour l'utilisateur)
              </label>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-bold text-blue-800 mb-2">ℹ️ Format des conditions</h4>
              <ul className="text-xs text-blue-700 space-y-1">
                <li><code className="bg-blue-100 px-1 rounded">challenges_completed:X</code> - X challenges complétés</li>
                <li><code className="bg-blue-100 px-1 rounded">points_earned:X</code> - X points gagnés au total</li>
                <li><code className="bg-blue-100 px-1 rounded">waste_reported:X</code> - X déchets signalés</li>
                <li><code className="bg-blue-100 px-1 rounded">consecutive_days:X</code> - X jours consécutifs d'activité</li>
                <li><code className="bg-blue-100 px-1 rounded">submissions_approved:X</code> - X soumissions approuvées</li>
              </ul>
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
                Créer
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminAchievementsManagement;