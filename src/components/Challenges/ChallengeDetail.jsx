// src/components/Challenges/ChallengeDetail.jsx
import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Award, Calendar, Users, TrendingUp, MapPin,
  CheckCircle, Clock, Target, Loader, AlertCircle, Share2, ThumbsUp, ThumbsDown
} from 'lucide-react';
import { challengeApi } from '../../services/api/challengeApi';
import api from '../../services/api/axiosConfig';
import SubmitProof from './SubmitProof';

const ChallengeDetail = ({ challengeId, onBack, user }) => {
  const [challenge, setChallenge] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showSubmitProof, setShowSubmitProof] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  const [votingLoading, setVotingLoading] = useState({});

  useEffect(() => {
    fetchChallengeData();
  }, [challengeId]);

  const fetchChallengeData = async () => {
    setLoading(true);
    setError('');
    
    try {
      const [challengeData, submissionsData] = await Promise.all([
        challengeApi.getChallengeById(challengeId),
        challengeApi.getChallengeSubmissions(challengeId, 1, 20)
      ]);

      setChallenge(challengeData);
      setSubmissions(submissionsData || []);
    } catch (err) {
      console.error('Erreur chargement challenge:', err);
      setError(err.message || 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinChallenge = async () => {
    try {
      await challengeApi.joinChallenge(challengeId);
      alert('Vous avez rejoint le défi avec succès !');
      await fetchChallengeData();
    } catch (err) {
      console.error('Erreur rejoindre challenge:', err);
      alert(err.message || 'Erreur lors de l\'inscription');
    }
  };

  const handleLeaveChallenge = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir quitter ce défi ?')) {
      return;
    }

    try {
      await challengeApi.leaveChallenge(challengeId);
      alert('Vous avez quitté le défi');
      await fetchChallengeData();
    } catch (err) {
      console.error('Erreur quitter challenge:', err);
      alert(err.message || 'Erreur');
    }
  };

  const handleVote = async (submissionId, isValid) => {
    setVotingLoading(prev => ({ ...prev, [submissionId]: true }));
    
    try {
      // ✅ Envoyer le booléen directement
      await api.post(`/api/Submissions/${submissionId}/vote`, { 
        isValid: isValid 
      });
      
      alert(isValid ? '👍 Vote enregistré!' : '👎 Vote enregistré!');
      await fetchChallengeData();
    } catch (error) {
      console.error('Erreur vote:', error);
      alert('Erreur: ' + (error.response?.data?.message || error.message));
    } finally {
      setVotingLoading(prev => ({ ...prev, [submissionId]: false }));
    }
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      'Easy': 'bg-emerald-100 text-emerald-700 border-emerald-300',
      'Medium': 'bg-amber-100 text-amber-700 border-amber-300',
      'Hard': 'bg-red-100 text-red-700 border-red-300',
      'Expert': 'bg-purple-100 text-purple-700 border-purple-300'
    };
    return colors[difficulty] || 'bg-gray-100 text-gray-700';
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

  const getStatusColor = (status) => {
    const colors = {
      'Pending': 'bg-yellow-100 text-yellow-700',
      'UnderReview': 'bg-blue-100 text-blue-700',
      'Approved': 'bg-green-100 text-green-700',
      'Rejected': 'bg-red-100 text-red-700'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader className="animate-spin text-emerald-600" size={40} />
        <p className="ml-4 text-gray-600">Chargement du défi...</p>
      </div>
    );
  }

  if (error || !challenge) {
    return (
      <div className="bg-red-50 border-2 border-red-200 text-red-700 px-6 py-4 rounded-xl flex items-center gap-3">
        <AlertCircle size={20} />
        <p>{error || 'Défi introuvable'}</p>
        <button onClick={onBack} className="ml-auto px-4 py-2 bg-red-600 text-white rounded-lg">
          Retour
        </button>
      </div>
    );
  }

  const daysRemaining = challenge.endDate 
    ? Math.ceil((new Date(challenge.endDate) - new Date()) / (1000 * 60 * 60 * 24))
    : challenge.durationDays;

  return (
    <div className="space-y-6">
      <style>{`
        .voting-buttons {
          display: flex;
          gap: 8px;
          margin-top: 12px;
        }
        .btn-vote {
          flex: 1;
          padding: 8px 12px;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 13px;
          font-weight: 600;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }
        .btn-vote:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .btn-valid {
          background: #10b981;
          color: white;
        }
        .btn-valid:hover:not(:disabled) {
          background: #059669;
          transform: translateY(-1px);
          box-shadow: 0 4px 6px rgba(16, 185, 129, 0.3);
        }
        .btn-invalid {
          background: #ef4444;
          color: white;
        }
        .btn-invalid:hover:not(:disabled) {
          background: #dc2626;
          transform: translateY(-1px);
          box-shadow: 0 4px 6px rgba(239, 68, 68, 0.3);
        }
        .submission-card {
          background: #f9fafb;
          border-radius: 16px;
          overflow: hidden;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .submission-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
        }
      `}</style>

      {/* Bouton retour */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition"
      >
        <ArrowLeft size={20} />
        Retour aux défis
      </button>

      {/* En-tête avec image */}
      <div className="relative">
        {challenge.imageUrl && (
          <div className="w-full h-96 rounded-3xl overflow-hidden shadow-2xl">
            <img
              src={challenge.imageUrl}
              alt={challenge.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          </div>
        )}

        {/* Badges flottants */}
        <div className="absolute top-4 left-4 flex flex-wrap gap-2">
          <span className={`px-4 py-2 rounded-xl font-bold border-2 text-sm ${getDifficultyColor(challenge.difficulty)}`}>
            {challenge.difficulty}
          </span>
          <span className="px-4 py-2 rounded-xl font-bold bg-blue-100 text-blue-700 border-2 border-blue-300 text-sm">
            {challenge.frequency}
          </span>
          {challenge.isAIGenerated && (
            <span className="px-4 py-2 rounded-xl font-bold bg-purple-100 text-purple-700 border-2 border-purple-300 text-sm">
              🤖 Généré par IA
            </span>
          )}
          {challenge.isFeatured && (
            <span className="px-4 py-2 rounded-xl font-bold bg-amber-100 text-amber-700 border-2 border-amber-300 text-sm">
              ⭐ En vedette
            </span>
          )}
        </div>
      </div>

      {/* Titre et actions */}
      <div className="bg-white rounded-3xl shadow-xl p-8">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-start gap-4">
            <div className="text-6xl">{getTypeIcon(challenge.type)}</div>
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2">
                {challenge.title}
              </h1>
              <p className="text-gray-600 text-lg">
                {challenge.description}
              </p>
            </div>
          </div>

          <button className="p-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition">
            <Share2 size={20} />
          </button>
        </div>

        {/* Stats principales */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="text-center p-6 bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl">
            <div className="text-3xl font-bold text-amber-600 mb-2">
              {challenge.points}
            </div>
            <p className="text-sm text-gray-600">Points de base</p>
          </div>

          <div className="text-center p-6 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl">
            <div className="text-3xl font-bold text-emerald-600 mb-2">
              +{challenge.bonusPoints}
            </div>
            <p className="text-sm text-gray-600">Points bonus</p>
          </div>

          <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {challenge.currentParticipants}
            </div>
            <p className="text-sm text-gray-600">Participants</p>
          </div>

          <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {daysRemaining}
            </div>
            <p className="text-sm text-gray-600">Jours restants</p>
          </div>
        </div>

        {/* Actions principales */}
        <div className="flex gap-4">
          {!challenge.isUserJoined ? (
            <button
              onClick={handleJoinChallenge}
              className="flex-1 py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-2xl hover:shadow-lg transition font-bold text-lg flex items-center justify-center gap-2"
            >
              <Target size={24} />
              Rejoindre le défi
            </button>
          ) : (
            <>
              <button
                onClick={() => setShowSubmitProof(true)}
                className="flex-1 py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-2xl hover:shadow-lg transition font-bold text-lg flex items-center justify-center gap-2"
              >
                <CheckCircle size={24} />
                Soumettre une preuve
              </button>
              <button
                onClick={handleLeaveChallenge}
                className="px-6 py-4 bg-red-100 text-red-700 rounded-2xl hover:bg-red-200 transition font-bold"
              >
                Quitter
              </button>
            </>
          )}
        </div>

        {challenge.isUserCompleted && (
          <div className="mt-4 p-4 bg-amber-50 border-2 border-amber-200 rounded-xl flex items-center justify-center gap-3 text-amber-700 font-bold">
            <Award size={24} />
            Défi complété ! 🎉
          </div>
        )}
      </div>

      {/* Onglets */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('details')}
          className={`px-6 py-3 font-medium transition ${
            activeTab === 'details'
              ? 'border-b-2 border-emerald-500 text-emerald-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Détails
        </button>
        <button
          onClick={() => setActiveTab('submissions')}
          className={`px-6 py-3 font-medium transition ${
            activeTab === 'submissions'
              ? 'border-b-2 border-emerald-500 text-emerald-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Soumissions ({submissions.length})
        </button>
      </div>

      {/* Contenu des onglets */}
      {activeTab === 'details' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Détails principaux */}
          <div className="lg:col-span-2 space-y-6">
            {/* Informations */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">📋 Informations</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-gray-700">
                  <Calendar size={20} className="text-emerald-600" />
                  <div>
                    <p className="font-medium">Dates</p>
                    <p className="text-sm text-gray-600">
                      Du {new Date(challenge.startDate).toLocaleDateString()} au{' '}
                      {challenge.endDate 
                        ? new Date(challenge.endDate).toLocaleDateString()
                        : `${challenge.durationDays} jours`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-gray-700">
                  <CheckCircle size={20} className="text-emerald-600" />
                  <div>
                    <p className="font-medium">Type de preuve requis</p>
                    <p className="text-sm text-gray-600">{challenge.requiredProofType}</p>
                  </div>
                </div>

                {challenge.maxParticipants && (
                  <div className="flex items-center gap-3 text-gray-700">
                    <Users size={20} className="text-emerald-600" />
                    <div>
                      <p className="font-medium">Places limitées</p>
                      <p className="text-sm text-gray-600">
                        {challenge.currentParticipants} / {challenge.maxParticipants} participants
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Conseils */}
            {challenge.tips && (
              <div className="bg-blue-50 rounded-2xl border-2 border-blue-200 p-6">
                <h3 className="text-xl font-bold text-blue-900 mb-3 flex items-center gap-2">
                  💡 Conseils
                </h3>
                <p className="text-blue-800 whitespace-pre-wrap">{challenge.tips}</p>
              </div>
            )}

            {/* Critères de vérification */}
            {challenge.verificationCriteria && (
              <div className="bg-purple-50 rounded-2xl border-2 border-purple-200 p-6">
                <h3 className="text-xl font-bold text-purple-900 mb-3">
                  ✓ Critères de vérification
                </h3>
                <p className="text-purple-800 whitespace-pre-wrap">
                  {challenge.verificationCriteria}
                </p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Tags */}
            {challenge.tags && challenge.tags.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="font-bold text-gray-800 mb-3">🏷️ Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {challenge.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Statistiques utilisateur */}
            {challenge.isUserJoined && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="font-bold text-gray-800 mb-4">📊 Vos statistiques</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Soumissions</span>
                    <span className="font-bold text-gray-800">
                      {challenge.userSubmissionCount}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Statut</span>
                    <span className={`px-3 py-1 rounded-lg font-bold ${
                      challenge.isUserCompleted 
                        ? 'bg-emerald-100 text-emerald-700' 
                        : 'bg-amber-100 text-amber-700'
                    }`}>
                      {challenge.isUserCompleted ? 'Complété' : 'En cours'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'submissions' && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-6">
            Soumissions de la communauté
          </h3>

          {submissions.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <CheckCircle size={48} className="mx-auto mb-4 text-gray-400" />
              <p>Aucune soumission pour le moment. Soyez le premier !</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {submissions.map((submission) => (
                <div key={submission.id} className="submission-card">
                  {submission.thumbnailUrl || submission.proofUrl ? (
                    <img
                      src={submission.thumbnailUrl || submission.proofUrl}
                      alt="Proof"
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-white text-6xl">
                      📸
                    </div>
                  )}

                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-white font-bold text-sm">
                        {submission.username.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-gray-800">
                        {submission.username}
                      </span>
                    </div>

                    {submission.description && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {submission.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between mb-3">
                      <span className={`px-3 py-1 rounded-lg text-xs font-bold ${getStatusColor(submission.status)}`}>
                        {submission.status}
                      </span>

                      {submission.pointsAwarded > 0 && (
                        <span className="text-amber-600 font-bold flex items-center gap-1">
                          <Award size={14} />
                          {submission.pointsAwarded} pts
                        </span>
                      )}
                    </div>

                    {/* Boutons de vote */}
                    <div className="voting-buttons">
                      <button 
                        onClick={() => handleVote(submission.id, true)}
                        disabled={votingLoading[submission.id]}
                        className="btn-vote btn-valid"
                      >
                        {votingLoading[submission.id] ? (
                          <Loader size={14} className="animate-spin" />
                        ) : (
                          <>
                            <ThumbsUp size={14} />
                            Valide ({submission.validVotes || 0})
                          </>
                        )}
                      </button>
                      <button 
                        onClick={() => handleVote(submission.id, false)}
                        disabled={votingLoading[submission.id]}
                        className="btn-vote btn-invalid"
                      >
                        {votingLoading[submission.id] ? (
                          <Loader size={14} className="animate-spin" />
                        ) : (
                          <>
                            <ThumbsDown size={14} />
                            Invalide ({submission.invalidVotes || 0})
                          </>
                        )}
                      </button>
                    </div>

                    <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                      <span className="ml-auto">
                        {new Date(submission.submittedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal de soumission de preuve */}
      {showSubmitProof && (
        <SubmitProof
          challenge={challenge}
          onClose={() => setShowSubmitProof(false)}
          onSuccess={() => {
            setShowSubmitProof(false);
            fetchChallengeData();
          }}
        />
      )}
    </div>
  );
};

export default ChallengeDetail;