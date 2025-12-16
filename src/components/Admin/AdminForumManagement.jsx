// src/components/Admin/AdminForumManagement.jsx - VERSION COMPLÈTE
import React, { useState, useEffect } from 'react';
import { MessageCircle, Edit2, Trash2, Lock, Unlock, Pin, X, Filter, Loader, Plus } from 'lucide-react';
import { forumApi } from '../../services/api/forumApi';

const AdminForumManagement = ({ user }) => {
  const [categories, setCategories] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingCategory, setEditingCategory] = useState(null);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    icon: '📁',
    displayOrder: 0,
    isActive: true
  });

  // Catégories par défaut à créer
  const DEFAULT_CATEGORIES = [
    { name: 'Général', description: 'Discussions générales sur l\'écologie', icon: '💬', displayOrder: 0 },
    { name: 'Recyclage', description: 'Tout sur le recyclage et le tri', icon: '♻️', displayOrder: 1 },
    { name: 'Zéro Déchet', description: 'Mode de vie zéro déchet', icon: '🌱', displayOrder: 2 },
    { name: 'Conseils', description: 'Partagez vos astuces écologiques', icon: '💡', displayOrder: 3 },
    { name: 'Événements', description: 'Événements et actions écologiques', icon: '📅', displayOrder: 4 }
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [cats, postsData] = await Promise.all([
        forumApi.getCategories(true),
        forumApi.getPosts({ pageNumber: 1, pageSize: 50 })
      ]);
      
      setCategories(cats || []);
      setPosts(postsData.items || []);
      
      // Si aucune catégorie, proposer de créer celles par défaut
      if (!cats || cats.length === 0) {
        if (window.confirm('Aucune catégorie de forum n\'existe. Voulez-vous créer les catégories par défaut ?')) {
          await createDefaultCategories();
        }
      }
    } catch (error) {
      console.error('Erreur chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  const createDefaultCategories = async () => {
    try {
      for (const cat of DEFAULT_CATEGORIES) {
        await forumApi.createCategory(cat);
      }
      alert('✅ Catégories créées avec succès!');
      await fetchData();
    } catch (error) {
      console.error('Erreur création catégories:', error);
      alert('Erreur lors de la création des catégories');
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    try {
      await forumApi.createCategory(categoryForm);
      alert('Catégorie créée!');
      setShowCategoryForm(false);
      setCategoryForm({ name: '', description: '', icon: '📁', displayOrder: 0, isActive: true });
      fetchData();
    } catch (error) {
      alert('Erreur: ' + error.message);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!confirm('Supprimer cette catégorie?')) return;
    try {
      await forumApi.deleteCategory(id);
      alert('Catégorie supprimée!');
      fetchData();
    } catch (error) {
      alert('Erreur: ' + error.message);
    }
  };

  const handlePostAction = async (postId, action) => {
    try {
      switch (action) {
        case 'pin':
          await forumApi.pinPost(postId);
          break;
        case 'unpin':
          await forumApi.unpinPost(postId);
          break;
        case 'lock':
          await forumApi.lockPost(postId);
          break;
        case 'unlock':
          await forumApi.unlockPost(postId);
          break;
        case 'delete':
          if (!confirm('Supprimer ce post?')) return;
          await forumApi.deletePost(postId);
          break;
      }
      alert('Action réalisée!');
      fetchData();
    } catch (error) {
      alert('Erreur: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader className="animate-spin text-purple-600" size={40} />
        <p className="ml-4 text-gray-600">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* En-tête */}
      <div>
        <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <MessageCircle size={32} className="text-purple-600" />
          Gestion du Forum
        </h2>
        <p className="text-gray-600 mt-2">Gérer les catégories, posts et commentaires</p>
      </div>

      {/* Section Catégories */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-800">📁 Catégories</h3>
          <div className="flex gap-2">
            {categories.length === 0 && (
              <button
                onClick={createDefaultCategories}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
              >
                Créer catégories par défaut
              </button>
            )}
            <button
              onClick={() => setShowCategoryForm(true)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center gap-2"
            >
              <Plus size={18} />
              Nouvelle catégorie
            </button>
          </div>
        </div>

        {categories.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <MessageCircle size={48} className="mx-auto mb-4 text-gray-400" />
            <p>Aucune catégorie. Créez-en pour permettre aux utilisateurs de poster.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map(category => (
              <div key={category.id} className="border rounded-xl p-4 hover:shadow-md transition">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{category.icon}</span>
                      <h4 className="font-bold text-gray-800">{category.name}</h4>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{category.description}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>Ordre: {category.displayOrder}</span>
                      <span className={`px-2 py-1 rounded ${category.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {category.isActive ? 'Actif' : 'Inactif'}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteCategory(category.id)}
                    className="p-2 hover:bg-red-100 rounded text-red-600"
                    title="Supprimer"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section Posts */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-6">📝 Posts récents</h3>
        
        {posts.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>Aucun post pour le moment</p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map(post => (
              <div key={post.id} className="border rounded-xl p-4 hover:shadow-md transition">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-bold text-gray-800">{post.title}</h4>
                      {post.isPinned && <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded text-xs">📌 Épinglé</span>}
                      {post.isLocked && <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs">🔒 Verrouillé</span>}
                    </div>
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">{post.content}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>Par: {post.username}</span>
                      <span>Catégorie: {post.categoryName}</span>
                      <span>Vues: {post.viewCount}</span>
                      <span>Commentaires: {post.commentCount}</span>
                    </div>
                  </div>
                  <div className="flex gap-1 ml-4">
                    {post.isPinned ? (
                      <button onClick={() => handlePostAction(post.id, 'unpin')} className="p-2 hover:bg-gray-100 rounded" title="Désépingler">
                        <X size={16} />
                      </button>
                    ) : (
                      <button onClick={() => handlePostAction(post.id, 'pin')} className="p-2 hover:bg-amber-100 rounded text-amber-600" title="Épingler">
                        <Pin size={16} />
                      </button>
                    )}
                    {post.isLocked ? (
                      <button onClick={() => handlePostAction(post.id, 'unlock')} className="p-2 hover:bg-gray-100 rounded" title="Déverrouiller">
                        <Unlock size={16} />
                      </button>
                    ) : (
                      <button onClick={() => handlePostAction(post.id, 'lock')} className="p-2 hover:bg-red-100 rounded text-red-600" title="Verrouiller">
                        <Lock size={16} />
                      </button>
                    )}
                    <button onClick={() => handlePostAction(post.id, 'delete')} className="p-2 hover:bg-red-100 rounded text-red-600" title="Supprimer">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de création de catégorie */}
      {showCategoryForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Nouvelle catégorie</h3>
              <button onClick={() => setShowCategoryForm(false)} className="p-1">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleCreateCategory} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nom *</label>
                <input
                  type="text"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({...categoryForm, name: e.target.value})}
                  className="w-full px-3 py-2 border rounded"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({...categoryForm, description: e.target.value})}
                  className="w-full px-3 py-2 border rounded"
                  rows="3"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Icône</label>
                  <input
                    type="text"
                    value={categoryForm.icon}
                    onChange={(e) => setCategoryForm({...categoryForm, icon: e.target.value})}
                    className="w-full px-3 py-2 border rounded"
                    placeholder="📁"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Ordre</label>
                  <input
                    type="number"
                    value={categoryForm.displayOrder}
                    onChange={(e) => setCategoryForm({...categoryForm, displayOrder: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={categoryForm.isActive}
                  onChange={(e) => setCategoryForm({...categoryForm, isActive: e.target.checked})}
                  id="isActive"
                />
                <label htmlFor="isActive" className="text-sm">Catégorie active</label>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCategoryForm(false)}
                  className="flex-1 px-4 py-2 border rounded hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                >
                  Créer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminForumManagement;