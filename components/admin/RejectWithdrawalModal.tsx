
import React, { useState } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { useLocalization } from '../../hooks/useLocalization';
import { Transaction } from '../../types';

interface RejectWithdrawalModalProps {
  transaction: Transaction;
  onClose: () => void;
}

const RejectWithdrawalModal: React.FC<RejectWithdrawalModalProps> = ({ transaction, onClose }) => {
    const { rejectWithdrawal, users } = useAppContext();
    const { t } = useLocalization();
    const [reason, setReason] = useState('');
    const [error, setError] = useState('');

    const user = users.find(u => u.id === transaction.userId);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!reason.trim()) {
            setError(t('admin.financialAdjustment.errorReasonRequired'));
            return;
        }
        rejectWithdrawal(transaction.id, reason);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-lg shadow-xl p-8 w-full max-w-md">
                <h2 className="text-xl font-bold text-white mb-4">{t('admin.rejectWithdrawal.title')}</h2>
                <form onSubmit={handleSubmit}>
                    <p className="text-gray-400 text-sm mb-4">
                        {t('admin.rejectWithdrawal.instruction', { amount: transaction.amount.toLocaleString(), user: user?.name || 'User' })}
                    </p>
                    <div>
                        <label htmlFor="reason" className="block text-sm font-medium text-gray-300 mb-2">
                           {t('admin.rejectWithdrawal.reasonLabel')}
                        </label>
                        <textarea
                            id="reason"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            rows={3}
                            className="w-full bg-gray-700 text-white rounded-md border-gray-600 px-4 py-2"
                            required
                        />
                        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
                    </div>
                     <div className="flex justify-end space-x-4 mt-6">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-md bg-gray-600 text-white hover:bg-gray-500">{t('common.cancel')}</button>
                        <button type="submit" className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-500">{t('admin.rejectWithdrawal.confirm')}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RejectWithdrawalModal;
