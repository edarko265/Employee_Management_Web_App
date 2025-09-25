import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000', // Update if backend runs on a different port
  withCredentials: false,
});

// Automatically attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token'); // or sessionStorage if you prefer
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// GET /admin/stats
export const getAdminStats = async () => {
  const response = await api.get('/admin/stats');
  return response.data;
};

// POST /employee/upload-profile-picture
export const uploadProfilePicture = async (profilePicFile: File) => {
  const formData = new FormData();
  formData.append("file", profilePicFile);
  const token = localStorage.getItem('token');
  await api.post("/employee/upload-profile-picture", formData, {
    headers: {
      'Authorization': token ? `Bearer ${token}` : ''
    }
  });
};

export default api;
