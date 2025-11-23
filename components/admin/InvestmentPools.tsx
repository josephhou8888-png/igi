
import React, { useState } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { useLocalization } from '../../hooks/useLocalization';
import { InvestmentPool } from '../../types';
import PoolEditorModal from './PoolEditorModal';
import { PlusCircleIcon } from '../../constants';

const InvestmentPools: React.FC = () => {
    const { investmentPools, deleteInvestmentPool } = useAppContext();
    const { t } = useLocalization();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPool, setEditingPool] = useState<InvestmentPool | null>(null);

    const handleCreate = () => {
        setEditingPool(null);
        setIsModalOpen(true);
    };

    const handleEdit = (pool: InvestmentPool) => {
        setEditingPool(pool);
        setIsModalOpen(true);
    };

    const handleDelete = (poolId: string) => {
        deleteInvestmentPool(poolId);
    };

    return (
        <>
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-white">{t('admin.legacyFunds.title')}</h3>
                    <button
                        onClick={handleCreate}
                        className="flex items-center bg-brand-primary hover:bg-brand-primary/90 text-white font-bold py-2 px-4 rounded-lg text-sm"
                    >
                        <PlusCircleIcon className="w-5 h-5 mr-2" />
                        {t('admin.legacyFunds.createNew')}
                    </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {investmentPools.map(pool => (
                        <div key={pool.id} className="bg-gray-700 p-6 rounded-lg shadow-md flex flex-col">
                            <div className="flex-grow">
                                <h4 className="text-xl font-bold text-white">{pool.name}</h4>
                                <p className="text-sm text-gray-300 mt-2 h-16 overflow-hidden">{pool.description}</p>
                            </div>
                            <div className="mt-4 pt-4 border-t border-gray-600 space-y-2 text-white">
                                <div className="flex justify-between">
                                    <span className="text-xs text-gray-400">{t('admin.projects.minInvestment')}</span>
                                    <span className="font-semibold">${pool.minInvestment.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-xs text-gray-400">{t('admin.legacyFunds.apy')}</span>
                                    <span className="font-semibold text-green-400">{pool.apy}%</span>
                                </div>
                            </div>
                            <div className="flex justify-end space-x-2 mt-4">
                                <button onClick={() => handleEdit(pool)} className="text-xs font-semibold text-cyan-400 hover:underline">{t('common.edit').toUpperCase()}</button>
                                <button onClick={() => handleDelete(pool.id)} className="text-xs font-semibold text-red-400 hover:underline">{t('common.delete').toUpperCase()}</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            {isModalOpen && (
                <PoolEditorModal 
                    poolToEdit={editingPool}
                    onClose={() => setIsModalOpen(false)}
                />
            )}
        </>
    );
};

export default InvestmentPools;