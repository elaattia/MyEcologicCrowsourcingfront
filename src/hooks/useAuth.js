// src/hooks/useAuth.js - VERSION COMPLÈTE
import { useState, useEffect } from 'react';
import AuthService from '../services/auth/AuthService';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Charger l'utilisateur au montage
    const currentUser = AuthService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const userData = await AuthService.login(email, password);
      setUser(AuthService.getCurrentUser());
      return userData;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    AuthService.logout();
    setUser(null);
  };

  const isAuthenticated = !!user && AuthService.isAuthenticated();

  const updateProfile = async (newData) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          const updatedUser = { ...user, ...newData };
          setUser(updatedUser);
          localStorage.setItem('user', JSON.stringify(updatedUser));
          resolve();
        } catch (error) {
          reject(error);
        }
      }, 500);
    });
  };

  const isAdmin = user?.role === 2;
  const isRepresentant = user?.role === 1;
  const isCitoyen = user?.role === 0;

  return { 
    user, 
    login, 
    logout, 
    isAuthenticated, 
    updateProfile, 
    loading,
    isAdmin,
    isRepresentant,
    isCitoyen
  };
}