// pages/UserDashboard.jsx
import React, { useState } from 'react';
import Sidebar from '../components/Shared/Sidebar';
import DashboardContent from '../components/DashboardContent';
import SignalWasteContent from '../components/SignalWasteContent';
import MapContent from '../components/MapContent';
import StatsContent from '../components/StatsContent';
import ProfileContent from '../components/ProfileContent';
import WasteHistory from '../components/WasteHistory';

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
      case 'stats':
        return <StatsContent user={user} />;
      case 'profile':
        return <ProfileContent user={user} />;
      default:
        return <DashboardContent user={user} />;
    }
  };

  return (
    <div className="bg-white min-h-screen flex">
      <Sidebar
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        user={user}
        onLogout={onLogout}
      />

      <main className="flex-1 p-8 ml-64">
        {renderContent()}
      </main>
    </div>
  );
};

export default UserDashboard;