// src/pages/OrganisationDashboard.jsx - VERSION COMPLÈTE
import React, { useState } from 'react';
import Sidebar from '../components/Shared/Sidebar';
import OrgDashboardContent from '../components/Organisation/OrgDashboardContent';
import OrgCartographie from '../components/Organisation/OrgCartographie';
import OrgItineraires from '../components/Organisation/OrgItineraires';
import OrgVehicules from '../components/Organisation/OrgVehicules';
import OrgDepots from '../components/Organisation/OrgDepots';
import OrgStatistiques from '../components/Organisation/OrgStatistiques';
import ProfileContent from '../components/ProfileContent';
import ForumContent from '../components/Forum/ForumContent'; // NOUVEAU

const OrganisationDashboard = ({ user, onLogout }) => {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const renderContent = () => {
    switch (currentPage) {
      case 'dashboard':
        return <OrgDashboardContent user={user} />;
      case 'map':
        return <OrgCartographie user={user} />;
      case 'itinerary':
        return <OrgItineraires user={user} />;
      case 'vehicles':
        return <OrgVehicules user={user} />;
      case 'depots':
        return <OrgDepots user={user} />;
      case 'forum':
        return <ForumContent user={user} />; // NOUVEAU
      case 'stats':
        return <OrgStatistiques user={user} />;
      case 'profile':
        return <ProfileContent user={user} />;
      default:
        return <OrgDashboardContent user={user} />;
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen flex">
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

export default OrganisationDashboard;