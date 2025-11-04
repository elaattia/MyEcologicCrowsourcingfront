// src/pages/LoginPage.jsx
import React, { useState } from 'react';
import { MapPin, Building2, User, Mail, Lock, Users, Loader } from 'lucide-react';
import AuthService from '../services/auth/AuthService';

const LoginPage = ({ onNavigate, onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [accountType, setAccountType] = useState('User'); // 'User' ou 'Organisation'
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    username: '',
    nom: '',
    nbrVolontaires: '',
    repreUsername: '',
    repreEmail: '',
    reprePassword: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        // LOGIN
        const data = await AuthService.login(formData.email, formData.password);
        onLogin(data);
      } else {
        // SIGNUP
        if (accountType === 'User') {
          if (formData.password !== formData.confirmPassword) {
            throw new Error('Les mots de passe ne correspondent pas');
          }
          const data = await AuthService.signupUser({
            email: formData.email,
            username: formData.username,
            password: formData.password
          });
          onLogin(data);
        } else {
          // Organisation
          if (!formData.nom || !formData.nbrVolontaires || !formData.repreUsername || 
              !formData.repreEmail || !formData.reprePassword) {
            throw new Error('Veuillez remplir tous les champs');
          }
          const data = await AuthService.signupOrganisation({
            nom: formData.nom,
            nbrVolontaires: formData.nbrVolontaires,
            repreUsername: formData.repreUsername,
            repreEmail: formData.repreEmail,
            reprePassword: formData.reprePassword
          });
          onLogin(data);
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-cyan-50 to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-2xl">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="bg-gradient-to-br from-emerald-400 to-cyan-500 p-2 rounded-xl">
              <MapPin className="text-white" size={32} />
            </div>
            <span className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
              EcoMap
            </span>
          </div>
          <h2 className="text-3xl font-bold mb-2">
            {isLogin ? 'Connexion' : 'Créer un compte'}
          </h2>
          <p className="text-gray-600">
            {isLogin 
              ? 'Connectez-vous à votre espace' 
              : accountType === 'User' 
                ? 'Rejoignez notre communauté de citoyens' 
                : 'Créez votre espace organisation'}
          </p>
        </div>

        {/* Toggle Login/Signup */}
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

        {/* Toggle User/Organisation (signup only) */}
        {!isLogin && (
          <div className="flex gap-2 mb-6 border-2 border-gray-200 rounded-xl p-1">
            <button
              onClick={() => setAccountType('User')}
              className={`flex-1 py-2 rounded-lg transition flex items-center justify-center gap-2 ${
                accountType === 'User' 
                  ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-lg' 
                  : 'bg-transparent text-gray-600'
              }`}
            >
              <User size={18} />
              Citoyen
            </button>
            <button
              onClick={() => setAccountType('Organisation')}
              className={`flex-1 py-2 rounded-lg transition flex items-center justify-center gap-2 ${
                accountType === 'Organisation' 
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg' 
                  : 'bg-transparent text-gray-600'
              }`}
            >
              <Building2 size={18} />
              Organisation
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* FORMULAIRE USER (Login + Signup) */}
          {(isLogin || accountType === 'User') && (
            <>
              {!isLogin && (
                <InputField 
                  icon={<User />} 
                  label="Nom complet"
                  value={formData.username}
                  onChange={(v) => setFormData({ ...formData, username: v })}
                  required
                />
              )}
              <InputField 
                icon={<Mail />} 
                label="Email" 
                type="email"
                value={formData.email}
                onChange={(v) => setFormData({ ...formData, email: v })}
                required
              />
              <InputField 
                icon={<Lock />} 
                label="Mot de passe" 
                type="password"
                value={formData.password}
                onChange={(v) => setFormData({ ...formData, password: v })}
                required
              />
              {!isLogin && (
                <InputField 
                  icon={<Lock />} 
                  label="Confirmer mot de passe" 
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(v) => setFormData({ ...formData, confirmPassword: v })}
                  required
                />
              )}
            </>
          )}

          {/* FORMULAIRE ORGANISATION (Signup only) */}
          {!isLogin && accountType === 'Organisation' && (
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-xl border-2 border-blue-200">
                <h3 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
                  <Building2 size={20} />
                  Informations organisation
                </h3>
                <InputField 
                  icon={<Building2 />} 
                  label="Nom de l'organisation"
                  value={formData.nom}
                  onChange={(v) => setFormData({ ...formData, nom: v })}
                  required
                />
                <InputField 
                  icon={<Users />} 
                  type="number" 
                  label="Nombre de volontaires"
                  value={formData.nbrVolontaires}
                  onChange={(v) => setFormData({ ...formData, nbrVolontaires: v })}
                  required
                  min="1"
                />
              </div>

              <div className="bg-purple-50 p-4 rounded-xl border-2 border-purple-200">
                <h3 className="font-bold text-purple-900 mb-3 flex items-center gap-2">
                  <User size={20} />
                  Compte représentant
                </h3>
                <InputField 
                  icon={<User />} 
                  label="Nom du représentant"
                  value={formData.repreUsername}
                  onChange={(v) => setFormData({ ...formData, repreUsername: v })}
                  required
                />
                <InputField 
                  icon={<Mail />} 
                  label="Email du représentant"
                  type="email"
                  value={formData.repreEmail}
                  onChange={(v) => setFormData({ ...formData, repreEmail: v })}
                  required
                />
                <InputField 
                  icon={<Lock />} 
                  type="password" 
                  label="Mot de passe"
                  value={formData.reprePassword}
                  onChange={(v) => setFormData({ ...formData, reprePassword: v })}
                  required
                />
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2">
              <span>⚠️</span>
              <p className="text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-xl font-bold text-lg hover:shadow-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader className="animate-spin" size={20} />
                Chargement...
              </>
            ) : isLogin ? (
              'Se connecter'
            ) : (
              'Créer mon compte'
            )}
          </button>
        </form>

        <button 
          onClick={() => onNavigate('welcome')}
          className="w-full mt-4 text-gray-600 hover:text-gray-800 transition"
        >
          ← Retour à l'accueil
        </button>
      </div>
    </div>
  );
};

const InputField = ({ label, icon, onChange, ...props }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{icon}</span>
      <input
        {...props}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition"
      />
    </div>
  </div>
);

export default LoginPage;