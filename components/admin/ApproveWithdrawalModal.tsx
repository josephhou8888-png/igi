
import React, { useState } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { useLocalization } from '../../hooks/useLocalization';
import { Transaction } from '../../types';

interface ApproveWithdrawalModalProps {
  transaction: Transaction;
  onClose: () => void;
}

const ApproveWithdrawalModal: React.FC<ApproveWithdrawalModalProps> = ({ transaction, onClose }) => {
    const { approveWithdrawal, users } = useAppContext();
    const { t } = useLocalization();
    const [txHash, setTxHash] = useState('');
    const [error, setError] = useState('');

    const user = users.find(u => u.id === transaction.userId);
    const targetWallet = transaction.reason?.replace('Withdraw to: ', '') || 'N/A';

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!txHash.trim()) {
            setError(t('admin.approveWithdrawal.errorTxHashRequired'));
            return;
        }
        
        approveWithdrawal(transaction.id, txHash);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-lg shadow-xl p-8 w-full max-w-md">
                <h2 className="text-xl font-bold text-white mb-4">{t('admin.approveWithdrawal.title')}</h2>
                <form onSubmit={handleSubmit}>
                    <p className="text-gray-400 text-sm mb-2">
                        {t('admin.approveWithdrawal.instruction', { amount: transaction.amount.toLocaleString(), user: user?.name || 'User' })}
                    </p>
                    <p className="text-gray-300 text-sm font-mono mb-4 break-all bg-gray-700 p-2 rounded">
                        {t('admin.approveWithdrawal.targetWallet', { wallet: targetWallet })}
                    </p>

                    <div className="mb-4">
                        <label htmlFor="txHash" className="block text-sm font-medium text-gray-300 mb-2">
                           {t('admin.approveWithdrawal.txHashLabel')}
                        </label>
                        <input
                            type="text"
                            id="txHash"
                            value={txHash}
                            onChange={(e) => setTxHash(e.target.value)}
                            placeholder={t('admin.approveWithdrawal.txHashPlaceholder')}
                            className="w-full bg-gray-700 text-white rounded-md border-gray-600 px-4 py-2"
                        />
                        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
                    </div>

                     <div className="flex justify-end space-x-4 mt-6">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-md bg-gray-600 text-white hover:bg-gray-500">{t('common.cancel')}</button>
                        <button type="submit" className="px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-500">{t('admin.approveWithdrawal.confirm')}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ApproveWithdrawalModal;
