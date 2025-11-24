
import React from 'react';
import { View } from '../types';
import { HomeIcon, NetworkIcon, WalletIcon, AdminIcon, TrophyIcon, UserIcon, MegaphoneIcon, BookOpenIcon, BriefcaseIcon, DollarSignIcon } from '../constants';
import { useAppContext } from '../hooks/useAppContext';
import { useLocalization } from '../hooks/useLocalization';

interface SidebarProps {
  currentView: View;
  setCurrentView: (view: View) => void;
  isAdminView: boolean;
  setIsAdminView: (isAdmin: boolean) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (isOpen: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setCurrentView, isAdminView, setIsAdminView, isMobileOpen, setIsMobileOpen }) => {
  const { currentUser } = useAppContext();
  const { t } = useLocalization();

  const handleNavigation = (view: View) => {
    setIsAdminView(false);
    setCurrentView(view);
    setIsMobileOpen(false);
  };
  
  const handleAdminNavigation = () => {
    setIsAdminView(true);
    setIsMobileOpen(false);
  }

  const NavItem: React.FC<{
    icon: React.ReactNode;
    label: string;
    view: View;
    isActive: boolean;
  }> = ({ icon, label, view, isActive }) => (
    <button
      onClick={() => handleNavigation(view)}
      className={`flex items-center w-full px-4 py-3 transition-colors duration-200 ${
        isActive && !isAdminView ? 'bg-brand-primary text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'
      }`}
    >
      {icon}
      <span className="ml-4 font-medium">{label}</span>
    </button>
  );

  return (
    <>
      {isMobileOpen && (
          <div 
            className="fixed inset-0 bg-black/60 z-30 md:hidden" 
            onClick={() => setIsMobileOpen(false)}
            aria-hidden="true"
          ></div>
        )}
      <div 
        className={`fixed inset-y-0 left-0 z-40 flex flex-col w-64 bg-gray-800 border-r border-gray-700 transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-center h-20 border-b border-gray-700 flex-shrink-0">
          <h1 className="text-2xl font-bold text-white">
            IGI <span className="text-brand-primary">{t('sidebar.title')}</span>
          </h1>
        </div>
        <nav className="flex-1 px-2 py-4 space-y-2 overflow-y-auto">
          <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('sidebar.userPanel')}</p>
          <NavItem icon={<HomeIcon className="w-6 h-6" />} label={t('sidebar.dashboard')} view={View.DASHBOARD} isActive={currentView === View.DASHBOARD} />
          <NavItem icon={<BriefcaseIcon className="w-6 h-6" />} label={t('sidebar.projects')} view={View.PROJECTS} isActive={currentView === View.PROJECTS} />
          <NavItem icon={<DollarSignIcon className="w-6 h-6" />} label={t('sidebar.funds')} view={View.FUNDS} isActive={currentView === View.FUNDS} />
          <NavItem icon={<NetworkIcon className="w-6 h-6" />} label={t('sidebar.myNetwork')} view={View.NETWORK} isActive={currentView === View.NETWORK} />
          <NavItem icon={<WalletIcon className="w-6 h-6" />} label={t('sidebar.wallet')} view={View.WALLET} isActive={currentView === View.WALLET} />
          <NavItem icon={<UserIcon className="w-6 h-6" />} label={t('sidebar.profile')} view={View.PROFILE} isActive={currentView === View.PROFILE} />
          <NavItem icon={<TrophyIcon className="w-6 h-6" />} label={t('sidebar.leaderboard')} view={View.LEADERBOARD} isActive={currentView === View.LEADERBOARD} />
          <NavItem icon={<MegaphoneIcon className="w-6 h-6" />} label={t('sidebar.resources')} view={View.RESOURCES} isActive={currentView === View.RESOURCES} />
          <NavItem icon={<BookOpenIcon className="w-6 h-6" />} label={t('sidebar.userManual')} view={View.USER_MANUAL} isActive={currentView === View.USER_MANUAL} />
          
          {currentUser && currentUser.role === 'admin' && (
            <>
              <p className="px-4 pt-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('sidebar.adminPanel')}</p>
              <button
                onClick={handleAdminNavigation}
                className={`flex items-center w-full px-4 py-3 transition-colors duration-200 ${
                  isAdminView ? 'bg-brand-primary text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <AdminIcon className="w-6 h-6" />
                <span className="ml-4 font-medium">{t('sidebar.adminView')}</span>
              </button>
            </>
          )}
        </nav>
        <div className="px-4 py-2 border-t border-gray-700 flex-shrink-0">
          {currentUser && (
            <div className="flex items-center p-2 bg-gray-700 rounded">
              <img src={currentUser.avatar} alt={currentUser.name} className="w-8 h-8 rounded-full" />
              <div className="ml-3">
                <p className="text-sm font-medium text-white">{currentUser.name}</p>
                <p className="text-xs text-gray-400">{currentUser.role === 'admin' ? t('sidebar.administrator') : t('sidebar.partnerRank', { rank: currentUser.rank })}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Sidebar;
