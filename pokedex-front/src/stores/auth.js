import { defineStore } from 'pinia';
import api from '../services/api';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || null,
    user: JSON.parse(localStorage.getItem('user')) || null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    isAdmin: (state) => state.user?.role === 'admin',
  },

  actions: {
    async login(identifier, password) {
      const payload = identifier.includes('@')
        ? { email: identifier, password }
        : { username: identifier, password };

      const response = await api.post('/auth/login', payload);
      const data = response.data;

      this.token = data.token;
      this.user = { userId: data.userId, username: data.username, role: data.role };

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(this.user));

      // Ajouter le token à toutes les futures requêtes
      api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;

      return data;
    },

    async register(username, email, password) {
      await api.post('/auth/register', { username, email, password });
    },

    logout() {
      this.token = null;
      this.user = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      delete api.defaults.headers.common['Authorization'];
    },

    initAuth() {
      if (this.token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${this.token}`;
      }
    },
  },
});
