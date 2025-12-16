import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  X,
  Save,
  AlertCircle,
  Shield,
  User,
  Building
} from 'lucide-react';
import adminApi from '../../services/api/adminApi';

const AdminUsersManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadUsers();
  }, []);

  // FONCTION UTILITAIRE: Extraire l'ID d'un user (supporte id, userId, guid, etc.)
  const getUserId = (user) => {
    return user?.id || user?.userId || user?.guid || user?.ID || user?.UserId;
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Loading users...');
      const data = await adminApi.getUsers();
      console.log('Users loaded:', data);
      
      // DEBUG: Afficher la structure du premier user
      if (data && data.length > 0) {
        console.log('STRUCTURE USER:', data[0]);
        console.log('ID trouvé:', getUserId(data[0]));
      }
      
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Erreur chargement utilisateurs:', err);
      setError('Erreur lors du chargement des utilisateurs: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (userData) => {
    try {
      console.log('Creating user with data:', userData);
      await adminApi.createUser(userData);
      alert('✅ Utilisateur créé avec succès');
      setShowCreateModal(false);
      await loadUsers();
    } catch (err) {
      console.error('Erreur création utilisateur:', err);
      const errorMsg = err.response?.data?.message || err.response?.data || err.message;
      alert('❌ Erreur création: ' + errorMsg);
    }
  };

  const handleUpdateUser = async (userData) => {
    try {
      // Vérifier que selectedUser existe et extraire son ID
      if (!selectedUser) {
        alert('❌ Erreur: Utilisateur non sélectionné');
        console.error('selectedUser is null');
        return;
      }

      const userId = getUserId(selectedUser);
      
      if (!userId) {
        alert('❌ Erreur: ID utilisateur introuvable');
        console.error('User ID not found in:', selectedUser);
        return;
      }

      console.log('Updating user:', userId, 'with data:', userData);
      await adminApi.updateUser(userId, userData);
      alert('✅ Utilisateur modifié avec succès');
      setShowEditModal(false);
      setSelectedUser(null);
      await loadUsers();
    } catch (err) {
      console.error('Erreur modification utilisateur:', err);
      const errorMsg = err.message || 'Erreur lors de la modification';
      alert('❌ Erreur modification: ' + errorMsg);
    }
  };

  const handleDeleteUser = async (user) => {
    // Extraire l'ID du user
    const userId = getUserId(user);
    
    if (!userId) {
      alert('❌ Erreur: ID utilisateur introuvable');
      console.error('User ID not found in:', user);
      return;
    }

    if (!window.confirm('⚠️ Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      return;
    }

    try {
      console.log('Deleting user:', userId);
      await adminApi.deleteUser(userId);
      alert('✅ Utilisateur supprimé avec succès');
      await loadUsers();
    } catch (err) {
      console.error('Erreur suppression utilisateur:', err);
      const errorMsg = err.message || 'Erreur lors de la suppression';
      alert('❌ Erreur suppression: ' + errorMsg);
    }
  };

  const getRoleBadge = (role) => {
    const roleValue = typeof role === 'string' ? role : 
                      role === 0 ? 'User' : 
                      role === 1 ? 'Representant' : 'Admin';
    
    const badges = {
      'User': { bg: 'bg-blue-100', text: 'text-blue-700', icon: User, label: 'Citoyen' },
      'Representant': { bg: 'bg-purple-100', text: 'text-purple-700', icon: Building, label: 'Représentant' },
      'Admin': { bg: 'bg-red-100', text: 'text-red-700', icon: Shield, label: 'Admin' }
    };

    const badge = badges[roleValue] || badges['User'];
    const Icon = badge.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
        <Icon className="h-3 w-3" />
        {badge.label}
      </span>
    );
  };

  const filteredUsers = users.filter(user => {
    const search = searchTerm.toLowerCase();
    return (
      user.nom?.toLowerCase().includes(search) ||
      user.prenom?.toLowerCase().includes(search) ||
      user.email?.toLowerCase().includes(search) ||
      user.username?.toLowerCase().includes(search)
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Users className="h-12 w-12 text-emerald-500 animate-pulse mx-auto mb-4" />
          <p className="text-gray-600">Chargement des utilisateurs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">👥 Gestion des Utilisateurs</h2>
          <p className="text-gray-600 mt-1">{users.length} utilisateurs au total</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
        >
          <Plus className="h-5 w-5" />
          Nouvel Utilisateur
        </button>
      </div>

      {/* Barre de recherche */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Rechercher par nom, prénom ou email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      {/* Message d'erreur */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Tableau des utilisateurs */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Utilisateur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Rôle
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Téléphone
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                    Aucun utilisateur trouvé
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const userId = getUserId(user);
                  return (
                    <tr key={userId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0 bg-emerald-100 rounded-full flex items-center justify-center">
                            <span className="text-emerald-700 font-semibold text-sm">
                              {(user.prenom?.[0] || user.username?.[0] || 'U')}{(user.nom?.[0] || '')}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.prenom && user.nom ? `${user.prenom} ${user.nom}` : user.username || user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{user.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getRoleBadge(user.role)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.telephone || user.phone || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => {
                              console.log('Selecting user for edit:', user);
                              setSelectedUser(user);
                              setShowEditModal(true);
                            }}
                            className="text-emerald-600 hover:text-emerald-900 p-2 hover:bg-emerald-50 rounded"
                            title="Modifier"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user)}
                            className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded"
                            title="Supprimer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {showCreateModal && (
        <UserFormModal
          title="Créer un Utilisateur"
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateUser}
        />
      )}

      {showEditModal && selectedUser && (
        <UserFormModal
          title="Modifier l'Utilisateur"
          user={selectedUser}
          onClose={() => {
            setShowEditModal(false);
            setSelectedUser(null);
          }}
          onSubmit={handleUpdateUser}
          isEdit
        />
      )}
    </div>
  );
};

// Modal de formulaire utilisateur
const UserFormModal = ({ title, user = null, onClose, onSubmit, isEdit = false }) => {
  const [formData, setFormData] = useState({
    nom: user?.nom || '',
    prenom: user?.prenom || '',
    email: user?.email || '',
    motDePasse: '',
    role: user?.role !== undefined ? user.role : 0,
    telephone: user?.telephone || user?.phone || '',
    adresse: user?.adresse || user?.address || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.nom || !formData.prenom || !formData.email) {
      alert('⚠️ Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (!isEdit && !formData.motDePasse) {
      alert('⚠️ Le mot de passe est obligatoire pour créer un utilisateur');
      return;
    }

    const dataToSend = { ...formData };
    if (isEdit && !formData.motDePasse) {
      delete dataToSend.motDePasse;
    }

    console.log('Submitting user data:', dataToSend);
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prénom <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.prenom}
                  onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.nom}
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mot de passe {!isEdit && <span className="text-red-500">*</span>}
                {isEdit && <span className="text-gray-500 text-xs ml-2">(laisser vide pour ne pas changer)</span>}
              </label>
              <input
                type="password"
                value={formData.motDePasse}
                onChange={(e) => setFormData({ ...formData, motDePasse: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                required={!isEdit}
                placeholder={isEdit ? "Laisser vide pour conserver l'actuel" : ""}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rôle <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              >
                <option value={0}>Citoyen</option>
                <option value={1}>Représentant</option>
                <option value={2}>Admin</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Téléphone
              </label>
              <input
                type="tel"
                value={formData.telephone}
                onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Adresse
              </label>
              <textarea
                value={formData.adresse}
                onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
                rows="2"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
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

export default AdminUsersManagement;