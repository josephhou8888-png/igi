
import React, { useState, useMemo } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { useLocalization } from '../hooks/useLocalization';
import { Project } from '../types';

interface InvestModalProps {
  project: Project;
  onClose: () => void;
}

const InvestModal: React.FC<InvestModalProps> = ({ project, onClose }) => {
  const { addInvestmentFromBalance, getUserBalances, currentUser } = useAppContext();
  const { t } = useLocalization();
  
  const [amount, setAmount] = useState<number>(project.minInvestment);
  const [source, setSource] = useState<'deposit' | 'profit_reinvestment'>('deposit');
  const [error, setError] = useState('');

  const { depositBalance, profitBalance } = useMemo(() => {
      if (!currentUser) return { depositBalance: 0, profitBalance: 0 };
      return getUserBalances(currentUser.id);
  }, [currentUser, getUserBalances]);

  const maxBalance = source === 'deposit' ? depositBalance : profitBalance;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount < project.minInvestment) {
        setError(t('investModal.errorMinInvestment', { 
            projectName: project.tokenName, 
            minInvestment: project.minInvestment.toLocaleString() 
        }));
        return;
    }
    if (amount > maxBalance) {
        setError(t('withdrawModal.errorExceedsBalance'));
        return;
    }

    addInvestmentFromBalance(amount, project.id, 'project', source);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md relative">
        <button 
            onClick={onClose} 
            className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>

        <h2 className="text-xl font-bold text-white mb-6 pr-8">{t('investModal.title', { project: project.tokenName })}</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Source Selection */}
            <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">{t('reinvestModal.investmentSource')}</label>
                <div className="grid grid-cols-2 gap-4">
                    <button
                        type="button"
                        onClick={() => setSource('deposit')}
                        className={`p-3 rounded-lg border text-left transition-all ${
                            source === 'deposit' 
                            ? 'bg-brand-primary/20 border-brand-primary ring-1 ring-brand-primary' 
                            : 'bg-gray-700 border-transparent hover:bg-gray-600'
                        }`}
                    >
                        <div className="text-xs text-gray-400 uppercase tracking-wider">{t('wallet.depositBalance')}</div>
                        <div className="text-lg font-bold text-white mt-1">${depositBalance.toLocaleString()}</div>
                    </button>
                    <button
                        type="button"
                        onClick={() => setSource('profit_reinvestment')}
                        className={`p-3 rounded-lg border text-left transition-all ${
                            source === 'profit_reinvestment' 
                            ? 'bg-brand-primary/20 border-brand-primary ring-1 ring-brand-primary' 
                            : 'bg-gray-700 border-transparent hover:bg-gray-600'
                        }`}
                    >
                        <div className="text-xs text-gray-400 uppercase tracking-wider">{t('wallet.profitBalance')}</div>
                        <div className="text-lg font-bold text-green-400 mt-1">${profitBalance.toLocaleString()}</div>
                    </button>
                </div>
            </div>

            {/* Amount Input */}
            <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">{t('investModal.amountLabel')}</label>
                <div className="relative">
                    <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(Number(e.target.value))}
                        className="w-full bg-gray-700 text-white rounded-lg border border-gray-600 px-4 py-3 focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none transition-all font-mono text-lg"
                        min={0}
                        step="0.01"
                    />
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                        <span className="text-gray-500 text-sm">USDT</span>
                        <button 
                            type="button"
                            onClick={() => setAmount(maxBalance)}
                            className="text-xs bg-gray-600 hover:bg-gray-500 text-white px-2 py-1 rounded transition-colors"
                        >
                            MAX
                        </button>
                    </div>
                </div>
                <p className="text-xs text-gray-500 mt-2 flex justify-between">
                    <span>Min: ${project.minInvestment.toLocaleString()}</span>
                    <span className={amount > maxBalance ? 'text-red-400' : ''}>Available: ${maxBalance.toLocaleString()}</span>
                </p>
            </div>

            {error && (
                <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-3">
                    <p className="text-red-400 text-sm flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                        {error}
                    </p>
                </div>
            )}

            <div className="flex justify-end space-x-3 pt-2">
                <button 
                    type="button" 
                    onClick={onClose}
                    className="px-5 py-2.5 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-colors font-medium"
                >
                    {t('common.cancel')}
                </button>
                <button 
                    type="submit"
                    className="px-6 py-2.5 rounded-lg bg-brand-primary hover:bg-brand-primary/90 text-white font-bold transition-colors shadow-lg flex items-center"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    {t('reinvestModal.reinvestNow')}
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default InvestModal;
