import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { useLocalization } from '../../hooks/useLocalization';
import { Transaction } from '../../types';
import ApproveWithdrawalModal from './ApproveWithdrawalModal';
import RejectWithdrawalModal from './RejectWithdrawalModal';

const WithdrawalManagement: React.FC = () => {
    const { transactions, users } = useAppContext();
    const { t } = useLocalization();
    const [rejectingTransaction, setRejectingTransaction] = useState<Transaction | null>(null);
    const [approvingTransaction, setApprovingTransaction] = useState<Transaction | null>(null);

    const pendingWithdrawals = useMemo(() => {
        return transactions
            .filter(tx => tx.type === 'Withdrawal' && tx.status === 'pending')
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }, [transactions]);

    const getUserName = (userId: string) => users.find(u => u.id === userId)?.name || 'N/A';
    
    const getTargetWallet = (tx: Transaction) => {
        if (tx.reason && tx.reason.startsWith('Withdraw to: ')) {
            return tx.reason.replace('Withdraw to: ', '');
        }
        return 'N/A';
    }

    return (
        <>
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                <h3 className="text-lg font-semibold text-white mb-4">{t('admin.withdrawals.title')}</h3>
                {pendingWithdrawals.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-300">
                            <thead className="text-xs text-gray-400 uppercase bg-gray-700">
                                <tr>
                                    <th scope="col" className="px-6 py-3">{t('admin.withdrawals.table.date')}</th>
                                    <th scope="col" className="px-6 py-3">{t('admin.withdrawals.table.user')}</th>
                                    <th scope="col" className="px-6 py-3">{t('admin.withdrawals.table.amount')}</th>
                                    <th scope="col" className="px-6 py-3">{t('admin.withdrawals.table.targetWallet')}</th>
                                    <th scope="col" className="px-6 py-3 text-right">{t('admin.withdrawals.table.actions')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pendingWithdrawals.map(tx => (
                                    <tr key={tx.id} className="border-b border-gray-700 hover:bg-gray-600 bg-gray-800">
                                        <td className="px-6 py-4">{tx.date}</td>
                                        <td className="px-6 py-4 font-medium text-white">{getUserName(tx.userId)}</td>
                                        <td className="px-6 py-4 font-semibold text-red-400">${tx.amount.toLocaleString()}</td>
                                        <td className="px-6 py-4 font-mono text-gray-500 truncate max-w-xs">{getTargetWallet(tx)}</td>
                                        <td className="px-6 py-4 text-right space-x-2">
                                            <button onClick={() => setApprovingTransaction(tx)} className="text-xs font-semibold text-white bg-green-600 hover:bg-green-500 px-3 py-1 rounded-md transition-colors">
                                                {t('admin.withdrawals.approve')}
                                            </button>
                                            <button onClick={() => setRejectingTransaction(tx)} className="text-xs font-semibold text-white bg-red-600 hover:bg-red-500 px-3 py-1 rounded-md transition-colors">
                                                {t('admin.withdrawals.reject')}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-gray-400 text-center py-8">{t('admin.withdrawals.noPending')}</p>
                )}
            </div>
            {rejectingTransaction && (
                <RejectWithdrawalModal 
                    transaction={rejectingTransaction} 
                    onClose={() => setRejectingTransaction(null)} 
                />
            )}
            {approvingTransaction && (
                <ApproveWithdrawalModal
                    transaction={approvingTransaction}
                    onClose={() => setApprovingTransaction(null)}
                />
            )}
        </>
    );
};

export default WithdrawalManagement;