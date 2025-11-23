
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { useLocalization } from '../../hooks/useLocalization';
import { InvestmentPool } from '../../types';

interface PoolEditorModalProps {
    poolToEdit: InvestmentPool | null;
    onClose: () => void;
}

const PoolEditorModal: React.FC<PoolEditorModalProps> = ({ poolToEdit, onClose }) => {
    const { addInvestmentPool, updateInvestmentPool } = useAppContext();
    const { t } = useLocalization();
    
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        minInvestment: 3000,
        apy: 10,
    });

    useEffect(() => {
        if (poolToEdit) {
            setFormData({
                name: poolToEdit.name,
                description: poolToEdit.description,
                minInvestment: poolToEdit.minInvestment,
                apy: poolToEdit.apy,
            });
        }
    }, [poolToEdit]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'number' ? Number(value) : value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (poolToEdit) {
            updateInvestmentPool({ ...poolToEdit, ...formData });
        } else {
            addInvestmentPool(formData);
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-lg shadow-xl p-8 w-full max-w-lg">
                <h2 className="text-2xl font-bold text-white mb-6">
                    {poolToEdit ? t('admin.legacyFundEditor.editTitle') : t('admin.legacyFundEditor.createTitle')}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300">{t('admin.legacyFundEditor.fundName')}</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full bg-gray-700 text-white rounded-md mt-1 px-3 py-2" required />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-300">{t('admin.legacyFundEditor.description')}</label>
                        <textarea name="description" value={formData.description} onChange={handleChange} rows={3} className="w-full bg-gray-700 text-white rounded-md mt-1 px-3 py-2" required />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                         <div>
                            <label className="block text-sm font-medium text-gray-300">{t('admin.projects.minInvestment')}</label>
                            <input type="number" name="minInvestment" value={formData.minInvestment} onChange={handleChange} min="0" step="100" className="w-full bg-gray-700 text-white rounded-md mt-1 px-3 py-2" required />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-300">{t('admin.legacyFunds.apy')} (%)</label>
                            <input type="number" name="apy" value={formData.apy} onChange={handleChange} min="0" step="0.5" className="w-full bg-gray-700 text-white rounded-md mt-1 px-3 py-2" required />
                        </div>
                    </div>
                    <div className="flex justify-end space-x-4 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-md bg-gray-600 text-white hover:bg-gray-500">{t('common.cancel')}</button>
                        <button type="submit" className="px-4 py-2 rounded-md bg-brand-primary text-white hover:bg-brand-primary/90">{t('admin.legacyFundEditor.saveFund')}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PoolEditorModal;