import React, { useMemo, useState } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { useLocalization } from '../../hooks/useLocalization';
import { Transaction, Bonus } from '../../types';

type AllFinancialEvent = (Transaction | (Bonus & { txHash: string, reason?: string })) & { eventType: 'Transaction' | 'Bonus' };

const TransactionsLog: React.FC = () => {
  const { transactions, bonuses, users } = useAppContext();
  const { t } = useLocalization();
  const [searchTerm, setSearchTerm] = useState('');

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
    if (!searchTerm) return allEvents;
    return allEvents.filter(event => {
      const userName = users.find(u => u.id === event.userId)?.name || '';
      return (
        userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  }, [allEvents, searchTerm, users]);

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
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-white">{t('admin.transactions.title')}</h3>
        <input
            type="text"
            placeholder={t('admin.transactions.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-gray-700 text-white rounded-md px-4 py-2 text-sm w-64"
        />
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
                <td className="px-6 py-4">{event.date}</td>
                <td className="px-6 py-4 font-medium text-white">{getUserName(event.userId)}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
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
                <td className="px-6 py-4 text-gray-400 text-xs">
                    {event.reason || event.txHash || event.sourceId}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionsLog;