
import React, { useState, useMemo } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { useLocalization } from '../hooks/useLocalization';
import { User } from '../types';

type LeaderboardCategory = 'monthlyIncome' | 'totalDownline' | 'totalInvestment';

const Leaderboard: React.FC = () => {
  const { users } = useAppContext();
  const { t } = useLocalization();
  const [category, setCategory] = useState<LeaderboardCategory>('monthlyIncome');

  const sortedUsers = useMemo(() => {
    // Exclude admin from leaderboards
    const filteredUsers = users.filter(u => u.role !== 'admin');
    return [...filteredUsers].sort((a, b) => (b[category] || 0) - (a[category] || 0));
  }, [users, category]);

  const getCategoryLabel = (cat: LeaderboardCategory) => {
    switch (cat) {
      case 'monthlyIncome': return t('leaderboard.monthlyIncome');
      case 'totalDownline': return t('leaderboard.totalDownline');
      case 'totalInvestment': return t('leaderboard.totalInvestment');
    }
  };

  const formatValue = (user: User, cat: LeaderboardCategory) => {
    const value = user[cat] || 0;
    if (cat === 'totalDownline') {
      return t('leaderboard.partners', { count: value });
    }
    return `$${value.toLocaleString()}`;
  };

  const getMedal = (rank: number) => {
    if (rank === 0) return '🥇';
    if (rank === 1) return '🥈';
    if (rank === 2) return '🥉';
    return `#${rank + 1}`;
  };

  const getSafeString = (str: string | null | undefined, fallback: string) => {
      if (!str || str === 'null' || str === 'undefined') return fallback;
      return str;
  };

  const TabButton: React.FC<{ tabId: LeaderboardCategory; label: string; }> = ({ tabId, label }) => (
    <button
      onClick={() => setCategory(tabId)}
      className={`px-4 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
        category === tabId ? 'bg-brand-primary text-white' : 'text-gray-300 hover:bg-gray-700'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="space-y-6">
        <h2 className="text-2xl font-semibold text-white">{t('leaderboard.title')}</h2>
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <div className="flex space-x-2 border-b border-gray-700 pb-4 mb-4 overflow-x-auto">
                <TabButton tabId="monthlyIncome" label={t('leaderboard.topEarners')} />
                <TabButton tabId="totalDownline" label={t('leaderboard.topRecruiters')} />
                <TabButton tabId="totalInvestment" label={t('leaderboard.topInvestors')} />
            </div>

            <h3 className="text-lg font-semibold text-white mb-4">{t('leaderboard.rankingBy')}: <span className="text-brand-primary">{getCategoryLabel(category)}</span></h3>

            <div className="space-y-3">
                {sortedUsers.map((user, index) => (
                    <div key={user.id} className="flex items-center p-4 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors">
                        <div className="w-12 text-center text-xl font-bold text-gray-300 flex-shrink-0">
                            {getMedal(index)}
                        </div>
                        <img 
                            src={getSafeString(user.avatar, `https://ui-avatars.com/api/?name=${encodeURIComponent(getSafeString(user.name, 'User'))}&background=random`)} 
                            alt={user.name} 
                            className="w-12 h-12 rounded-full mx-4 object-cover flex-shrink-0" 
                        />
                        <div className="flex-grow min-w-0">
                            <p className="font-semibold text-white truncate">{getSafeString(user.name, 'Unknown User')}</p>
                            <p className="text-sm text-gray-400 truncate">
                                {t('leaderboard.partnerDetails', { rank: user.rank || 0, country: getSafeString(user.country, 'Global') })}
                            </p>
                        </div>
                        <div className="text-right flex-shrink-0 ml-2">
                            <p className="text-lg font-bold text-green-400">{formatValue(user, category)}</p>
                        </div>
                    </div>
                ))}
                {sortedUsers.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                        No ranking data available yet.
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};

export default Leaderboard;
