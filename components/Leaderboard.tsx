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
    return [...filteredUsers].sort((a, b) => b[category] - a[category]);
  }, [users, category]);

  const getCategoryLabel = (cat: LeaderboardCategory) => {
    switch (cat) {
      case 'monthlyIncome': return t('leaderboard.monthlyIncome');
      case 'totalDownline': return t('leaderboard.totalDownline');
      case 'totalInvestment': return t('leaderboard.totalInvestment');
    }
  };

  const formatValue = (user: User, cat: LeaderboardCategory) => {
    const value = user[cat];
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

  const TabButton: React.FC<{ tabId: LeaderboardCategory; label: string; }> = ({ tabId, label }) => (
    <button
      onClick={() => setCategory(tabId)}
      className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
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
            <div className="flex space-x-2 border-b border-gray-700 pb-4 mb-4">
                <TabButton tabId="monthlyIncome" label={t('leaderboard.topEarners')} />
                <TabButton tabId="totalDownline" label={t('leaderboard.topRecruiters')} />
                <TabButton tabId="totalInvestment" label={t('leaderboard.topInvestors')} />
            </div>

            <h3 className="text-lg font-semibold text-white mb-4">{t('leaderboard.rankingBy')}: <span className="text-brand-primary">{getCategoryLabel(category)}</span></h3>

            <div className="space-y-3">
                {sortedUsers.map((user, index) => (
                    <div key={user.id} className="flex items-center p-4 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors">
                        <div className="w-12 text-center text-xl font-bold text-gray-300">
                            {getMedal(index)}
                        </div>
                        <img src={user.avatar} alt={user.name} className="w-12 h-12 rounded-full mx-4" />
                        <div className="flex-grow">
                            <p className="font-semibold text-white">{user.name}</p>
                            <p className="text-sm text-gray-400">{t('leaderboard.partnerDetails', { rank: user.rank, country: user.country })}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-lg font-bold text-green-400">{formatValue(user, category)}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
  );
};

export default Leaderboard;