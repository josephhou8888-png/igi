
import React, { useState, Suspense } from 'react';
import { AppContextProvider } from './context/AppContext';
import { ToastProvider } from './context/ToastContext';
import { useAppContext } from './hooks/useAppContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import ToastContainer from './components/ui/ToastContainer';
import PasswordResetModal from './components/PasswordResetModal';
import InviteModal from './components/InviteModal';
import { View } from './types';

// Lazy Load heavy components to improve initial render time
const AdminDashboard = React.lazy(() => import('./components/admin/AdminDashboard'));
const Wallet = React.lazy(() => import('./components/Wallet'));
const Leaderboard = React.lazy(() => import('./components/Leaderboard'));
const Profile = React.lazy(() => import('./components/Profile'));
const Resources = React.lazy(() => import('./components/Resources'));
const UserManual = React.lazy(() => import('./components/UserManual'));
const Projects = React.lazy(() => import('./components/Projects'));
const ProjectDetail = React.lazy(() => import('./components/ProjectDetail'));
const Network = React.lazy(() => import('./components/Network'));
const LegacyFunds = React.lazy(() => import('./components/LegacyFunds'));

const LoadingFallback = () => (
  <div className="flex items-center justify-center h-screen bg-gray-900">
    <div className="flex flex-col items-center space-y-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
      <p className="text-gray-400 text-sm font-medium animate-pulse">Authenticating...</p>
    </div>
  </div>
);

const AppContent: React.FC = () => {
  const { currentUser, loading } = useAppContext();
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
      return (
        <Suspense fallback={<LoadingFallback />}>
          <AdminDashboard />
        </Suspense>
      );
    }
    switch (currentView) {
      case View.DASHBOARD:
        return <Dashboard setView={navigateToProjects} />;
      case View.PROJECTS:
        return (
          <Suspense fallback={<LoadingFallback />}>
            {selectedProjectId ? (
              <ProjectDetail projectId={selectedProjectId} onBack={() => setSelectedProjectId(null)} />
            ) : (
              <Projects onSelectProject={setSelectedProjectId} />
            )}
          </Suspense>
        );
      case View.FUNDS:
        return <Suspense fallback={<LoadingFallback />}><LegacyFunds /></Suspense>;
      case View.WALLET:
        return <Suspense fallback={<LoadingFallback />}><Wallet /></Suspense>;
      case View.NETWORK:
        return <Suspense fallback={<LoadingFallback />}><Network /></Suspense>;
      case View.LEADERBOARD:
        return <Suspense fallback={<LoadingFallback />}><Leaderboard /></Suspense>;
      case View.PROFILE:
        return <Suspense fallback={<LoadingFallback />}><Profile /></Suspense>;
      case View.RESOURCES:
        return <Suspense fallback={<LoadingFallback />}><Resources /></Suspense>;
      case View.USER_MANUAL:
        return <Suspense fallback={<LoadingFallback />}><UserManual /></Suspense>;
      default:
        return <Dashboard setView={navigateToProjects} />;
    }
  };

  // If the app is still determining auth state, show a generic loader
  if (loading) {
    return <LoadingFallback />;
  }

  // If no user is authenticated after loading finishes, show the login screen
  if (!currentUser) {
    return (
        <>
            <Login />
            <ToastContainer />
            <PasswordResetModal />
        </>
    );
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
      <ToastContainer />
      <PasswordResetModal />
      <InviteModal />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ToastProvider>
      <AppContextProvider>
        <AppContent />
      </AppContextProvider>
    </ToastProvider>
  );
};

export default App;
