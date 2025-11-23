import React, { useState } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { useLocalization } from '../../hooks/useLocalization';
import { Investment } from '../../types';
import CreateInvestmentModal from './CreateInvestmentModal';
import EditInvestmentModal from './EditInvestmentModal';
import { PlusCircleIcon } from '../../constants';

const InvestmentManagement: React.FC = () => {
    const { investments, users, deleteInvestment } = useAppContext();
    const { t } = useLocalization();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingInvestment, setEditingInvestment] = useState<Investment | null>(null);

    const getUserName = (userId: string) => {
        return users.find(u => u.id === userId)?.name || t('admin.investments.unknownUser');
    };

    const handleExport = () => {
        const headers = ["ID", "User ID", "User Name", "Amount (USDT)", "Asset", "Date", "Status"];
        const csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + investments.map(inv => [
                inv.id,
                inv.userId,
                `"${getUserName(inv.userId)}"`,
                inv.amount,
                `"${inv.projectName || inv.poolName}"`,
                inv.date,
                inv.status
            ].join(",")).join("\n");
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "investments_export.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <>
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-white">{t('admin.investments.title')}</h3>
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="flex items-center bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-4 rounded-lg text-sm"
                        >
                            <PlusCircleIcon className="w-5 h-5 mr-2" />
                            {t('admin.investments.createInvestment')}
                        </button>
                        <button
                            onClick={handleExport}
                            className="bg-brand-primary hover:bg-brand-primary/90 text-white font-bold py-2 px-4 rounded-lg text-sm"
                        >
                            {t('admin.investments.exportCsv')}
                        </button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-300">
                        <thead className="text-xs text-gray-400 uppercase bg-gray-700">
                            <tr>
                                <th scope="col" className="px-6 py-3">{t('admin.investments.table.id')}</th>
                                <th scope="col" className="px-6 py-3">{t('admin.investments.table.user')}</th>
                                <th scope="col" className="px-6 py-3">{t('admin.investments.table.amount')}</th>
                                <th scope="col" className="px-6 py-3">{t('admin.investments.table.project')}</th>
                                <th scope="col" className="px-6 py-3">{t('admin.investments.table.date')}</th>
                                <th scope="col" className="px-6 py-3">{t('admin.investments.table.status')}</th>
                                <th scope="col" className="px-6 py-3">{t('admin.investments.table.actions')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {investments.map(inv => (
                                <tr key={inv.id} className="border-b border-gray-700 hover:bg-gray-600 bg-gray-800">
                                    <td className="px-6 py-4 font-mono text-xs">{inv.id}</td>
                                    <td className="px-6 py-4 font-medium text-white">{getUserName(inv.userId)}</td>
                                    <td className="px-6 py-4">${inv.amount.toLocaleString()}</td>
                                    <td className="px-6 py-4">{inv.projectName || inv.poolName}</td>
                                    <td className="px-6 py-4">{inv.date}</td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-900 text-green-300">
                                            {inv.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 space-x-4">
                                        <button onClick={() => setEditingInvestment(inv)} className="font-medium text-cyan-400 hover:underline text-xs">
                                            {t('common.edit')}
                                        </button>
                                        <button onClick={() => deleteInvestment(inv.id)} className="font-medium text-red-400 hover:underline text-xs">
                                            {t('common.delete')}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            {isCreateModalOpen && <CreateInvestmentModal onClose={() => setIsCreateModalOpen(false)} />}
            {editingInvestment && <EditInvestmentModal investment={editingInvestment} onClose={() => setEditingInvestment(null)} />}
        </>
    );
};

export default InvestmentManagement;