// src/pages/LoginPage.jsx - SANS vérification email (2FA supprimée)
import React, { useState, useEffect } from 'react';
import { MapPin, Building2, User, Mail, Lock, Users, Loader, Eye, EyeOff, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import AuthService from '../services/auth/AuthService';

const LoginPage = ({ onNavigate, onLogin, initialMode = 'login' }) => {
  const [isLogin, setIsLogin] = useState(initialMode === 'login');
  const [accountType, setAccountType] = useState('User');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // État pour reset password
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetError, setResetError] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  
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

  useEffect(() => {
    setIsLogin(initialMode === 'login');
  }, [initialMode]);

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
    setShowResetPassword(false);
    resetForm();
  };

  const handleAccountTypeChange = (type) => {
    setAccountType(type);
    resetForm();
  };

  const validateForm = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

    // Bloquer création admin via l'interface
    if (accountType === 'Admin') {
      setError('❌ La création de compte administrateur n\'est pas autorisée via l\'interface. Contactez un administrateur existant.');
      return false;
    }

    if (accountType === 'User') {
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

    if (accountType === 'Organisation') {
      if (!formData.nom || formData.nom.trim().length < 2) {
        setError('Le nom de l\'organisation est requis (minimum 2 caractères)');
        return false;
      }

      if (!formData.nbrVolontaires || parseInt(formData.nbrVolontaires) < 1) {
        setError('Le nombre de volontaires doit être supérieur à 0');
        return false;
      }

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

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        // LOGIN
        const userData = await AuthService.login(formData.email, formData.password);
        onLogin(userData);
      } else {
        // SIGNUP - Création directe sans 2FA
        let userData;
        
        if (accountType === 'User') {
          userData = await AuthService.signupUser({
            email: formData.email,
            username: formData.username,
            password: formData.password
          });
        } else if (accountType === 'Organisation') {
          userData = await AuthService.signupOrganisation({
            nom: formData.nom,
            nbrVolontaires: parseInt(formData.nbrVolontaires, 10),
            repreUsername: formData.repreUsername,
            repreEmail: formData.repreEmail,
            reprePassword: formData.reprePassword
          });
        }

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

  // Gérer le reset password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setResetError('');
    setResetSuccess(false);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!resetEmail || !emailRegex.test(resetEmail)) {
      setResetError('Veuillez entrer un email valide');
      return;
    }

    setResetLoading(true);

    try {
      await AuthService.resetPassword(resetEmail);
      setResetSuccess(true);
      setResetEmail('');
    } catch (err) {
      setResetError(err.message || 'Erreur lors de la réinitialisation');
    } finally {
      setResetLoading(false);
    }
  };

  // VUE: Réinitialisation mot de passe
  if (showResetPassword) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-cyan-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md">
          <button
            onClick={() => setShowResetPassword(false)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6"
          >
            <ArrowLeft size={20} />
            Retour
          </button>

          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="bg-gradient-to-br from-emerald-400 to-cyan-500 p-2 rounded-xl">
                <Lock className="text-white" size={32} />
              </div>
            </div>
            <h2 className="text-3xl font-bold mb-2">Mot de passe oublié</h2>
            <p className="text-gray-600">
              Entrez votre email pour recevoir un lien de réinitialisation
            </p>
          </div>

          {resetSuccess && (
            <div className="mb-6 p-4 bg-emerald-50 border-2 border-emerald-200 text-emerald-700 rounded-xl flex items-center gap-2">
              <CheckCircle size={20} />
              <p className="text-sm">
                Email envoyé ! Vérifiez votre boîte de réception.
              </p>
            </div>
          )}

          {resetError && (
            <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 text-red-700 rounded-xl flex items-center gap-2">
              <AlertCircle size={20} />
              <p className="text-sm">{resetError}</p>
            </div>
          )}

          <form onSubmit={handleResetPassword} className="space-y-4">
            <InputField
              icon={<Mail />}
              label="Email"
              type="email"
              value={resetEmail}
              onChange={(v) => setResetEmail(v)}
              required
              placeholder="votre@email.com"
            />

            <button
              type="submit"
              disabled={resetLoading}
              className="w-full py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-xl font-bold text-lg hover:shadow-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {resetLoading ? (
                <>
                  <Loader className="animate-spin" size={20} />
                  Envoi en cours...
                </>
              ) : (
                'Envoyer le lien'
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // VUE PRINCIPALE: Login/Signup
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-cyan-50 to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-2xl">
        
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="bg-gradient-to-br from-emerald-400 to-cyan-500 p-2 rounded-xl">
              <MapPin className="text-white" size={32} />
            </div>
            <span className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
              EcoClean 
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

        {!isLogin && (
          <div className="mb-6 border-2 border-gray-200 rounded-xl p-1">
            <div className="grid grid-cols-2 gap-1">
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
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 text-red-700 rounded-xl flex items-center gap-2">
            <AlertCircle size={20} />
            <p className="text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {(isLogin || accountType === 'User') && (
            <>
              {!isLogin && (
                <InputField 
                  icon={<User />} 
                  label="Nom complet"
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

          {isLogin && (
            <p className="text-center text-sm text-gray-600 mt-4">
              Mot de passe oublié ? 
              <button 
                type="button" 
                onClick={() => setShowResetPassword(true)}
                className="text-emerald-600 hover:underline ml-1"
              >
                Réinitialiser
              </button>
            </p>
          )}
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