// src/pages/LoginPage.jsx
import React, { useState } from 'react';
import AuthService from '../services/auth/AuthService';
import { MapPin } from 'lucide-react';

const LoginPage = ({ onNavigate, onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    confirmPassword: '',
    accountType: 'User'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const response = await AuthService.login(formData.email, formData.password);
        onLogin(response.user); 
      } else {
        if (formData.password !== formData.confirmPassword) {
          setError('Les mots de passe ne correspondent pas');
          setLoading(false);
          return;
        }

        const userData = {
          email: formData.email,
          username: formData.username,
          password: formData.password,
          role: formData.accountType === 'User' ? 0 : 1
        };

        await AuthService.signup(userData);

        const response = await AuthService.login(formData.email, formData.password);
        onLogin(response.user); 
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-cyan-50 to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="bg-gradient-to-br from-emerald-400 to-cyan-500 p-2 rounded-xl">
              <MapPin className="text-white" size={32} />
            </div>
            <span className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
              EcoMap
            </span>
          </div>
          <h2 className="text-3xl font-bold mb-2">Bienvenue</h2>
          <p className="text-gray-600">Connectez-vous ou créez votre compte pour commencer</p>
        </div>

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-3 rounded-xl font-medium transition ${
              isLogin ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'
            }`}
          >
            Connexion
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-3 rounded-xl font-medium transition ${
              !isLogin ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'
            }`}
          >
            Inscription
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Type de compte</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, accountType: 'User' })}
                    className={`flex-1 py-3 rounded-xl font-medium transition ${
                      formData.accountType === 'User' ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    Citoyen
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, accountType: 'Organisation' })}
                    className={`flex-1 py-3 rounded-xl font-medium transition ${
                      formData.accountType === 'Organisation' ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    Organisation
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nom complet</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Jean Dupont"
                  required
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="nom@exemple.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mot de passe</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              required
            />
          </div>

          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Confirmer le mot de passe</label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                required
              />
            </div>
          )}

          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm">{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-xl font-bold hover:shadow-lg transition disabled:opacity-50"
          >
            {loading ? 'Chargement...' : isLogin ? 'Se connecter' : 'Créer mon compte'}
          </button>
        </form>

        <button
          onClick={() => onNavigate('welcome')}
          className="w-full mt-4 text-gray-600 hover:text-gray-800"
        >
          ← Retour à l'accueil
        </button>
      </div>
    </div>
  );
};

export default LoginPage;
