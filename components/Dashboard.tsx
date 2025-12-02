
import React, { useMemo } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { useLocalization } from '../hooks/useLocalization';
import { useToast } from '../hooks/useToast';
import IncomeChart from './charts/IncomeChart';
import LoadingSpinner from './ui/LoadingSpinner';
import { DollarSignIcon, TrophyIcon, TrendingUpIcon, PercentIcon, PlusCircleIcon, TokenIcon, SolanaIcon, CopyIcon, ShareIcon, UserPlusIcon, WalletIcon, CalendarIcon, UsersIcon } from '../constants';
import { View } from '../types';

interface DashboardProps {
  setView: (view: View) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ setView }) => {
  const { currentUser, bonuses, transactions, currentDate, investments, projects, investmentPools, solanaWalletAddress, igiTokenBalance, solBalance, fetchAllBalances, getUserBalances, users, setInviteModalOpen } = useAppContext();
  const { t } = useLocalization();
  const { addToast } = useToast();
  
  const { incomeToday, incomeThisMonth, lifetimeBonuses } = useMemo(() => {
      if (!currentUser) return { incomeToday: 0, incomeThisMonth: 0, lifetimeBonuses: 0 };
      
      const todayStr = currentDate.toISOString().split('T')[0];
      const currentMonthPrefix = todayStr.substring(0, 7); // YYYY-MM

      let today = 0;
      let thisMonth = 0;
      let lifetimeBonusTotal = 0;

      transactions.forEach(t => {
          if (t.userId !== currentUser.id) return;
          if (t.status === 'rejected') return;

          const isProfitShare = t.type === 'Profit Share';
          const isBonus = 
            t.type === 'Bonus' || 
            t.type === 'Manual Bonus' || 
            t.type === 'Instant' ||
            t.type === 'Team Builder' ||
            t.type === 'Leadership' ||
            t.type === 'Asset Growth';

          if (isBonus || isProfitShare) {
              const tDateStr = t.date.length >= 10 ? t.date.substring(0, 10) : t.date;
              
              if (tDateStr.startsWith(currentMonthPrefix)) {
                  thisMonth += t.amount;
              }
              
              if (tDateStr === todayStr && isProfitShare) {
                  today += t.amount;
              }

              if (isBonus) {
                  lifetimeBonusTotal += t.amount;
              }
          }
      });

      return { incomeToday: today, incomeThisMonth: thisMonth, lifetimeBonuses: lifetimeBonusTotal };
  }, [transactions, currentUser, currentDate]);

  const { depositBalance } = useMemo(() => {
    if (!currentUser) return { depositBalance: 0 };
    return getUserBalances(currentUser.id);
  }, [currentUser, getUserBalances]);

  const totalProfits = useMemo(() => {
    if (!currentUser) return 0;
    return investments
        .filter(inv => inv.userId === currentUser.id)
        .reduce((sum, inv) => sum + inv.totalProfitEarned, 0);
  }, [investments, currentUser]);

  const userInvestments = useMemo(() => {
    if (!currentUser) return [];
    return investments
        .filter(inv => inv.userId === currentUser.id)
        .map(inv => {
            let apy = 0;
            let name = inv.projectName || inv.poolName || 'N/A';

            if (inv.projectId) {
                const project = projects.find(p => p.id === inv.projectId);
                if (project) {
                    apy = project.expectedYield;
                    name = project.tokenName;
                }
            } else if (inv.poolId) {
                const pool = investmentPools.find(p => p.id === inv.poolId);
                if (pool) {
                    apy = pool.apy;
                    name = pool.name;
                }
            }
            return {
                ...inv,
                name: name,
                apy: apy,
            };
        })
        .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [investments, currentUser, projects, investmentPools]);

  const directReferrals = useMemo(() => {
    if (!currentUser) return [];
    const directs = users.filter(u => u.uplineId === currentUser.id);
    const referralStats = directs.map(referral => {
        const referralInvestments = investments.filter(i => i.userId === referral.id);
        const investmentIds = new Set(referralInvestments.map(i => i.id));
        const earnedFromUser = bonuses
            .filter(b => b.userId === currentUser.id && (b.type === 'Instant' || b.type === 'Team Builder') && investmentIds.has(b.sourceId))
            .reduce((sum, b) => sum + b.amount, 0);

        return { ...referral, earnedFromUser };
    });
    return referralStats.sort((a, b) => new Date(b.joinDate).getTime() - new Date(a.joinDate).getTime());
  }, [users, currentUser, investments, bonuses]);


  const incomeChartData = useMemo(() => {
      if (!currentUser) return [];
      const monthlyData: { [key: string]: number } = {};
      transactions
          .filter(t => t.userId === currentUser.id && t.status !== 'rejected')
          .forEach(t => {
              const isIncome = 
                t.type === 'Bonus' || 
                t.type === 'Manual Bonus' || 
                t.type === 'Profit Share' ||
                t.type === 'Instant' ||
                t.type === 'Team Builder' ||
                t.type === 'Leadership' ||
                t.type === 'Asset Growth';

              if (isIncome) {
                  const month = new Date(t.date).toLocaleString('default', { month: 'short', year: '2-digit' });
                  monthlyData[month] = (monthlyData[month] || 0) + t.amount;
              }
          });
      
      const sortedMonths = Object.keys(monthlyData).sort((a, b) => {
          const [monthA, yearA] = a.split(' ');
          const [monthB, yearB] = b.split(' ');
          const dateA = new Date(`${monthA} 1, 20${yearA}`);
          const dateB = new Date(`${monthB} 1, 20${yearB}`);
          return dateA.getTime() - dateB.getTime();
      });

      return sortedMonths.map(month => ({
          name: month,
          income: monthlyData[month]
      }));
  }, [transactions, currentUser]);
  
  const copyToClipboard = () => {
    if (currentUser) {
        navigator.clipboard.writeText(currentUser.referralCode);
        addToast(t('dashboard.referral.copied'), 'success');
    }
  };

  const handleShare = async () => {
    if (currentUser && navigator.share) {
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
      addToast(t('dashboard.share.notSupported'), 'info');
    }
  };

  if (!currentUser) return <LoadingSpinner />;

  const Card: React.FC<{ title: string; value: string | number; subtext?: string, icon: React.ReactNode }> = ({ title, value, subtext, icon }) => (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg flex items-start space-x-4 border border-gray-700/50">
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

  const InvestmentInfo: React.FC<{ icon: React.ReactNode, label: string, value: React.ReactNode }> = ({ icon, label, value }) => (
    <div className="flex items-center space-x-3">
        <div className="bg-gray-800 p-2 rounded-full">
            {icon}
        </div>
        <div>
            <p className="text-xs text-gray-400">{label}</p>
            <p className="font-semibold text-white text-sm">{value}</p>
        </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card title={t('dashboard.cards.incomeToday')} value={`$${incomeToday.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`} subtext="USDT" icon={<DollarSignIcon className="w-6 h-6 text-green-400" />} />
        <Card title={t('dashboard.cards.incomeMonth')} value={`$${incomeThisMonth.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`} subtext="USDT" icon={<CalendarIcon className="w-6 h-6 text-blue-400" />} />
        <Card title={t('dashboard.cards.lifetimeBonus')} value={`$${lifetimeBonuses.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`} subtext="USDT" icon={<TrophyIcon className="w-6 h-6 text-yellow-400" />} />
        <Card title={t('dashboard.cards.totalProfits')} value={`$${totalProfits.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`} subtext={t('dashboard.cards.totalProfitsSubtext')} icon={<TrendingUpIcon className="w-6 h-6 text-green-400" />} />
      </div>

       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card title={t('dashboard.cards.totalInvestment')} value={`$${currentUser.totalInvestment.toLocaleString()}`} subtext="USDT" icon={<DollarSignIcon className="w-6 h-6 text-gray-300" />}/>
        <Card title={t('wallet.depositBalance')} value={`$${depositBalance.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`} subtext="USDT" icon={<WalletIcon className="w-6 h-6 text-blue-400" />} />
        
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg space-y-4 md:col-span-2 lg:col-span-2 border border-gray-700/50">
          <h3 className="text-lg font-semibold text-white">{t('dashboard.referral.title')}</h3>
          <div className="bg-gray-700 p-4 rounded-lg">
            <p className="text-sm text-gray-400">{t('dashboard.referral.subtitle')}</p>
            <div className="flex items-center justify-between mt-1 mb-6">
              <p className="text-lg font-mono text-white break-all">{currentUser.referralCode}</p>
              <div className="flex items-center space-x-3">
                <button onClick={copyToClipboard} className="text-gray-400 hover:text-white transition-colors" title={t('dashboard.referral.copy')}>
                  <CopyIcon className="w-5 h-5" />
                </button>
                <button onClick={handleShare} className="text-gray-400 hover:text-white transition-colors" title={t('dashboard.referral.share')}>
                  <ShareIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="border-t border-gray-600 pt-4">
                <button 
                    onClick={() => setInviteModalOpen(true)}
                    className="w-full sm:w-auto bg-brand-primary hover:bg-brand-primary/90 text-white font-bold py-2 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2 shadow-lg"
                >
                    <UserPlusIcon className="w-5 h-5" />
                    <span>{t('dashboard.referral.inviteTitle')}</span>
                </button>
            </div>
          </div>
        </div>
      </div>

      {solanaWalletAddress && (
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700/50">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-white">{t('dashboard.cards.myCryptoWallet')}</h3>
                <button onClick={fetchAllBalances} className="text-gray-400 hover:text-white" title={t('wallet.solana.refresh')}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-700 p-4 rounded-lg flex items-center space-x-4">
                      <SolanaIcon className="w-8 h-8 text-purple-400" />
                      <div>
                          <p className="text-sm text-gray-400">SOL Balance</p>
                           <p className="text-xl font-bold text-white">
                              {solBalance !== null ? solBalance.toLocaleString(undefined, {maximumFractionDigits: 4}) : '...'}
                          </p>
                      </div>
                  </div>
                  <div className="bg-gray-700 p-4 rounded-lg flex items-center space-x-4">
                      <TokenIcon className="w-8 h-8 text-cyan-400" />
                      <div>
                          <p className="text-sm text-gray-400">{t('wallet.solana.igiBalance')}</p>
                          <p className="text-xl font-bold text-white">
                              {igiTokenBalance !== null ? igiTokenBalance.toLocaleString() : '...'}
                          </p>
                      </div>
                  </div>
              </div>
          </div>
      )}

      <div className="bg-gradient-to-r from-brand-primary to-brand-secondary p-6 rounded-lg shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-2xl font-bold text-white">{t('dashboard.investBanner.title')}</h3>
          <p className="text-gray-200 mt-1">{t('dashboard.investBanner.subtitle')}</p>
        </div>
        <button 
          onClick={() => setView(View.PROJECTS)}
          className="bg-white text-brand-primary font-bold py-3 px-6 rounded-lg hover:bg-gray-200 transition-colors flex-shrink-0 flex items-center space-x-2 shadow-md"
        >
          <PlusCircleIcon className="w-6 h-6" />
          <span>{t('dashboard.investBanner.button')}</span>
        </button>
      </div>

      <div className="bg-gray-800 p-4 sm:p-6 rounded-lg shadow-lg border border-gray-700/50">
        <h3 className="text-lg font-semibold text-white mb-4">{t('dashboard.charts.incomeOverview')}</h3>
        <div className="h-64">
          <IncomeChart data={incomeChartData} />
        </div>
      </div>
      
      <div className="bg-gray-800 p-4 sm:p-6 rounded-lg shadow-lg border border-gray-700/50">
        <h3 className="text-lg font-semibold text-white mb-4">{t('dashboard.myInvestments.title')}</h3>
         {userInvestments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {userInvestments.map(inv => (
                    <div key={inv.id} className="bg-gray-700 p-4 rounded-lg hover:bg-gray-600 transition-colors">
                        <div className="flex justify-between items-center mb-3">
                            <h4 className="font-bold text-white truncate max-w-[70%]">{inv.name}</h4>
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${inv.status === 'Active' ? 'bg-green-900 text-green-300' : 'bg-gray-600 text-gray-300'}`}>
                                {inv.status}
                            </span>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <InvestmentInfo 
                                icon={<DollarSignIcon className="w-5 h-5 text-gray-300" />} 
                                label={t('dashboard.myInvestments.investedAmount')} 
                                value={`$${inv.amount.toLocaleString()}`} 
                            />
                            <InvestmentInfo 
                                icon={<TrendingUpIcon className="w-5 h-5 text-green-400" />} 
                                label={t('dashboard.myInvestments.profitEarned')} 
                                value={`$${inv.totalProfitEarned.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`} 
                            />
                             <InvestmentInfo 
                                icon={<PercentIcon className="w-5 h-5 text-blue-400" />} 
                                label="APY" 
                                value={`${inv.apy}%`} 
                            />
                            <InvestmentInfo 
                                icon={<CalendarIcon className="w-5 h-5 text-gray-300" />} 
                                label={t('dashboard.myInvestments.startDate')} 
                                value={new Date(inv.date).toLocaleDateString()} 
                            />
                        </div>
                    </div>
                ))}
            </div>
         ) : (
            <div className="text-center py-10 bg-gray-700/30 rounded-lg border border-dashed border-gray-600">
                <p className="text-gray-400 mb-4">{t('dashboard.myInvestments.noInvestments')}</p>
                <button 
                    onClick={() => setView(View.PROJECTS)}
                    className="bg-brand-primary text-white font-bold py-2 px-6 rounded-lg hover:opacity-90 transition-opacity text-sm shadow-lg"
                >
                    {t('dashboard.myInvestments.makeFirstInvestment')}
                </button>
            </div>
         )}
      </div>

      <div className="bg-gray-800 p-4 sm:p-6 rounded-lg shadow-lg border border-gray-700/50">
        <h3 className="text-lg font-semibold text-white mb-4">{t('dashboard.directReferrals.title')}</h3>
        {directReferrals.length > 0 ? (
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-300">
                    <thead className="text-xs text-gray-400 uppercase bg-gray-700/50">
                        <tr>
                            <th className="px-4 py-3">{t('dashboard.directReferrals.user')}</th>
                            <th className="px-4 py-3">{t('dashboard.directReferrals.joinDate')}</th>
                            <th className="px-4 py-3">{t('dashboard.directReferrals.status')}</th>
                            <th className="px-4 py-3 text-right">{t('dashboard.directReferrals.investment')}</th>
                            <th className="px-4 py-3 text-right">{t('dashboard.directReferrals.earned')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {directReferrals.map(ref => (
                            <tr key={ref.id} className="border-b border-gray-700 hover:bg-gray-700/30 transition-colors">
                                <td className="px-4 py-3 flex items-center gap-2">
                                    <img src={ref.avatar} alt="" className="w-8 h-8 rounded-full" />
                                    <span className="font-medium text-white">{ref.name}</span>
                                </td>
                                <td className="px-4 py-3">{ref.joinDate}</td>
                                <td className="px-4 py-3">
                                    <span className={`px-2 py-0.5 rounded text-xs ${ref.isFrozen ? 'bg-red-900 text-red-300' : 'bg-green-900 text-green-300'}`}>
                                        {ref.isFrozen ? 'Frozen' : 'Active'}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-right text-white font-medium">${ref.totalInvestment.toLocaleString()}</td>
                                <td className="px-4 py-3 text-right text-green-400 font-medium">+${ref.earnedFromUser.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        ) : (
            <div className="text-center py-10 bg-gray-700/30 rounded-lg flex flex-col items-center justify-center border border-dashed border-gray-600">
                <div className="bg-gray-800 p-4 rounded-full mb-3">
                    <UsersIcon className="w-8 h-8 text-gray-500" />
                </div>
                <p className="text-gray-400 mb-4">{t('dashboard.directReferrals.noReferrals')}</p>
                <button 
                    onClick={() => setInviteModalOpen(true)}
                    className="text-brand-primary hover:text-brand-secondary font-medium text-sm underline"
                >
                    {t('dashboard.referral.inviteTitle')}
                </button>
            </div>
        )}
      </div>
      
    </div>
  );
};

export default Dashboard;
