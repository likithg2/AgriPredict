import React, { createContext, useState, useEffect } from 'react';
import { authAPI } from '../utils/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedAdminWarehouseId, setSelectedAdminWarehouseId] = useState(() => {
    const saved = localStorage.getItem('selectedAdminWarehouseId');
    return saved ? parseInt(saved) : null;
  });

  const setAdminWarehouse = (id) => {
    setSelectedAdminWarehouseId(id);
    localStorage.setItem('selectedAdminWarehouseId', id);
  };

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        try {
          const storedUser = localStorage.getItem('user');
          if (storedUser) {
            setUser(JSON.parse(storedUser));
          } else {
            const res = await authAPI.getProfile();
            setUser(res.data);
            localStorage.setItem('user', JSON.stringify(res.data));
          }
        } catch (err) {
          console.error("Auth init failed", err);
          logout();
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = (token, userData) => {
    localStorage.setItem('auth_token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, selectedAdminWarehouseId, setAdminWarehouse }}>
      {children}
    </AuthContext.Provider>
  );
};
