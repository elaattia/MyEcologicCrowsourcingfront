// components/StatsContent.jsx
import React from 'react';
import { BarChart3 } from 'lucide-react';

const StatsContent = ({ user }) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <BarChart3 size={28} className="text-amber-600" />
        Statistiques
      </h2>
      <div className="space-y-4">
        <p className="text-gray-600">
          Analysez vos contributions et votre impact environnemental.
        </p>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-emerald-50 p-6 rounded-xl">
            <p className="text-sm text-gray-600 mb-2">Total signalements</p>
            <p className="text-3xl font-bold text-emerald-600">42</p>
          </div>
          <div className="bg-blue-50 p-6 rounded-xl">
            <p className="text-sm text-gray-600 mb-2">En attente</p>
            <p className="text-3xl font-bold text-blue-600">12</p>
          </div>
          <div className="bg-amber-50 p-6 rounded-xl">
            <p className="text-sm text-gray-600 mb-2">Traités</p>
            <p className="text-3xl font-bold text-amber-600">30</p>
          </div>
          <div className="bg-purple-50 p-6 rounded-xl">
            <p className="text-sm text-gray-600 mb-2">Points gagnés</p>
            <p className="text-3xl font-bold text-purple-600">420</p>
          </div>
        </div>
      </div>
    </div>
  );
};
export default StatsContent;