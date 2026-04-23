import { createContext, useContext, useEffect, useState } from 'react';
import api from '../services/api';

const AuthContext = createContext();

// Demo accounts for offline/demo mode (when backend is not running)
const DEMO_ACCOUNTS = {
  'admin@swiftpos.com': {
    id: 'demo-admin-001',
    name: 'Admin User',
    email: 'admin@swiftpos.com',
    role: 'admin',
    avatar: null,
    password: 'admin123',
  },
  'cashier@swiftpos.com': {
    id: 'demo-cashier-001',
    name: 'Jane Cashier',
    email: 'cashier@swiftpos.com',
    role: 'cashier',
    avatar: null,
    password: 'cashier123',
  },
};

const DEMO_TOKEN = 'demo-mode-token';

function getDemoUser(email, password) {
  const account = DEMO_ACCOUNTS[email];
  if (!account) return null;
  if (account.password !== password) return null;
  const { password: _, ...user } = account;
  return user;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('swift-pos-token');
    if (token) {
      if (token === DEMO_TOKEN) {
        // Restore demo session
        const savedUser = localStorage.getItem('swift-pos-user');
        if (savedUser) {
          setUser(JSON.parse(savedUser));
        }
        setLoading(false);
      } else {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        fetchUser();
      }
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async (attempt = 0) => {
    try {
      const { data } = await api.get('/api/auth/me');
      setUser(data.user);
      setLoading(false);
    } catch (err) {
      const status = err.response?.status;

      // Real auth failure — token is genuinely bad. Clear it and go to login.
      if (status === 401) {
        localStorage.removeItem('swift-pos-token');
        localStorage.removeItem('swift-pos-user');
        delete api.defaults.headers.common['Authorization'];
        setUser(null);
        setLoading(false);
        return;
      }

      // Transient failure (network blip, Neon cold-start, rate limit, 5xx):
      // keep the token, retry in the background. Cap at 6 attempts (roughly
      // 30 seconds of total wait) before giving up and showing login.
      if (attempt < 6) {
        setTimeout(() => fetchUser(attempt + 1), 3000 + attempt * 1000);
        return;
      }

      console.warn('fetchUser: giving up after 6 transient failures, preserving token');
      setLoading(false); // stop showing the page loader; keep token so interceptor can retry on next API call
    }
  };

  const isBackendUnavailable = (error) =>
    !error.response || error.response.status === 500 || error.response.status === 502 || error.response.status === 503;

  const login = async (email, password) => {
    // Try backend first
    try {
      const { data } = await api.post('/api/auth/login', { email, password });
      localStorage.setItem('swift-pos-token', data.token);
      api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      setUser(data.user);
      return data;
    } catch (apiError) {
      // If backend is unavailable, fall back to demo mode
      if (isBackendUnavailable(apiError)) {
        const demoUser = getDemoUser(email, password);
        if (demoUser) {
          localStorage.setItem('swift-pos-token', DEMO_TOKEN);
          localStorage.setItem('swift-pos-user', JSON.stringify(demoUser));
          setUser(demoUser);
          return { user: demoUser, token: DEMO_TOKEN, demo: true };
        }
        throw new Error('Invalid email or password');
      }
      // If backend responded with a real error (401, 409, etc.), re-throw it
      throw apiError;
    }
  };

  const register = async (userData) => {
    try {
      const { data } = await api.post('/api/auth/register', userData);
      localStorage.setItem('swift-pos-token', data.token);
      api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      setUser(data.user);
      return data;
    } catch (apiError) {
      // If backend is unavailable, create a demo session
      if (isBackendUnavailable(apiError)) {
        const demoUser = {
          id: `demo-${Date.now()}`,
          name: userData.name,
          email: userData.email,
          role: 'admin',
          avatar: null,
        };
        localStorage.setItem('swift-pos-token', DEMO_TOKEN);
        localStorage.setItem('swift-pos-user', JSON.stringify(demoUser));
        setUser(demoUser);
        return { user: demoUser, token: DEMO_TOKEN, demo: true };
      }
      throw apiError;
    }
  };

  const logout = () => {
    localStorage.removeItem('swift-pos-token');
    localStorage.removeItem('swift-pos-user');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const updateProfile = async (updates) => {
    try {
      const { data } = await api.put('/api/auth/profile', updates);
      setUser(data.user);
      return data;
    } catch {
      // Demo mode: update locally
      const updated = { ...user, ...updates };
      localStorage.setItem('swift-pos-user', JSON.stringify(updated));
      setUser(updated);
      return { user: updated };
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    const isDemoMode = localStorage.getItem('swift-pos-token') === 'demo-mode-token';
    if (isDemoMode) {
      throw new Error('Password change is not available in demo mode. Log in with a real backend account.');
    }
    const { data } = await api.put('/api/auth/change-password', {
      currentPassword,
      newPassword,
    });
    return data;
  };

  const changePin = async (currentPassword, newPin) => {
    const isDemoMode = localStorage.getItem('swift-pos-token') === 'demo-mode-token';
    if (isDemoMode) {
      throw new Error('PIN change is not available in demo mode.');
    }
    const { data } = await api.put('/api/auth/change-pin', {
      currentPassword,
      newPin,
    });
    return data;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile, changePassword, changePin }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
