// src/components/User/EcologicalRecommendations.jsx
import React, { useState, useEffect } from 'react';
import { Lightbulb, RefreshCw } from 'lucide-react';
import api from '../../services/api/axiosConfig';
import './EcologicalRecommendations.css';

const EcologicalRecommendations = ({ wastePointId }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (wastePointId) {
      fetchRecommendations();
    }
  }, [wastePointId]);

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/api/PointDechet/${wastePointId}/recommandations`);
      setRecommendations(response.data || []);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = async () => {
    setLoading(true);
    try {
      await api.post(`/api/PointDechet/${wastePointId}/regenerer-recommandation`);
      alert('🤖 Recommandations régénérées!');
      fetchRecommendations();
    } catch (error) {
      alert('Erreur: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && recommendations.length === 0) {
    return <div className="loading">Chargement recommandations...</div>;
  }

  return (
    <div className="ecological-recommendations">
      <div className="recommendations-header">
        <h3>
          <Lightbulb size={20} />
          Recommandations écologiques (IA)
        </h3>
        <button 
          onClick={handleRegenerate} 
          disabled={loading}
          className="btn-regenerate"
        >
          <RefreshCw size={16} className={loading ? 'spinning' : ''} />
          Régénérer
        </button>
      </div>

      <div className="recommendations-list">
        {recommendations.map((rec, index) => (
          <div key={rec.id || index} className="recommendation-card">
            <div className="rec-category">{rec.categorie}</div>
            <p className="rec-text">{rec.texte}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EcologicalRecommendations;