import { create } from 'zustand';
import axiosClient from '../api/axiosClient';

export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  loading: true,
  error: null,

  checkAuth: async () => {
    set({ loading: true, error: null });
    
    // Extract token from URL query params if present (from Google OAuth callback redirect)
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get('token');
    if (urlToken) {
      localStorage.setItem('token', urlToken);
      // Clean up URL query parameters for security and aesthetics
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    }

    try {
      const response = await axiosClient.get('/auth/me');
      if (response.data?.success) {
        set({ user: response.data.user, isAuthenticated: true, loading: false });
      } else {
        localStorage.removeItem('token');
        set({ user: null, isAuthenticated: false, loading: false });
      }
    } catch (err) {
      localStorage.removeItem('token');
      set({ user: null, isAuthenticated: false, loading: false });
    }
  },

  register: async (name, email, password) => {
    set({ loading: true, error: null });
    try {
      const response = await axiosClient.post('/auth/register', { name, email, password });
      if (response.data?.success) {
        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
        }
        set({ user: response.data.user, isAuthenticated: true, loading: false });
        return { success: true };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed';
      set({ error: msg, loading: false });
      return { success: false, message: msg };
    }
  },

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const response = await axiosClient.post('/auth/login', { email, password });
      if (response.data?.success) {
        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
        }
        set({ user: response.data.user, isAuthenticated: true, loading: false });
        return { success: true };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed';
      set({ error: msg, loading: false });
      return { success: false, message: msg };
    }
  },

  logout: async () => {
    set({ loading: true });
    try {
      await axiosClient.post('/auth/logout');
    } catch (err) {
      // ignore
    } finally {
      localStorage.removeItem('token');
      set({ user: null, isAuthenticated: false, loading: false });
    }
  },

  setUser: (user) => {
    set({ user, isAuthenticated: !!user, loading: false });
  },
}));
