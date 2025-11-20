// src/components/Forum/PostDetail.jsx
import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, ThumbsUp, MessageCircle, Share2, Flag, 
  Edit2, Trash2, Clock, Eye, Loader, AlertCircle 
} from 'lucide-react';
import { forumApi } from '../../services/api/forumApi';
import CommentSection from './CommentSection';

const PostDetail = ({ postId, onBack, user }) => {
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reactionLoading, setReactionLoading] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  useEffect(() => {
    fetchPost();
  }, [postId]);

  const fetchPost = async () => {
    setLoading(true);
    setError('');
    
    try {
      const data = await forumApi.getPostById(postId);
      setPost(data);
    } catch (err) {
      console.error('Erreur chargement post:', err);
      setError(err.message || 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleReaction = async (type) => {
    if (!post) return;
    
    setReactionLoading(true);
    try {
      if (post.hasUserReacted && post.userReactionType === type) {
        // Retirer la réaction
        await forumApi.removePostReaction(post.id);
      } else {
        // Ajouter/Changer la réaction
        await forumApi.addPostReaction(post.id, type);
      }
      await fetchPost(); // Recharger le post
    } catch (err) {
      console.error('Erreur réaction:', err);
      alert('Erreur lors de la réaction');
    } finally {
      setReactionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce post ?')) {
      return;
    }

    try {
      await forumApi.deletePost(post.id);
      alert('Post supprimé avec succès');
      onBack();
    } catch (err) {
      console.error('Erreur suppression:', err);
      alert(err.message || 'Erreur lors de la suppression');
    }
  };

  const handleReport = async (reason, description) => {
    try {
      await forumApi.reportPost({
        postId: post.id,
        reason,
        description
      });
      alert('Signalement envoyé. Merci pour votre vigilance.');
      setShowReportModal(false);
    } catch (err) {
      console.error('Erreur signalement:', err);
      alert('Erreur lors du signalement');
    }
  };

  const getReactionIcon = (type) => {
    const icons = {
      'Like': '👍',
      'Love': '❤️',
      'Helpful': '💡',
      'Insightful': '🧠'
    };
    return icons[type] || '👍';
  };

  const getReactionColor = (type) => {
    const colors = {
      'Like': 'bg-blue-100 text-blue-700 border-blue-300',
      'Love': 'bg-red-100 text-red-700 border-red-300',
      'Helpful': 'bg-amber-100 text-amber-700 border-amber-300',
      'Insightful': 'bg-purple-100 text-purple-700 border-purple-300'
    };
    return colors[type] || 'bg-gray-100 text-gray-700 border-gray-300';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader className="animate-spin text-emerald-600" size={40} />
        <p className="ml-4 text-gray-600">Chargement du post...</p>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="bg-red-50 border-2 border-red-200 text-red-700 px-6 py-4 rounded-xl flex items-center gap-3">
        <AlertCircle size={20} />
        <p>{error || 'Post introuvable'}</p>
        <button onClick={onBack} className="ml-auto px-4 py-2 bg-red-600 text-white rounded-lg">
          Retour
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Bouton retour */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition"
      >
        <ArrowLeft size={20} />
        Retour au forum
      </button>

      {/* En-tête du post */}
      <div className="bg-white rounded-2xl shadow-lg p-8">
        {/* Badges */}
        <div className="flex flex-wrap gap-2 mb-4">
          {post.isPinned && (
            <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-lg text-sm font-bold">
              📌 Épinglé
            </span>
          )}
          {post.isLocked && (
            <span className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-sm font-bold">
              🔒 Verrouillé
            </span>
          )}
          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-bold">
            {post.categoryName}
          </span>
        </div>

        {/* Titre */}
        <h1 className="text-4xl font-bold text-gray-800 mb-6">
          {post.title}
        </h1>

        {/* Auteur et stats */}
        <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-white font-bold text-xl">
              {post.username.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-bold text-gray-800 text-lg">{post.username}</p>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <Clock size={14} />
                  {new Date(post.createdAt).toLocaleDateString('fr-FR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
                <span className="flex items-center gap-1">
                  <Eye size={14} />
                  {post.viewCount} vues
                </span>
              </div>
            </div>
          </div>

          {/* Actions auteur */}
          {user?.userId === post.userId && (
            <div className="flex gap-2">
              <button className="p-2 hover:bg-gray-100 rounded-lg transition">
                <Edit2 size={18} className="text-blue-600" />
              </button>
              <button 
                onClick={handleDelete}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <Trash2 size={18} className="text-red-600" />
              </button>
            </div>
          )}
        </div>

        {/* Contenu */}
        <div className="prose max-w-none mb-6">
          <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-wrap">
            {post.content}
          </p>
        </div>

        {/* Image/Vidéo */}
        {post.imageUrl && (
          <div className="mb-6">
            <img
              src={post.imageUrl}
              alt="Post"
              className="w-full rounded-xl shadow-lg"
            />
          </div>
        )}

        {post.videoUrl && (
          <div className="mb-6">
            <video
              src={post.videoUrl}
              controls
              className="w-full rounded-xl shadow-lg"
            />
          </div>
        )}

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {post.tags.map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Réactions */}
        <div className="flex items-center gap-3 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-600 font-medium mr-2">Réactions:</p>
          {['Like', 'Love', 'Helpful', 'Insightful'].map((type) => (
            <button
              key={type}
              onClick={() => handleReaction(type)}
              disabled={reactionLoading || post.isLocked}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition hover:shadow-md ${
                post.hasUserReacted && post.userReactionType === type
                  ? getReactionColor(type)
                  : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <span className="text-xl">{getReactionIcon(type)}</span>
              <span className="text-sm font-medium">{type}</span>
            </button>
          ))}

          <div className="ml-auto flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition">
              <Share2 size={16} />
              <span className="text-sm">Partager</span>
            </button>
            <button 
              onClick={() => setShowReportModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition"
            >
              <Flag size={16} />
              <span className="text-sm">Signaler</span>
            </button>
          </div>
        </div>

        {/* Statistiques */}
        <div className="flex items-center gap-6 mt-6 pt-6 border-t border-gray-200 text-sm text-gray-600">
          <span className="flex items-center gap-2">
            <ThumbsUp size={16} />
            {post.reactionCount} réactions
          </span>
          <span className="flex items-center gap-2">
            <MessageCircle size={16} />
            {post.commentCount} commentaires
          </span>
        </div>
      </div>

      {/* Section commentaires */}
      {!post.isLocked ? (
        <CommentSection postId={post.id} user={user} />
      ) : (
        <div className="bg-amber-50 border-2 border-amber-200 text-amber-700 px-6 py-4 rounded-xl">
          🔒 Ce post est verrouillé. Vous ne pouvez plus ajouter de commentaires.
        </div>
      )}

      {/* Modal de signalement */}
      {showReportModal && (
        <ReportModal
          onClose={() => setShowReportModal(false)}
          onSubmit={handleReport}
        />
      )}
    </div>
  );
};

// Modal de signalement
const ReportModal = ({ onClose, onSubmit }) => {
  const [reason, setReason] = useState('Spam');
  const [description, setDescription] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(reason, description);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8">
        <h3 className="text-2xl font-bold text-gray-800 mb-6">
          Signaler ce post
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Raison
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
            >
              <option value="Spam">Spam</option>
              <option value="Harassment">Harcèlement</option>
              <option value="OffTopic">Hors sujet</option>
              <option value="Inappropriate">Contenu inapproprié</option>
              <option value="Misinformation">Désinformation</option>
              <option value="Other">Autre</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description (optionnel)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
              rows="4"
              placeholder="Détails supplémentaires..."
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition font-medium"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:shadow-lg transition font-medium"
            >
              Signaler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostDetail;