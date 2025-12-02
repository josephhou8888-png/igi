
import React, { useMemo, useState } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { useLocalization } from '../../hooks/useLocalization';
import { Transaction, Bonus } from '../../types';

type AllFinancialEvent = (Transaction | (Bonus & { txHash: string, reason?: string })) & { eventType: 'Transaction' | 'Bonus' };

const TransactionsLog: React.FC = () => {
  const { transactions, bonuses, users } = useAppContext();
  const { t } = useLocalization();
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  const allEvents = useMemo(() => {
    const bonusEvents: AllFinancialEvent[] = bonuses.map(b => ({
      ...b,
      txHash: `bonus-${b.id}`,
      eventType: 'Bonus',
    }));
    const transactionEvents: AllFinancialEvent[] = transactions.map(t => ({
      ...t,
      eventType: 'Transaction',
    }));
    return [...transactionEvents, ...bonusEvents].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, bonuses]);

  const filteredEvents = useMemo(() => {
    let filtered = allEvents;

    // Filter by date range
    if (dateRange.start) {
        filtered = filtered.filter(event => new Date(event.date) >= new Date(dateRange.start));
    }
    
    if (dateRange.end) {
        const endDate = new Date(dateRange.end);
        // Set to end of day to include all transactions on that date
        endDate.setHours(23, 59, 59, 999);
        filtered = filtered.filter(event => new Date(event.date) <= endDate);
    }

    // Filter by search term
    if (searchTerm) {
        const lowerSearch = searchTerm.toLowerCase();
        filtered = filtered.filter(event => {
            const userName = users.find(u => u.id === event.userId)?.name || '';
            return (
                userName.toLowerCase().includes(lowerSearch) ||
                event.type.toLowerCase().includes(lowerSearch) ||
                event.id.toLowerCase().includes(lowerSearch) ||
                (event.txHash && event.txHash.toLowerCase().includes(lowerSearch))
            );
        });
    }
    
    return filtered;
  }, [allEvents, searchTerm, users, dateRange]);

  const getUserName = (userId: string) => users.find(u => u.id === userId)?.name || 'N/A';
  
  const getAmountClass = (type: string) => {
      const positiveTypes = ['Deposit', 'Bonus', 'Manual Bonus', 'Instant', 'Leadership', 'Team Builder', 'Asset Growth', 'Profit Share'];
      const negativeTypes = ['Withdrawal', 'Investment', 'Reinvestment', 'Manual Deduction'];
      if(positiveTypes.includes(type)) return 'text-green-400';
      if(negativeTypes.includes(type)) return 'text-red-400';
      return 'text-yellow-400';
  }

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-6 gap-4">
        <h3 className="text-lg font-semibold text-white whitespace-nowrap">{t('admin.transactions.title')}</h3>
        <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto items-end">
            <div className="flex gap-2 w-full sm:w-auto">
                <div className="w-full sm:w-auto">
                    <label className="block text-xs text-gray-400 mb-1 ml-1">{t('admin.reports.startDate')}</label>
                    <input
                        type="date"
                        value={dateRange.start}
                        onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                        className="bg-gray-700 text-white rounded-md px-3 py-2 text-sm w-full focus:outline-none focus:ring-1 focus:ring-brand-primary"
                    />
                </div>
                <div className="w-full sm:w-auto">
                    <label className="block text-xs text-gray-400 mb-1 ml-1">{t('admin.reports.endDate')}</label>
                    <input
                        type="date"
                        value={dateRange.end}
                        onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                        className="bg-gray-700 text-white rounded-md px-3 py-2 text-sm w-full focus:outline-none focus:ring-1 focus:ring-brand-primary"
                    />
                </div>
            </div>
            <div className="w-full sm:w-auto flex-grow">
                <label className="block text-xs text-gray-400 mb-1 ml-1 sm:invisible">Search</label>
                <input
                    type="text"
                    placeholder={t('admin.transactions.searchPlaceholder')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-gray-700 text-white rounded-md px-4 py-2 text-sm w-full sm:w-64 focus:outline-none focus:ring-1 focus:ring-brand-primary"
                />
            </div>
        </div>
      </div>
      <div className="overflow-x-auto max-h-[600px]">
        <table className="w-full text-sm text-left text-gray-300">
          <thead className="text-xs text-gray-400 uppercase bg-gray-700 sticky top-0">
            <tr>
              <th scope="col" className="px-6 py-3">{t('admin.transactions.table.date')}</th>
              <th scope="col" className="px-6 py-3">{t('admin.transactions.table.user')}</th>
              <th scope="col" className="px-6 py-3">{t('admin.transactions.table.type')}</th>
              <th scope="col" className="px-6 py-3">{t('admin.transactions.table.amount')}</th>
              <th scope="col" className="px-6 py-3">{t('admin.transactions.table.details')}</th>
            </tr>
          </thead>
          <tbody className="bg-gray-800">
            {filteredEvents.map(event => (
              <tr key={`${event.eventType}-${event.id}`} className="border-b border-gray-700 hover:bg-gray-600">
                <td className="px-6 py-4 whitespace-nowrap">{new Date(event.date).toLocaleDateString()}</td>
                <td className="px-6 py-4 font-medium text-white">{getUserName(event.userId)}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                    event.eventType === 'Bonus' ? 'bg-purple-900 text-purple-300' : 
                    event.type.includes('Bonus') || event.type === 'Deposit' ? 'bg-green-900 text-green-300' :
                    event.type.includes('Deduction') || event.type === 'Withdrawal' || event.type === 'Investment' ? 'bg-red-900 text-red-300' :
                    'bg-gray-600 text-gray-300'
                  }`}>
                    {event.type}
                  </span>
                </td>
                <td className={`px-6 py-4 font-semibold ${getAmountClass(event.type)}`}>
                  ${event.amount.toLocaleString()}
                </td>
                <td className="px-6 py-4 text-gray-400 text-xs break-all max-w-xs">
                    {event.reason || event.txHash || event.sourceId}
                </td>
              </tr>
            ))}
            {filteredEvents.length === 0 && (
                <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                        No transactions found matching your filters.
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionsLog;
