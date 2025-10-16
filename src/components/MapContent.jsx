// components/MapContent.jsx
import React from 'react';
import { Map as MapIcon } from 'lucide-react';

const MapContent = () => {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <MapIcon size={28} className="text-blue-600" />
        Carte des déchets
      </h2>
      <div className="h-[600px] bg-gray-100 rounded-xl flex items-center justify-center">
        <p className="text-gray-500">Carte interactive à implémenter</p>
      </div>
    </div>
  );
};
export default MapContent;