
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { useLocalization } from '../../hooks/useLocalization';
import { Transaction } from '../../types';

interface ApproveDepositModalProps {
  transaction: Transaction;
  onClose: () => void;
}

interface InvestmentIntent {
    intent: 'auto_invest';
    targetId: string;
    targetType: 'project' | 'pool';
    targetName: string;
}

const ApproveDepositModal: React.FC<ApproveDepositModalProps> = ({ transaction, onClose }) => {
    const { approveDeposit } = useAppContext();
    const { t } = useLocalization();
    const [bonusAmount, setBonusAmount] = useState<string>('0');
    const [error, setError] = useState('');
    const [investmentIntent, setInvestmentIntent] = useState<InvestmentIntent | null>(null);
    const [shouldAutoInvest, setShouldAutoInvest] = useState(true);

    useEffect(() => {
        if (transaction.reason) {
            try {
                const parsed = JSON.parse(transaction.reason);
                if (parsed.intent === 'auto_invest' && parsed.targetId) {
                    setInvestmentIntent(parsed);
                }
            } catch (e) {
                // Not a JSON reason or not an auto-invest intent, ignore
            }
        }
    }, [transaction.reason]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const bonus = parseFloat(bonusAmount);
        if (isNaN(bonus) || bonus < 0) {
            setError(t('admin.approveDeposit.errorBonusInvalid'));
            return;
        }
        
        const autoInvestTarget = (shouldAutoInvest && investmentIntent) 
            ? { type: investmentIntent.targetType, id: investmentIntent.targetId } 
            : undefined;

        approveDeposit(transaction.id, bonus, autoInvestTarget);
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
                    
                    {investmentIntent && (
                        <div className="bg-blue-900/30 border border-blue-800 p-3 rounded-lg mb-4">
                            <p className="text-sm text-blue-300 mb-2">
                                {t('admin.approveDeposit.userIntent', { target: investmentIntent.targetName })}
                            </p>
                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    checked={shouldAutoInvest}
                                    onChange={e => setShouldAutoInvest(e.target.checked)}
                                    className="form-checkbox h-4 w-4 text-brand-primary rounded bg-gray-700 border-gray-600 focus:ring-brand-primary"
                                />
                                <span className="text-sm text-white font-medium">{t('admin.approveDeposit.autoExecute')}</span>
                            </label>
                        </div>
                    )}

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
