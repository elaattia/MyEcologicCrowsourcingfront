// src/context/AuthContext.jsx - VERSION CORRIGÉE
import React, { createContext, useState, useContext, useEffect } from 'react';
import AuthService from '../services/auth/AuthService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialiser l'utilisateur au chargement
  useEffect(() => {
    const initAuth = () => {
      const currentUser = AuthService.getCurrentUser();
      const currentToken = AuthService.getToken();
      
      if (currentUser && currentToken) {
        setUser(currentUser);
        setToken(currentToken);
      }
      
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const data = await AuthService.login(email, password);
      setUser({
        userId: data.userId,
        email: data.email,
        username: data.username,
        role: data.role,
        organisationId: data.organisationId
      });
      setToken(data.token);
      return data;
    } catch (error) {
      console.error('Erreur login:', error);
      throw error;
    }
  };

  const logout = () => {
    AuthService.logout();
    setUser(null);
    setToken(null);
  };

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
      }, 1000);
    });
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    updateProfile,
    isAuthenticated: !!token && !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;