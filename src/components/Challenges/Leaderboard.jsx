// src/components/Challenges/Leaderboard.jsx
import React, { useState, useEffect } from 'react';
import { Trophy, TrendingUp, Calendar, Award, Flame, Loader, AlertCircle, Crown, Medal } from 'lucide-react';
import { challengeApi } from '../../services/api/challengeApi';

const Leaderboard = ({ user }) => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [period, setPeriod] = useState('global'); // 'global' | 'weekly' | 'monthly'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [myStats, setMyStats] = useState(null);

  useEffect(() => {
    fetchLeaderboard();
  }, [period]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    setError('');
    
    try {
      let data;
      
      switch (period) {
        case 'weekly':
          data = await challengeApi.getWeeklyLeaderboard(100);
          break;
        case 'monthly':
          data = await challengeApi.getMonthlyLeaderboard(100);
          break;
        default:
          data = await challengeApi.getGlobalLeaderboard(100);
      }

      setLeaderboard(data || []);

      // Charger les stats personnelles si connecté
      if (user) {
        try {
          const stats = await challengeApi.getMyStats();
          setMyStats(stats);
        } catch (err) {
          console.error('Erreur stats personnelles:', err);
        }
      }
    } catch (err) {
      console.error('Erreur chargement leaderboard:', err);
      setError(err.message || 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return <Crown size={24} className="text-yellow-500" />;
    if (rank === 2) return <Medal size={24} className="text-gray-400" />;
    if (rank === 3) return <Medal size={24} className="text-amber-600" />;
    return null;
  };

  const getRankColor = (rank) => {
    if (rank === 1) return 'bg-gradient-to-r from-yellow-400 to-amber-500 text-white';
    if (rank === 2) return 'bg-gradient-to-r from-gray-300 to-gray-400 text-gray-800';
    if (rank === 3) return 'bg-gradient-to-r from-amber-500 to-orange-500 text-white';
    return 'bg-white';
  };

  const getPeriodLabel = () => {
    switch (period) {
      case 'weekly':
        return 'Cette semaine';
      case 'monthly':
        return 'Ce mois-ci';
      default:
        return 'Classement global';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader className="animate-spin text-emerald-600" size={40} />
        <p className="ml-4 text-gray-600">Chargement du classement...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <Trophy size={32} className="text-amber-500" />
          Classement
        </h2>
      </div>

      {error && (
        <div className="bg-red-50 border-2 border-red-200 text-red-700 px-6 py-4 rounded-xl flex items-center gap-3">
          <AlertCircle size={20} />
          <p>{error}</p>
        </div>
      )}

      {/* Stats personnelles */}
      {myStats && (
        <div className="bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-3xl shadow-2xl p-8 text-white">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-lg flex items-center justify-center text-2xl font-bold">
                {user?.username?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-2xl font-bold">{user?.username}</p>
                <p className="text-emerald-100">Votre classement</p>
              </div>
            </div>
            <div className="text-5xl">🏆</div>
          </div>

          <div className="grid grid-cols-4 gap-4">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 text-center">
              <div className="text-3xl font-bold mb-1">{myStats.totalPoints}</div>
              <p className="text-sm text-emerald-100">Points totaux</p>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 text-center">
              <div className="text-3xl font-bold mb-1">#{myStats.globalRank}</div>
              <p className="text-sm text-emerald-100">Rang global</p>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 text-center">
              <div className="text-3xl font-bold mb-1">{myStats.challengesCompleted}</div>
              <p className="text-sm text-emerald-100">Défis complétés</p>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 text-center">
              <div className="text-3xl font-bold mb-1 flex items-center justify-center gap-1">
                <Flame size={24} />
                {myStats.currentStreak}
              </div>
              <p className="text-sm text-emerald-100">Série actuelle</p>
            </div>
          </div>
        </div>
      )}

      {/* Sélecteur de période */}
      <div className="flex gap-2 bg-white rounded-2xl shadow-lg p-2">
        <button
          onClick={() => setPeriod('global')}
          className={`flex-1 px-6 py-3 rounded-xl font-medium transition flex items-center justify-center gap-2 ${
            period === 'global'
              ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-lg'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Trophy size={18} />
          Global
        </button>
        <button
          onClick={() => setPeriod('weekly')}
          className={`flex-1 px-6 py-3 rounded-xl font-medium transition flex items-center justify-center gap-2 ${
            period === 'weekly'
              ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-lg'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <TrendingUp size={18} />
          Semaine
        </button>
        <button
          onClick={() => setPeriod('monthly')}
          className={`flex-1 px-6 py-3 rounded-xl font-medium transition flex items-center justify-center gap-2 ${
            period === 'monthly'
              ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-lg'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Calendar size={18} />
          Mois
        </button>
      </div>

      {/* Podium (Top 3) */}
      {leaderboard.length >= 3 && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          {/* 2ème place */}
          <div className="bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl p-6 text-center transform translate-y-8">
            <div className="flex justify-center mb-3">
              <Medal size={40} className="text-gray-500" />
            </div>
            <div className="w-20 h-20 mx-auto rounded-full bg-white shadow-lg flex items-center justify-center text-2xl font-bold mb-3">
              {leaderboard[1].username.charAt(0).toUpperCase()}
            </div>
            <p className="font-bold text-gray-800 mb-1 truncate">{leaderboard[1].username}</p>
            <div className="text-3xl font-bold text-gray-700 mb-2">
              {leaderboard[1].totalPoints}
            </div>
            <p className="text-sm text-gray-600">points</p>
            <div className="mt-3 flex justify-center gap-3 text-xs text-gray-600">
              <span>🏆 {leaderboard[1].challengesCompleted}</span>
              <span>🔥 {leaderboard[1].currentStreak}</span>
            </div>
          </div>

          {/* 1ère place */}
          <div className="bg-gradient-to-br from-yellow-300 to-amber-400 rounded-2xl p-6 text-center">
            <div className="flex justify-center mb-3">
              <Crown size={48} className="text-yellow-600" />
            </div>
            <div className="w-24 h-24 mx-auto rounded-full bg-white shadow-2xl flex items-center justify-center text-3xl font-bold mb-3 border-4 border-yellow-500">
              {leaderboard[0].username.charAt(0).toUpperCase()}
            </div>
            <p className="font-bold text-gray-900 mb-1 truncate text-lg">{leaderboard[0].username}</p>
            <div className="text-4xl font-bold text-yellow-700 mb-2">
              {leaderboard[0].totalPoints}
            </div>
            <p className="text-sm text-gray-700">points</p>
            <div className="mt-3 flex justify-center gap-3 text-sm text-gray-700">
              <span>🏆 {leaderboard[0].challengesCompleted}</span>
              <span>🔥 {leaderboard[0].currentStreak}</span>
            </div>
          </div>

          {/* 3ème place */}
          <div className="bg-gradient-to-br from-amber-400 to-orange-400 rounded-2xl p-6 text-center transform translate-y-8">
            <div className="flex justify-center mb-3">
              <Medal size={40} className="text-amber-700" />
            </div>
            <div className="w-20 h-20 mx-auto rounded-full bg-white shadow-lg flex items-center justify-center text-2xl font-bold mb-3">
              {leaderboard[2].username.charAt(0).toUpperCase()}
            </div>
            <p className="font-bold text-gray-800 mb-1 truncate">{leaderboard[2].username}</p>
            <div className="text-3xl font-bold text-amber-700 mb-2">
              {leaderboard[2].totalPoints}
            </div>
            <p className="text-sm text-gray-700">points</p>
            <div className="mt-3 flex justify-center gap-3 text-xs text-gray-700">
              <span>🏆 {leaderboard[2].challengesCompleted}</span>
              <span>🔥 {leaderboard[2].currentStreak}</span>
            </div>
          </div>
        </div>
      )}

      {/* Liste complète */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-800">
            {getPeriodLabel()}
          </h3>
        </div>

        <div className="divide-y divide-gray-200">
          {leaderboard.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <Trophy size={48} className="mx-auto mb-4 text-gray-400" />
              <p>Aucun classement disponible</p>
            </div>
          ) : (
            leaderboard.map((entry, index) => {
              const isCurrentUser = user?.userId === entry.userId;
              
              return (
                <div
                  key={entry.userId}
                  className={`p-6 hover:bg-gray-50 transition ${
                    isCurrentUser ? 'bg-emerald-50 border-l-4 border-emerald-500' : ''
                  } ${index < 3 ? getRankColor(entry.rank) : ''}`}
                >
                  <div className="flex items-center gap-6">
                    {/* Rang */}
                    <div className="w-16 text-center">
                      {getRankIcon(entry.rank) || (
                        <div className={`text-2xl font-bold ${
                          index < 3 ? 'text-white' : 'text-gray-600'
                        }`}>
                          #{entry.rank}
                        </div>
                      )}
                    </div>

                    {/* Avatar et nom */}
                    <div className="flex items-center gap-4 flex-1">
                      <div className={`w-14 h-14 rounded-full ${
                        index < 3 
                          ? 'bg-white/30' 
                          : 'bg-gradient-to-br from-emerald-400 to-cyan-500'
                      } flex items-center justify-center text-white font-bold text-xl shadow-lg`}>
                        {entry.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className={`font-bold text-lg ${
                          index < 3 ? '' : 'text-gray-800'
                        }`}>
                          {entry.username}
                          {isCurrentUser && (
                            <span className="ml-2 px-2 py-1 bg-emerald-500 text-white rounded text-xs">
                              Vous
                            </span>
                          )}
                        </p>
                        <div className={`flex items-center gap-4 text-sm ${
                          index < 3 ? 'text-white/80' : 'text-gray-600'
                        }`}>
                          <span className="flex items-center gap-1">
                            <Award size={14} />
                            {entry.challengesCompleted} défis
                          </span>
                          <span className="flex items-center gap-1">
                            <Flame size={14} />
                            {entry.currentStreak} jours
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Points */}
                    <div className="text-right">
                      <div className={`text-3xl font-bold ${
                        index < 3 ? '' : 'text-emerald-600'
                      }`}>
                        {entry.totalPoints.toLocaleString()}
                      </div>
                      <p className={`text-sm ${
                        index < 3 ? 'text-white/80' : 'text-gray-600'
                      }`}>
                        points
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {leaderboard.length > 0 && (
          <div className="p-6 bg-gray-50 text-center text-sm text-gray-600">
            Affichage de {leaderboard.length} participant{leaderboard.length > 1 ? 's' : ''}
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;