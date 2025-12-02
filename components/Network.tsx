
import React, { useMemo } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { useLocalization } from '../hooks/useLocalization';
import TeamPerformanceChart from './charts/TeamPerformanceChart';
import NetworkTree from './NetworkTree';
import { CopyIcon, ShareIcon, StarIcon, UsersIcon } from '../constants';
import { User } from '../types';

const Network: React.FC = () => {
  const { currentUser, users, ranks, investments } = useAppContext();
  const { t } = useLocalization();

  if (!currentUser) return <div>{t('dashboard.loading')}</div>;

  const currentRank = ranks.find(r => r.level === currentUser.rank);
  const nextRank = ranks.find(r => r.level === currentUser.rank + 1);

  const teamPerformanceData = useMemo(() => {
    if (!currentUser) return [];

    // Iterative BFS to safely get all downline IDs without stack overflow on cycles
    const getDownlineIds = (rootId: string, allUsers: User[]): string[] => {
        const descendants = new Set<string>();
        const queue = [rootId];
        const visited = new Set<string>([rootId]); // Track visited to prevent cycles

        while (queue.length > 0) {
            const currentId = queue.shift()!;
            
            const children = allUsers.filter(u => u.uplineId === currentId);
            
            for (const child of children) {
                if (!visited.has(child.id)) {
                    visited.add(child.id);
                    descendants.add(child.id);
                    queue.push(child.id);
                }
            }
        }
        return Array.from(descendants);
    };
    
    const downlineIds = new Set(getDownlineIds(currentUser.id, users));
    const downlineUsers = users.filter(u => downlineIds.has(u.id));
    const downlineInvestments = investments.filter(inv => downlineIds.has(inv.userId));

    const monthlyData: { [key: string]: { joins: number; investment: number } } = {};

    downlineUsers.forEach(user => {
        const month = new Date(user.joinDate).toLocaleString('default', { month: 'short', year: '2-digit' });
        if (!monthlyData[month]) monthlyData[month] = { joins: 0, investment: 0 };
        monthlyData[month].joins += 1;
    });

    downlineInvestments.forEach(inv => {
        const month = new Date(inv.date).toLocaleString('default', { month: 'short', year: '2-digit' });
        if (!monthlyData[month]) monthlyData[month] = { joins: 0, investment: 0 };
        monthlyData[month].investment += inv.amount;
    });
    
     const sortedMonths = Object.keys(monthlyData).sort((a, b) => {
        const [monthA, yearA] = a.split(' ');
        const [monthB, yearB] = b.split(' ');
        const dateA = new Date(`${monthA} 1, 20${yearA}`);
        const dateB = new Date(`${monthB} 1, 20${yearB}`);
        return dateA.getTime() - dateB.getTime();
    }).slice(-6); // Last 6 months

    return sortedMonths.map(month => ({
        name: month,
        ...monthlyData[month]
    }));

  }, [currentUser, users, investments]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(currentUser.referralCode);
    alert(t('dashboard.referral.copied'));
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: t('dashboard.share.title'),
          text: t('dashboard.share.text', { referralCode: currentUser.referralCode }),
          url: window.location.origin,
        });
      } catch (error) {
        console.error('Error sharing referral code:', error);
      }
    } else {
      alert(t('dashboard.share.notSupported'));
    }
  };

  const Card: React.FC<{ title: string; value: string | number; subtext?: string, icon: React.ReactNode }> = ({ title, value, subtext, icon }) => (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg flex items-start space-x-4">
      <div className="bg-gray-700 p-3 rounded-full">
        {icon}
      </div>
      <div>
        <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">{title}</h3>
        <p className="text-2xl font-bold text-white">{value}</p>
        {subtext && <p className="text-xs text-gray-500">{subtext}</p>}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-white">{t('network.title')}</h2>
        <p className="text-gray-400 mt-1">{t('network.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title={t('dashboard.cards.currentRank')} value={currentRank?.name || 'N/A'} subtext={t('dashboard.cards.rankSubtext', { rank: currentUser.rank })} icon={<StarIcon className="w-6 h-6 text-gray-300" />}/>
        <Card title={t('dashboard.cards.totalDownline')} value={currentUser.totalDownline} subtext={t('dashboard.cards.downlineSubtext')} icon={<UsersIcon className="w-6 h-6 text-gray-300" />} />
      </div>

       <div className="bg-gray-800 p-6 rounded-lg shadow-lg space-y-4">
          <h3 className="text-lg font-semibold text-white">{t('dashboard.referral.title')}</h3>
          <div className="bg-gray-700 p-4 rounded-lg">
            <p className="text-sm text-gray-400">{t('dashboard.referral.subtitle')}</p>
            <div className="flex items-center justify-between mt-1">
              <p className="text-lg font-mono text-white break-all">{currentUser.referralCode}</p>
              <div className="flex items-center space-x-3">
                <button onClick={copyToClipboard} className="text-gray-400 hover:text-white" title={t('dashboard.referral.copy')}>
                  <CopyIcon className="w-5 h-5" />
                </button>
                <button onClick={handleShare} className="text-gray-400 hover:text-white" title={t('dashboard.referral.share')}>
                  <ShareIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
           <h3 className="text-lg font-semibold text-white mb-4">{t('dashboard.rank.title')}</h3>
           <div className="space-y-4">
               <div>
                  <div className="flex justify-between items-baseline mb-1">
                      <span className="text-base font-medium text-brand-primary">{currentRank?.name}</span>
                      {nextRank && <span className="text-sm text-gray-400">{t('dashboard.rank.next')}: {nextRank.name}</span>}
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2.5">
                      <div className="bg-brand-primary h-2.5 rounded-full" style={{width: `${(currentUser.totalDownline / (nextRank?.minAccounts || currentUser.totalDownline)) * 100}%`}}></div>
                  </div>
               </div>
               <div className="text-sm text-gray-300">
                  <p>{t('dashboard.rank.accounts')}: {currentUser.totalDownline} / {nextRank ? nextRank.minAccounts : t('dashboard.rank.max')}</p>
                  <p>{t('dashboard.rank.qualified')}: {Math.floor(currentUser.totalDownline * 0.8)} / {nextRank ? nextRank.newlyQualified : t('dashboard.rank.max')}</p>
               </div>
           </div>
        </div>
         <div className="bg-gray-800 p-4 sm:p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold text-white mb-4">{t('dashboard.charts.teamPerformance')}</h3>
            <div className="h-48">
                <TeamPerformanceChart data={teamPerformanceData} />
            </div>
         </div>
       </div>

      <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
        <h3 className="text-lg font-semibold text-white mb-4">{t('dashboard.network.title')}</h3>
        <div className="overflow-x-auto p-2 -mx-2">
            <NetworkTree rootUserId={currentUser.id} allUsers={users} />
        </div>
      </div>
    </div>
  );
};

export default Network;
