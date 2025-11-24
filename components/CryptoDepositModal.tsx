
import React, { useState, useMemo } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { useLocalization } from '../hooks/useLocalization';
import { TreasuryWallets } from '../types';
import { CopyIcon } from '../constants';

interface CryptoDepositModalProps {
  onClose: () => void;
  initialNetwork?: keyof TreasuryWallets;
}

type Step = 'amount' | 'payment' | 'confirm';
type Network = keyof TreasuryWallets;

const CryptoDepositModal: React.FC<CryptoDepositModalProps> = ({ onClose, initialNetwork }) => {
  const { treasuryWallets, addCryptoDeposit, projects, investmentPools } = useAppContext();
  const { t } = useLocalization();
  
  const [step, setStep] = useState<Step>('amount');
  const [amount, setAmount] = useState(100);
  const [network, setNetwork] = useState<Network>(initialNetwork || 'erc20');
  const [txId, setTxId] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [selectedTargetId, setSelectedTargetId] = useState<string>('');

  const allAssets = useMemo(() => [
      ...projects.map(p => ({ id: p.id, name: p.tokenName, type: 'project', min: p.minInvestment })),
      ...investmentPools.map(p => ({ id: p.id, name: p.name, type: 'pool', min: p.minInvestment }))
  ], [projects, investmentPools]);

  const selectedAsset = useMemo(() => allAssets.find(a => a.id === selectedTargetId), [selectedTargetId, allAssets]);

  const handleNext = () => {
      if (selectedAsset && amount < selectedAsset.min) {
          alert(t('investModal.errorMinInvestment', { projectName: selectedAsset.name, minInvestment: selectedAsset.min.toLocaleString() }));
          return;
      }
      setStep('payment');
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!txId) return;
    
    let reason = '';
    if (selectedAsset) {
        // Encode investment intent into the reason field
        reason = JSON.stringify({
            intent: 'auto_invest',
            targetId: selectedAsset.id,
            targetType: selectedAsset.type,
            targetName: selectedAsset.name
        });
    }

    addCryptoDeposit(amount, txId, reason);
    setStep('confirm');
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };
  
  const currentAddress = treasuryWallets[network];

  const renderStep = () => {
    switch(step) {
      case 'amount':
        return (
          <>
            <h2 className="text-2xl font-bold text-white mb-4">{t('cryptoDepositModal.step1.title')}</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-300 mb-2">
                  {t('cryptoDepositModal.amountLabel')}
                </label>
                <input
                  type="number" id="amount" value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full bg-gray-700 text-white rounded-md border-gray-600 px-4 py-2"
                  min="1"
                />
              </div>
              
              <div>
                <label htmlFor="target" className="block text-sm font-medium text-gray-300 mb-2">
                  {t('cryptoDepositModal.targetLabel')} <span className="text-gray-500 text-xs">({t('cryptoDepositModal.optional')})</span>
                </label>
                <select
                  id="target"
                  value={selectedTargetId}
                  onChange={(e) => {
                      setSelectedTargetId(e.target.value);
                      const asset = allAssets.find(a => a.id === e.target.value);
                      if (asset && amount < asset.min) {
                          setAmount(asset.min);
                      }
                  }}
                  className="w-full bg-gray-700 text-white rounded-md border-gray-600 px-4 py-2"
                >
                  <option value="">{t('cryptoDepositModal.targetWallet')}</option>
                  <optgroup label={t('reinvestModal.rwaProject')}>
                      {projects.map(p => <option key={p.id} value={p.id}>{p.tokenName} (Min ${p.minInvestment.toLocaleString()})</option>)}
                  </optgroup>
                  <optgroup label={t('reinvestModal.legacyFund')}>
                      {investmentPools.map(p => <option key={p.id} value={p.id}>{p.name} (Min ${p.minInvestment.toLocaleString()})</option>)}
                  </optgroup>
                </select>
                <p className="text-xs text-gray-400 mt-1">
                    {selectedTargetId ? t('cryptoDepositModal.targetSelectedHint') : t('cryptoDepositModal.targetWalletHint')}
                </p>
              </div>

              <div>
                <label htmlFor="network" className="block text-sm font-medium text-gray-300 mb-2">
                  {t('cryptoDepositModal.networkLabel')}
                </label>
                <select
                  id="network" value={network}
                  onChange={(e) => setNetwork(e.target.value as Network)}
                  className="w-full bg-gray-700 text-white rounded-md border-gray-600 px-4 py-2"
                >
                  <option value="erc20">ERC20 (Ethereum)</option>
                  <option value="trc20">TRC20 (TRON)</option>
                  <option value="polygon">Polygon (Matic)</option>
                  <option value="solana">Solana (SOL)</option>
                </select>
              </div>
            </div>
             <div className="flex justify-end space-x-4 mt-8">
                <button type="button" onClick={onClose} className="px-4 py-2 rounded-md bg-gray-600 text-white hover:bg-gray-500">{t('common.cancel')}</button>
                <button type="button" onClick={handleNext} className="px-4 py-2 rounded-md bg-brand-primary text-white hover:bg-brand-primary/90">{t('cryptoDepositModal.next')}</button>
            </div>
          </>
        );
      case 'payment':
        return (
          <form onSubmit={handleSubmit}>
            <h2 className="text-2xl font-bold text-white mb-4">{t('cryptoDepositModal.step2.title')}</h2>
            <div className="space-y-4 text-center">
                <p className="text-gray-300 text-sm">
                    {t('cryptoDepositModal.sendInstruction', { amount: amount, network: network.toUpperCase() })}
                </p>
                <div className="bg-gray-100 p-2 rounded-lg inline-block">
                     <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${currentAddress}&bgcolor=F3F4F6&color=111827&qzone=1`} 
                        alt="QR Code"
                        className="w-44 h-44"
                    />
                </div>
                <div className="bg-gray-700 p-3 rounded-lg">
                    <p className="text-xs text-gray-400 mb-1">{t('cryptoDepositModal.walletAddress')}</p>
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-mono text-white break-all mr-2">{currentAddress}</p>
                        <button type="button" onClick={() => handleCopy(currentAddress)} className="text-gray-300 hover:text-white flex-shrink-0" title={t('cryptoDepositModal.copyAddress')}>
                           <CopyIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>
                 {isCopied && <p className="text-green-400 text-xs">{t('cryptoDepositModal.copied')}</p>}
                <p className="text-xs bg-red-900/50 text-red-300 p-2 rounded-lg">{t('cryptoDepositModal.warning')}</p>
                <div>
                  <label htmlFor="txId" className="block text-sm font-medium text-gray-300 mb-2 text-left">
                    {t('cryptoDepositModal.txIdLabel')}
                  </label>
                  <input
                    type="text" id="txId" value={txId}
                    onChange={(e) => setTxId(e.target.value)}
                    placeholder={t('cryptoDepositModal.txIdPlaceholder')}
                    className="w-full bg-gray-700 text-white rounded-md border-gray-600 px-4 py-2"
                    required
                  />
                </div>
            </div>
            <div className="flex justify-end space-x-4 mt-8">
              <button type="button" onClick={() => setStep('amount')} className="px-4 py-2 rounded-md bg-gray-600 text-white hover:bg-gray-500">{t('common.back')}</button>
              <button type="submit" className="px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-500">{t('cryptoDepositModal.confirmPayment')}</button>
            </div>
          </form>
        );
       case 'confirm':
        return (
            <div className="text-center">
                 <h2 className="text-2xl font-bold text-white mb-4">{t('cryptoDepositModal.step3.title')}</h2>
                 <p className="text-gray-300">
                    {t('cryptoDepositModal.successMessage', { amount: amount })}
                 </p>
                 {selectedAsset && (
                     <p className="text-brand-primary mt-4 font-semibold text-sm">
                         {t('cryptoDepositModal.autoInvestMessage', { asset: selectedAsset.name })}
                     </p>
                 )}
                 <button onClick={onClose} className="mt-8 px-6 py-2 rounded-md bg-brand-primary text-white hover:bg-brand-primary/90">
                    {t('cryptoDepositModal.finish')}
                 </button>
            </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg shadow-xl p-8 w-full max-w-md">
        {renderStep()}
      </div>
    </div>
  );
};

export default CryptoDepositModal;
