import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { useLocalization } from '../../hooks/useLocalization';
import { Bonus } from '../../types';
import BonusPayoutChart from '../charts/BonusPayoutChart';

type BonusTypeFilter = 'All' | Bonus['type'];

const PayoutMonitoring: React.FC = () => {
    const { bonuses, users } = useAppContext();
    const { t } = useLocalization();
    const [bonusTypeFilter, setBonusTypeFilter] = useState<BonusTypeFilter>('All');
    const [dateRange, setDateRange] = useState({ start: '', end: '' });

    const filteredBonuses = useMemo(() => {
        return bonuses
            .filter(bonus => {
                if (bonusTypeFilter !== 'All' && bonus.type !== bonusTypeFilter) {
                    return false;
                }
                const bonusDate = new Date(bonus.date);
                if (dateRange.start && bonusDate < new Date(dateRange.start)) {
                    return false;
                }
                if (dateRange.end) {
                    const endDate = new Date(dateRange.end);
                    endDate.setHours(23, 59, 59, 999); // Include the whole end day
                    if (bonusDate > endDate) {
                        return false;
                    }
                }
                return true;
            })
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [bonuses, bonusTypeFilter, dateRange]);

    const getUserName = (userId: string) => users.find(u => u.id === userId)?.name || 'N/A';
    
    const totalPayout = useMemo(() => filteredBonuses.reduce((sum, b) => sum + b.amount, 0), [filteredBonuses]);

    const chartData = useMemo(() => {
        const dailyTotals: { [date: string]: number } = {};
        filteredBonuses.forEach(bonus => {
            const date = bonus.date;
            if (!dailyTotals[date]) {
                dailyTotals[date] = 0;
            }
            dailyTotals[date] += bonus.amount;
        });
        return Object.entries(dailyTotals)
            .map(([date, amount]) => ({ date, amount }))
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }, [filteredBonuses]);

    return (
        <div className="space-y-6">
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                <h3 className="text-lg font-semibold text-white mb-4">{t('admin.payouts.filtersTitle')}</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-700 rounded-lg">
                    <div>
                        <label className="text-xs text-gray-400">{t('admin.payouts.bonusType')}</label>
                        <select
                            value={bonusTypeFilter}
                            onChange={e => setBonusTypeFilter(e.target.value as BonusTypeFilter)}
                            className="w-full bg-gray-600 text-white rounded-md mt-1 px-3 py-2 text-sm"
                        >
                            <option value="All">{t('admin.payouts.allTypes')}</option>
                            <option value="Instant">{t('bonusType.Instant')}</option>
                            <option value="Team Builder">{t('bonusType.Team Builder')}</option>
                            <option value="Leadership">{t('bonusType.Leadership')}</option>
                            <option value="Asset Growth">{t('bonusType.Asset Growth')}</option>
                        </select>
                    </div>
                    <div>
                         <label className="text-xs text-gray-400">{t('admin.payouts.startDate')}</label>
                         <input 
                            type="date"
                            value={dateRange.start}
                            onChange={e => setDateRange(prev => ({...prev, start: e.target.value}))}
                            className="w-full bg-gray-600 text-white rounded-md mt-1 px-3 py-2 text-sm"
                         />
                    </div>
                    <div>
                         <label className="text-xs text-gray-400">{t('admin.payouts.endDate')}</label>
                         <input 
                            type="date"
                            value={dateRange.end}
                            onChange={e => setDateRange(prev => ({...prev, end: e.target.value}))}
                            className="w-full bg-gray-600 text-white rounded-md mt-1 px-3 py-2 text-sm"
                         />
                    </div>
                     <div className="bg-gray-800 p-3 rounded-md text-center flex flex-col justify-center">
                        <label className="text-xs text-gray-400 uppercase">{t('admin.payouts.totalPayout')}</label>
                        <p className="text-xl font-bold text-green-400 mt-1">${totalPayout.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
                    </div>
                </div>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                <h3 className="text-lg font-semibold text-white mb-4">{t('admin.payouts.trendAnalysis')}</h3>
                <p className="text-sm text-gray-400 mb-4">
                    {t('admin.payouts.chartDescription')}
                </p>
                <div className="h-72">
                    <BonusPayoutChart data={chartData} />
                </div>
            </div>
            
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                <h3 className="text-lg font-semibold text-white mb-4">{t('admin.payouts.detailedLog')}</h3>
                <div className="overflow-x-auto max-h-[600px]">
                    <table className="w-full text-sm text-left text-gray-300">
                        <thead className="text-xs text-gray-400 uppercase bg-gray-700 sticky top-0">
                            <tr>
                                <th scope="col" className="px-6 py-3">{t('admin.payouts.table.date')}</th>
                                <th scope="col" className="px-6 py-3">{t('admin.payouts.table.recipient')}</th>
                                <th scope="col" className="px-6 py-3">{t('admin.payouts.table.type')}</th>
                                <th scope="col" className="px-6 py-3">{t('admin.payouts.table.amount')}</th>
                                <th scope="col" className="px-6 py-3">{t('admin.payouts.table.sourceId')}</th>
                            </tr>
                        </thead>
                        <tbody className="bg-gray-800">
                            {filteredBonuses.map(bonus => (
                                <tr key={bonus.id} className="border-b border-gray-700 hover:bg-gray-600">
                                    <td className="px-6 py-4">{bonus.date}</td>
                                    <td className="px-6 py-4 font-medium text-white">{getUserName(bonus.userId)}</td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 rounded-full text-xs font-semibold bg-purple-900 text-purple-300">
                                            {t(`bonusType.${bonus.type}`)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-semibold text-green-400">
                                        ${bonus.amount.toLocaleString(undefined, {minimumFractionDigits: 2})}
                                    </td>
                                    <td className="px-6 py-4 text-gray-400 text-xs font-mono">
                                        {bonus.sourceId}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default PayoutMonitoring;