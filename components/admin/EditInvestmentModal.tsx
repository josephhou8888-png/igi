import React, { useState } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { useLocalization } from '../../hooks/useLocalization';
import { Investment } from '../../types';

interface EditInvestmentModalProps {
  investment: Investment;
  onClose: () => void;
}

const EditInvestmentModal: React.FC<EditInvestmentModalProps> = ({ investment, onClose }) => {
  const { updateInvestment, projects, investmentPools } = useAppContext();
  const { t } = useLocalization();
  const [formData, setFormData] = useState<Investment>(investment);
  const [investmentType, setInvestmentType] = useState<'project' | 'pool'>(investment.projectId ? 'project' : 'pool');

  const handleTypeChange = (newType: 'project' | 'pool') => {
    setInvestmentType(newType);
    if (newType === 'project') {
        const firstProject = projects[0];
        setFormData(prev => {
            const { poolId, poolName, ...rest } = prev;
            return {
                ...rest,
                projectId: firstProject?.id || '',
                projectName: firstProject?.tokenName || ''
            };
        });
    } else { // 'pool'
        const firstPool = investmentPools[0];
        setFormData(prev => {
            const { projectId, projectName, ...rest } = prev;
            return {
                ...rest,
                poolId: firstPool?.id || '',
                poolName: firstPool?.name || ''
            };
        });
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'projectId') {
        const project = projects.find(p => p.id === value);
        setFormData(prev => ({ ...prev, projectId: value, projectName: project?.tokenName || '' }));
    } else if (name === 'poolId') {
        const pool = investmentPools.find(p => p.id === value);
        setFormData(prev => ({ ...prev, poolId: value, poolName: pool?.name || '' }));
    } else {
        setFormData(prev => ({ ...prev, [name]: name === 'amount' ? Number(value) : value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateInvestment(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg shadow-xl p-8 w-full max-w-lg">
        <h2 className="text-2xl font-bold text-white mb-6">{t('admin.editInvestment.title')}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300">{t('admin.editInvestment.amount')}</label>
            <input type="number" name="amount" value={formData.amount} onChange={handleChange} className="w-full bg-gray-700 text-white rounded-md mt-1 px-3 py-2"/>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">{t('admin.editInvestment.date')}</label>
            <input type="date" name="date" value={formData.date} onChange={handleChange} className="w-full bg-gray-700 text-white rounded-md mt-1 px-3 py-2"/>
          </div>
           <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {t('reinvestModal.investmentType')}
            </label>
             <div className="flex space-x-4 bg-gray-700 p-1 rounded-lg">
              <button type="button" onClick={() => handleTypeChange('project')} className={`w-full py-2 rounded-md text-sm font-semibold ${investmentType === 'project' ? 'bg-brand-primary text-white' : 'text-gray-300'}`}>
                {t('reinvestModal.rwaProject')}
              </button>
              <button type="button" onClick={() => handleTypeChange('pool')} className={`w-full py-2 rounded-md text-sm font-semibold ${investmentType === 'pool' ? 'bg-brand-primary text-white' : 'text-gray-300'}`}>
                {t('reinvestModal.legacyFund')}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">{t('admin.editInvestment.project')}</label>
            {investmentType === 'project' ? (
                 <select name="projectId" value={formData.projectId || ''} onChange={handleChange} className="w-full bg-gray-700 text-white rounded-md mt-1 px-3 py-2">
                 {projects.map(project => (
                   <option key={project.id} value={project.id}>{project.tokenName}</option>
                 ))}
               </select>
            ) : (
                <select name="poolId" value={formData.poolId || ''} onChange={handleChange} className="w-full bg-gray-700 text-white rounded-md mt-1 px-3 py-2">
                {investmentPools.map(pool => (
                    <option key={pool.id} value={pool.id}>{pool.name}</option>
                ))}
                </select>
            )}
          </div>
           <div>
            <label className="block text-sm font-medium text-gray-300">{t('admin.editInvestment.status')}</label>
            <select name="status" value={formData.status} onChange={handleChange} className="w-full bg-gray-700 text-white rounded-md mt-1 px-3 py-2">
              <option value="Active">{t('admin.editInvestment.statusActive')}</option>
              <option value="Completed">{t('admin.editInvestment.statusCompleted')}</option>
            </select>
          </div>
          <div className="flex justify-end space-x-4 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-md bg-gray-600 text-white hover:bg-gray-500">{t('common.cancel')}</button>
            <button type="submit" className="px-4 py-2 rounded-md bg-brand-primary text-white hover:bg-brand-primary/90">{t('common.saveChanges')}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditInvestmentModal;