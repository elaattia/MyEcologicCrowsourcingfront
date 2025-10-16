//service/ApiService
/*import AuthService from './AuthService';

const API_BASE = 'http://localhost:5008/api';

const ApiService = {
  async signalWaste(imageFile, latitude, longitude) {
    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('latitude', latitude.toString());
    formData.append('longitude', longitude.toString());

    const response = await fetch(`${API_BASE}/pointdechet/signaler`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${AuthService.getToken()}`,
      },
      body: formData,
    });

    if (!response.ok) throw new Error('Échec du signalement');
    return response.json();
  },

  async getMyWastes() {
    return [];
  },
};

export default ApiService;
*/