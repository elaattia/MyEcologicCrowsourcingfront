// src/pages/LoginPage.jsx - CORRECTION DE LA VALIDATION
import React, { useState } from 'react';
import { MapPin, Building2, User, Mail, Lock, Users, Loader, Shield, Eye, EyeOff } from 'lucide-react';
import AuthService from '../services/auth/AuthService';

const LoginPage = ({ onNavigate, onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [accountType, setAccountType] = useState('User'); // 'User', 'Organisation', 'Admin'
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    username: '',
    // Pour organisation
    nom: '',
    nbrVolontaires: '',
    repreUsername: '',
    repreEmail: '',
    reprePassword: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setFormData({
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
    setError('');
  };

  const handleToggleMode = (mode) => {
    setIsLogin(mode);
    resetForm();
  };

  const handleAccountTypeChange = (type) => {
    setAccountType(type);
    resetForm();
  };

  const validateForm = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // VALIDATION POUR LOGIN
    if (isLogin) {
      if (!formData.email || !formData.password) {
        setError('Email et mot de passe sont requis');
        return false;
      }

      if (!emailRegex.test(formData.email)) {
        setError('Format d\'email invalide');
        return false;
      }

      return true;
    }

    // VALIDATION POUR INSCRIPTION - USER/ADMIN
    if (accountType === 'User' || accountType === 'Admin') {
      if (!formData.email || !formData.password) {
        setError('Email et mot de passe sont requis');
        return false;
      }

      if (!emailRegex.test(formData.email)) {
        setError('Format d\'email invalide');
        return false;
      }

      if (!formData.username || formData.username.trim().length < 2) {
        setError('Le nom d\'utilisateur doit contenir au moins 2 caractères');
        return false;
      }

      if (formData.password.length < 6) {
        setError('Le mot de passe doit contenir au moins 6 caractères');
        return false;
      }

      if (formData.password !== formData.confirmPassword) {
        setError('Les mots de passe ne correspondent pas');
        return false;
      }

      return true;
    }

    // VALIDATION POUR INSCRIPTION - ORGANISATION
    if (accountType === 'Organisation') {
      // Vérifier les champs de l'organisation
      if (!formData.nom || formData.nom.trim().length < 2) {
        setError('Le nom de l\'organisation est requis (minimum 2 caractères)');
        return false;
      }

      if (!formData.nbrVolontaires || parseInt(formData.nbrVolontaires) < 1) {
        setError('Le nombre de volontaires doit être supérieur à 0');
        return false;
      }

      // Vérifier les champs du représentant
      if (!formData.repreUsername || formData.repreUsername.trim().length < 2) {
        setError('Le nom du représentant est requis (minimum 2 caractères)');
        return false;
      }

      if (!formData.repreEmail || !emailRegex.test(formData.repreEmail)) {
        setError('Email du représentant invalide');
        return false;
      }

      if (!formData.reprePassword || formData.reprePassword.length < 6) {
        setError('Le mot de passe du représentant doit contenir au moins 6 caractères');
        return false;
      }

      return true;
    }

    return false;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    console.log('🔍 Validation du formulaire...', {
      isLogin,
      accountType,
      formData: accountType === 'Organisation' ? {
        nom: formData.nom,
        nbrVolontaires: formData.nbrVolontaires,
        repreUsername: formData.repreUsername,
        repreEmail: formData.repreEmail,
        reprePassword: formData.reprePassword ? '***' : ''
      } : {
        email: formData.email,
        username: formData.username,
        password: formData.password ? '***' : ''
      }
    });

    if (!validateForm()) {
      console.error('❌ Validation échouée');
      return;
    }

    console.log('✅ Validation réussie, envoi à l\'API...');
    setLoading(true);

    try {
      if (isLogin) {
        // LOGIN
        console.log('🔐 Tentative de connexion...');
        const userData = await AuthService.login(formData.email, formData.password);
        console.log('✅ Connexion réussie, userData:', userData);
        onLogin(userData);
      } else {
        // SIGNUP
        let userData;
        
        if (accountType === 'User') {
          console.log('👤 Création compte User...');
          userData = await AuthService.signupUser({
            email: formData.email,
            username: formData.username,
            password: formData.password
          });
          console.log('✅ User créé, userData:', userData);
        } else if (accountType === 'Organisation') {
          console.log('🏢 Création organisation...');
          userData = await AuthService.signupOrganisation({
            nom: formData.nom,
            nbrVolontaires: parseInt(formData.nbrVolontaires, 10),
            repreUsername: formData.repreUsername,
            repreEmail: formData.repreEmail,
            reprePassword: formData.reprePassword
          });
          console.log('✅ Organisation créée, userData:', userData);
        } else if (accountType === 'Admin') {
          console.log('🛡️ Création compte Admin...');
          userData = await AuthService.signupAdmin({
            email: formData.email,
            username: formData.username,
            password: formData.password
          });
          console.log('✅ Admin créé, userData:', userData);
        }
        
        // IMPORTANT: Vérifier userData avant de passer à onLogin
        if (!userData || typeof userData.role === 'undefined') {
          throw new Error('Données utilisateur invalides reçues');
        }
        
        onLogin(userData);
      }
    } catch (err) {
      console.error('❌ Erreur:', err);
      setError(err.message || 'Une erreur est survenue');
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
                : accountType === 'Organisation'
                ? 'Créez votre espace organisation'
                : 'Créer un compte administrateur'}
          </p>
        </div>

        {/* Toggle Login/Signup */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => handleToggleMode(true)}
            className={`flex-1 py-3 rounded-xl font-medium transition ${
              isLogin ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'
            }`}
          >
            Connexion
          </button>
          <button
            onClick={() => handleToggleMode(false)}
            className={`flex-1 py-3 rounded-xl font-medium transition ${
              !isLogin ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'
            }`}
          >
            Inscription
          </button>
        </div>

        {/* Toggle User/Organisation/Admin (signup only) */}
        {!isLogin && (
          <div className="mb-6 border-2 border-gray-200 rounded-xl p-1">
            <div className="grid grid-cols-3 gap-1">
              <button
                onClick={() => handleAccountTypeChange('User')}
                className={`py-2 rounded-lg transition flex items-center justify-center gap-2 text-sm ${
                  accountType === 'User' 
                    ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-lg' 
                    : 'bg-transparent text-gray-600 hover:bg-gray-50'
                }`}
              >
                <User size={18} />
                Citoyen
              </button>
              <button
                onClick={() => handleAccountTypeChange('Organisation')}
                className={`py-2 rounded-lg transition flex items-center justify-center gap-2 text-sm ${
                  accountType === 'Organisation' 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg' 
                    : 'bg-transparent text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Building2 size={18} />
                Organisation
              </button>
              <button
                onClick={() => handleAccountTypeChange('Admin')}
                className={`py-2 rounded-lg transition flex items-center justify-center gap-2 text-sm ${
                  accountType === 'Admin' 
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg' 
                    : 'bg-transparent text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Shield size={18} />
                Admin
              </button>
            </div>
          </div>
        )}

        {/* Message d'erreur */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 text-red-700 rounded-xl flex items-center gap-2">
            <span>⚠️</span>
            <p className="text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* FORMULAIRE USER/ADMIN (Login + Signup) */}
          {(isLogin || accountType === 'User' || accountType === 'Admin') && (
            <>
              {!isLogin && (
                <InputField 
                  icon={<User />} 
                  label={accountType === 'Admin' ? "Nom d'administrateur" : "Nom complet"}
                  value={formData.username}
                  onChange={(v) => setFormData({ ...formData, username: v })}
                  required
                  placeholder="Ex: Jean Dupont"
                />
              )}
              <InputField 
                icon={<Mail />} 
                label="Email" 
                type="email"
                value={formData.email}
                onChange={(v) => setFormData({ ...formData, email: v })}
                required
                placeholder="exemple@email.com"
              />
              <div className="relative">
                <InputField 
                  icon={<Lock />} 
                  label="Mot de passe" 
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(v) => setFormData({ ...formData, password: v })}
                  required
                  placeholder="Minimum 6 caractères"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-[38px] text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {!isLogin && (
                <div className="relative">
                  <InputField 
                    icon={<Lock />} 
                    label="Confirmer mot de passe" 
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(v) => setFormData({ ...formData, confirmPassword: v })}
                    required
                    placeholder="Confirmer le mot de passe"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-[38px] text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
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
                <div className="space-y-3">
                  <InputField 
                    icon={<Building2 />} 
                    label="Nom de l'organisation"
                    value={formData.nom}
                    onChange={(v) => setFormData({ ...formData, nom: v })}
                    required
                    placeholder="Ex: Association EcoTunis"
                  />
                  <InputField 
                    icon={<Users />} 
                    type="number" 
                    label="Nombre de volontaires"
                    value={formData.nbrVolontaires}
                    onChange={(v) => setFormData({ ...formData, nbrVolontaires: v })}
                    required
                    min="1"
                    placeholder="Ex: 25"
                  />
                </div>
              </div>

              <div className="bg-purple-50 p-4 rounded-xl border-2 border-purple-200">
                <h3 className="font-bold text-purple-900 mb-3 flex items-center gap-2">
                  <User size={20} />
                  Compte représentant
                </h3>
                <div className="space-y-3">
                  <InputField 
                    icon={<User />} 
                    label="Nom du représentant"
                    value={formData.repreUsername}
                    onChange={(v) => setFormData({ ...formData, repreUsername: v })}
                    required
                    placeholder="Ex: Ahmed Ben Ali"
                  />
                  <InputField 
                    icon={<Mail />} 
                    label="Email du représentant"
                    type="email"
                    value={formData.repreEmail}
                    onChange={(v) => setFormData({ ...formData, repreEmail: v })}
                    required
                    placeholder="representant@organisation.com"
                  />
                  <InputField 
                    icon={<Lock />} 
                    type="password" 
                    label="Mot de passe"
                    value={formData.reprePassword}
                    onChange={(v) => setFormData({ ...formData, reprePassword: v })}
                    required
                    placeholder="Minimum 6 caractères"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Bouton de soumission */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-xl font-bold text-lg hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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

          {/* Lien mot de passe oublié (mode connexion) */}
          {isLogin && (
            <p className="text-center text-sm text-gray-600 mt-4">
              Mot de passe oublié ? 
              <button type="button" className="text-emerald-600 hover:underline ml-1">
                Réinitialiser
              </button>
            </p>
          )}
        </form>

        {/* Bouton retour */}
        <button 
          onClick={() => onNavigate('welcome')}
          className="w-full mt-4 text-gray-600 hover:text-gray-800 transition"
        >
          ← Retour à l'accueil
        </button>

        {/* Note pour Admin */}
        {!isLogin && accountType === 'Admin' && (
          <div className="mt-6 p-4 bg-amber-50 border-2 border-amber-200 rounded-xl">
            <p className="text-sm text-amber-800">
              <strong>⚠️ Note:</strong> La création de compte administrateur nécessite des permissions spéciales. 
              Contactez le support si vous rencontrez des problèmes.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// Composant InputField
const InputField = ({ label, icon, onChange, error, ...props }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{icon}</span>
      <input
        {...props}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full pl-10 pr-4 py-3 rounded-xl border-2 ${
          error ? 'border-red-300' : 'border-gray-300'
        } focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition`}
      />
    </div>
    {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
  </div>
);

export default LoginPage;
