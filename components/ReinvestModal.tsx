
import React, { useState, useMemo, useEffect } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { useLocalization } from '../hooks/useLocalization';
import { Project, InvestmentPool } from '../types';

interface ReinvestModalProps {
  onClose: () => void;
  depositBalance: number;
  profitBalance: number;
  initialAssetId?: string;
  forcedSource?: 'deposit' | 'profit_reinvestment';
}

const XIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
);

const ReinvestModal: React.FC<ReinvestModalProps> = ({ onClose, depositBalance, profitBalance, initialAssetId, forcedSource }) => {
  const { addInvestmentFromBalance, projects, investmentPools } = useAppContext();
  const { t } = useLocalization();

  type Step = 'source' | 'asset' | 'amount';
  const [step, setStep] = useState<Step>('source');

  const [investmentSource, setInvestmentSource] = useState<'deposit' | 'profit'>(
    forcedSource === 'profit_reinvestment' ? 'profit' : (forcedSource === 'deposit' ? 'deposit' : (depositBalance > 0 ? 'deposit' : 'profit'))
  );
  
  const [selectedAssetId, setSelectedAssetId] = useState<string>(initialAssetId || '');
  const [amount, setAmount] = useState(0);
  const [error, setError] = useState('');

  // Skip steps if props are provided
  useEffect(() => {
      if (initialAssetId && forcedSource) {
          setStep('amount');
          const asset = [...projects, ...investmentPools].find(a => a.id === initialAssetId);
          if (asset) {
              if (forcedSource === 'profit_reinvestment') {
                  setAmount(Math.floor(profitBalance * 100) / 100);
              } else {
                  setAmount(asset.minInvestment);
              }
          }
      }
  }, [initialAssetId, forcedSource, projects, investmentPools, profitBalance]);

  const availableAssets = useMemo(() => {
    // Deposit source: Can invest in Projects (to give deposits a use)
    if (investmentSource === 'deposit') {
        return projects; 
    }
    // Profit source: Can invest in Projects AND Legacy Funds
    return [...projects, ...investmentPools];
  }, [investmentSource, projects, investmentPools]);

  const selectedAsset = useMemo(() => {
    if (!selectedAssetId) return null;
    return availableAssets.find(a => a.id === selectedAssetId);
  }, [selectedAssetId, availableAssets]);

  const currentBalance = investmentSource === 'deposit' ? depositBalance : profitBalance;

  const handleSourceSelect = (source: 'deposit' | 'profit') => {
    setInvestmentSource(source);
    setStep('asset');
    setError('');
  };

  const handleAssetSelect = (asset: Project | InvestmentPool) => {
    setSelectedAssetId(asset.id);
    if (investmentSource === 'profit') {
      const roundedProfitBalance = Math.floor(profitBalance * 100) / 100;
      setAmount(roundedProfitBalance);
    } else {
      setAmount(asset.minInvestment);
    }
    setStep('amount');
    setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAsset) {
        setError(t('reinvestModal.noSelectionError'));
        return;
    }
    
    const minInvestment = selectedAsset.minInvestment;
    const assetName = 'tokenName' in selectedAsset ? selectedAsset.tokenName : selectedAsset.name;
    const investmentType = 'tokenName' in selectedAsset ? 'project' : 'pool';
    
    if (amount < minInvestment) {
      setError(t('reinvestModal.errorMinReinvestment', { projectName: assetName, minInvestment: minInvestment.toLocaleString() }));
      return;
    }
    if (amount > currentBalance) {
      setError(t('withdrawModal.errorExceedsBalance'));
      return;
    }
    setError('');
    addInvestmentFromBalance(amount, selectedAssetId, investmentType, investmentSource === 'deposit' ? 'deposit' : 'profit_reinvestment');
    onClose();
  };
  
  const renderSourceStep = () => (
    <div>
      <h3 className="text-lg font-semibold text-white mb-1">{t('reinvestModal.step1.title')}</h3>
      <p className="text-sm text-gray-400 mb-4">{t('reinvestModal.step1.subtitle')}</p>
      <div className="space-y-4">
        <button
          onClick={() => handleSourceSelect('deposit')}
          disabled={depositBalance <= 0}
          className="w-full text-left p-4 bg-gray-700 rounded-lg border-2 border-transparent hover:border-brand-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <div className="flex justify-between items-center">
            <span className="font-bold text-white">{t('reinvestModal.fromDeposits')}</span>
            <span className="text-lg font-semibold text-white">${depositBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          <p className="text-xs text-gray-400 mt-1">{t('reinvestModal.fromDepositsSubtitle')}</p>
        </button>
        <button
          onClick={() => handleSourceSelect('profit')}
          disabled={profitBalance <= 0}
          className="w-full text-left p-4 bg-gray-700 rounded-lg border-2 border-transparent hover:border-brand-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <div className="flex justify-between items-center">
            <span className="font-bold text-white">{t('reinvestModal.fromProfits')}</span>
            <span className="text-lg font-semibold text-green-400">${profitBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          <p className="text-xs text-gray-400 mt-1">{t('reinvestModal.fromProfitsSubtitle')}</p>
        </button>
      </div>
      <div className="flex justify-end mt-6">
        <button type="button" onClick={onClose} className="px-4 py-2 rounded-md bg-gray-600 text-white hover:bg-gray-500 text-sm">
            {t('common.cancel')}
        </button>
      </div>
    </div>
  );

  const renderAssetStep = () => (
    <div>
      <h3 className="text-lg font-semibold text-white mb-4">{t('reinvestModal.step2.title')}</h3>
      {availableAssets.length > 0 ? (
        <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
          {availableAssets.map(asset => (
            <button key={asset.id} onClick={() => handleAssetSelect(asset)} className="w-full text-left p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">
              <div className="flex justify-between items-center">
                  <h4 className="font-bold text-white">{'tokenName' in asset ? asset.tokenName : asset.name}</h4>
                  {'tokenName' in asset ? 
                    <span className="text-[10px] bg-blue-900 text-blue-300 px-2 py-0.5 rounded-full uppercase">{t('reinvestModal.rwaProject')}</span> :
                    <span className="text-[10px] bg-purple-900 text-purple-300 px-2 py-0.5 rounded-full uppercase">{t('reinvestModal.legacyFund')}</span>
                  }
              </div>
              <div className="flex items-center justify-between text-xs text-gray-400 mt-2">
                <span>APY: <span className="text-green-400 font-semibold">{'expectedYield' in asset ? asset.expectedYield : asset.apy}%</span></span>
                <span>{t('admin.projects.minInvestment')}: <span className="text-white font-semibold">${asset.minInvestment.toLocaleString()}</span></span>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-400 py-8">{t('reinvestModal.noOptionsAvailable')}</p>
      )}
      <div className="flex justify-between items-center mt-6">
        <button type="button" onClick={() => setStep('source')} className="text-sm text-gray-400 hover:text-white">&larr; {t('common.back')}</button>
        <button type="button" onClick={onClose} className="px-4 py-2 rounded-md bg-gray-600 text-white hover:bg-gray-500 text-sm">
          {t('common.cancel')}
        </button>
      </div>
    </div>
  );

  const renderAmountStep = () => {
      if (!selectedAsset) return null;
      const assetName = 'tokenName' in selectedAsset ? selectedAsset.tokenName : selectedAsset.name;
      return (
          <form onSubmit={handleSubmit}>
              <h3 className="text-lg font-semibold text-white mb-2">{t('reinvestModal.step3.title')}</h3>
              <div className="p-3 bg-gray-700 rounded-lg mb-4">
                  <p className="text-xs text-gray-400">{t('reinvestModal.step3.investingIn')}</p>
                  <p className="font-bold text-white">{assetName}</p>
                  <p className="text-xs text-green-400 mt-1">{t('admin.legacyFunds.apy')}: {'expectedYield' in selectedAsset ? selectedAsset.expectedYield : selectedAsset.apy}%</p>
              </div>
              <div>
                  <label htmlFor="amount" className="block text-sm font-medium text-gray-300 mb-2">
                      {t('reinvestModal.amountLabel')}
                  </label>
                  <input
                      type="number" id="amount" value={amount}
                      onChange={(e) => setAmount(Number(e.target.value))}
                      className="w-full bg-gray-700 text-white rounded-md border-gray-600 px-4 py-2"
                      min="0" max={currentBalance} step="0.01"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>{t('reinvestModal.min')}: ${selectedAsset.minInvestment.toLocaleString()}</span>
                      <span>{t('wallet.availableBalance')}: ${currentBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
              </div>
              <div className="flex justify-between items-center mt-6">
                  {!initialAssetId && <button type="button" onClick={() => setStep('asset')} className="text-sm text-gray-400 hover:text-white">&larr; {t('common.back')}</button>}
                  <div className="flex space-x-4 ml-auto">
                      <button type="button" onClick={onClose} className="px-4 py-2 rounded-md bg-gray-600 text-white hover:bg-gray-500">{t('common.cancel')}</button>
                      <button type="submit" className="px-4 py-2 rounded-md bg-brand-primary text-white hover:bg-brand-primary/90">{t('reinvestModal.reinvestNow')}</button>
                  </div>
              </div>
          </form>
      );
  };
  
  const renderStepContent = () => {
    switch(step) {
      case 'source': return renderSourceStep();
      case 'asset': return renderAssetStep();
      case 'amount': return renderAmountStep();
      default: return null;
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="relative bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white z-10" aria-label={t('common.close')}>
            <XIcon className="w-6 h-6" />
        </button>
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-white">{t('wallet.investFromWallet')}</h2>
            {!initialAssetId && (
                <div className="flex space-x-1.5">
                    <div className={`w-3 h-3 rounded-full ${step === 'source' ? 'bg-brand-primary' : 'bg-gray-600'}`}></div>
                    <div className={`w-3 h-3 rounded-full ${step === 'asset' ? 'bg-brand-primary' : 'bg-gray-600'}`}></div>
                    <div className={`w-3 h-3 rounded-full ${step === 'amount' ? 'bg-brand-primary' : 'bg-gray-600'}`}></div>
                </div>
            )}
        </div>
        
        {renderStepContent()}
        
      </div>
    </div>
  );
};

export default ReinvestModal;
