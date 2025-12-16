// src/pages/UserDashboard.jsx - VERSION COMPLÈTE
import React, { useState } from 'react';
import Sidebar from '../components/Shared/Sidebar';
import DashboardContent from '../components/DashboardContent';
import SignalWasteContent from '../components/SignalWasteContent';
import MapContent from '../components/MapContent';
import StatsContent from '../components/StatsContent';
import ProfileContent from '../components/ProfileContent';
import WasteHistory from '../components/WasteHistory';
import ForumContent from '../components/Forum/ForumContent'; // NOUVEAU
import ChallengesContent from '../components/Challenges/ChallengesContent'; // NOUVEAU

const UserDashboard = ({ user, onLogout }) => {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const renderContent = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardContent user={user} />;
      case 'signal':
        return <SignalWasteContent />;
      case 'map':
        return <MapContent />;
      case 'challenges':
        return <ChallengesContent user={user} />; // NOUVEAU
      case 'forum':
        return <ForumContent user={user} />; // NOUVEAU
      case 'stats':
        return <StatsContent user={user} />;
      case 'history':
        return <WasteHistory user={user} />;
      case 'profile':
        return <ProfileContent user={user} />;
      default:
        return <DashboardContent user={user} />;
    }
  };

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen flex">
      <Sidebar
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        user={user}
        onLogout={onLogout}
      />

      <main className="flex-1 p-8 ml-64">
        <div className="max-w-7xl mx-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default UserDashboard;