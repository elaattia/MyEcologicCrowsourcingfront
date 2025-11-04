// src/services/api/wasteApi.js
import axios from './axiosConfig';

const API_URL = '/api/pointdechet';

/**
 * Récupère le token JWT stocké
 */
const getToken = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error("Utilisateur non connecté. Veuillez vous reconnecter.");
  }
  return token;
};

/**
 * Signaler un déchet avec image et localisation
 */
const signalWaste = async (imageFile, latitude, longitude, wasteData = null) => {
  const token = getToken();

  const formData = new FormData();
  formData.append('Image', imageFile);
  formData.append('Latitude', latitude.toString());
  formData.append('Longitude', longitude.toString());

  try {
    const response = await axios.post(`${API_URL}/signaler`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (err) {
    console.error('Erreur signalWaste:', err.response?.data || err.message);
    throw new Error(err.response?.data?.message || 'Erreur lors du signalement');
  }
};

/**
 * Récupérer les statistiques globales
 */
const getStatistics = async (params = {}) => {
  const token = getToken();

  try {
    const response = await axios.get(`${API_URL}/statistiques`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      params: params
    });
    return response.data;
  } catch (err) {
    console.error('Erreur getStatistics:', err.response?.data || err.message);
    throw new Error(err.response?.data?.message || 'Erreur lors de la récupération des statistiques');
  }
};

/**
 * Récupérer MES statistiques
 */
const getMyStatistics = async (dateDebut = null, dateFin = null) => {
  const token = getToken();

  try {
    const params = {};
    if (dateDebut) params.dateDebut = dateDebut;
    if (dateFin) params.dateFin = dateFin;

    const response = await axios.get(`${API_URL}/mes-statistiques`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      params: params
    });
    return response.data;
  } catch (err) {
    console.error('Erreur getMyStatistics:', err);
    throw new Error(err.response?.data?.message || 'Erreur lors de la récupération de vos statistiques');
  }
};

/**
 * Récupérer tous les points de déchets (avec filtres)
 */
const getAllWastes = async (filters = {}) => {
  const token = getToken();

  try {
    const response = await axios.get(API_URL, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      params: {
        Page: filters.page || 1,
        PageSize: filters.pageSize || 10,
        Search: filters.search || '',
        Statut: filters.statut || '',
        Type: filters.type || '',
        Pays: filters.pays || '',
        Zone: filters.zone || '',
        DateDebut: filters.dateDebut || '',
        DateFin: filters.dateFin || '',
        SortBy: filters.sortBy || 'Date',
        Descending: filters.descending !== undefined ? filters.descending : true
      }
    });
    return response.data;
  } catch (err) {
    console.error('Erreur getAllWastes:', err);
    throw new Error(err.response?.data?.message || 'Erreur lors de la récupération des déchets');
  }
};

/**
 * Récupérer MES déchets signalés
 */
const getMyWastes = async (filters = {}) => {
  const token = getToken();

  try {
    const response = await axios.get(`${API_URL}/mes-dechets`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      params: {
        Page: filters.page || 1,
        PageSize: filters.pageSize || 10,
        Search: filters.search || '',
        Statut: filters.statut || '',
        Type: filters.type || '',
        SortBy: filters.sortBy || 'Date',
        Descending: filters.descending !== undefined ? filters.descending : true
      }
    });
    return response.data;
  } catch (err) {
    console.error('Erreur getMyWastes:', err);
    throw new Error(err.response?.data?.message || 'Erreur lors de la récupération de vos déchets');
  }
};

/**
 * Récupérer un point de déchet par ID
 */
const getWasteById = async (id) => {
  const token = getToken();

  try {
    const response = await axios.get(`${API_URL}/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    });
    return response.data;
  } catch (err) {
    console.error('Erreur getWasteById:', err);
    throw new Error(err.response?.data?.message || 'Erreur lors de la récupération du déchet');
  }
};

/**
 * Vérifier si une recommandation est disponible
 */
const checkRecommendation = async (pointDechetId) => {
  const token = getToken();

  try {
    const response = await axios.get(`${API_URL}/${pointDechetId}/check-recommandation`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    });
    return response.data;
  } catch (err) {
    console.error('Erreur checkRecommendation:', err);
    throw new Error(err.response?.data?.message || 'Erreur lors de la vérification de la recommandation');
  }
};

/**
 * Télécharger les statistiques (CSV/JSON/Excel)
 */
const downloadStatistics = async (format = 'csv', params = {}) => {
  const token = getToken();

  try {
    const response = await axios.get(`${API_URL}/statistiques/telecharger`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      params: {
        ...params,
        format: format
      },
      responseType: 'blob'
    });

    // Créer un lien de téléchargement
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `statistiques_${new Date().toISOString().split('T')[0]}.${format}`);
    document.body.appendChild(link);
    link.click();
    link.remove();

    return true;
  } catch (err) {
    console.error('Erreur downloadStatistics:', err);
    throw new Error('Erreur lors du téléchargement des statistiques');
  }
};

export default {
  signalWaste,
  getStatistics,
  getMyStatistics,
  getAllWastes,
  getMyWastes,
  getWasteById,
  checkRecommendation,
  downloadStatistics
};