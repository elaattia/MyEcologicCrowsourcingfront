// components/ProfileContent.jsx - VERSION COMPLÈTE
import React, { useState } from 'react';
import { User, Mail, Award, Edit2, Save, X, Shield, Loader } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api/axiosConfig';

const ProfileContent = ({ user }) => {
  const { updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [stats, setStats] = useState({
    totalSignalements: 0,
    traites: 0,
    points: 0
  });

  // Charger les statistiques au montage
  React.useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/api/pointdechet/mes-statistiques');
        setStats({
          totalSignalements: response.data.totalDechets || 0,
          traites: response.data.totalNettoyés || 0,
          points: (response.data.totalDechets || 0) * 10 // 10 points par signalement
        });
      } catch (err) {
        console.error('Erreur chargement stats:', err);
      }
    };

    fetchStats();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (formData.password && formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (formData.password && formData.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setLoading(true);

    try {
      // Préparer les données à envoyer
      const updateData = {
        userId: user.userId,
        email: formData.email,
        username: formData.username,
        role: user.role
      };

      // Ajouter le mot de passe seulement s'il est fourni
      if (formData.password) {
        updateData.password = formData.password;
      }

      // Appeler l'API
      const response = await api.put(`/api/users/${user.userId}`, updateData);

      // Mettre à jour le localStorage
      const updatedUser = {
        ...user,
        username: response.data.username,
        email: response.data.email
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));

      // Appeler updateProfile du hook
      await updateProfile(updatedUser);

      setSuccess('Profil mis à jour avec succès');
      setIsEditing(false);
      
      // Réinitialiser les mots de passe
      setFormData(prev => ({
        ...prev,
        password: '',
        confirmPassword: ''
      }));

      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Erreur mise à jour profil:', err);
      setError(err.message || 'Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      username: user?.username || '',
      email: user?.email || '',
      password: '',
      confirmPassword: ''
    });
    setIsEditing(false);
    setError('');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl shadow-lg p-8">
        {/* En-tête */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-3xl font-bold text-white shadow-lg">
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-800">
                {user?.username || 'Utilisateur'}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                {user?.role === 1 ? (
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium flex items-center gap-1">
                    <Shield size={14} />
                    Organisation
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-sm font-medium flex items-center gap-1">
                    <User size={14} />
                    Citoyen
                  </span>
                )}
              </div>
            </div>
          </div>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-xl hover:bg-emerald-200 transition"
            >
              <Edit2 size={18} />
              Modifier
            </button>
          )}
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl border border-red-200">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200">
            {success}
          </div>
        )}

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nom d'utilisateur */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nom d'utilisateur
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                disabled={!isEditing}
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition disabled:bg-gray-50 disabled:text-gray-600"
                required
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={!isEditing}
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition disabled:bg-gray-50 disabled:text-gray-600"
                required
              />
            </div>
          </div>

          {/* Changement de mot de passe (seulement en mode édition) */}
          {isEditing && (
            <>
              <div className="border-t pt-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">
                  Changer le mot de passe (optionnel)
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Laissez vide pour conserver votre mot de passe actuel
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nouveau mot de passe
                    </label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                      placeholder="Minimum 6 caractères"
                      minLength={6}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirmer le mot de passe
                    </label>
                    <input
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                      placeholder="Confirmer le mot de passe"
                      minLength={6}
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Boutons d'action */}
          {isEditing && (
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition font-medium disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader className="animate-spin" size={18} />
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Enregistrer
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={loading}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition font-medium disabled:opacity-50"
              >
                <X size={18} className="inline mr-2" />
                Annuler
              </button>
            </div>
          )}
        </form>

        {/* Statistiques */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Award size={24} className="text-amber-600" />
            Vos réalisations
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-emerald-50 p-4 rounded-xl text-center border-2 border-emerald-200">
              <p className="text-3xl font-bold text-emerald-600 mb-1">{stats.totalSignalements}</p>
              <p className="text-sm text-gray-600">Signalements</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-xl text-center border-2 border-blue-200">
              <p className="text-3xl font-bold text-blue-600 mb-1">{stats.traites}</p>
              <p className="text-sm text-gray-600">Traités</p>
            </div>
            <div className="bg-amber-50 p-4 rounded-xl text-center border-2 border-amber-200">
              <p className="text-3xl font-bold text-amber-600 mb-1">{stats.points}</p>
              <p className="text-sm text-gray-600">Points</p>
            </div>
          </div>
        </div>

        {/* Informations du compte */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Informations du compte</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">ID du compte:</span>
              <span className="font-mono text-gray-800">{user?.userId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Type de compte:</span>
              <span className="font-medium text-gray-800">
                {user?.role === 1 ? 'Organisation (Représentant)' : 'Citoyen'}
              </span>
            </div>
            {user?.organisationId && (
              <div className="flex justify-between">
                <span className="text-gray-600">Organisation:</span>
                <span className="font-medium text-gray-800">{user.organisationId}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileContent;