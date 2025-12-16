// src/components/Organisation/OrgSubmissions.jsx
import React, { useState, useEffect } from 'react';
import { 
  Upload, 
  Image as ImageIcon, 
  MapPin, 
  CheckCircle, 
  XCircle, 
  Clock,
  Eye,
  Trash2
} from 'lucide-react';
import api from '../../services/api/axiosConfig';
import './OrgSubmissions.css';

const OrgSubmissions = () => {
  const [submissions, setSubmissions] = useState([]);
  const [wastePoints, setWastePoints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  
  const [formData, setFormData] = useState({
    wastePointId: '',
    description: '',
    imageAvant: null,
    imageApres: null
  });

  const [previewImages, setPreviewImages] = useState({
    avant: null,
    apres: null
  });

  useEffect(() => {
    fetchSubmissions();
    fetchWastePoints();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const response = await api.get('/api/Submissions/my');
      setSubmissions(response.data || []);
    } catch (error) {
      console.error('Erreur chargement soumissions:', error);
    }
  };

  const fetchWastePoints = async () => {
    try {
      // Récupérer les points de déchets non nettoyés
      const response = await api.get('/api/PointDechet', {
        params: { statut: 'Signale' }
      });
      setWastePoints(response.data || []);
    } catch (error) {
      console.error('Erreur chargement points:', error);
    }
  };

  const handleImageChange = (type, e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Vérifier le type et la taille
    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner une image');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('L\'image ne doit pas dépasser 5 MB');
      return;
    }

    // Mettre à jour le formData
    setFormData({
      ...formData,
      [type === 'avant' ? 'imageAvant' : 'imageApres']: file
    });

    // Créer un preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImages({
        ...previewImages,
        [type]: reader.result
      });
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.wastePointId) {
      alert('Veuillez sélectionner un point de déchet');
      return;
    }

    if (!formData.imageAvant || !formData.imageApres) {
      alert('Veuillez ajouter les deux photos (avant et après)');
      return;
    }

    setLoading(true);

    try {
      const submitData = new FormData();
      submitData.append('PointDechetId', formData.wastePointId);
      submitData.append('Description', formData.description);
      submitData.append('ImageAvant', formData.imageAvant);
      submitData.append('ImageApres', formData.imageApres);

      await api.post('/api/Submissions', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      alert('✅ Soumission envoyée avec succès! En attente de validation.');
      
      // Reset form
      setFormData({
        wastePointId: '',
        description: '',
        imageAvant: null,
        imageApres: null
      });
      setPreviewImages({ avant: null, apres: null });
      setShowForm(false);
      
      // Refresh
      fetchSubmissions();
      fetchWastePoints();
    } catch (error) {
      console.error('Erreur soumission:', error);
      alert('❌ Erreur lors de l\'envoi de la soumission');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      'Pending': { 
        icon: Clock, 
        color: 'orange', 
        text: 'En attente',
        bg: '#fff3cd',
        textColor: '#856404'
      },
      'Approved': { 
        icon: CheckCircle, 
        color: 'green', 
        text: 'Approuvée',
        bg: '#d4edda',
        textColor: '#155724'
      },
      'Rejected': { 
        icon: XCircle, 
        color: 'red', 
        text: 'Rejetée',
        bg: '#f8d7da',
        textColor: '#721c24'
      }
    };

    const badge = badges[status] || badges['Pending'];
    const Icon = badge.icon;

    return (
      <span 
        className="status-badge"
        style={{ 
          background: badge.bg, 
          color: badge.textColor 
        }}
      >
        <Icon size={14} />
        {badge.text}
      </span>
    );
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

  return (
    <div className="org-submissions">
      <div className="submissions-header">
        <div>
          <h2>📋 Mes Soumissions</h2>
          <p className="subtitle">Soumettre et suivre vos actions de nettoyage</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="btn-new-submission"
        >
          <Upload size={18} />
          Nouvelle Soumission
        </button>
      </div>

      {/* Formulaire de soumission */}
      {showForm && (
        <div className="submission-form-card">
          <h3>📤 Soumettre une action de nettoyage</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>
                <MapPin size={16} />
                Point de déchet nettoyé *
              </label>
              <select
                value={formData.wastePointId}
                onChange={(e) => setFormData({ ...formData, wastePointId: e.target.value })}
                required
                className="form-select"
              >
                <option value="">Sélectionner un point...</option>
                {wastePoints.map(point => (
                  <option key={point.id} value={point.id}>
                    {point.adresse} - {point.typeDechet}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Description (optionnel)</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Décrivez l'action de nettoyage réalisée..."
                rows="3"
                className="form-textarea"
              />
            </div>

            <div className="images-upload-section">
              <div className="upload-group">
                <label className="upload-label">
                  <ImageIcon size={16} />
                  Photo AVANT le nettoyage *
                </label>
                <div className="upload-area">
                  {previewImages.avant ? (
                    <div className="image-preview">
                      <img src={previewImages.avant} alt="Avant" />
                      <button
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, imageAvant: null });
                          setPreviewImages({ ...previewImages, avant: null });
                        }}
                        className="btn-remove-image"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ) : (
                    <label className="upload-box">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageChange('avant', e)}
                        hidden
                      />
                      <Upload size={32} />
                      <span>Cliquer pour uploader</span>
                      <span className="file-info">Max 5 MB</span>
                    </label>
                  )}
                </div>
              </div>

              <div className="arrow-divider">→</div>

              <div className="upload-group">
                <label className="upload-label">
                  <ImageIcon size={16} />
                  Photo APRÈS le nettoyage *
                </label>
                <div className="upload-area">
                  {previewImages.apres ? (
                    <div className="image-preview">
                      <img src={previewImages.apres} alt="Après" />
                      <button
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, imageApres: null });
                          setPreviewImages({ ...previewImages, apres: null });
                        }}
                        className="btn-remove-image"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ) : (
                    <label className="upload-box">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageChange('apres', e)}
                        hidden
                      />
                      <Upload size={32} />
                      <span>Cliquer pour uploader</span>
                      <span className="file-info">Max 5 MB</span>
                    </label>
                  )}
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setFormData({
                    wastePointId: '',
                    description: '',
                    imageAvant: null,
                    imageApres: null
                  });
                  setPreviewImages({ avant: null, apres: null });
                }}
                className="btn-cancel"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn-submit"
              >
                {loading ? 'Envoi en cours...' : 'Soumettre'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Liste des soumissions */}
      <div className="submissions-list">
        <h3>📜 Historique de mes soumissions</h3>
        
        {submissions.length === 0 ? (
          <div className="empty-state">
            <Upload size={48} color="#ccc" />
            <p>Aucune soumission pour le moment</p>
            <button onClick={() => setShowForm(true)} className="btn-start">
              Créer ma première soumission
            </button>
          </div>
        ) : (
          <div className="submissions-grid">
            {submissions.map((submission) => (
              <div key={submission.id} className="submission-card">
                <div className="card-header">
                  {getStatusBadge(submission.status)}
                  <span className="card-date">{formatDate(submission.dateCreation)}</span>
                </div>

                <div className="card-images">
                  <div className="image-wrapper">
                    <span className="image-label">Avant</span>
                    <img 
                      src={submission.imageAvantUrl} 
                      alt="Avant nettoyage"
                      className="submission-image"
                    />
                  </div>
                  <div className="arrow-indicator">→</div>
                  <div className="image-wrapper">
                    <span className="image-label">Après</span>
                    <img 
                      src={submission.imageApresUrl} 
                      alt="Après nettoyage"
                      className="submission-image"
                    />
                  </div>
                </div>

                <div className="card-details">
                  <p className="waste-point">
                    <MapPin size={14} />
                    {submission.wastePointAddress || 'Point de déchet'}
                  </p>
                  
                  {submission.description && (
                    <p className="description">{submission.description}</p>
                  )}

                  {submission.status === 'Approved' && submission.pointsAttribues > 0 && (
                    <div className="points-earned">
                      <CheckCircle size={16} color="#4CAF50" />
                      <strong>+{submission.pointsAttribues} points</strong> attribués
                    </div>
                  )}

                  {submission.notes && (
                    <div className={`admin-notes ${submission.status.toLowerCase()}`}>
                      <strong>Notes admin:</strong> {submission.notes}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrgSubmissions;