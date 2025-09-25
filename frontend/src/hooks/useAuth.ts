import { useEffect, useState } from 'react';
import api from '../lib/api';
import { useNavigate } from 'react-router-dom';

export function useAuth() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/auth/login', { email, password });
      const { access_token, user } = res.data;

      localStorage.setItem('token', access_token);
      localStorage.setItem('user', JSON.stringify(user));

      // Start silent refresh interval
      startSilentRefresh();

      // Redirect based on role
      if (user.role === 'ADMIN') navigate('/admin-dashboard');
      else if (user.role === 'SUPERVISOR') navigate('/supervisor-dashboard');
      else navigate('/employee-dashboard');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    try {
      await api.post('/auth/logout', { userId: user?.id });
    } catch (err) {
      console.warn('Logout failed on server, clearing client data anyway.');
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      // Clear silent refresh interval
      if (refreshInterval) clearInterval(refreshInterval);

      navigate('/login');
    }
  };

  const validateToken = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token');
      const res = await api.post('/auth/validate-token', { token });
      return res.data?.valid;
    } catch (err) {
      return false;
    }
  };

  const refreshToken = async () => {
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (!token || !user?.id) throw new Error('Missing token or user ID');

      const res = await api.post('/auth/refresh-token', {
        token,
        userId: user.id,
      });

      localStorage.setItem('token', res.data.access_token);
      return res.data.access_token;
    } catch (err) {
      console.error('Refresh token failed');
      logout(); // force logout if refresh fails
    }
  };

  const startSilentRefresh = () => {
    // Clear any existing interval
    if (refreshInterval) clearInterval(refreshInterval);

    // Set new interval for every 13 minutes
    const interval = setInterval(() => {
      refreshToken();
    }, 13 * 60 * 1000);

    setRefreshInterval(interval);
  };

  // Auto-start silent refresh if already logged in
  useEffect(() => {
    const user = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (user && token) {
      startSilentRefresh();
    }

    return () => {
      if (refreshInterval) clearInterval(refreshInterval);
    };
  }, []);

  const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user') as string) : null;

  return {
    login,
    logout,
    refreshToken,
    validateToken,
    loading,
    error,
    user,
  };
}
