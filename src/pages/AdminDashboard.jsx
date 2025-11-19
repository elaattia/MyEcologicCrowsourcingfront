// src/pages/AdminDashboard.jsx - NOUVEAU
import React, { useState, useEffect } from 'react';
import { Users, Trash2, Shield, User, Mail, Loader, AlertCircle, Search, Filter } from 'lucide-react';
import api from '../services/api/axiosConfig';

const AdminDashboard = ({ user, onLogout }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await api.get('/api/users');
      setUsers(response.data || []);
    } catch (err) {
      console.error('Erreur chargement utilisateurs:', err);
      setError(err.message || 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId, username) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur "${username}" ?`)) {
      return;
    }

    try {
      await api.delete(`/api/users/${userId}`);
      setSuccess(`Utilisateur "${username}" supprimé avec succès`);
      
      // Rafraîchir la liste
      await fetchUsers();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Erreur suppression:', err);
      setError(err.message || 'Erreur lors de la suppression');
    }
  };

  const filteredUsers = users.filter(u => {
    const matchSearch = searchTerm === '' || 
      u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchRole = filterRole === '' || u.role.toString() === filterRole;
    
    return matchSearch && matchRole;
  });

  const stats = {
    total: users.length,
    citoyens: users.filter(u => u.role === 'User').length,
    representants: users.filter(u => u.role === 'Representant').length
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8 flex items-center justify-center">
        <Loader className="animate-spin text-blue-600" size={40} />
        <p className="ml-4 text-gray-600">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* En-tête */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 flex items-center gap-3">
              <Shield size={40} className="text-purple-600" />
              Panel Administrateur
            </h1>
            <p className="text-gray-600 mt-2">Gestion des utilisateurs</p>
          </div>
          <button
            onClick={onLogout}
            className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition font-medium"
          >
            Déconnexion
          </button>
        </div>

        {/* Messages */}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 text-red-700 px-6 py-4 rounded-xl flex items-center gap-3">
            <AlertCircle size={20} />
            <p>{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-emerald-50 border-2 border-emerald-200 text-emerald-700 px-6 py-4 rounded-xl">
            {success}
          </div>
        )}

        {/* Statistiques */}
        <div className="grid grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-lg text-center border-l-4 border-blue-500">
            <div className="text-4xl font-bold text-blue-600 mb-2">{stats.total}</div>
            <p className="text-gray-600 font-medium">Total utilisateurs</p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg text-center border-l-4 border-emerald-500">
            <div className="text-4xl font-bold text-emerald-600 mb-2">{stats.citoyens}</div>
            <p className="text-gray-600 font-medium">Citoyens</p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg text-center border-l-4 border-purple-500">
            <div className="text-4xl font-bold text-purple-600 mb-2">{stats.representants}</div>
            <p className="text-gray-600 font-medium">Représentants</p>
          </div>
        </div>

        {/* Filtres */}
        <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            <Filter size={20} />
            Filtres
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Recherche</label>
              <div className="relative">
                <Search size={18} className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Nom ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Rôle</label>
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tous</option>
                <option value="0">Citoyens</option>
                <option value="1">Représentants</option>
              </select>
            </div>
          </div>
        </div>

        {/* Liste des utilisateurs */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b-2 border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">ID</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Nom</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Email</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Rôle</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Organisation</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                      Aucun utilisateur trouvé
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => (
                    <tr key={u.userId} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {u.userId.substring(0, 8)}...
                        </code>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                            {u.username.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium text-gray-800">{u.username}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail size={14} />
                          {u.email}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {u.role === 'User' ? (
                          <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold flex items-center gap-1 w-fit">
                            <User size={14} />
                            Citoyen
                          </span>
                        ) : (
                          <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-xs font-bold flex items-center gap-1 w-fit">
                            <Shield size={14} />
                            Représentant
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {u.organisationId ? (
                          <code className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                            {u.organisationId.substring(0, 8)}...
                          </code>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleDeleteUser(u.userId, u.username)}
                          disabled={u.userId === user.userId}
                          className="flex items-center gap-2 px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                          title={u.userId === user.userId ? "Vous ne pouvez pas vous supprimer" : "Supprimer"}
                        >
                          <Trash2 size={16} />
                          Supprimer
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;