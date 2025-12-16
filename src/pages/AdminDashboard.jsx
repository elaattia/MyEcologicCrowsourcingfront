// src/pages/AdminDashboard.jsx - VERSION CORRIGÉE AVEC FORUM
import React, { useState } from 'react';
import Sidebar from '../components/Shared/Sidebar';
import AdminDashboardContent from '../components/Admin/AdminDashboardContent';
import AdminUsersManagement from '../components/Admin/AdminUsersManagement';
import AdminSubmissionsReview from '../components/Admin/AdminSubmissionsReview';
import AdminForumModeration from '../components/Admin/AdminForumModeration';
import AdminChallengesManagement from '../components/Admin/AdminChallengesManagement';
import AdminAchievementsManagement from '../components/Admin/AdminAchievementsManagement';
import AdminStatistiques from '../components/Admin/AdminStatistiques';
import ProfileContent from '../components/ProfileContent';
import ForumContent from '../components/Admin/AdminForumManagement'; // AJOUT

const AdminDashboard = ({ user, onLogout }) => {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const renderContent = () => {
    switch (currentPage) {
      case 'dashboard':
        return <AdminDashboardContent user={user} />;
      
      case 'users':
        return <AdminUsersManagement user={user} />;
      
      case 'submissions':
        return <AdminSubmissionsReview />;
        
      case 'moderation':
        return <AdminForumModeration />;
        
      case 'challenges':
        return <AdminChallengesManagement />;
        
      case 'achievements':
        return <AdminAchievementsManagement />;
        
      case 'statistiques':
        return <AdminStatistiques />;
      
      // AJOUT: Support du forum
      case 'forum':
        return <ForumContent user={user} />;
      
      case 'profile':
        return <ProfileContent user={user} />;
      
      default:
        return <AdminDashboardContent user={user} />;
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

export default AdminDashboard;