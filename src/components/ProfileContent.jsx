// components/ProfileContent.jsx
import React, { useState } from 'react';
import { User, Mail, Award, Edit2, Save, X } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import MapContent from './MapContent';
import StatsContent from './StatsContent';

const ProfileContent = ({ user }) => {
  const { updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await updateProfile(formData);
      setSuccess('Profil mis à jour avec succès');
      setIsEditing(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      username: user?.username || '',
      email: user?.email || '',
    });
    setIsEditing(false);
    setError('');
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg p-8">
        {}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-3xl font-bold text-white shadow-lg">
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-800">
                {user?.username || 'Utilisateur'}
              </h2>
              <p className="text-gray-600">
                {user?.role === 1 ? 'Organisation' : 'Citoyen'}
              </p>
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

        {}
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

        {}
        <form onSubmit={handleSubmit} className="space-y-6">
          {}
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
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition disabled:bg-gray-50"
                required
              />
            </div>
          </div>

          {}
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
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition disabled:bg-gray-50"
                required
              />
            </div>
          </div>

          {}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type de compte
            </label>
            <div className="px-4 py-3 bg-gray-50 rounded-xl border border-gray-300">
              <p className="text-gray-700">
                {user?.role === 1 ? '🏢 Organisation' : '👤 Citoyen'}
              </p>
            </div>
          </div>

          {}
          {isEditing && (
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition font-medium disabled:opacity-50"
              >
                <Save size={18} />
                {loading ? 'Enregistrement...' : 'Enregistrer'}
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

        {}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Award size={24} className="text-amber-600" />
            Vos réalisations
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-emerald-50 p-4 rounded-xl text-center">
              <p className="text-3xl font-bold text-emerald-600 mb-1">42</p>
              <p className="text-sm text-gray-600">Signalements</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-xl text-center">
              <p className="text-3xl font-bold text-blue-600 mb-1">30</p>
              <p className="text-sm text-gray-600">Traités</p>
            </div>
            <div className="bg-amber-50 p-4 rounded-xl text-center">
              <p className="text-3xl font-bold text-amber-600 mb-1">420</p>
              <p className="text-sm text-gray-600">Points</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export { MapContent, StatsContent, ProfileContent };
export default ProfileContent;