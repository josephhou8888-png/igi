import React, { useState } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { useLocalization } from '../hooks/useLocalization';

interface WithdrawModalProps {
  onClose: () => void;
  currentBalance: number;
}

const WithdrawModal: React.FC<WithdrawModalProps> = ({ onClose, currentBalance }) => {
  const { addWithdrawal } = useAppContext();
  const { t } = useLocalization();
  const [amount, setAmount] = useState(100);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) {
      setError(t('withdrawModal.errorPositiveAmount'));
      return;
    }
    if (amount > currentBalance) {
      setError(t('withdrawModal.errorExceedsBalance'));
      return;
    }
    setError('');
    addWithdrawal(amount, currentBalance);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg shadow-xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-white mb-4">{t('withdrawModal.title')}</h2>
        <p className="text-gray-400 mb-2">{t('withdrawModal.subtitle')}</p>
        <p className="text-sm text-brand-primary mb-6">{t('wallet.availableBalance')}: ${currentBalance.toLocaleString()}</p>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="amount" className="block text-sm font-medium text-gray-300 mb-2">
              {t('withdrawModal.amountLabel')}
            </label>
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full bg-gray-700 text-white rounded-md border-gray-600 px-4 py-2 focus:ring-brand-primary focus:border-brand-primary"
              min="1"
              max={currentBalance}
              step="100"
            />
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          </div>
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-md bg-gray-600 text-white hover:bg-gray-500"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-md bg-brand-primary text-white hover:bg-brand-primary/90"
            >
              {t('withdrawModal.withdrawFunds')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WithdrawModal;