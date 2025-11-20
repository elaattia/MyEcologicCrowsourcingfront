// src/components/Forum/CommentSection.jsx
import React, { useState, useEffect } from 'react';
import { 
  MessageCircle, ThumbsUp, Reply, Edit2, Trash2, 
  Send, Loader, AlertCircle, MoreVertical 
} from 'lucide-react';
import { forumApi } from '../../services/api/forumApi';

const CommentSection = ({ postId, user }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [editingComment, setEditingComment] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const fetchComments = async () => {
    setLoading(true);
    setError('');
    
    try {
      const data = await forumApi.getComments(postId);
      setComments(data || []);
    } catch (err) {
      console.error('Erreur chargement commentaires:', err);
      setError(err.message || 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    
    if (!newComment.trim()) {
      alert('Le commentaire ne peut pas être vide');
      return;
    }

    setSubmitting(true);
    
    try {
      await forumApi.createComment({
        content: newComment.trim(),
        postId,
        parentCommentId: replyTo
      });

      setNewComment('');
      setReplyTo(null);
      await fetchComments();
    } catch (err) {
      console.error('Erreur création commentaire:', err);
      alert(err.message || 'Erreur lors de la création du commentaire');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateComment = async (commentId, newContent) => {
    try {
      await forumApi.updateComment(commentId, {
        content: newContent.trim()
      });

      setEditingComment(null);
      await fetchComments();
    } catch (err) {
      console.error('Erreur modification:', err);
      alert(err.message || 'Erreur lors de la modification');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce commentaire ?')) {
      return;
    }

    try {
      await forumApi.deleteComment(commentId);
      await fetchComments();
    } catch (err) {
      console.error('Erreur suppression:', err);
      alert(err.message || 'Erreur lors de la suppression');
    }
  };

  const handleReaction = async (commentId, type) => {
    try {
      const comment = findComment(comments, commentId);
      
      if (comment.hasUserReacted && comment.userReactionType === type) {
        await forumApi.removeCommentReaction(commentId);
      } else {
        await forumApi.addCommentReaction(commentId, type);
      }
      
      await fetchComments();
    } catch (err) {
      console.error('Erreur réaction:', err);
      alert('Erreur lors de la réaction');
    }
  };

  const findComment = (commentList, id) => {
    for (const comment of commentList) {
      if (comment.id === id) return comment;
      if (comment.replies && comment.replies.length > 0) {
        const found = findComment(comment.replies, id);
        if (found) return found;
      }
    }
    return null;
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

  const CommentItem = ({ comment, depth = 0 }) => {
    const [showActions, setShowActions] = useState(false);
    const [editContent, setEditContent] = useState(comment.content);
    const isEditing = editingComment === comment.id;
    const isOwner = user?.userId === comment.userId;

    return (
      <div className={`${depth > 0 ? 'ml-12 mt-4' : 'mt-6'}`}>
        <div className="bg-gray-50 rounded-xl p-4">
          {/* En-tête du commentaire */}
          <div className="flex items-start gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-white font-bold">
              {comment.username.charAt(0).toUpperCase()}
            </div>

            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-gray-800">{comment.username}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(comment.createdAt).toLocaleString('fr-FR')}
                    {comment.isEdited && <span className="ml-2">(modifié)</span>}
                  </p>
                </div>

                {isOwner && (
                  <div className="relative">
                    <button
                      onClick={() => setShowActions(!showActions)}
                      className="p-1 hover:bg-gray-200 rounded-lg transition"
                    >
                      <MoreVertical size={16} />
                    </button>

                    {showActions && (
                      <div className="absolute right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-10 min-w-[150px]">
                        <button
                          onClick={() => {
                            setEditingComment(comment.id);
                            setShowActions(false);
                          }}
                          className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
                        >
                          <Edit2 size={14} />
                          Modifier
                        </button>
                        <button
                          onClick={() => {
                            handleDeleteComment(comment.id);
                            setShowActions(false);
                          }}
                          className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-red-600"
                        >
                          <Trash2 size={14} />
                          Supprimer
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Contenu du commentaire */}
              {isEditing ? (
                <div className="mt-3">
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                    rows="3"
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => handleUpdateComment(comment.id, editContent)}
                      className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition text-sm"
                    >
                      Enregistrer
                    </button>
                    <button
                      onClick={() => {
                        setEditingComment(null);
                        setEditContent(comment.content);
                      }}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition text-sm"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-gray-700 mt-2 whitespace-pre-wrap">{comment.content}</p>
              )}

              {comment.imageUrl && (
                <img
                  src={comment.imageUrl}
                  alt="Comment"
                  className="mt-3 rounded-lg max-w-md"
                />
              )}

              {/* Actions */}
              {!isEditing && (
                <div className="flex items-center gap-4 mt-3">
                  <button
                    onClick={() => handleReaction(comment.id, 'Like')}
                    className={`flex items-center gap-1 text-sm transition ${
                      comment.hasUserReacted && comment.userReactionType === 'Like'
                        ? 'text-blue-600 font-bold'
                        : 'text-gray-600 hover:text-blue-600'
                    }`}
                  >
                    {getReactionIcon('Like')} {comment.reactionCount > 0 && comment.reactionCount}
                  </button>

                  <button
                    onClick={() => setReplyTo(comment.id)}
                    className="flex items-center gap-1 text-sm text-gray-600 hover:text-emerald-600 transition"
                  >
                    <Reply size={14} />
                    Répondre
                  </button>

                  {comment.replyCount > 0 && (
                    <span className="text-xs text-gray-500">
                      {comment.replyCount} réponse{comment.replyCount > 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Réponses */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-2">
            {comment.replies.map((reply) => (
              <CommentItem key={reply.id} comment={reply} depth={depth + 1} />
            ))}
          </div>
        )}

        {/* Formulaire de réponse */}
        {replyTo === comment.id && (
          <div className="ml-12 mt-3 bg-blue-50 p-4 rounded-xl">
            <p className="text-sm text-gray-700 mb-2">
              Répondre à <span className="font-bold">{comment.username}</span>
            </p>
            <form onSubmit={handleSubmitComment} className="space-y-3">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                rows="3"
                placeholder="Écrivez votre réponse..."
                disabled={submitting}
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition text-sm disabled:opacity-50 flex items-center gap-2"
                >
                  {submitting ? <Loader className="animate-spin" size={14} /> : <Send size={14} />}
                  Répondre
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setReplyTo(null);
                    setNewComment('');
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition text-sm"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="animate-spin text-emerald-600" size={32} />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <MessageCircle size={24} className="text-emerald-600" />
        Commentaires ({comments.length})
      </h3>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 text-red-700 rounded-xl flex items-center gap-3">
          <AlertCircle size={20} />
          <p>{error}</p>
        </div>
      )}

      {/* Formulaire nouveau commentaire */}
      {!replyTo && (
        <form onSubmit={handleSubmitComment} className="mb-8">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
            rows="4"
            placeholder="Écrivez votre commentaire..."
            disabled={submitting}
          />
          <button
            type="submit"
            disabled={submitting || !newComment.trim()}
            className="mt-3 px-6 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-xl hover:shadow-lg transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {submitting ? (
              <>
                <Loader className="animate-spin" size={18} />
                Envoi...
              </>
            ) : (
              <>
                <Send size={18} />
                Publier le commentaire
              </>
            )}
          </button>
        </form>
      )}

      {/* Liste des commentaires */}
      {comments.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <MessageCircle size={48} className="mx-auto mb-4 text-gray-400" />
          <p>Aucun commentaire pour le moment. Soyez le premier à commenter !</p>
        </div>
      ) : (
        <div className="space-y-2">
          {comments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} />
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentSection;