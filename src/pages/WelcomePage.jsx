// src/pages/WelcomePage.jsx
import React from 'react';
import { MapPin, Users, TrendingUp, Camera, Award, Building2, UserCircle } from 'lucide-react';

const WelcomePage = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-400 via-cyan-400 to-blue-500">
      <nav className="bg-white/95 backdrop-blur shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-emerald-400 to-cyan-500 p-2 rounded-xl">
              <MapPin className="text-white" size={28} />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
              EcoMap
            </span>
          </div>
          <div className="space-x-4">
            <button 
              onClick={() => onNavigate('login')}
              className="px-6 py-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition font-medium"
            >
              Connexion
            </button>
            <button 
              onClick={() => onNavigate('signup')}
              className="px-6 py-2 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-lg hover:shadow-lg transition font-medium"
            >
              Inscription
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-20">
        {/* Hero Section */}
        <div className="text-center mb-20">
          <h1 className="text-6xl font-bold text-white mb-6 drop-shadow-lg">
            Ensemble pour un environnement plus propre
          </h1>
          <p className="text-xl text-white/90 max-w-3xl mx-auto mb-10">
            <strong>Citoyens</strong> : Signalez les déchets |{' '}
            <strong>Organisations</strong> : Optimisez vos collectes 
          </p>
          <div className="flex gap-4 justify-center">
            <button 
              onClick={() => onNavigate('signup')}
              className="px-8 py-4 bg-white text-emerald-600 rounded-xl hover:shadow-2xl transition font-bold text-lg flex items-center gap-2"
            >
              <UserCircle size={24} />
              Espace Citoyen
            </button>
            <button 
              onClick={() => onNavigate('signup')}
              className="px-8 py-4 bg-blue-600 text-white rounded-xl hover:shadow-2xl transition font-bold text-lg flex items-center gap-2"
            >
              <Building2 size={24} />
              Espace Organisation
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          <div className="bg-white/95 backdrop-blur p-8 rounded-2xl shadow-xl text-center">
            <div className="bg-emerald-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="text-emerald-600" size={36} />
            </div>
            <div className="text-5xl font-bold text-emerald-600 mb-2">1,247</div>
            <p className="text-gray-600 font-medium">Déchets signalés</p>
          </div>

          <div className="bg-white/95 backdrop-blur p-8 rounded-2xl shadow-xl text-center">
            <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="text-blue-600" size={36} />
            </div>
            <div className="text-5xl font-bold text-blue-600 mb-2">892</div>
            <p className="text-gray-600 font-medium">Contributeurs actifs</p>
          </div>

          <div className="bg-white/95 backdrop-blur p-8 rounded-2xl shadow-xl text-center">
            <div className="bg-amber-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="text-amber-600" size={36} />
            </div>
            <div className="text-5xl font-bold text-amber-600 mb-2">734</div>
            <p className="text-gray-600 font-medium">Zones nettoyées</p>
          </div>
        </div>

        {/* Pour qui ? */}
        <div className="bg-white/95 backdrop-blur rounded-3xl shadow-2xl p-12 mb-16">
          <h2 className="text-4xl font-bold text-center mb-12">Deux espaces, un objectif</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Citoyens */}
            <div className="bg-gradient-to-br from-emerald-50 to-cyan-50 p-8 rounded-2xl border-2 border-emerald-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-emerald-500 p-3 rounded-xl">
                  <UserCircle className="text-white" size={32} />
                </div>
                <h3 className="text-2xl font-bold text-emerald-900">Citoyens</h3>
              </div>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-3">
                  <span className="text-emerald-600 text-xl">✓</span>
                  <span>Signalez un déchet en quelques secondes</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-600 text-xl">✓</span>
                  <span>Classification automatique par IA</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-600 text-xl">✓</span>
                  <span>Suivez l'impact de vos contributions</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-600 text-xl">✓</span>
                  <span>Gagnez des badges et points</span>
                </li>
              </ul>
            </div>

            {/* Organisations */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-8 rounded-2xl border-2 border-blue-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-blue-500 p-3 rounded-xl">
                  <Building2 className="text-white" size={32} />
                </div>
                <h3 className="text-2xl font-bold text-blue-900">Organisations</h3>
              </div>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 text-xl">✓</span>
                  <span>Cartographie en temps réel des déchets</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 text-xl">✓</span>
                  <span>Optimisation automatique des itinéraires</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 text-xl">✓</span>
                  <span>Gestion de flotte de véhicules</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 text-xl">✓</span>
                  <span>Notifications des signalements</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Comment ça marche */}
        <div className="bg-white/95 backdrop-blur rounded-3xl shadow-2xl p-12 mb-16">
          <h2 className="text-4xl font-bold text-center mb-4">Comment ça marche ?</h2>
          <p className="text-center text-gray-600 mb-12 text-lg">Une plateforme simple et collaborative</p>
          
          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="bg-gradient-to-br from-emerald-400 to-emerald-500 w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Camera className="text-white" size={48} />
              </div>
              <h3 className="text-2xl font-bold mb-3">1. Signalez</h3>
              <p className="text-gray-600">Prenez une photo du déchet et notre IA le classifie automatiquement</p>
            </div>

            <div className="text-center">
              <div className="bg-gradient-to-br from-blue-400 to-blue-500 w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Users className="text-white" size={48} />
              </div>
              <h3 className="text-2xl font-bold mb-3">2. Collaborez</h3>
              <p className="text-gray-600">Les organisations locales planifient les interventions de nettoyage</p>
            </div>

            <div className="text-center">
              <div className="bg-gradient-to-br from-amber-400 to-amber-500 w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Award className="text-white" size={48} />
              </div>
              <h3 className="text-2xl font-bold mb-3">3. Agissez</h3>
              <p className="text-gray-600">Suivez les résultats et célébrez l'impact collectif</p>
            </div>
          </div>
        </div>

        {/* CTA Final */}
        <div className="bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-500 rounded-3xl shadow-2xl p-16 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Prêt à faire la différence ?</h2>
          <p className="text-xl text-white/90 mb-8">
            Rejoignez notre communauté et contribuez à un environnement plus propre
          </p>
          <button 
            onClick={() => onNavigate('signup')}
            className="px-10 py-4 bg-white text-emerald-600 rounded-xl hover:shadow-2xl transition font-bold text-lg"
          >
            Créer mon compte gratuitement
          </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomePage;