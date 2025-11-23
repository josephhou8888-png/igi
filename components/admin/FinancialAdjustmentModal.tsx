import React, { useState } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { useLocalization } from '../../hooks/useLocalization';
import { User } from '../../types';

interface FinancialAdjustmentModalProps {
  user: User;
  onClose: () => void;
}

const FinancialAdjustmentModal: React.FC<FinancialAdjustmentModalProps> = ({ user, onClose }) => {
  const { addManualTransaction } = useAppContext();
  const { t } = useLocalization();
  const [type, setType] = useState<'Manual Bonus' | 'Manual Deduction'>('Manual Bonus');
  const [amount, setAmount] = useState(100);
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) {
      setError(t('admin.financialAdjustment.errorAmountPositive'));
      return;
    }
    if (!reason) {
      setError(t('admin.financialAdjustment.errorReasonRequired'));
      return;
    }
    setError('');
    addManualTransaction(user.id, type, amount, reason);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg shadow-xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-white mb-2">{t('admin.financialAdjustment.title')}</h2>
        <p className="text-gray-400 mb-6">{t('admin.financialAdjustment.forUser')}: <span className="font-semibold text-white">{user.name}</span></p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300">{t('admin.financialAdjustment.transactionType')}</label>
            <select value={type} onChange={(e) => setType(e.target.value as any)} className="w-full bg-gray-700 text-white rounded-md mt-1 px-3 py-2">
              <option value="Manual Bonus">{t('admin.financialAdjustment.manualBonus')}</option>
              <option value="Manual Deduction">{t('admin.financialAdjustment.manualDeduction')}</option>
            </select>
          </div>
           <div>
            <label className="block text-sm font-medium text-gray-300">{t('admin.financialAdjustment.amount')}</label>
            <input type="number" value={amount} onChange={e => setAmount(Number(e.target.value))} min="1" className="w-full bg-gray-700 text-white rounded-md mt-1 px-3 py-2"/>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">{t('admin.financialAdjustment.reason')}</label>
            <input type="text" value={reason} onChange={e => setReason(e.target.value)} placeholder={t('admin.financialAdjustment.reasonPlaceholder')} className="w-full bg-gray-700 text-white rounded-md mt-1 px-3 py-2"/>
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div className="flex justify-end space-x-4 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-md bg-gray-600 text-white hover:bg-gray-500">{t('common.cancel')}</button>
            <button type="submit" className="px-4 py-2 rounded-md bg-brand-primary text-white hover:bg-brand-primary/90">{t('admin.financialAdjustment.apply')}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FinancialAdjustmentModal;