//src/hooks/useAuth.js
import { useState } from 'react';

export function useAuth() {
  const [user, setUser] = useState(null); 
  const [loading, setLoading] = useState(false);

  const login = (userData) => {
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
    console.log('Déconnexion simulée');
  };

  const isAuthenticated = !!user;

  const updateProfile = async (newData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        setUser((prev) => ({ ...prev, ...newData }));
        resolve();
      }, 1000);
    });
  };

  return { user, login, logout, isAuthenticated, updateProfile, loading };
}
