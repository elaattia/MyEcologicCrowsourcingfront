// src/services/api/wasteApi.js
import axios from './axiosConfig';

const API_URL = '/api/pointdechet';

/**
 * Vérifie si le token JWT est présent
 * @returns {string|null} token
 */
const getToken = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error("Utilisateur non connecté. Veuillez vous reconnecter.");
  }
  return token;
};

const signalWaste = async (imageFile, latitude, longitude) => {
  const token = getToken();

  const formData = new FormData();
  formData.append('Image', imageFile);
  formData.append('Latitude', latitude);
  formData.append('Longitude', longitude);

  try {
    const response = await axios.post(`${API_URL}/signaler`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (err) {
    console.error('Erreur signalWaste:', err);
    throw err;
  }
};


const getStatistics = async () => {
  const token = getToken();

  try {
    const response = await axios.get(`${API_URL}/statistics`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (err) {
    console.error('Erreur getStatistics:', err);
    throw err;
  }
};

export default {
  signalWaste,
  getStatistics,
};
