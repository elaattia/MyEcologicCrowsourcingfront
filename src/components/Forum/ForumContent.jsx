// src/components/Forum/ForumContent.jsx
import React, { useState, useEffect } from 'react';
import { MessageCircle, Plus, TrendingUp, Clock, ThumbsUp, Loader, AlertCircle } from 'lucide-react';
import { forumApi } from '../../services/api/forumApi';
import CreatePost from './CreatePost';
import PostDetail from './PostDetail';

const ForumContent = ({ user }) => {
  const [categories, setCategories] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);

  useEffect(() => {
    fetchData();
  }, [selectedCategory]);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    
    try {
      const categoriesData = await forumApi.getCategories();
      setCategories(categoriesData || []);

      const postsParams = {
        pageNumber: 1,
        pageSize: 20,
        sortBy: 'recent',
        categoryId: selectedCategory
      };

      const postsData = await forumApi.getPosts(postsParams);
      setPosts(postsData.items || []);
    } catch (err) {
      console.error('Erreur chargement forum:', err);
      setError(err.message || 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  // Si un post est sélectionné, afficher ses détails
  if (selectedPost) {
    return (
      <PostDetail
        postId={selectedPost}
        onBack={() => {
          setSelectedPost(null);
          fetchData(); // Recharger les données après retour
        }}
        user={user}
      />
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader className="animate-spin text-emerald-600" size={40} />
        <p className="ml-4 text-gray-600">Chargement du forum...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <MessageCircle size={32} className="text-emerald-600" />
          Forum communautaire
        </h2>
        <button
          onClick={() => setShowCreatePost(true)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-xl hover:shadow-lg transition font-medium"
        >
          <Plus size={20} />
          Nouveau post
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border-2 border-red-200 text-red-700 px-6 py-4 rounded-xl flex items-center gap-3">
          <AlertCircle size={20} />
          <p>{error}</p>
        </div>
      )}

      {/* Catégories */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Bouton "Toutes les catégories" */}
        <div
          onClick={() => setSelectedCategory(null)}
          className={`bg-white rounded-xl p-6 shadow-lg cursor-pointer hover:shadow-xl transition border-l-4 ${
            selectedCategory === null
              ? 'border-emerald-500'
              : 'border-gray-300'
          }`}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="text-3xl">📁</div>
            <div>
              <h3 className="font-bold text-gray-800">Toutes les catégories</h3>
              <p className="text-sm text-gray-600">
                {posts.length} posts au total
              </p>
            </div>
          </div>
        </div>

        {categories.map((category) => (
          <div
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`bg-white rounded-xl p-6 shadow-lg cursor-pointer hover:shadow-xl transition border-l-4 ${
              selectedCategory === category.id
                ? 'border-emerald-500'
                : 'border-gray-300'
            }`}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="text-3xl">{category.icon || '📁'}</div>
              <div>
                <h3 className="font-bold text-gray-800">{category.name}</h3>
                <p className="text-sm text-gray-600">{category.postCount} posts</p>
              </div>
            </div>
            {category.description && (
              <p className="text-sm text-gray-600">{category.description}</p>
            )}
          </div>
        ))}
      </div>

      {/* Liste des posts */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <TrendingUp size={20} className="text-emerald-600" />
            Posts récents
            {selectedCategory && (
              <span className="text-sm font-normal text-gray-600">
                - {categories.find(c => c.id === selectedCategory)?.name}
              </span>
            )}
          </h3>
        </div>

        <div className="divide-y divide-gray-200">
          {posts.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <MessageCircle size={48} className="mx-auto mb-4 text-gray-400" />
              <p>Aucun post pour le moment</p>
              {selectedCategory && (
                <button
                  onClick={() => setSelectedCategory(null)}
                  className="mt-4 text-emerald-600 hover:underline"
                >
                  Voir toutes les catégories
                </button>
              )}
            </div>
          ) : (
            posts.map((post) => (
              <div 
                key={post.id} 
                onClick={() => setSelectedPost(post.id)}
                className="p-6 hover:bg-gray-50 transition cursor-pointer"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                    {post.username.charAt(0).toUpperCase()}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <h4 className="font-bold text-gray-800">{post.title}</h4>
                      {post.isPinned && (
                        <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded text-xs font-bold">
                          📌 Épinglé
                        </span>
                      )}
                      {post.isLocked && (
                        <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-bold">
                          🔒 Verrouillé
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {post.contentPreview}
                    </p>

                    <div className="flex items-center gap-4 text-sm text-gray-500 flex-wrap">
                      <span className="flex items-center gap-1">
                        <ThumbsUp size={14} />
                        {post.reactionCount}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle size={14} />
                        {post.commentCount}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={14} />
                        {new Date(post.createdAt).toLocaleDateString()}
                      </span>
                      <span className="text-emerald-600 font-medium">
                        {post.username}
                      </span>
                      <span className="text-blue-600">
                        {post.categoryName}
                      </span>
                    </div>

                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {post.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {post.imageUrl && (
                    <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={post.imageUrl}
                        alt={post.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal de création de post */}
      {showCreatePost && (
        <CreatePost
          onClose={() => setShowCreatePost(false)}
          onSuccess={() => {
            setShowCreatePost(false);
            fetchData();
          }}
        />
      )}
    </div>
  );
};

export default ForumContent;