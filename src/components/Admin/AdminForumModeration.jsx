// src/components/Admin/AdminForumModeration.jsx
import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Pin,
  Lock,
  Unlock,
  Trash2,
  Eye,
  Filter,
  Calendar,
  User
} from 'lucide-react';
import adminApi from '../../services/api/adminApi';
import './AdminForumModeration.css';

const AdminForumModeration = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [filter, setFilter] = useState('Pending'); // Pending, Resolved, Dismissed, All
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [actionNotes, setActionNotes] = useState('');

  useEffect(() => {
    fetchReports();
    fetchPendingCount();
    
    // Poll pour les nouveaux signalements toutes les 30s
    const interval = setInterval(fetchPendingCount, 30000);
    return () => clearInterval(interval);
  }, [filter, currentPage]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const status = filter === 'All' ? null : filter;
      const data = await adminApi.getReports(status, currentPage, 20);
      
      setReports(data.items || []);
      setTotalPages(Math.ceil((data.totalCount || 0) / 20));
    } catch (error) {
      console.error('Erreur chargement reports:', error);
      alert('Erreur lors du chargement des signalements');
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingCount = async () => {
    try {
      const count = await adminApi.getPendingReportsCount();
      setPendingCount(count);
    } catch (error) {
      console.error('Erreur count:', error);
    }
  };

  const openReportModal = (report) => {
    setSelectedReport(report);
    setActionNotes('');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedReport(null);
    setActionNotes('');
  };

  const handleReviewReport = async (action) => {
    if (!selectedReport) return;

    try {
      await adminApi.reviewReport(selectedReport.id, action, actionNotes);
      
      alert(
        action === 'Approve' 
          ? '✅ Signalement approuvé - Post supprimé'
          : '❌ Signalement rejeté'
      );

      closeModal();
      fetchReports();
      fetchPendingCount();
    } catch (error) {
      console.error('Erreur review report:', error);
      alert('Erreur lors du traitement du signalement');
    }
  };

  const handlePinPost = async (postId, currentlyPinned) => {
    try {
      if (currentlyPinned) {
        await adminApi.unpinPost(postId);
        alert('📌 Post désépinglé');
      } else {
        await adminApi.pinPost(postId);
        alert('📌 Post épinglé');
      }
      fetchReports();
    } catch (error) {
      console.error('Erreur pin:', error);
      alert('Erreur lors de l\'épinglage');
    }
  };

  const handleLockPost = async (postId, currentlyLocked) => {
    try {
      if (currentlyLocked) {
        await adminApi.unlockPost(postId);
        alert('🔓 Post déverrouillé');
      } else {
        await adminApi.lockPost(postId);
        alert('🔒 Post verrouillé');
      }
      fetchReports();
    } catch (error) {
      console.error('Erreur lock:', error);
      alert('Erreur lors du verrouillage');
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('⚠️ Êtes-vous sûr de vouloir supprimer ce post?')) {
      return;
    }

    try {
      await adminApi.deletePost(postId);
      alert('🗑️ Post supprimé');
      fetchReports();
    } catch (error) {
      console.error('Erreur delete:', error);
      alert('Erreur lors de la suppression');
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
    const badges = {
      'Pending': { color: 'orange', icon: AlertTriangle, text: 'En attente' },
      'Resolved': { color: 'green', icon: CheckCircle, text: 'Résolu' },
      'Dismissed': { color: 'gray', icon: XCircle, text: 'Rejeté' }
    };
    const badge = badges[status] || { color: 'gray', icon: AlertTriangle, text: status };
    const Icon = badge.icon;
    
    return (
      <span className={`status-badge status-${badge.color}`}>
        <Icon size={14} />
        {badge.text}
      </span>
    );
  };

  const getReasonBadge = (reason) => {
    const colors = {
      'Spam': 'red',
      'Inapproprié': 'orange',
      'Harcèlement': 'red',
      'Désinformation': 'orange',
      'Autre': 'gray'
    };
    return (
      <span className={`reason-badge reason-${colors[reason] || 'gray'}`}>
        {reason}
      </span>
    );
  };

  return (
    <div className="admin-forum-moderation">
      <div className="moderation-header">
        <div>
          <h2>
            🛡️ Modération Forum
            {pendingCount > 0 && (
              <span className="pending-badge">{pendingCount}</span>
            )}
          </h2>
          <p className="subtitle">Gérer les signalements et modérer le contenu</p>
        </div>
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
            <option value="Pending">En attente ({pendingCount})</option>
            <option value="Resolved">Résolus</option>
            <option value="Dismissed">Rejetés</option>
            <option value="All">Tous</option>
          </select>
        </div>

        <button 
          onClick={() => {
            fetchReports();
            fetchPendingCount();
          }} 
          className="btn-refresh"
          disabled={loading}
        >
          🔄 Actualiser
        </button>
      </div>

      {/* Liste des signalements */}
      {loading ? (
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Chargement...</p>
        </div>
      ) : reports.length === 0 ? (
        <div className="empty-state">
          <AlertTriangle size={48} color="#ccc" />
          <p>Aucun signalement trouvé</p>
        </div>
      ) : (
        <>
          <div className="reports-list">
            {reports.map((report) => (
              <div key={report.id} className="report-card">
                <div className="report-header">
                  <div className="report-info">
                    {getReasonBadge(report.raison)}
                    {getStatusBadge(report.statut)}
                  </div>
                  <div className="report-date">
                    <Calendar size={14} />
                    {formatDate(report.dateCreation)}
                  </div>
                </div>

                <div className="report-body">
                  <div className="reported-post">
                    <h4>📝 Post signalé</h4>
                    <div className="post-content">
                      <div className="post-meta">
                        <User size={14} />
                        <span>{report.postAuthorName || 'Auteur'}</span>
                        {report.postIsPinned && <Pin size={14} color="#4CAF50" />}
                        {report.postIsLocked && <Lock size={14} color="#f44336" />}
                      </div>
                      <p className="post-text">{report.postContent}</p>
                    </div>
                  </div>

                  <div className="reporter-info">
                    <h4>👤 Signalé par</h4>
                    <p>
                      <User size={14} />
                      {report.reporterName || 'Utilisateur'}
                    </p>
                    {report.description && (
                      <p className="report-description">
                        <strong>Description:</strong> {report.description}
                      </p>
                    )}
                  </div>

                  {report.notes && (
                    <div className="admin-notes">
                      <strong>Notes admin:</strong> {report.notes}
                    </div>
                  )}
                </div>

                <div className="report-actions">
                  {report.statut === 'Pending' && (
                    <>
                      <button 
                        onClick={() => openReportModal(report)}
                        className="btn-action btn-review"
                      >
                        <Eye size={16} />
                        Examiner
                      </button>
                    </>
                  )}
                  
                  <button
                    onClick={() => handlePinPost(report.postId, report.postIsPinned)}
                    className={`btn-action ${report.postIsPinned ? 'btn-unpin' : 'btn-pin'}`}
                    title={report.postIsPinned ? 'Désépingler' : 'Épingler'}
                  >
                    <Pin size={16} />
                    {report.postIsPinned ? 'Désépingler' : 'Épingler'}
                  </button>

                  <button
                    onClick={() => handleLockPost(report.postId, report.postIsLocked)}
                    className={`btn-action ${report.postIsLocked ? 'btn-unlock' : 'btn-lock'}`}
                    title={report.postIsLocked ? 'Déverrouiller' : 'Verrouiller'}
                  >
                    {report.postIsLocked ? <Unlock size={16} /> : <Lock size={16} />}
                    {report.postIsLocked ? 'Déverrouiller' : 'Verrouiller'}
                  </button>

                  <button
                    onClick={() => handleDeletePost(report.postId)}
                    className="btn-action btn-delete"
                    title="Supprimer le post"
                  >
                    <Trash2 size={16} />
                    Supprimer
                  </button>
                </div>
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
      {showModal && selectedReport && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Examiner le signalement</h3>
              <button onClick={closeModal} className="btn-close">✕</button>
            </div>

            <div className="modal-body">
              <div className="modal-report-details">
                <div className="detail-section">
                  <h4>Raison du signalement</h4>
                  {getReasonBadge(selectedReport.raison)}
                </div>

                <div className="detail-section">
                  <h4>Post signalé</h4>
                  <div className="post-preview">
                    <p className="post-author">Par: {selectedReport.postAuthorName}</p>
                    <p className="post-content">{selectedReport.postContent}</p>
                  </div>
                </div>

                <div className="detail-section">
                  <h4>Signalé par</h4>
                  <p>{selectedReport.reporterName}</p>
                  {selectedReport.description && (
                    <p className="description-text">{selectedReport.description}</p>
                  )}
                </div>

                <div className="detail-section">
                  <h4>Notes (optionnel)</h4>
                  <textarea
                    value={actionNotes}
                    onChange={(e) => setActionNotes(e.target.value)}
                    placeholder="Ajoutez des notes sur votre décision..."
                    rows="3"
                    className="textarea-notes"
                  />
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button 
                onClick={() => handleReviewReport('Dismiss')}
                className="btn-dismiss"
              >
                <XCircle size={18} />
                Rejeter le signalement
              </button>
              <button 
                onClick={() => handleReviewReport('Approve')}
                className="btn-approve"
              >
                <CheckCircle size={18} />
                Approuver (Supprimer le post)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminForumModeration;