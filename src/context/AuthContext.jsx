import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('agenda-user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem('agenda-token') || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      localStorage.setItem('agenda-user', JSON.stringify(user));
    } else {
      localStorage.removeItem('agenda-user');
    }
  }, [user]);

  useEffect(() => {
    if (token) {
      localStorage.setItem('agenda-token', token);
    } else {
      localStorage.removeItem('agenda-token');
    }
  }, [token]);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al iniciar sesión');

      setUser(data.user);
      setToken(data.token);
      return data.user;
    } catch (err) {
      setError(err.message || 'No se pudo iniciar sesión en PostgreSQL');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password, role = 'user', avatar_url = '') => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role, avatar_url }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al registrar usuario');

      setUser(data.user);
      setToken(data.token);
      return data.user;
    } catch (err) {
      setError(err.message || 'No se pudo registrar el usuario en PostgreSQL');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('agenda-user');
    localStorage.removeItem('agenda-token');
  };

  const loginAsDemo = (roleType = 'admin') => {
    if (roleType === 'admin') {
      login('admin@agenda.com', 'admin123').catch(() => {});
    } else {
      login('carlos@agenda.com', 'user123').catch(() => {});
    }
  };

  const isAdmin = user?.role === 'admin';
  const isUser = user?.role === 'user';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        isAdmin,
        isUser,
        login,
        register,
        logout,
        loginAsDemo,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
}