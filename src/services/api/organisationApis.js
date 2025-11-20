// src/services/api/organisationApis.js
import api from './axiosConfig';

// ============= DÉPÔTS =============
export const depotApi = {
  /**
   * Récupérer tous les dépôts de l'organisation
   */
  getAll: async () => {
    try {
      const response = await api.get('/api/depots');
      console.log('✅ Dépôts récupérés:', response.data);
      return response.data;
    } catch (err) {
      console.error('❌ Erreur getAll depots:', err.response?.data || err.message);
      throw err;
    }
  },

  /**
   * Récupérer un dépôt par son ID
   */
  getById: async (id) => {
    try {
      const response = await api.get(`/api/depots/${id}`);
      console.log('✅ Dépôt récupéré:', response.data);
      return response.data;
    } catch (err) {
      console.error('❌ Erreur getById depot:', err.response?.data || err.message);
      throw err;
    }
  },

  /**
   * Créer un nouveau dépôt
   * @param {Object} depot - { nom, adresse, latitude, longitude, estActif }
   */
  create: async (depot) => {
    try {
      console.log('📤 Création dépôt:', depot);
      const response = await api.post('/api/depots', depot);
      console.log('✅ Dépôt créé:', response.data);
      return response.data;
    } catch (err) {
      console.error('❌ Erreur create depot:', err.response?.data || err.message);
      throw err;
    }
  },

  /**
   * Mettre à jour un dépôt
   */
  update: async (id, depot) => {
    try {
      console.log('📤 Mise à jour dépôt:', id, depot);
      const response = await api.put(`/api/depots/${id}`, depot);
      console.log('✅ Dépôt mis à jour:', response.data);
      return response.data;
    } catch (err) {
      console.error('❌ Erreur update depot:', err.response?.data || err.message);
      throw err;
    }
  },

  /**
   * Supprimer un dépôt
   */
  delete: async (id) => {
    try {
      console.log('📤 Suppression dépôt:', id);
      await api.delete(`/api/depots/${id}`);
      console.log('✅ Dépôt supprimé');
      return true;
    } catch (err) {
      console.error('❌ Erreur delete depot:', err.response?.data || err.message);
      throw err;
    }
  }
};

// ============= VÉHICULES =============
export const vehiculeApi = {
  /**
   * Récupérer tous les véhicules de l'organisation
   */
  getAll: async () => {
    try {
      const response = await api.get('/api/vehicules');
      console.log('✅ Véhicules récupérés:', response.data);
      return response.data;
    } catch (err) {
      console.error('❌ Erreur getAll vehicules:', err.response?.data || err.message);
      throw err;
    }
  },

  /**
   * Récupérer un véhicule par son ID
   */
  getById: async (id) => {
    try {
      const response = await api.get(`/api/vehicules/${id}`);
      console.log('✅ Véhicule récupéré:', response.data);
      return response.data;
    } catch (err) {
      console.error('❌ Erreur getById vehicule:', err.response?.data || err.message);
      throw err;
    }
  },

  /**
   * Créer un nouveau véhicule
   * @param {Object} vehicule - { immatriculation, type, capaciteMax, consommationMoyenne, estDisponible }
   */
  create: async (vehicule) => {
    try {
      console.log('📤 Création véhicule:', vehicule);
      const response = await api.post('/api/vehicules', vehicule);
      console.log('✅ Véhicule créé:', response.data);
      return response.data;
    } catch (err) {
      console.error('❌ Erreur create vehicule:', err.response?.data || err.message);
      throw err;
    }
  },

  /**
   * Mettre à jour un véhicule
   */
  update: async (id, vehicule) => {
    try {
      console.log('📤 Mise à jour véhicule:', id, vehicule);
      const response = await api.put(`/api/vehicules/${id}`, vehicule);
      console.log('✅ Véhicule mis à jour:', response.data);
      return response.data;
    } catch (err) {
      console.error('❌ Erreur update vehicule:', err.response?.data || err.message);
      throw err;
    }
  },

  /**
   * Supprimer un véhicule
   */
  delete: async (id) => {
    try {
      console.log('📤 Suppression véhicule:', id);
      await api.delete(`/api/vehicules/${id}`);
      console.log('✅ Véhicule supprimé');
      return true;
    } catch (err) {
      console.error('❌ Erreur delete vehicule:', err.response?.data || err.message);
      throw err;
    }
  },

  /**
   * Récupérer uniquement les véhicules disponibles
   */
  getDisponibles: async () => {
    try {
      const response = await api.get('/api/vehicules');
      const vehiculesDisponibles = response.data.filter(v => v.estDisponible);
      console.log('✅ Véhicules disponibles:', vehiculesDisponibles.length);
      return vehiculesDisponibles;
    } catch (err) {
      console.error('❌ Erreur getDisponibles vehicules:', err.response?.data || err.message);
      throw err;
    }
  }
};

// ============= OPTIMISATION =============
export const optimisationApi = {
  /**
   * Optimiser les tournées de collecte
   * @param {Object} requestData - Données de la requête
   * @param {string} requestData.organisationId - GUID de l'organisation (requis)
   * @param {string[]} [requestData.vehiculesIds] - Liste de GUIDs des véhicules à utiliser (optionnel)
   * @param {string} [requestData.depotId] - GUID du dépôt de départ (optionnel)
   * @param {string} [requestData.tempsMaxParTrajet] - Temps max au format "HH:mm:ss" (optionnel)
   * @returns {Promise<Object>} Résultat de l'optimisation
   */
  optimiserTournees: async (requestData) => {
    try {
      console.log('📤 Requête optimisation:', requestData);
      console.log('📊 Types des paramètres:', {
        organisationId: typeof requestData.organisationId,
        vehiculesIds: Array.isArray(requestData.vehiculesIds) ? 'array' : typeof requestData.vehiculesIds,
        depotId: typeof requestData.depotId,
        tempsMaxParTrajet: typeof requestData.tempsMaxParTrajet
      });

      const response = await api.post('/api/optimisation/optimiser', requestData);
      
      console.log('✅ Optimisation réussie:', {
        nombreItineraires: response.data.nombreItineraires,
        nombrePoints: response.data.nombrePointsCollectes,
        distanceTotale: response.data.distanceTotale,
        scoreEfficacite: response.data.scoreEfficacite
      });

      return response.data;
    } catch (err) {
      console.error('❌ Erreur optimiserTournees:', {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message
      });

      // Enrichir l'erreur pour le frontend
      if (err.response?.data) {
        const error = new Error(err.response.data.message || 'Erreur lors de l\'optimisation');
        error.response = err.response;
        throw error;
      }
      
      throw err;
    }
  },

  /**
   * Récupérer l'historique des optimisations
   */
  getHistorique: async () => {
    try {
      const response = await api.get('/api/optimisation/historique');
      console.log('✅ Historique récupéré:', response.data);
      return response.data;
    } catch (err) {
      console.error('❌ Erreur getHistorique:', err.response?.data || err.message);
      throw err;
    }
  },

  /**
   * Récupérer les détails d'une optimisation spécifique
   */
  getById: async (optimisationId) => {
    try {
      const response = await api.get(`/api/optimisation/${optimisationId}`);
      console.log('✅ Optimisation récupérée:', response.data);
      return response.data;
    } catch (err) {
      console.error('❌ Erreur getById optimisation:', err.response?.data || err.message);
      throw err;
    }
  }
};

// ============= ITINÉRAIRES =============
export const itineraireApi = {
  /**
   * Récupérer tous les itinéraires de l'organisation
   */
  getAll: async () => {
    try {
      const response = await api.get('/api/itineraires');
      console.log('✅ Itinéraires récupérés:', response.data);
      return response.data;
    } catch (err) {
      console.error('❌ Erreur getAll itineraires:', err.response?.data || err.message);
      throw err;
    }
  },

  /**
   * Récupérer un itinéraire par son ID
   */
  getById: async (id) => {
    try {
      const response = await api.get(`/api/itineraires/${id}`);
      console.log('✅ Itinéraire récupéré:', response.data);
      return response.data;
    } catch (err) {
      console.error('❌ Erreur getById itineraire:', err.response?.data || err.message);
      throw err;
    }
  },

  /**
   * Mettre à jour le statut d'un itinéraire
   * @param {string} id - GUID de l'itinéraire
   * @param {string} statut - 'EnAttente' | 'EnCours' | 'Termine' | 'Annule'
   */
  updateStatut: async (id, statut) => {
    try {
      console.log('📤 Mise à jour statut itinéraire:', id, statut);
      const response = await api.patch(`/api/itineraires/${id}/statut`, { statut });
      console.log('✅ Statut mis à jour:', response.data);
      return response.data;
    } catch (err) {
      console.error('❌ Erreur updateStatut itineraire:', err.response?.data || err.message);
      throw err;
    }
  },

  /**
   * Démarrer un itinéraire
   */
  demarrer: async (id) => {
    try {
      console.log('📤 Démarrage itinéraire:', id);
      const response = await api.post(`/api/itineraires/${id}/demarrer`);
      console.log('✅ Itinéraire démarré:', response.data);
      return response.data;
    } catch (err) {
      console.error('❌ Erreur demarrer itineraire:', err.response?.data || err.message);
      throw err;
    }
  },

  /**
   * Terminer un itinéraire
   */
  terminer: async (id) => {
    try {
      console.log('📤 Fin itinéraire:', id);
      const response = await api.post(`/api/itineraires/${id}/terminer`);
      console.log('✅ Itinéraire terminé:', response.data);
      return response.data;
    } catch (err) {
      console.error('❌ Erreur terminer itineraire:', err.response?.data || err.message);
      throw err;
    }
  },

  /**
   * Annuler un itinéraire
   */
  annuler: async (id) => {
    try {
      console.log('📤 Annulation itinéraire:', id);
      const response = await api.post(`/api/itineraires/${id}/annuler`);
      console.log('✅ Itinéraire annulé:', response.data);
      return response.data;
    } catch (err) {
      console.error('❌ Erreur annuler itineraire:', err.response?.data || err.message);
      throw err;
    }
  },

  /**
   * Supprimer un itinéraire
   */
  delete: async (id) => {
    try {
      console.log('📤 Suppression itinéraire:', id);
      await api.delete(`/api/itineraires/${id}`);
      console.log('✅ Itinéraire supprimé');
      return true;
    } catch (err) {
      console.error('❌ Erreur delete itineraire:', err.response?.data || err.message);
      throw err;
    }
  },

  /**
   * Récupérer les itinéraires par statut
   */
  getByStatut: async (statut) => {
    try {
      const response = await api.get(`/api/itineraires/statut/${statut}`);
      console.log(`✅ Itinéraires ${statut} récupérés:`, response.data);
      return response.data;
    } catch (err) {
      console.error(`❌ Erreur getByStatut ${statut}:`, err.response?.data || err.message);
      throw err;
    }
  }
};

// ============= ORGANISATIONS =============
export const organisationApi = {
  /**
   * Récupérer toutes les organisations (admin uniquement)
   */
  getAll: async () => {
    try {
      const response = await api.get('/api/organisations');
      console.log('✅ Organisations récupérées:', response.data);
      return response.data;
    } catch (err) {
      console.error('❌ Erreur getAll organisations:', err.response?.data || err.message);
      throw err;
    }
  },

  /**
   * Récupérer une organisation par son ID
   */
  getById: async (id) => {
    try {
      const response = await api.get(`/api/organisations/${id}`);
      console.log('✅ Organisation récupérée:', response.data);
      return response.data;
    } catch (err) {
      console.error('❌ Erreur getById organisation:', err.response?.data || err.message);
      throw err;
    }
  },

  /**
   * Mettre à jour une organisation
   */
  update: async (id, data) => {
    try {
      console.log('📤 Mise à jour organisation:', id, data);
      const response = await api.put(`/api/organisations/${id}`, data);
      console.log('✅ Organisation mise à jour:', response.data);
      return response.data;
    } catch (err) {
      console.error('❌ Erreur update organisation:', err.response?.data || err.message);
      throw err;
    }
  },

  /**
   * Récupérer les statistiques de l'organisation
   */
  getStatistiques: async (id) => {
    try {
      const response = await api.get(`/api/organisations/${id}/statistiques`);
      console.log('✅ Statistiques récupérées:', response.data);
      return response.data;
    } catch (err) {
      console.error('❌ Erreur getStatistiques:', err.response?.data || err.message);
      throw err;
    }
  }
};

// ============= POINTS DE DÉCHETS =============
export const pointDechetApi = {
  /**
   * Récupérer tous les points de déchets
   */
  getAll: async () => {
    try {
      const response = await api.get('/api/pointdechet');
      console.log('✅ Points de déchets récupérés:', response.data);
      return response.data;
    } catch (err) {
      console.error('❌ Erreur getAll points:', err.response?.data || err.message);
      throw err;
    }
  },

  /**
   * Récupérer les points par zone géographique
   */
  getByZone: async (zone) => {
    try {
      const response = await api.get(`/api/pointdechet/zone/${encodeURIComponent(zone)}`);
      console.log(`✅ Points zone ${zone} récupérés:`, response.data);
      return response.data;
    } catch (err) {
      console.error(`❌ Erreur getByZone ${zone}:`, err.response?.data || err.message);
      throw err;
    }
  },

  /**
   * Récupérer les points par statut
   */
  getByStatut: async (statut) => {
    try {
      const response = await api.get(`/api/pointdechet/statut/${statut}`);
      console.log(`✅ Points ${statut} récupérés:`, response.data);
      return response.data;
    } catch (err) {
      console.error(`❌ Erreur getByStatut ${statut}:`, err.response?.data || err.message);
      throw err;
    }
  },

  /**
   * Mettre à jour le statut d'un point de déchet
   */
  updateStatut: async (id, statut) => {
    try {
      console.log('📤 Mise à jour statut point:', id, statut);
      const response = await api.patch(`/api/pointdechet/${id}/statut`, { statut });
      console.log('✅ Statut point mis à jour:', response.data);
      return response.data;
    } catch (err) {
      console.error('❌ Erreur updateStatut point:', err.response?.data || err.message);
      throw err;
    }
  }
};

// ============= UTILITAIRES =============

/**
 * Convertir des minutes en format TimeSpan "HH:mm:ss"
 */
export const convertMinutesToTimeSpan = (minutes) => {
  const heures = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${heures.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:00`;
};

/**
 * Convertir un TimeSpan "HH:mm:ss" en minutes
 */
export const convertTimeSpanToMinutes = (timeSpan) => {
  if (!timeSpan) return 0;
  const [heures, minutes] = timeSpan.split(':').map(Number);
  return (heures * 60) + minutes;
};

/**
 * Formater une distance en km avec 2 décimales
 */
export const formatDistance = (distance) => {
  return `${distance.toFixed(2)} km`;
};

/**
 * Formater un volume en kg
 */
export const formatVolume = (volume) => {
  return `${volume.toFixed(1)} kg`;
};

/**
 * Formater une durée au format HH:mm
 */
export const formatDuree = (timeSpan) => {
  if (!timeSpan) return '00:00';
  const [heures, minutes] = timeSpan.split(':');
  return `${heures}h${minutes}`;
};

export default {
  depotApi,
  vehiculeApi,
  optimisationApi,
  itineraireApi,
  organisationApi,
  pointDechetApi,
  convertMinutesToTimeSpan,
  convertTimeSpanToMinutes,
  formatDistance,
  formatVolume,
  formatDuree
};