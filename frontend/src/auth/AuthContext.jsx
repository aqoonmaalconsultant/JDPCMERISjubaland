import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api, clearAuthSession, updateStoredUser } from '../api/client.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('jdpcmeris_user');
    return stored ? JSON.parse(stored) : null;
  });

  const login = async ({ email, password }) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('jdpcmeris_access_token', data.accessToken);
    localStorage.setItem('jdpcmeris_refresh_token', data.refreshToken);
    updateStoredUser(data.user);
    setUser(data.user);
    return data.user;
  };

  const logout = async () => {
    const refreshToken = localStorage.getItem('jdpcmeris_refresh_token');
    if (refreshToken) {
      await api.post('/auth/logout', { refreshToken }).catch(() => null);
    }
    clearAuthSession();
    setUser(null);
  };

  useEffect(() => {
    const handleAuthCleared = () => setUser(null);
    const handleUserUpdated = (event) => setUser(event.detail);
    window.addEventListener('jdpcmeris_auth_cleared', handleAuthCleared);
    window.addEventListener('jdpcmeris_user_updated', handleUserUpdated);
    return () => {
      window.removeEventListener('jdpcmeris_auth_cleared', handleAuthCleared);
      window.removeEventListener('jdpcmeris_user_updated', handleUserUpdated);
    };
  }, []);

  useEffect(() => {
    if (!localStorage.getItem('jdpcmeris_access_token')) return;

    let cancelled = false;
    api.get('/auth/me')
      .then(({ data }) => {
        if (!cancelled) updateStoredUser(data.user);
      })
      .catch(() => null);

    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo(() => ({
    user,
    isAuthenticated: Boolean(user && localStorage.getItem('jdpcmeris_access_token')),
    login,
    logout
  }), [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
}
