//pages/WelcomePage
import { MapPin, Users, TrendingUp, Camera, Award } from 'lucide-react';
const WelcomePage = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-400 via-cyan-400 to-blue-500">
      <nav className="bg-white/95 backdrop-blur shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-emerald-400 to-cyan-500 p-2 rounded-xl">
              <MapPin className="text-white" size={28} />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">EcoMap</span>
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
        <div className="text-center mb-20">
          <h1 className="text-6xl font-bold text-white mb-6 drop-shadow-lg">
            Ensemble pour un environnement plus propre
          </h1>
          <p className="text-xl text-white/90 max-w-3xl mx-auto mb-10">
            Signalez, localisez et agissez contre les déchets sauvages près de chez vous
          </p>
          <div className="flex gap-4 justify-center">
            <button 
              onClick={() => onNavigate('signup')}
              className="px-8 py-4 bg-white text-emerald-600 rounded-xl hover:shadow-2xl transition font-bold text-lg flex items-center gap-2"
            >
              <MapPin size={24} />
              Signaler un déchet
            </button>
            <button className="px-8 py-4 bg-white/20 backdrop-blur text-white rounded-xl hover:bg-white/30 transition font-bold text-lg">
              Voir la carte
            </button>
          </div>
        </div>

        {}
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

        {}
        <div className="bg-white/95 backdrop-blur rounded-3xl shadow-2xl p-12 mb-16">
          <h2 className="text-4xl font-bold text-center mb-4">Comment ça marche ?</h2>
          <p className="text-center text-gray-600 mb-12 text-lg">Une plateforme simple et collaborative pour agir ensemble</p>
          
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
              <h3 className="text-2xl font-bold mb-3">3. Gagnez des badges</h3>
              <p className="text-gray-600">Plus vous contribuez, plus vous gagnez de points et de reconnaissance</p>
            </div>
          </div>
        </div>

        {}
        <div className="bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-500 rounded-3xl shadow-2xl p-16 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Prêt à faire la différence ?</h2>
          <p className="text-xl text-white/90 mb-8">Rejoignez notre communauté et contribuez à un environnement plus propre</p>
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
