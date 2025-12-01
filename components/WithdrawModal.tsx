import React, { useState, useEffect } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { useLocalization } from '../hooks/useLocalization';

interface WithdrawModalProps {
  onClose: () => void;
  currentBalance: number;
}

const WithdrawModal: React.FC<WithdrawModalProps> = ({ onClose, currentBalance }) => {
  const { addWithdrawal, currentUser, withdrawalLimit, minWithdrawalLimit } = useAppContext();
  const { t } = useLocalization();
  const [amount, setAmount] = useState<string>('100');
  const [walletAddress, setWalletAddress] = useState('');
  const [error, setError] = useState('');
  const [isConfirming, setIsConfirming] = useState(false);

  useEffect(() => {
      if (currentUser?.wallet) {
          setWalletAddress(currentUser.wallet);
      }
  }, [currentUser]);

  const handleValidation = () => {
    const numericAmount = Number(amount);
    if (numericAmount <= 0) {
      setError(t('withdrawModal.errorPositiveAmount'));
      return false;
    }
    if (numericAmount < minWithdrawalLimit) {
      setError(t('withdrawModal.errorMinWithdrawal', { limit: minWithdrawalLimit.toLocaleString() }));
      return false;
    }
    if (numericAmount > currentBalance) {
      setError(t('withdrawModal.errorExceedsBalance'));
      return false;
    }
    if (withdrawalLimit > 0 && numericAmount > withdrawalLimit) {
        setError(t('withdrawModal.errorExceedsLimit', { limit: withdrawalLimit.toLocaleString() }));
        return false;
    }
    if (!walletAddress.trim()) {
        setError(t('withdrawModal.errorAddressRequired'));
        return false;
    }
    setError('');
    return true;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (handleValidation()) {
        setIsConfirming(true);
    }
  };

  const handleConfirmWithdrawal = () => {
    const numericAmount = Number(amount);
    addWithdrawal(numericAmount, currentBalance, walletAddress);
    alert(t('withdrawModal.requestSuccess'));
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <style>{`
        /* Chrome, Safari, Edge, Opera */
        input::-webkit-outer-spin-button,
        input::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        /* Firefox */
        input[type=number] {
          -moz-appearance: textfield;
        }
      `}</style>
      <div className="bg-gray-800 rounded-lg shadow-xl p-8 w-full max-w-md relative">
        {!isConfirming ? (
          <>
            <h2 className="text-2xl font-bold text-white mb-4">{t('withdrawModal.title')}</h2>
            <p className="text-gray-400 mb-2">{t('withdrawModal.subtitle')}</p>
            <p className="text-sm text-brand-primary mb-6">{t('wallet.availableBalance')}: ${currentBalance.toLocaleString()}</p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-300 mb-2">
                  {t('withdrawModal.amountLabel')}
                </label>
                <input
                  type="number"
                  id="amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-gray-700 text-white rounded-md border-gray-600 px-4 py-2 focus:ring-brand-primary focus:border-brand-primary"
                  min="1"
                  step="any"
                />
                <div className="flex justify-between mt-1">
                    {minWithdrawalLimit > 0 && (
                        <p className="text-xs text-gray-500">Min: ${minWithdrawalLimit.toLocaleString()}</p>
                    )}
                    {withdrawalLimit > 0 && (
                        <p className="text-xs text-gray-500">Max: ${withdrawalLimit.toLocaleString()}</p>
                    )}
                </div>
              </div>
              <div>
                <label htmlFor="walletAddress" className="block text-sm font-medium text-gray-300 mb-2">
                  {t('withdrawModal.addressLabel')}
                </label>
                <input
                  type="text"
                  id="walletAddress"
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  className="w-full bg-gray-700 text-white rounded-md border-gray-600 px-4 py-2 focus:ring-brand-primary focus:border-brand-primary font-mono text-sm"
                  placeholder="T..."
                />
              </div>
              {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
              <div className="flex justify-end space-x-4 pt-4">
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
          </>
        ) : (
          <div>
            <h3 className="text-xl font-bold text-yellow-400">{t('withdrawModal.confirmTitle')}</h3>
            <p className="text-gray-300 my-4">{t('withdrawModal.confirmMessage')}</p>
            <div className="bg-gray-700 p-3 rounded-lg break-all">
                <p className="text-xs text-gray-400">{t('withdrawModal.confirmAddress')}</p>
                <p className="font-mono text-white text-sm">{walletAddress}</p>
                <p className="text-xs text-gray-400 mt-2">{t('withdrawModal.confirmAmount')}</p>
                <p className="font-bold text-lg text-white">${Number(amount).toLocaleString()}</p>
            </div>
             <p className="text-xs text-red-400 mt-4">{t('withdrawModal.confirmWarning')}</p>
            <div className="flex justify-end space-x-4 mt-6">
                <button onClick={() => setIsConfirming(false)} className="px-4 py-2 rounded-md bg-gray-600 text-white hover:bg-gray-500">{t('common.cancel')}</button>
                <button onClick={handleConfirmWithdrawal} className="px-4 py-2 rounded-md bg-yellow-500 text-black font-semibold hover:bg-yellow-400">{t('withdrawModal.confirmButton')}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WithdrawModal;