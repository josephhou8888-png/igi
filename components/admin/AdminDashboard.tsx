
import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { useLocalization } from '../../hooks/useLocalization';
import AdminInflowOutflowChart from '../charts/AdminInflowOutflowChart';
import DailyInvestmentsChart from '../charts/DailyInvestmentsChart';
import PayoutsByRankChart from '../charts/PayoutsByRankChart';
import UserManagement from './UserManagement';
import InvestmentManagement from './InvestmentManagement';
import PlatformSettings from './PlatformSettings';
import TransactionsLog from './TransactionsLog';
import NewsManagement from './NewsManagement';
import PayoutMonitoring from './PayoutMonitoring';
import ProjectManagement from './ProjectManagement';
import InvestmentPools from './InvestmentPools';
import FinancialReports from './FinancialReports';
import DepositManagement from './DepositManagement';

type AdminTab = 'overview' | 'users' | 'deposits' | 'investments' | 'payouts' | 'projects' | 'legacyFunds' | 'transactions' | 'reports' | 'news' | 'settings';

const AdminDashboard: React.FC = () => {
  const { users, investments, transactions, bonuses, currentDate, advanceDate } = useAppContext();
  const { t } = useLocalization();
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');

  const {
    totalInvested,
    totalUsers,
    activeUsers,
    pendingKYC,
    newUsersToday,
    investmentsToday,
    pendingDeposits,
  } = useMemo(() => {
    const todayStr = currentDate.toISOString().split('T')[0];
    return {
      totalInvested: investments.reduce((sum, inv) => sum + inv.amount, 0),
      totalUsers: users.length,
      activeUsers: users.filter(u => u.totalInvestment > 0).length,
      pendingKYC: users.filter(u => u.kycStatus === 'Pending').length,
      newUsersToday: users.filter(u => u.joinDate === todayStr).length,
      investmentsToday: investments
        .filter(inv => inv.date === todayStr)
        .reduce((sum, inv) => sum + inv.amount, 0),
      pendingDeposits: transactions.filter(tx => tx.type === 'Deposit' && tx.status === 'pending').length,
    };
  }, [investments, users, currentDate, transactions]);
  
  const inflowOutflowData = useMemo(() => {
    const dailyData: { [date: string]: { inflow: number; outflow: number } } = {};

    transactions.forEach(tx => {
        if (!dailyData[tx.date]) {
            dailyData[tx.date] = { inflow: 0, outflow: 0 };
        }
        if (tx.type === 'Deposit' && tx.status === 'completed') {
            dailyData[tx.date].inflow += tx.amount;
        } else if (tx.type === 'Withdrawal') {
            dailyData[tx.date].outflow += tx.amount;
        }
    });

    return Object.entries(dailyData)
        .map(([date, { inflow, outflow }]) => ({ date, inflow, outflow }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [transactions]);

  const dailyInvestmentsData = useMemo(() => {
    const dailyData: { [date: string]: number } = {};
    investments.forEach(inv => {
        dailyData[inv.date] = (dailyData[inv.date] || 0) + inv.amount;
    });
    return Object.entries(dailyData)
      .map(([date, amount]) => ({ date, amount }))
      .sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [investments]);

  const payoutsByRankData = useMemo(() => {
    const rankData: { [rank: string]: number } = {};
    bonuses.forEach(bonus => {
        const user = users.find(u => u.id === bonus.userId);
        if (user) {
            const rankName = `L${user.rank}`;
            rankData[rankName] = (rankData[rankName] || 0) + bonus.amount;
        }
    });
    return Object.entries(rankData).map(([name, amount]) => ({ name, amount }));
  }, [bonuses, users]);

  const Card: React.FC<{ title: string; value: string | number; }> = ({ title, value }) => (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
      <h3 className="text-sm font-medium text-gray-400 uppercase">{title}</h3>
      <p className="text-3xl font-bold text-white mt-2">{value}</p>
    </div>
  );

  const TabButton: React.FC<{ tabId: AdminTab; label: React.ReactNode; }> = ({ tabId, label }) => (
    <button
      onClick={() => setActiveTab(tabId)}
      className={`px-4 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap flex items-center justify-center ${
        activeTab === tabId ? 'bg-brand-primary text-white' : 'text-gray-300 hover:bg-gray-700'
      }`}
    >
      {label}
    </button>
  );

  const renderContent = () => {
    switch(activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card title={t('admin.overview.totalInvested')} value={`$${totalInvested.toLocaleString()}`} />
              <Card title={t('admin.overview.totalUsers')} value={totalUsers} />
              <Card title={t('admin.overview.activeAccounts')} value={activeUsers} />
              <Card title={t('admin.overview.pendingKYC')} value={pendingKYC} />
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card title={t('admin.overview.newUsersToday')} value={newUsersToday} />
                <Card title={t('admin.overview.investmentsToday')} value={`$${investmentsToday.toLocaleString()}`} />
            </div>
             <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                <h3 className="text-lg font-semibold text-white mb-4">{t('admin.overview.inflowOutflow')}</h3>
                <div className="h-72">
                    <AdminInflowOutflowChart data={inflowOutflowData} />
                </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">{t('admin.overview.dailyNewInvestments')}</h3>
                    <div className="h-72">
                        <DailyInvestmentsChart data={dailyInvestmentsData} />
                    </div>
                 </div>
                 <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">{t('admin.overview.payoutsByRank')}</h3>
                    <div className="h-72">
                        <PayoutsByRankChart data={payoutsByRankData} />
                    </div>
                 </div>
            </div>
          </div>
        );
      case 'users': return <UserManagement />;
      case 'deposits': return <DepositManagement />;
      case 'investments': return <InvestmentManagement />;
      case 'payouts': return <PayoutMonitoring />;
      case 'projects': return <ProjectManagement />;
      case 'legacyFunds': return <InvestmentPools />;
      case 'transactions': return <TransactionsLog />;
      case 'reports': return <FinancialReports />;
      case 'news': return <NewsManagement />;
      case 'settings': return <PlatformSettings />;
      default: return null;
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <h2 className="text-2xl font-semibold text-white">{t('admin.title')}</h2>
         <div className="bg-gray-800 p-3 rounded-lg shadow-lg flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
            <span className="font-semibold text-white whitespace-nowrap">{t('admin.simulatedDate')}: {currentDate.toLocaleDateString()}</span>
            <div className="flex items-center space-x-2">
                <button onClick={() => advanceDate(1)} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-1 px-3 rounded-lg text-sm">{t('admin.advance1Day')}</button>
                <button onClick={() => advanceDate(7)} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-1 px-3 rounded-lg text-sm">{t('admin.advance7Days')}</button>
                <button onClick={() => advanceDate(30)} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-1 px-3 rounded-lg text-sm">{t('admin.advance30Days')}</button>
            </div>
        </div>
      </div>
      
      <div className="border-b border-gray-700">
        <div className="flex space-x-2 overflow-x-auto pb-2">
            <TabButton tabId="overview" label={t('admin.tabs.overview')} />
            <TabButton tabId="users" label={t('admin.tabs.users')} />
            <TabButton tabId="deposits" label={
              <div className="flex items-center space-x-2">
                  <span>{t('admin.tabs.deposits')}</span>
                  {pendingDeposits > 0 && <span className="bg-yellow-500 text-black text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">{pendingDeposits}</span>}
              </div>
            } />
            <TabButton tabId="investments" label={t('admin.tabs.investments')} />
            <TabButton tabId="payouts" label={t('admin.tabs.payouts')} />
            <TabButton tabId="projects" label={t('admin.tabs.projects')} />
            <TabButton tabId="legacyFunds" label={t('admin.tabs.legacyFunds')} />
            <TabButton tabId="transactions" label={t('admin.tabs.transactions')} />
            <TabButton tabId="reports" label={t('admin.tabs.reports')} />
            <TabButton tabId="news" label={t('admin.tabs.news')} />
            <TabButton tabId="settings" label={t('admin.tabs.settings')} />
        </div>
      </div>

      <div className="mt-4">
        {renderContent()}
      </div>
    </div>
  );
};

export default AdminDashboard;
