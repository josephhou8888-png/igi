
import React, { useState } from 'react';
import { AppContextProvider } from './context/AppContext';
import { useAppContext } from './hooks/useAppContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import AdminDashboard from './components/admin/AdminDashboard';
import Wallet from './components/Wallet';
import Login from './components/Login';
import Leaderboard from './components/Leaderboard';
import Profile from './components/Profile';
import Resources from './components/Resources';
import UserManual from './components/UserManual';
import Projects from './components/Projects';
import ProjectDetail from './components/ProjectDetail';
import Network from './components/Network';
import LegacyFunds from './components/LegacyFunds';
import { View } from './types';

const AppContent: React.FC = () => {
  const { currentUser } = useAppContext();
  const [currentView, setCurrentView] = useState<View>(View.DASHBOARD);
  const [isAdminView, setIsAdminView] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  const navigateToProjects = () => {
    setSelectedProjectId(null);
    setCurrentView(View.PROJECTS);
  }

  const renderContent = () => {
    if (isAdminView) {
      return <AdminDashboard />;
    }
    switch (currentView) {
      case View.DASHBOARD:
        return <Dashboard setView={navigateToProjects} />;
      case View.PROJECTS:
        if (selectedProjectId) {
          return <ProjectDetail projectId={selectedProjectId} onBack={() => setSelectedProjectId(null)} />;
        }
        return <Projects onSelectProject={setSelectedProjectId} />;
      case View.FUNDS:
        return <LegacyFunds />;
      case View.WALLET:
        return <Wallet />;
      case View.NETWORK:
        return <Network />;
      case View.LEADERBOARD:
        return <Leaderboard />;
      case View.PROFILE:
        return <Profile />;
      case View.RESOURCES:
        return <Resources />;
      case View.USER_MANUAL:
        return <UserManual />;
      default:
        return <Dashboard setView={navigateToProjects} />;
    }
  };

  if (!currentUser) {
    return <Login />;
  }

  return (
    <div className="relative flex h-screen bg-gray-900 text-gray-200 font-sans">
      <Sidebar 
        currentView={currentView} 
        setCurrentView={(view) => {
          setSelectedProjectId(null);
          setCurrentView(view);
        }} 
        isAdminView={isAdminView} 
        setIsAdminView={setIsAdminView}
        isMobileOpen={isMobileSidebarOpen}
        setIsMobileOpen={setIsMobileSidebarOpen}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          onMenuClick={() => setIsMobileSidebarOpen(true)} 
          onNavigate={(view) => setCurrentView(view)}
        />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-900 p-4 sm:p-6 lg:p-8">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AppContextProvider>
      <AppContent />
    </AppContextProvider>
  );
};

export default App;
