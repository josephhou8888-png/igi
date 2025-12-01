
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { useLocalization } from '../hooks/useLocalization';
import { BellIcon, ChevronDownIcon, LogOutIcon, UserIcon, MenuIcon, GithubIcon } from '../constants';
import { locales } from '../locales';
import { View } from '../types';

interface HeaderProps {
  onMenuClick: () => void;
  onNavigate: (view: View) => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick, onNavigate }) => {
  const { currentUser, bonuses, notifications, logout, markNotificationsAsRead } = useAppContext();
  const { t, setLocale, locale } = useLocalization();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLocaleData = locales[locale as keyof typeof locales];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  const allNotifications = useMemo(() => {
    if (!currentUser) return [];
    
    const bonusNotifs = bonuses
        .filter(b => b.userId === currentUser.id)
        .map(b => ({
            id: `bonus-${b.id}`,
            date: b.date,
            read: b.read,
            message: `+${b.amount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} from ${t(`bonusType.${b.type}`)}`,
            isBonus: true,
        }));

    const generalNotifs = notifications
        .filter(n => n.userId === currentUser.id)
        .map(n => ({
            id: `notif-${n.id}`,
            date: n.date,
            read: n.read,
            message: n.message, // Assuming messages are pre-formatted
            isBonus: false,
        }));
    
    return [...bonusNotifs, ...generalNotifs].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [bonuses, notifications, currentUser, t]);

  const hasUnreadNotifications = useMemo(() => {
    return allNotifications.some(n => !n.read);
  }, [allNotifications]);

  if (!currentUser) return null;

  const handleNotificationsToggle = () => {
    setIsNotificationsOpen(!isNotificationsOpen);
    if (hasUnreadNotifications) {
      markNotificationsAsRead();
    }
  };

  const handleLanguageSelect = (lang: string) => {
    setLocale(lang);
    setIsLanguageOpen(false);
  };

  return (
    <header className="flex-shrink-0 bg-gray-800 border-b border-gray-700">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center">
          <button onClick={onMenuClick} className="md:hidden mr-3 text-gray-400 hover:text-white">
            <MenuIcon className="h-6 w-6" />
          </button>
          <div>
            <h1 className="text-lg sm:text-xl font-semibold text-white">{t('header.welcome')}, {currentUser.name}!</h1>
            <p className="text-xs sm:text-sm text-gray-400">{t('header.financialOverview')}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2 sm:space-x-4">
          <a 
            href="https://github.com" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-gray-400 hover:text-white transition-colors"
            title="View Source on GitHub"
          >
            <GithubIcon className="h-6 w-6" />
          </a>

          <div className="relative">
            <button onClick={() => setIsLanguageOpen(!isLanguageOpen)} className="flex items-center justify-center h-10 w-10 rounded-full text-xl bg-gray-700 hover:bg-gray-600">
              {currentLocaleData.flag}
            </button>
            {isLanguageOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-gray-700 rounded-md shadow-lg z-50">
                {Object.entries(locales).map(([langCode, langData]) => (
                  <button
                    key={langCode}
                    onClick={() => handleLanguageSelect(langCode)}
                    className={`w-full text-left px-4 py-2 text-sm flex items-center ${
                      locale === langCode ? 'bg-brand-primary text-white' : 'text-gray-200 hover:bg-gray-600'
                    }`}
                  >
                    <span className="mr-3 text-lg">{langData.flag}</span>
                    <span>{langData.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="relative">
            <button onClick={handleNotificationsToggle} className="relative text-gray-400 hover:text-white">
              <BellIcon className="h-6 w-6" />
              {hasUnreadNotifications && <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>}
            </button>
            {isNotificationsOpen && (
               <div className="absolute right-0 mt-2 w-80 bg-gray-700 rounded-md shadow-lg z-50 max-h-96 overflow-y-auto">
                 <div className="p-3 border-b border-gray-600">
                   <h3 className="font-semibold text-white">{t('header.notifications')}</h3>
                 </div>
                 {allNotifications.length > 0 ? (
                    <ul>
                      {allNotifications.map(notif => (
                        <li key={notif.id} className={`border-b border-gray-600 p-3 text-sm ${!notif.read ? 'bg-brand-primary/20' : ''}`}>
                          <p className={notif.isBonus ? 'font-bold text-green-400' : 'text-gray-200'}>{notif.message}</p>
                          <p className="text-gray-400 text-xs mt-1">{new Date(notif.date).toLocaleDateString()}</p>
                        </li>
                      ))}
                    </ul>
                 ) : (
                    <p className="text-gray-400 text-sm p-4">{t('header.noNotifications')}</p>
                 )}
               </div>
            )}
          </div>
          
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)} 
              className="flex items-center space-x-2"
            >
              <img src={currentUser.avatar} alt="User Avatar" className="h-10 w-10 rounded-full object-cover" />
              <span className="hidden md:inline text-white">{currentUser.name}</span>
              <ChevronDownIcon className={`h-5 w-5 text-gray-400 transition-transform hidden md:block ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-gray-700 rounded-md shadow-lg py-1 z-50">
                <button 
                  onClick={() => {
                    onNavigate(View.PROFILE);
                    setIsDropdownOpen(false);
                  }} 
                  className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-600"
                >
                  <UserIcon className="w-4 h-4 mr-2" />
                  {t('header.profile')}
                </button>
                <button onClick={logout} className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-600">
                  <LogOutIcon className="w-4 h-4 mr-2" />
                  {t('header.logout')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
