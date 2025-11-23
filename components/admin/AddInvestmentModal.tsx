import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { useLocalization } from '../../hooks/useLocalization';
import { User } from '../../types';

interface AddInvestmentModalProps {
  user: User;
  onClose: () => void;
}

const AddInvestmentModal: React.FC<AddInvestmentModalProps> = ({ user, onClose }) => {
  const { projects, investmentPools, confirmCryptoInvestment } = useAppContext();
  const { t } = useLocalization();

  const [investmentType, setInvestmentType] = useState<'project' | 'pool'>('project');
  const [selectedAssetId, setSelectedAssetId] = useState<string>('');
  const [amount, setAmount] = useState(0);
  const [error, setError] = useState('');

  const availableAssets = investmentType === 'project' ? projects : investmentPools;

  useEffect(() => {
    if (availableAssets.length > 0) {
      const firstAsset = availableAssets[0];
      setSelectedAssetId(firstAsset.id);
      setAmount(firstAsset.minInvestment || 3000);
    } else {
      setSelectedAssetId('');
      setAmount(0);
    }
  }, [investmentType, projects, investmentPools]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssetId || !user) {
      setError(t('admin.addInvestment.errorSelectAsset'));
      return;
    }
    
    const asset = availableAssets.find(a => a.id === selectedAssetId);
    if (!asset) return;

    if (amount < asset.minInvestment) {
      setError(t('investModal.errorMinInvestment', { projectName: ('tokenName' in asset ? asset.tokenName : asset.name), minInvestment: asset.minInvestment.toLocaleString() }));
      return;
    }
    setError('');
    confirmCryptoInvestment(user.id, amount, selectedAssetId, investmentType);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg shadow-xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-white mb-2">{t('admin.addInvestment.title', { name: user.name })}</h2>
        <p className="text-sm text-gray-400 mb-6">{t('admin.addInvestment.subtitle')}</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">{t('admin.addInvestment.investmentType')}</label>
            <div className="flex space-x-4 bg-gray-700 p-1 rounded-lg">
              <button type="button" onClick={() => setInvestmentType('project')} className={`w-full py-2 rounded-md text-sm font-semibold ${investmentType === 'project' ? 'bg-brand-primary text-white' : 'text-gray-300'}`}>
                {t('reinvestModal.rwaProject')}
              </button>
              <button type="button" onClick={() => setInvestmentType('pool')} className={`w-full py-2 rounded-md text-sm font-semibold ${investmentType === 'pool' ? 'bg-brand-primary text-white' : 'text-gray-300'}`}>
                {t('reinvestModal.legacyFund')}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300">{t('admin.addInvestment.asset')}</label>
            <select
              value={selectedAssetId}
              onChange={(e) => setSelectedAssetId(e.target.value)}
              className="w-full bg-gray-700 text-white rounded-md mt-1 px-3 py-2"
              required
              disabled={availableAssets.length === 0}
            >
              {availableAssets.length > 0 ? (
                availableAssets.map(asset => (
                  <option key={asset.id} value={asset.id}>{('tokenName' in asset ? asset.tokenName : asset.name)}</option>
                ))
              ) : (
                <option value="">{t('reinvestModal.noOptionsAvailable')}</option>
              )}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300">{t('admin.addInvestment.amount')}</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full bg-gray-700 text-white rounded-md mt-1 px-3 py-2"
              min="1"
              required
            />
          </div>

          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          
          <div className="flex justify-end space-x-4 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-md bg-gray-600 text-white hover:bg-gray-500">{t('common.cancel')}</button>
            <button type="submit" className="px-4 py-2 rounded-md bg-brand-primary text-white hover:bg-brand-primary/90" disabled={availableAssets.length === 0}>
              {t('admin.addInvestment.confirm')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddInvestmentModal;