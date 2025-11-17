// src/utils/constants.js
export const LIMITS = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  MIN_FILE_SIZE: 10 * 1024, // 10KB
};

export const ACCEPTED_FORMATS = {
  IMAGES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
};

export const STATUS_COLORS = {
  'Signale': 'bg-amber-100 text-amber-800 border-amber-300',
  'Nettoye': 'bg-emerald-100 text-emerald-800 border-emerald-300',
  'Signalé': 'bg-amber-100 text-amber-800 border-amber-300',
  'Nettoyé': 'bg-emerald-100 text-emerald-800 border-emerald-300'
};

export const TYPE_COLORS = {
  'Plastique': 'bg-blue-50 border-blue-200 text-blue-800',
  'Verre': 'bg-purple-50 border-purple-200 text-purple-800',
  'Metale': 'bg-gray-50 border-gray-200 text-gray-800',
  'Pile': 'bg-red-50 border-red-200 text-red-800',
  'Papier': 'bg-amber-50 border-amber-200 text-amber-800',
  'Autre': 'bg-gray-50 border-gray-200 text-gray-800'
};

export const MARKER_COLORS = {
  'Signale': '#FFA500',
  'Nettoye': '#10B981',
  'Signalé': '#FFA500',
  'Nettoyé': '#10B981'
};