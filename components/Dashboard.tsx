
import React, { useMemo, useState } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { useLocalization } from '../hooks/useLocalization';
import IncomeChart from './charts/IncomeChart';
import { DollarSignIcon, TrophyIcon, TrendingUpIcon, PercentIcon, PlusCircleIcon, TokenIcon, SolanaIcon, CopyIcon, ShareIcon, MailIcon, WalletIcon } from '../constants';
import { View } from '../types';

interface DashboardProps {
  setView: (view: View) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ setView }) => {
  const { currentUser, bonuses, currentDate, investments, projects, investmentPools, solanaWalletAddress, igiTokenBalance, solBalance, fetchAllBalances, getUserBalances, sendReferralInvite } = useAppContext();
  const { t } = useLocalization();
  const [inviteEmail, setInviteEmail] = useState('');
  const [isInviting, setIsInviting] = useState(false);
  
  if (!currentUser) return <div>{t('dashboard.loading')}</div>;

  const { incomeToday, incomeThisMonth, lifetimeEarnings } = useMemo(() => {
      if (!currentUser) return { incomeToday: 0, incomeThisMonth: 0, lifetimeEarnings: 0 };
      
      const todayStr = currentDate.toISOString().split('T')[0];
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

      let today = 0;
      let thisMonth = 0;
      let lifetime = 0;

      bonuses.forEach(b => {
          if (b.userId !== currentUser.id) return;
          lifetime += b.amount;
          const bonusDate = new Date(b.date);
          if (bonusDate >= startOfMonth) {
              thisMonth += b.amount;
          }
          if (b.date === todayStr) {
              today += b.amount;
          }
      });

      return { incomeToday: today, incomeThisMonth: thisMonth, lifetimeEarnings: lifetime };
  }, [bonuses, currentUser, currentDate]);

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


  const incomeChartData = useMemo(() => {
      if (!currentUser) return [];
      const monthlyData: { [key: string]: number } = {};
      
      bonuses
          .filter(b => b.userId === currentUser.id)
          .forEach(b => {
              const month = new Date(b.date).toLocaleString('default', { month: 'short', year: '2-digit' });
              monthlyData[month] = (monthlyData[month] || 0) + b.amount;
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
  }, [bonuses, currentUser]);
  
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

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;
    
    setIsInviting(true);
    try {
        await sendReferralInvite(inviteEmail);
        setInviteEmail('');
    } catch (error) {
        // Error handling if needed, though AppContext handles alerts
    } finally {
        setIsInviting(false);
    }
  }

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
        <Card title={t('dashboard.cards.incomeMonth')} value={`$${incomeThisMonth.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`} subtext="USDT" icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-blue-400"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>} />
        <Card title={t('dashboard.cards.lifetimeBonus')} value={`$${lifetimeEarnings.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`} subtext="USDT" icon={<TrophyIcon className="w-6 h-6 text-yellow-400" />} />
        <Card title={t('dashboard.cards.totalProfits')} value={`$${totalProfits.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`} subtext={t('dashboard.cards.totalProfitsSubtext')} icon={<TrendingUpIcon className="w-6 h-6 text-green-400" />} />
      </div>

       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card title={t('dashboard.cards.totalInvestment')} value={`$${currentUser.totalInvestment.toLocaleString()}`} subtext="USDT" icon={<DollarSignIcon className="w-6 h-6 text-gray-300" />}/>
        <Card title={t('wallet.depositBalance')} value={`$${depositBalance.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`} subtext="USDT" icon={<WalletIcon className="w-6 h-6 text-blue-400" />} />
        
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg space-y-4 md:col-span-2 lg:col-span-2">
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
            
            {/* Invite via Email Section */}
            <div className="mt-4 pt-4 border-t border-gray-600">
                <p className="text-sm text-gray-300 mb-2">{t('dashboard.referral.inviteTitle')}</p>
                <form onSubmit={handleInvite} className="flex gap-2">
                    <input 
                        type="email" 
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        placeholder={t('dashboard.referral.emailPlaceholder')}
                        className="flex-1 bg-gray-800 border border-gray-600 text-white text-sm rounded-md px-3 py-2 focus:ring-brand-primary focus:border-brand-primary outline-none"
                        required
                    />
                    <button 
                        type="submit"
                        disabled={isInviting}
                        className="bg-brand-primary hover:bg-brand-primary/90 text-white p-2 rounded-md transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed w-10"
                        title={t('dashboard.referral.send')}
                    >
                        {isInviting ? (
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : (
                            <MailIcon className="w-5 h-5" />
                        )}
                    </button>
                </form>
            </div>
          </div>
        </div>
      </div>

      {solanaWalletAddress && (
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
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
          className="bg-white text-brand-primary font-bold py-3 px-6 rounded-lg hover:bg-gray-200 transition-colors flex-shrink-0 flex items-center space-x-2"
        >
          <PlusCircleIcon className="w-6 h-6" />
          <span>{t('dashboard.investBanner.button')}</span>
        </button>
      </div>

      <div className="bg-gray-800 p-4 sm:p-6 rounded-lg shadow-lg">
        <h3 className="text-lg font-semibold text-white mb-4">{t('dashboard.charts.incomeOverview')}</h3>
        <div className="h-64">
          <IncomeChart data={incomeChartData} />
        </div>
      </div>
      
      <div className="bg-gray-800 p-4 sm:p-6 rounded-lg shadow-lg">
        <h3 className="text-lg font-semibold text-white mb-4">{t('dashboard.myInvestments.title')}</h3>
         {userInvestments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {userInvestments.map(inv => (
                    <div key={inv.id} className="bg-gray-700 p-4 rounded-lg">
                        <div className="flex justify-between items-center mb-3">
                            <h4 className="font-bold text-white">{inv.name}</h4>
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
                                icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-gray-300"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>} 
                                label={t('dashboard.myInvestments.startDate')} 
                                value={new Date(inv.date).toLocaleDateString()} 
                            />
                        </div>
                    </div>
                ))}
            </div>
         ) : (
            <div className="text-center py-8">
                <p className="text-gray-400">{t('dashboard.myInvestments.noInvestments')}</p>
                <button 
                    onClick={() => setView(View.PROJECTS)}
                    className="mt-4 bg-brand-primary text-white font-bold py-2 px-4 rounded-lg hover:opacity-90 transition-opacity text-sm"
                >
                    {t('dashboard.myInvestments.makeFirstInvestment')}
                </button>
            </div>
         )}
      </div>
      
    </div>
  );
};

export default Dashboard;
