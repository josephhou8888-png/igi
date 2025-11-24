
import React, { useState } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { useLocalization } from '../../hooks/useLocalization';
import { Transaction } from '../../types';

interface ApproveDepositModalProps {
  transaction: Transaction;
  onClose: () => void;
}

const ApproveDepositModal: React.FC<ApproveDepositModalProps> = ({ transaction, onClose }) => {
    const { approveDeposit } = useAppContext();
    const { t } = useLocalization();
    const [bonusAmount, setBonusAmount] = useState<string>('0');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const bonus = parseFloat(bonusAmount);
        if (isNaN(bonus) || bonus < 0) {
            setError(t('admin.approveDeposit.errorBonusInvalid'));
            return;
        }
        approveDeposit(transaction.id, bonus);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-lg shadow-xl p-8 w-full max-w-md">
                <h2 className="text-xl font-bold text-white mb-4">{t('admin.approveDeposit.title')}</h2>
                <form onSubmit={handleSubmit}>
                    <p className="text-gray-400 text-sm mb-4">
                        {t('admin.approveDeposit.instruction', { amount: transaction.amount.toLocaleString() })}
                    </p>
                    
                    <div className="mb-4">
                        <label htmlFor="bonusAmount" className="block text-sm font-medium text-gray-300 mb-2">
                           {t('admin.approveDeposit.bonusLabel')}
                        </label>
                        <input
                            type="number"
                            id="bonusAmount"
                            value={bonusAmount}
                            onChange={(e) => setBonusAmount(e.target.value)}
                            min="0"
                            step="any"
                            className="w-full bg-gray-700 text-white rounded-md border-gray-600 px-4 py-2"
                        />
                        <p className="text-xs text-gray-500 mt-1">{t('admin.approveDeposit.bonusHint')}</p>
                        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
                    </div>

                     <div className="flex justify-end space-x-4 mt-6">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-md bg-gray-600 text-white hover:bg-gray-500">{t('common.cancel')}</button>
                        <button type="submit" className="px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-500">{t('admin.approveDeposit.confirmApproval')}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ApproveDepositModal;
