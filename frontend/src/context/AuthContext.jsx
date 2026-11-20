import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as api from '../api/services.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(localStorage.getItem('token')));

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setUser(null);
  }, []);

  useEffect(() => {
    if (!localStorage.getItem('token')) return;
    api
      .getMe()
      .then((res) => setUser(res.user))
      .catch(logout)
      .finally(() => setLoading(false));
  }, [logout]);

  useEffect(() => {
    window.addEventListener('auth:expired', logout);
    return () => window.removeEventListener('auth:expired', logout);
  }, [logout]);

  const login = useCallback(async (email, password) => {
    const res = await api.login({ email, password });
    localStorage.setItem('token', res.token);
    setUser(res.user);
    return res.user;
  }, []);

  const setSession = useCallback((res) => {
    localStorage.setItem('token', res.token);
    setUser(res.user);
  }, []);

  const value = useMemo(() => ({ user, loading, login, logout, setSession }), [user, loading, login, logout, setSession]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
