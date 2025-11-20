// src/components/Challenges/AchievementBadge.jsx
import React, { useState, useEffect } from 'react';
import { Award, Lock, Trophy, Star, Zap, Target, Flame, Loader, AlertCircle } from 'lucide-react';
import { challengeApi } from '../../services/api/challengeApi';

const AchievementBadge = ({ user }) => {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // 'all' | 'unlocked' | 'locked'
  const [selectedAchievement, setSelectedAchievement] = useState(null);

  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    setLoading(true);
    setError('');
    
    try {
      const data = await challengeApi.getMyAchievements();
      setAchievements(data || []);
    } catch (err) {
      console.error('Erreur chargement achievements:', err);
      setError(err.message || 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  const getIconComponent = (iconName) => {
    const icons = {
      'trophy': Trophy,
      'star': Star,
      'zap': Zap,
      'target': Target,
      'flame': Flame,
      'award': Award
    };
    return icons[iconName?.toLowerCase()] || Award;
  };

  const filteredAchievements = achievements.filter(achievement => {
    if (filter === 'unlocked') return achievement.isUnlocked;
    if (filter === 'locked') return !achievement.isUnlocked;
    return true;
  });

  const unlockedCount = achievements.filter(a => a.isUnlocked).length;
  const totalCount = achievements.length;
  const progressPercentage = totalCount > 0 ? (unlockedCount / totalCount) * 100 : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader className="animate-spin text-emerald-600" size={40} />
        <p className="ml-4 text-gray-600">Chargement des succès...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <Award size={32} className="text-amber-500" />
          Succès
        </h2>
      </div>

      {error && (
        <div className="bg-red-50 border-2 border-red-200 text-red-700 px-6 py-4 rounded-xl flex items-center gap-3">
          <AlertCircle size={20} />
          <p>{error}</p>
        </div>
      )}

      {/* Progression globale */}
      <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl shadow-2xl p-8 text-white">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold mb-2">Vos succès</h3>
            <p className="text-purple-100">
              {unlockedCount} sur {totalCount} débloqués
            </p>
          </div>
          <div className="text-6xl">🏆</div>
        </div>

        {/* Barre de progression */}
        <div className="relative">
          <div className="w-full h-6 bg-white/20 rounded-full overflow-hidden backdrop-blur-lg">
            <div
              className="h-full bg-gradient-to-r from-amber-400 to-amber-600 transition-all duration-500 rounded-full flex items-center justify-end pr-2"
              style={{ width: `${progressPercentage}%` }}
            >
              {progressPercentage > 10 && (
                <span className="text-white text-xs font-bold">
                  {Math.round(progressPercentage)}%
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex gap-2 bg-white rounded-2xl shadow-lg p-2">
        <button
          onClick={() => setFilter('all')}
          className={`flex-1 px-6 py-3 rounded-xl font-medium transition ${
            filter === 'all'
              ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-lg'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Tous ({totalCount})
        </button>
        <button
          onClick={() => setFilter('unlocked')}
          className={`flex-1 px-6 py-3 rounded-xl font-medium transition ${
            filter === 'unlocked'
              ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-lg'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Débloqués ({unlockedCount})
        </button>
        <button
          onClick={() => setFilter('locked')}
          className={`flex-1 px-6 py-3 rounded-xl font-medium transition ${
            filter === 'locked'
              ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-lg'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Verrouillés ({totalCount - unlockedCount})
        </button>
      </div>

      {/* Grille des succès */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredAchievements.length === 0 ? (
          <div className="col-span-full bg-white rounded-2xl shadow-lg p-12 text-center">
            <Award size={48} className="mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600">
              {filter === 'unlocked' 
                ? 'Aucun succès débloqué pour le moment'
                : filter === 'locked'
                ? 'Tous les succès sont débloqués !'
                : 'Aucun succès disponible'
              }
            </p>
          </div>
        ) : (
          filteredAchievements.map((achievement) => {
            const IconComponent = getIconComponent(achievement.icon);
            const isLocked = !achievement.isUnlocked;

            return (
              <div
                key={achievement.id}
                onClick={() => setSelectedAchievement(achievement)}
                className={`bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition transform hover:scale-105 ${
                  isLocked ? 'opacity-60' : ''
                }`}
              >
                {/* Badge icon */}
                <div className={`relative h-32 flex items-center justify-center ${
                  isLocked 
                    ? 'bg-gradient-to-br from-gray-300 to-gray-400' 
                    : 'bg-gradient-to-br from-amber-400 to-orange-500'
                }`}>
                  {isLocked ? (
                    <Lock size={48} className="text-white" />
                  ) : (
                    <IconComponent size={48} className="text-white" />
                  )}

                  {!isLocked && achievement.unlockedAt && (
                    <div className="absolute top-2 right-2 bg-white/20 backdrop-blur-lg rounded-lg px-3 py-1 text-white text-xs font-bold">
                      ✓ Débloqué
                    </div>
                  )}
                </div>

                {/* Contenu */}
                <div className="p-4">
                  <h4 className={`font-bold mb-2 ${
                    isLocked ? 'text-gray-600' : 'text-gray-800'
                  }`}>
                    {isLocked ? '???' : achievement.name}
                  </h4>

                  <p className={`text-sm mb-3 line-clamp-2 ${
                    isLocked ? 'text-gray-500' : 'text-gray-600'
                  }`}>
                    {isLocked ? 'Succès mystère' : achievement.description}
                  </p>

                  {/* Exigences */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-amber-600">
                      <Award size={14} />
                      <span className="text-xs font-bold">
                        {achievement.pointsRequired} pts
                      </span>
                    </div>

                    {achievement.unlockedAt && (
                      <span className="text-xs text-gray-500">
                        {new Date(achievement.unlockedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal de détails */}
      {selectedAchievement && (
        <AchievementModal
          achievement={selectedAchievement}
          onClose={() => setSelectedAchievement(null)}
        />
      )}
    </div>
  );
};

// Modal de détails du succès
const AchievementModal = ({ achievement, onClose }) => {
  const IconComponent = achievement.icon ? Trophy : Award;
  const isLocked = !achievement.isUnlocked;

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* En-tête avec badge */}
        <div className={`relative h-48 flex items-center justify-center ${
          isLocked 
            ? 'bg-gradient-to-br from-gray-400 to-gray-500' 
            : 'bg-gradient-to-br from-amber-400 to-orange-500'
        }`}>
          {isLocked ? (
            <Lock size={80} className="text-white" />
          ) : (
            <IconComponent size={80} className="text-white" />
          )}

          {!isLocked && (
            <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-lg rounded-xl px-4 py-2 text-white font-bold flex items-center gap-2">
              <Award size={16} />
              Débloqué
            </div>
          )}
        </div>

        {/* Contenu */}
        <div className="p-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            {isLocked ? 'Succès mystère' : achievement.name}
          </h2>

          <p className="text-gray-600 mb-6">
            {isLocked 
              ? 'Continuez à relever des défis pour découvrir ce succès !' 
              : achievement.description
            }
          </p>

          {/* Critères */}
          {!isLocked && (
            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-between p-4 bg-amber-50 rounded-xl">
                <span className="text-gray-700 font-medium">Points requis</span>
                <span className="text-amber-600 font-bold flex items-center gap-1">
                  <Award size={16} />
                  {achievement.pointsRequired}
                </span>
              </div>

              {achievement.challengesRequired && (
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl">
                  <span className="text-gray-700 font-medium">Défis requis</span>
                  <span className="text-blue-600 font-bold flex items-center gap-1">
                    <Target size={16} />
                    {achievement.challengesRequired}
                  </span>
                </div>
              )}

              {achievement.specificType && (
                <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-xl">
                  <span className="text-gray-700 font-medium">Type spécifique</span>
                  <span className="text-emerald-600 font-bold">
                    {achievement.specificType}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Date de déverrouillage */}
          {achievement.unlockedAt && (
            <div className="p-4 bg-emerald-50 border-2 border-emerald-200 rounded-xl mb-6">
              <p className="text-emerald-800 text-center">
                🎉 Débloqué le{' '}
                <span className="font-bold">
                  {new Date(achievement.unlockedAt).toLocaleDateString('fr-FR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </p>
            </div>
          )}

          {/* Bouton fermer */}
          <button
            onClick={onClose}
            className="w-full py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-xl hover:shadow-lg transition font-bold"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

export default AchievementBadge;