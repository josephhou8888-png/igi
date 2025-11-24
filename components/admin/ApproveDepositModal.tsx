
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
    const { approveDeposit, projects, investmentPools } = useAppContext();
    const { t } = useLocalization();
    const [bonusAmount, setBonusAmount] = useState<string>('0');
    const [error, setError] = useState('');
    const [investmentIntent, setInvestmentIntent] = useState<InvestmentIntent | null>(null);
    const [shouldAutoInvest, setShouldAutoInvest] = useState(true);
    
    // New state for manual target selection
    const [targetType, setTargetType] = useState<'project' | 'pool'>('project');
    const [targetAssetId, setTargetAssetId] = useState('');

    useEffect(() => {
        if (transaction.reason) {
            try {
                const parsed = JSON.parse(transaction.reason);
                if (parsed.intent === 'auto_invest' && parsed.targetId) {
                    setInvestmentIntent(parsed);
                    setTargetType(parsed.targetType);
                    setTargetAssetId(parsed.targetId);
                }
            } catch (e) {
                // Not a JSON reason or not an auto-invest intent, ignore
            }
        }
        // Default initialization if no intent
        if (!targetAssetId) {
             if (targetType === 'project' && projects.length > 0) setTargetAssetId(projects[0].id);
             if (targetType === 'pool' && investmentPools.length > 0) setTargetAssetId(investmentPools[0].id);
        }
    }, [transaction.reason, projects, investmentPools, targetAssetId, targetType]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const bonus = parseFloat(bonusAmount);
        if (isNaN(bonus) || bonus < 0) {
            setError(t('admin.approveDeposit.errorBonusInvalid'));
            return;
        }
        
        const autoInvestTarget = shouldAutoInvest && targetAssetId
            ? { type: targetType, id: targetAssetId } 
            : undefined;

        approveDeposit(transaction.id, bonus, autoInvestTarget);
        onClose();
    };

    const availableAssets = targetType === 'project' ? projects : investmentPools;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-lg shadow-xl p-8 w-full max-w-md">
                <h2 className="text-xl font-bold text-white mb-4">{t('admin.approveDeposit.title')}</h2>
                <form onSubmit={handleSubmit}>
                    <p className="text-gray-400 text-sm mb-4">
                        {t('admin.approveDeposit.instruction', { amount: transaction.amount.toLocaleString() })}
                    </p>
                    
                    <div className="bg-blue-900/30 border border-blue-800 p-3 rounded-lg mb-4">
                        {investmentIntent && (
                            <p className="text-sm text-blue-300 mb-2">
                                {t('admin.approveDeposit.userIntent', { target: investmentIntent.targetName })}
                            </p>
                        )}
                        <label className="flex items-center space-x-2 cursor-pointer mb-3">
                            <input 
                                type="checkbox" 
                                checked={shouldAutoInvest}
                                onChange={e => setShouldAutoInvest(e.target.checked)}
                                className="form-checkbox h-4 w-4 text-brand-primary rounded bg-gray-700 border-gray-600 focus:ring-brand-primary"
                            />
                            <span className="text-sm text-white font-medium">{t('admin.approveDeposit.autoExecute')}</span>
                        </label>

                        {shouldAutoInvest && (
                            <div className="space-y-3 pl-6 border-l-2 border-blue-800/50">
                                <div>
                                    <label className="block text-xs text-gray-400 mb-1">Target Type</label>
                                    <div className="flex space-x-2">
                                        <button type="button" onClick={() => setTargetType('project')} className={`px-2 py-1 text-xs rounded ${targetType === 'project' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`}>
                                            {t('reinvestModal.rwaProject')}
                                        </button>
                                        <button type="button" onClick={() => setTargetType('pool')} className={`px-2 py-1 text-xs rounded ${targetType === 'pool' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`}>
                                            {t('reinvestModal.legacyFund')}
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-400 mb-1">Select Asset</label>
                                    <select 
                                        value={targetAssetId} 
                                        onChange={e => setTargetAssetId(e.target.value)} 
                                        className="w-full bg-gray-700 text-white text-xs rounded px-2 py-1 border border-gray-600"
                                    >
                                        {availableAssets.map(a => (
                                            <option key={a.id} value={a.id}>{'tokenName' in a ? a.tokenName : a.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        )}
                    </div>

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
