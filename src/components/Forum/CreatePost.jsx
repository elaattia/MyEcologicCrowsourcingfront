// src/components/Forum/CreatePost.jsx - CORRIGÉ
import React, { useState, useEffect } from 'react';
import { X, Image, Video, Tag, Loader, AlertCircle, CheckCircle } from 'lucide-react';
import { forumApi } from '../../services/api/forumApi';

const CreatePost = ({ onClose, onSuccess }) => {
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    categoryId: '',
    imageUrl: '',
    videoUrl: '',
    tags: []
  });
  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoadingCategories(true);
    try {
      const data = await forumApi.getCategories();
      console.log('📂 Catégories chargées:', data);
      
      if (data && Array.isArray(data) && data.length > 0) {
        setCategories(data);
        // Sélectionner automatiquement la première catégorie
        setFormData(prev => ({ ...prev, categoryId: data[0].id }));
      } else {
        setError('Aucune catégorie disponible. Contactez un administrateur.');
      }
    } catch (err) {
      console.error('❌ Erreur chargement catégories:', err);
      setError('Impossible de charger les catégories');
    } finally {
      setLoadingCategories(false);
    }
  };

  const handleAddTag = () => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag && !formData.tags.includes(trimmedTag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, trimmedTag]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const validateForm = () => {
    if (!formData.title.trim() || formData.title.length < 5) {
      setError('Le titre doit contenir au moins 5 caractères');
      return false;
    }

    if (formData.title.length > 300) {
      setError('Le titre ne peut pas dépasser 300 caractères');
      return false;
    }

    if (!formData.content.trim() || formData.content.length < 10) {
      setError('Le contenu doit contenir au moins 10 caractères');
      return false;
    }

    if (!formData.categoryId) {
      setError('Veuillez sélectionner une catégorie');
      return false;
    }

    // Validation optionnelle des URLs
    if (formData.imageUrl && formData.imageUrl.trim()) {
      try {
        new URL(formData.imageUrl);
      } catch {
        setError('URL de l\'image invalide');
        return false;
      }
    }

    if (formData.videoUrl && formData.videoUrl.trim()) {
      try {
        new URL(formData.videoUrl);
      } catch {
        setError('URL de la vidéo invalide');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      await forumApi.createPost({
        title: formData.title.trim(),
        content: formData.content.trim(),
        categoryId: formData.categoryId,
        imageUrl: formData.imageUrl.trim() || null,
        videoUrl: formData.videoUrl.trim() || null,
        tags: formData.tags
      });

      setSuccess(true);
      
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (err) {
      console.error('❌ Erreur création post:', err);
      setError(err.message || 'Erreur lors de la création du post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full p-8 my-8">
        {/* En-tête */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800">
            Créer un nouveau post
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
            disabled={loading}
          >
            <X size={24} />
          </button>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 text-red-700 rounded-xl flex items-center gap-3">
            <AlertCircle size={20} />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-emerald-50 border-2 border-emerald-200 text-emerald-700 rounded-xl flex items-center gap-3">
            <CheckCircle size={20} />
            <p className="text-sm">Post créé avec succès ! Redirection...</p>
          </div>
        )}

        {/* Loading catégories */}
        {loadingCategories ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="animate-spin text-emerald-600" size={32} />
            <p className="ml-4 text-gray-600">Chargement des catégories...</p>
          </div>
        ) : (
          /* Formulaire */
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Catégorie */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Catégorie *
              </label>
              {categories.length === 0 ? (
                <div className="p-4 bg-amber-50 border-2 border-amber-200 text-amber-700 rounded-xl">
                  Aucune catégorie disponible. Contactez un administrateur.
                </div>
              ) : (
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                  required
                  disabled={loading}
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.icon ? `${cat.icon} ` : ''}{cat.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Titre */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Titre *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                placeholder="Ex: Comment réduire ses déchets au quotidien ?"
                required
                disabled={loading}
                maxLength={300}
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.title.length}/300 caractères
              </p>
            </div>

            {/* Contenu */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contenu *
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                rows="8"
                placeholder="Partagez vos idées, questions ou expériences..."
                required
                disabled={loading}
              />
              <p className="text-xs text-gray-500 mt-1">
                Minimum 10 caractères
              </p>
            </div>

            {/* Image URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Image size={16} className="inline mr-2" />
                URL de l'image (optionnel)
              </label>
              <input
                type="url"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                placeholder="https://example.com/image.jpg"
                disabled={loading}
              />
            </div>

            {/* Video URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Video size={16} className="inline mr-2" />
                URL de la vidéo (optionnel)
              </label>
              <input
                type="url"
                value={formData.videoUrl}
                onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                placeholder="https://example.com/video.mp4"
                disabled={loading}
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Tag size={16} className="inline mr-2" />
                Tags (optionnel)
              </label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                  placeholder="Ex: recyclage, zéro-déchet..."
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-6 py-3 bg-emerald-100 text-emerald-700 rounded-xl hover:bg-emerald-200 transition font-medium"
                  disabled={loading}
                >
                  Ajouter
                </button>
              </div>

              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium flex items-center gap-2"
                    >
                      #{tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:text-blue-900"
                        disabled={loading}
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Boutons */}
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition font-medium"
                disabled={loading}
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading || categories.length === 0}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-xl hover:shadow-lg transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader className="animate-spin" size={18} />
                    Publication...
                  </>
                ) : (
                  'Publier'
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default CreatePost;