//src/content/AuthContent.jsx
import React, { createContext, useState, useContext } from 'react';


const AuthContext = createContext();


export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState({
    username: 'Utilisateur',
    email: 'ela.attia.pro@gmail.com',
    role: 0, 
  });

  const [token, setToken] = useState(null);

  const login = async (email, password) => {
    console.log('Connexion simulée avec:', email, password);
    setUser({ username: 'Ela Attia', email, role: 0 });
    setToken('fake-token');
  };

  const logout = () => {
    console.log('Déconnexion simulée');
    setUser(null);
    setToken(null);
  };

  const updateProfile = async (newData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        setUser((prev) => ({ ...prev, ...newData }));
        resolve();
      }, 1000);
    });
  };

  const value = {
    user,
    token,
    login,
    logout,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  return useContext(AuthContext);
};
