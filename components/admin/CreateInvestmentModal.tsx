
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { useLocalization } from '../../hooks/useLocalization';

interface CreateInvestmentModalProps {
  onClose: () => void;
}

const CreateInvestmentModal: React.FC<CreateInvestmentModalProps> = ({ onClose }) => {
  const { users, projects, investmentPools, addInvestmentForUser } = useAppContext();
  const { t } = useLocalization();
  const [investmentType, setInvestmentType] = useState<'project' | 'pool'>('project');
  const [investmentSource, setInvestmentSource] = useState<'deposit' | 'profit_reinvestment'>('deposit');
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [selectedAssetId, setSelectedAssetId] = useState<string>(projects[0]?.id || '');
  const [amount, setAmount] = useState(projects[0]?.minInvestment || 3000);
  const [error, setError] = useState('');

  useEffect(() => {
    if (investmentType === 'project' && projects.length > 0) {
      const firstProject = projects[0];
      setSelectedAssetId(firstProject.id);
      setAmount(firstProject.minInvestment);
    } else if (investmentType === 'pool' && investmentPools.length > 0) {
      const firstPool = investmentPools[0];
      setSelectedAssetId(firstPool.id);
      setAmount(firstPool.minInvestment);
    } else {
      setSelectedAssetId('');
      setAmount(0);
    }
  }, [investmentType, projects, investmentPools]);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let minInvestment = 0;
    let assetName = '';

    if (investmentType === 'project') {
      const project = projects.find(p => p.id === selectedAssetId);
      if (!selectedUserId || !project) {
        setError(t('admin.createInvestment.errorSelectUserAndProject'));
        return;
      }
      minInvestment = project.minInvestment;
      assetName = project.tokenName;
    } else {
      const pool = investmentPools.find(p => p.id === selectedAssetId);
      if (!selectedUserId || !pool) {
        setError(t('admin.createInvestment.errorSelectUserAndFund'));
        return;
      }
      minInvestment = pool.minInvestment;
      assetName = pool.name;
    }
    
    if (amount < minInvestment) {
      setError(t('investModal.errorMinInvestment', { projectName: assetName, minInvestment: minInvestment.toLocaleString() }));
      return;
    }
    setError('');
    addInvestmentForUser(selectedUserId, amount, selectedAssetId, investmentType, investmentSource);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg shadow-xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-white mb-6">{t('admin.createInvestment.title')}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300">{t('admin.createInvestment.selectUser')}</label>
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="w-full bg-gray-700 text-white rounded-md mt-1 px-3 py-2"
              required
            >
              <option value="" disabled>{t('admin.createInvestment.selectUserPlaceholder')}</option>
              {users.filter(u => u.role === 'user').map(user => (
                <option key={user.id} value={user.id}>{user.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {t('reinvestModal.investmentType')}
            </label>
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
            <label className="block text-sm font-medium text-gray-300">
                {investmentType === 'project' ? t('investModal.projectLabel') : t('reinvestModal.legacyFund')}
            </label>
            <select
              value={selectedAssetId}
              onChange={(e) => setSelectedAssetId(e.target.value)}
              className="w-full bg-gray-700 text-white rounded-md mt-1 px-3 py-2"
              required
            >
              <option value="" disabled>{ investmentType === 'project' ? 'Choose a project...' : t('admin.createInvestment.selectFundPlaceholder')}</option>
              {investmentType === 'project' ? projects.map(project => (
                <option key={project.id} value={project.id}>{project.tokenName}</option>
              )) : investmentPools.map(pool => (
                <option key={pool.id} value={pool.id}>{pool.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {t('reinvestModal.investmentSource')}
            </label>
            <select
              value={investmentSource}
              onChange={(e) => setInvestmentSource(e.target.value as 'deposit' | 'profit_reinvestment')}
              className="w-full bg-gray-700 text-white rounded-md mt-1 px-3 py-2"
            >
              <option value="deposit">{t('reinvestModal.fromDeposits')}</option>
              <option value="profit_reinvestment">{t('reinvestModal.fromProfits')}</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">{t('investModal.amountLabel')}</label>
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
            <button type="submit" className="px-4 py-2 rounded-md bg-brand-primary text-white hover:bg-brand-primary/90">{t('admin.createInvestment.create')}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateInvestmentModal;
