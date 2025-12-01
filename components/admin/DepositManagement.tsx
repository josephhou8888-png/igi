import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { useLocalization } from '../../hooks/useLocalization';
import { Transaction } from '../../types';
import RejectDepositModal from './RejectDepositModal';
import ApproveDepositModal from './ApproveDepositModal';

const DepositManagement: React.FC = () => {
    const { transactions, users } = useAppContext();
    const { t } = useLocalization();
    const [rejectingTransaction, setRejectingTransaction] = useState<Transaction | null>(null);
    const [approvingTransaction, setApprovingTransaction] = useState<Transaction | null>(null);

    const pendingDeposits = useMemo(() => {
        return transactions
            .filter(tx => tx.type === 'Deposit' && tx.status === 'pending')
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }, [transactions]);

    const getUserName = (userId: string) => users.find(u => u.id === userId)?.name || 'N/A';
    
    return (
        <>
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                <h3 className="text-lg font-semibold text-white mb-4">{t('admin.deposits.title')}</h3>
                {pendingDeposits.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-300">
                            <thead className="text-xs text-gray-400 uppercase bg-gray-700">
                                <tr>
                                    <th scope="col" className="px-6 py-3">{t('admin.deposits.table.date')}</th>
                                    <th scope="col" className="px-6 py-3">{t('admin.deposits.table.user')}</th>
                                    <th scope="col" className="px-6 py-3">{t('admin.deposits.table.amount')}</th>
                                    <th scope="col" className="px-6 py-3">{t('admin.deposits.table.txHash')}</th>
                                    <th scope="col" className="px-6 py-3 text-right">{t('admin.deposits.table.actions')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pendingDeposits.map(tx => (
                                    <tr key={tx.id} className="border-b border-gray-700 hover:bg-gray-600 bg-gray-800">
                                        <td className="px-6 py-4">{tx.date}</td>
                                        <td className="px-6 py-4 font-medium text-white">{getUserName(tx.userId)}</td>
                                        <td className="px-6 py-4 font-semibold text-green-400">${tx.amount.toLocaleString()}</td>
                                        <td className="px-6 py-4 font-mono text-gray-500 truncate max-w-xs">{tx.txHash}</td>
                                        <td className="px-6 py-4 text-right space-x-2">
                                            <button onClick={() => setApprovingTransaction(tx)} className="text-xs font-semibold text-white bg-green-600 hover:bg-green-500 px-3 py-1 rounded-md transition-colors">
                                                {t('admin.deposits.approve')}
                                            </button>
                                            <button onClick={() => setRejectingTransaction(tx)} className="text-xs font-semibold text-white bg-red-600 hover:bg-red-500 px-3 py-1 rounded-md transition-colors">
                                                {t('admin.deposits.reject')}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-gray-400 text-center py-8">{t('admin.deposits.noPending')}</p>
                )}
            </div>
            {rejectingTransaction && (
                <RejectDepositModal 
                    transaction={rejectingTransaction} 
                    onClose={() => setRejectingTransaction(null)} 
                />
            )}
            {approvingTransaction && (
                <ApproveDepositModal
                    transaction={approvingTransaction}
                    onClose={() => setApprovingTransaction(null)}
                />
            )}
        </>
    );
};

export default DepositManagement;