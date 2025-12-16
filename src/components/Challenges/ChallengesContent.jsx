// src/components/Challenges/ChallengesContent.jsx - NAVIGATION CORRIGÉE
import React, { useState, useEffect } from 'react';
import { Award, TrendingUp, Calendar, Users, Loader, AlertCircle, CheckCircle, Trophy, ArrowLeft } from 'lucide-react';
import { challengeApi } from '../../services/api/challengeApi';
import ChallengeDetail from './ChallengeDetail';
import Leaderboard from './Leaderboard';
import AchievementBadge from './AchievementBadge';

const ChallengesContent = ({ user }) => {
  const [challenges, setChallenges] = useState([]);
  const [myActiveChallenges, setMyActiveChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'active' | 'completed' | 'leaderboard' | 'achievements'
  const [selectedChallenge, setSelectedChallenge] = useState(null);

  useEffect(() => {
    // Ne charger que si on n'est pas dans leaderboard ou achievements
    if (activeTab !== 'leaderboard' && activeTab !== 'achievements') {
      fetchChallenges();
    } else {
      setLoading(false);
    }
  }, [activeTab]);

  const fetchChallenges = async () => {
    setLoading(true);
    setError('');
    
    try {
      if (activeTab === 'all') {
        const data = await challengeApi.getActiveChallenges();
        setChallenges(data || []);
      } else if (activeTab === 'active') {
        const data = await challengeApi.getMyActiveChallenges();
        setMyActiveChallenges(data || []);
      } else if (activeTab === 'completed') {
        const data = await challengeApi.getMyCompletedChallenges();
        setMyActiveChallenges(data || []);
      }
    } catch (err) {
      console.error('Erreur chargement challenges:', err);
      setError(err.message || 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinChallenge = async (challengeId) => {
    try {
      await challengeApi.joinChallenge(challengeId);
      alert('Vous avez rejoint le défi avec succès !');
      fetchChallenges();
    } catch (err) {
      console.error('Erreur rejoindre challenge:', err);
      alert(err.message || 'Erreur lors de l\'inscription au défi');
    }
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      'Easy': 'bg-emerald-100 text-emerald-700 border-emerald-300',
      'Medium': 'bg-amber-100 text-amber-700 border-amber-300',
      'Hard': 'bg-red-100 text-red-700 border-red-300',
      'Expert': 'bg-purple-100 text-purple-700 border-purple-300'
    };
    return colors[difficulty] || 'bg-gray-100 text-gray-700 border-gray-300';
  };

  const getTypeIcon = (type) => {
    const icons = {
      'Recycling': '♻️',
      'LitterPickup': '🗑️',
      'Planting': '🌱',
      'PlantIdentification': '🔍',
      'WasteReduction': '📉',
      'EnergyConservation': '⚡',
      'WaterConservation': '💧',
      'Composting': '🌿',
      'SustainableTransport': '🚲',
      'Education': '📚'
    };
    return icons[type] || '🎯';
  };

  // CORRECTION: Gérer le retour depuis les détails d'un challenge
  const handleBackFromDetail = () => {
    setSelectedChallenge(null);
  };

  // CORRECTION: Gérer le changement d'onglet
  const handleTabChange = (newTab) => {
    setSelectedChallenge(null); // Réinitialiser la sélection
    setActiveTab(newTab);
  };

  // Si un challenge est sélectionné, afficher ses détails
  if (selectedChallenge) {
    return (
      <ChallengeDetail
        challengeId={selectedChallenge}
        onBack={handleBackFromDetail}
        user={user}
      />
    );
  }

  // Afficher le leaderboard
  if (activeTab === 'leaderboard') {
    return (
      <div className="space-y-6">
        {/* Bouton retour */}
        <button
          onClick={() => handleTabChange('all')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition"
        >
          <ArrowLeft size={20} />
          Retour aux défis
        </button>
        
        <Leaderboard user={user} />
      </div>
    );
  }

  // Afficher les achievements
  if (activeTab === 'achievements') {
    return (
      <div className="space-y-6">
        {/* Bouton retour */}
        <button
          onClick={() => handleTabChange('all')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition"
        >
          <ArrowLeft size={20} />
          Retour aux défis
        </button>
        
        <AchievementBadge user={user} />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader className="animate-spin text-emerald-600" size={40} />
        <p className="ml-4 text-gray-600">Chargement des défis...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <Award size={32} className="text-amber-600" />
          Défis écologiques
        </h2>
      </div>

      {error && (
        <div className="bg-red-50 border-2 border-red-200 text-red-700 px-6 py-4 rounded-xl flex items-center gap-3">
          <AlertCircle size={20} />
          <p>{error}</p>
        </div>
      )}

      {/* Onglets */}
      <div className="flex gap-2 border-b border-gray-200 overflow-x-auto">
        <button
          onClick={() => handleTabChange('all')}
          className={`px-6 py-3 font-medium transition whitespace-nowrap ${
            activeTab === 'all'
              ? 'border-b-2 border-emerald-500 text-emerald-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Tous les défis
        </button>
        <button
          onClick={() => handleTabChange('active')}
          className={`px-6 py-3 font-medium transition whitespace-nowrap ${
            activeTab === 'active'
              ? 'border-b-2 border-emerald-500 text-emerald-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Mes défis actifs
        </button>
        <button
          onClick={() => handleTabChange('completed')}
          className={`px-6 py-3 font-medium transition whitespace-nowrap ${
            activeTab === 'completed'
              ? 'border-b-2 border-emerald-500 text-emerald-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Défis complétés
        </button>
        <button
          onClick={() => handleTabChange('leaderboard')}
          className={`px-6 py-3 font-medium transition whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'leaderboard'
              ? 'border-b-2 border-emerald-500 text-emerald-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <Trophy size={18} />
          Classement
        </button>
        <button
          onClick={() => handleTabChange('achievements')}
          className={`px-6 py-3 font-medium transition whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'achievements'
              ? 'border-b-2 border-emerald-500 text-emerald-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <Award size={18} />
          Succès
        </button>
      </div>

      {/* Liste des challenges */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(activeTab === 'all' ? challenges : myActiveChallenges).map((challenge) => (
          <div
            key={challenge.id}
            onClick={() => setSelectedChallenge(challenge.id)}
            className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition cursor-pointer transform hover:scale-105"
          >
            {/* Image */}
            {challenge.imageUrl && (
              <img
                src={challenge.imageUrl}
                alt={challenge.title}
                className="w-full h-48 object-cover"
              />
            )}

            <div className="p-6">
              {/* En-tête */}
              <div className="flex items-start gap-3 mb-4">
                <div className="text-4xl">{getTypeIcon(challenge.type)}</div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-800 text-lg mb-2">
                    {challenge.title}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    <span className={`px-3 py-1 rounded-lg text-xs font-bold border ${getDifficultyColor(challenge.difficulty)}`}>
                      {challenge.difficulty}
                    </span>
                    <span className="px-3 py-1 rounded-lg text-xs font-bold bg-blue-100 text-blue-700 border border-blue-300">
                      {challenge.frequency}
                    </span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                {challenge.description}
              </p>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center p-3 bg-amber-50 rounded-lg">
                  <div className="text-2xl font-bold text-amber-600">
                    {challenge.points}
                  </div>
                  <p className="text-xs text-gray-600">Points</p>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {challenge.currentParticipants}
                  </div>
                  <p className="text-xs text-gray-600">Participants</p>
                </div>
              </div>

              {/* Dates */}
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                <Calendar size={14} />
                <span>
                  {new Date(challenge.startDate).toLocaleDateString()} - {' '}
                  {challenge.endDate 
                    ? new Date(challenge.endDate).toLocaleDateString()
                    : `${challenge.durationDays} jours`
                  }
                </span>
              </div>

              {/* Action */}
              {activeTab === 'all' && !challenge.isUserJoined && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleJoinChallenge(challenge.id);
                  }}
                  className="w-full py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-xl hover:shadow-lg transition font-bold"
                >
                  Rejoindre le défi
                </button>
              )}

              {challenge.isUserJoined && (
                <div className="flex items-center justify-center gap-2 text-emerald-600 font-bold">
                  <CheckCircle size={20} />
                  <span>Déjà inscrit</span>
                </div>
              )}

              {challenge.isUserCompleted && (
                <div className="flex items-center justify-center gap-2 text-amber-600 font-bold">
                  <Award size={20} />
                  <span>Complété !</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {(activeTab === 'all' ? challenges : myActiveChallenges).length === 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
          <Award size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 text-lg">
            {activeTab === 'all' 
              ? 'Aucun défi disponible pour le moment'
              : activeTab === 'active'
              ? 'Vous n\'avez pas encore rejoint de défi'
              : 'Vous n\'avez pas encore complété de défi'
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default ChallengesContent;