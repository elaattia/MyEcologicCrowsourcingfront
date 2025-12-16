// src/components/Admin/AdminSubmissionsReview.jsx - VERSION CORRIGÉE
import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, XCircle, Eye, Filter, Calendar, MapPin, User, Image as ImageIcon
} from 'lucide-react';
import adminApi from '../../services/api/adminApi';
import './AdminSubmissionsReview.css';

const AdminSubmissionsReview = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [reviewData, setReviewData] = useState({
    approved: true,
    points: 10,
    notes: ''
  });
  const [filter, setFilter] = useState('Pending');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchSubmissions();
  }, [filter, currentPage]);

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      let data;
      if (filter === 'Pending') {
        data = await adminApi.getPendingSubmissions(currentPage, 10);
      } else {
        // Mapper le filtre au format backend
        const statusMap = {
          'Approved': 'Approved',
          'Rejected': 'Rejected',
          'All': null
        };
        const status = statusMap[filter];
        data = await adminApi.getAllSubmissions(currentPage, 10, status);
      }
      
      setSubmissions(data.items || []);
      setTotalPages(Math.ceil((data.totalCount || 0) / 10));
    } catch (error) {
      console.error('Erreur chargement soumissions:', error);
      alert('Erreur lors du chargement des soumissions');
    } finally {
      setLoading(false);
    }
  };

  const openReviewModal = async (submission) => {
    setSelectedSubmission(submission);
    setReviewData({
      approved: true,
      points: 10,
      notes: ''
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedSubmission(null);
  };

  const handleReview = async () => {
    if (!selectedSubmission) return;

    try {
      console.log('📡 Review submission:', {
        id: selectedSubmission.id,
        approved: reviewData.approved,
        notes: reviewData.notes,
        points: reviewData.points
      });

      await adminApi.reviewSubmission(
        selectedSubmission.id,
        reviewData.approved,
        reviewData.notes,
        reviewData.approved ? reviewData.points : 0
      );

      alert(
        reviewData.approved 
          ? `✅ Soumission approuvée! ${reviewData.points} points attribués.`
          : '❌ Soumission rejetée.'
      );

      closeModal();
      
      // Attendre un peu puis recharger
      await new Promise(resolve => setTimeout(resolve, 500));
      await fetchSubmissions();
    } catch (error) {
      console.error('Erreur review:', error);
      alert('Erreur lors de la review de la soumission: ' + (error.response?.data?.message || error.message));
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    // Gérer à la fois string et enum numérique
    const statusValue = typeof status === 'string' ? status : 
                       status === 0 ? 'Pending' :
                       status === 1 ? 'UnderReview' :
                       status === 2 ? 'Approved' :
                       status === 3 ? 'Rejected' : 'Unknown';

    const badges = {
      'Pending': { color: 'orange', text: 'En attente' },
      'UnderReview': { color: 'blue', text: 'En révision' },
      'Approved': { color: 'green', text: 'Approuvée' },
      'Rejected': { color: 'red', text: 'Rejetée' }
    };
    
    const badge = badges[statusValue] || { color: 'gray', text: statusValue };
    
    return (
      <span className={`status-badge status-${badge.color}`}>
        {badge.text}
      </span>
    );
  };

  if (loading && submissions.length === 0) {
    return (
      <div className="loading-spinner">
        <div className="spinner"></div>
        <p>Chargement...</p>
      </div>
    );
  }

  return (
    <div className="admin-submissions-review">
      <div className="review-header">
        <h2>📋 Review des Soumissions</h2>
        <p className="subtitle">Valider les actions de nettoyage des organisations</p>
      </div>

      {/* Filtres */}
      <div className="filters-bar">
        <div className="filter-group">
          <Filter size={18} />
          <select 
            value={filter} 
            onChange={(e) => {
              setFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="filter-select"
          >
            <option value="Pending">En attente</option>
            <option value="Approved">Approuvées</option>
            <option value="Rejected">Rejetées</option>
            <option value="All">Toutes</option>
          </select>
        </div>

        <button 
          onClick={fetchSubmissions} 
          className="btn-refresh"
          disabled={loading}
        >
          🔄 Actualiser
        </button>
      </div>

      {/* Liste des soumissions */}
      {submissions.length === 0 ? (
        <div className="empty-state">
          <p>Aucune soumission trouvée</p>
        </div>
      ) : (
        <>
          <div className="submissions-grid">
            {submissions.map((submission) => (
              <div key={submission.id} className="submission-card">
                <div className="card-header">
                  <div className="card-title">
                    <User size={16} />
                    <span>{submission.organisationName || 'Organisation'}</span>
                  </div>
                  {getStatusBadge(submission.status)}
                </div>

                <div className="card-images">
                  <div className="image-wrapper">
                    <span className="image-label">Avant</span>
                    <img 
                      src={submission.imageAvantUrl} 
                      alt="Avant nettoyage"
                      className="submission-image"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/300x200?text=Image+non+disponible';
                      }}
                    />
                  </div>
                  <div className="arrow">→</div>
                  <div className="image-wrapper">
                    <span className="image-label">Après</span>
                    <img 
                      src={submission.imageApresUrl} 
                      alt="Après nettoyage"
                      className="submission-image"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/300x200?text=Image+non+disponible';
                      }}
                    />
                  </div>
                </div>

                <div className="card-info">
                  <div className="info-item">
                    <MapPin size={14} />
                    <span>{submission.wastePointAddress || 'Point de déchet'}</span>
                  </div>
                  <div className="info-item">
                    <Calendar size={14} />
                    <span>{formatDate(submission.dateCreation)}</span>
                  </div>
                </div>

                {submission.description && (
                  <p className="card-description">{submission.description}</p>
                )}

                {submission.status === 'Pending' || submission.status === 0 ? (
                  <button 
                    onClick={() => openReviewModal(submission)}
                    className="btn-review"
                  >
                    <Eye size={16} />
                    Reviewer
                  </button>
                ) : (
                  <div className="review-result">
                    <p className="review-notes">
                      <strong>Notes:</strong> {submission.notes || 'Aucune note'}
                    </p>
                    {submission.pointsAttribues > 0 && (
                      <p className="points-awarded">
                        ⭐ {submission.pointsAttribues} points attribués
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="btn-page"
              >
                ← Précédent
              </button>
              <span className="page-info">
                Page {currentPage} / {totalPages}
              </span>
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="btn-page"
              >
                Suivant →
              </button>
            </div>
          )}
        </>
      )}

      {/* Modal Review */}
      {showModal && selectedSubmission && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Review de la soumission</h3>
              <button onClick={closeModal} className="btn-close">✕</button>
            </div>

            <div className="modal-body">
              <div className="modal-images">
                <div className="modal-image-wrapper">
                  <h4>Avant nettoyage</h4>
                  <img 
                    src={selectedSubmission.imageAvantUrl} 
                    alt="Avant"
                    className="modal-image"
                  />
                </div>
                <div className="modal-image-wrapper">
                  <h4>Après nettoyage</h4>
                  <img 
                    src={selectedSubmission.imageApresUrl} 
                    alt="Après"
                    className="modal-image"
                  />
                </div>
              </div>

              <div className="modal-info">
                <p><strong>Organisation:</strong> {selectedSubmission.organisationName}</p>
                <p><strong>Point de déchet:</strong> {selectedSubmission.wastePointAddress}</p>
                <p><strong>Date:</strong> {formatDate(selectedSubmission.dateCreation)}</p>
                {selectedSubmission.description && (
                  <p><strong>Description:</strong> {selectedSubmission.description}</p>
                )}
              </div>

              <div className="review-form">
                <div className="form-group">
                  <label>Décision</label>
                  <div className="decision-buttons">
                    <button
                      className={`btn-decision ${reviewData.approved ? 'active' : ''}`}
                      onClick={() => setReviewData({ ...reviewData, approved: true })}
                    >
                      <CheckCircle size={18} />
                      Approuver
                    </button>
                    <button
                      className={`btn-decision reject ${!reviewData.approved ? 'active' : ''}`}
                      onClick={() => setReviewData({ ...reviewData, approved: false })}
                    >
                      <XCircle size={18} />
                      Rejeter
                    </button>
                  </div>
                </div>

                {reviewData.approved && (
                  <div className="form-group">
                    <label>Points à attribuer</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={reviewData.points}
                      onChange={(e) => setReviewData({ 
                        ...reviewData, 
                        points: parseInt(e.target.value) || 0 
                      })}
                      className="input-points"
                    />
                  </div>
                )}

                <div className="form-group">
                  <label>Notes (optionnel)</label>
                  <textarea
                    value={reviewData.notes}
                    onChange={(e) => setReviewData({ 
                      ...reviewData, 
                      notes: e.target.value 
                    })}
                    placeholder="Commentaires sur cette soumission..."
                    rows="3"
                    className="textarea-notes"
                  />
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button onClick={closeModal} className="btn-cancel">
                Annuler
              </button>
              <button onClick={handleReview} className="btn-submit">
                {reviewData.approved ? 'Approuver' : 'Rejeter'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSubmissionsReview;

// ========== adminApi.js - CORRECTIONS IA ==========
// Dans votre fichier src/services/api/adminApi.js, remplacez les fonctions generateAIChallenge et generateAIChallengesBatch par :

/*
  generateAIChallenge: async (prompt) => {
    try {
      // Format correct attendu par le backend
      const dto = { 
        theme: prompt,
        count: 1
      };
      
      console.log('📡 POST /api/Challenges/generate:', dto);
      const response = await api.post('/api/Challenges/generate', dto);
      console.log('✅ Challenge IA généré:', response.data);
      
      // Attendre 2 secondes pour que le backend finisse
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      return response.data;
    } catch (error) {
      console.error('❌ POST Challenge/generate:', error.response?.data);
      throw new Error(
        error.response?.data?.message || 
        error.response?.data || 
        'Erreur lors de la génération du challenge avec l\'IA'
      );
    }
  },

  generateAIChallengesBatch: async (count = 5) => {
    try {
      const dto = { count: parseInt(count) };
      
      console.log('📡 POST /api/Challenges/generate/batch:', dto);
      const response = await api.post('/api/Challenges/generate/batch', dto);
      console.log('✅ Batch généré:', response.data);
      
      // Attendre 3 secondes pour que tous les challenges soient créés
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      return response.data;
    } catch (error) {
      console.error('❌ POST Challenge/generate/batch:', error.response?.data);
      throw new Error(
        error.response?.data?.message || 
        error.response?.data || 
        'Erreur lors de la génération en lot'
      );
    }
  },
*/