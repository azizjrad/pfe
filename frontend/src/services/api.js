import axios from "axios";

// Get API URL from environment variable (fallback to localhost for development)
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

// Configuration de l'instance axios
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: false, // Set to true if using cookies
});

// Intercepteur pour ajouter le token à chaque requête
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Intercepteur pour gérer les erreurs d'authentification
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token invalide ou expiré
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

// ==================== Authentication Services ====================

export const authService = {
  /**
   * Inscription d'un nouvel utilisateur
   */
  register: async (userData) => {
    const response = await api.post("/register", userData);
    if (response.data.access_token) {
      localStorage.setItem("token", response.data.access_token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
    }
    return response.data;
  },

  /**
   * Connexion d'un utilisateur
   */
  login: async (credentials) => {
    const response = await api.post("/login", credentials);
    if (response.data.access_token) {
      localStorage.setItem("token", response.data.access_token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
    }
    return response.data;
  },

  /**
   * Déconnexion de l'utilisateur
   */
  logout: async () => {
    try {
      await api.post("/logout");
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  },

  /**
   * Récupérer l'utilisateur authentifié depuis l'API
   */
  getUser: async () => {
    const response = await api.get("/user");
    // L'API retourne {user: {...}}, on extrait l'objet user
    const userData = response.data.user;
    localStorage.setItem("user", JSON.stringify(userData));
    return userData;
  },

  /**
   * Vérifier si l'utilisateur est connecté
   */
  isAuthenticated: () => {
    return !!localStorage.getItem("token");
  },

  /**
   * Récupérer l'utilisateur depuis le localStorage
   */
  getCurrentUser: () => {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  },

  /**
   * Mettre à jour le profil de l'utilisateur
   */
  updateProfile: async (profileData) => {
    const response = await api.put("/profile", profileData);
    // Update localStorage with new user data
    if (response.data.user) {
      localStorage.setItem("user", JSON.stringify(response.data.user));
    }
    return response.data;
  },
};

// ==================== Reservation Services ====================

export const reservationService = {
  getAll: () => api.get("/reservations"),
  getById: (id) => api.get(`/reservations/${id}`),
  create: (data) => api.post("/reservations", data),
  update: (id, data) => api.put(`/reservations/${id}`, data),
  delete: (id) => api.delete(`/reservations/${id}`),
};

// ==================== Vehicle Services ====================

export const vehicleService = {
  getAll: () => api.get("/vehicles"),
  getById: (id) => api.get(`/vehicles/${id}`),
  create: (data) => api.post("/vehicles", data),
  update: (id, data) => api.put(`/vehicles/${id}`, data),
  delete: (id) => api.delete(`/vehicles/${id}`),
};

// ==================== Agency Services ====================

export const agencyService = {
  getAll: () => api.get("/agencies"),
  getById: (id) => api.get(`/agencies/${id}`),
  create: (data) => api.post("/agencies", data),
  update: (id, data) => api.put(`/agencies/${id}`, data),
  delete: (id) => api.delete(`/agencies/${id}`),
};

export default api;
