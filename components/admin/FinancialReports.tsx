import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { useLocalization } from '../../hooks/useLocalization';
import { Bonus } from '../../types';
import NetFlowChart from '../charts/NetFlowChart';
import { DollarSignIcon, TrendingUpIcon, TrendingDownIcon } from '../../constants';

const FinancialReports: React.FC = () => {
    const { transactions, bonuses, currentDate } = useAppContext();
    const { t } = useLocalization();
    const [dateRange, setDateRange] = useState({
        start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString().split('T')[0],
        end: currentDate.toISOString().split('T')[0],
    });

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDateRange(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const { filteredTransactions, filteredBonuses } = useMemo(() => {
        const start = dateRange.start ? new Date(dateRange.start) : null;
        const end = dateRange.end ? new Date(dateRange.end) : null;
        
        if (end) end.setHours(23, 59, 59, 999);

        const filterByDate = (item: { date: string }) => {
            const itemDate = new Date(item.date);
            if (start && itemDate < start) return false;
            if (end && itemDate > end) return false;
            return true;
        };

        return {
            filteredTransactions: transactions.filter(filterByDate),
            filteredBonuses: bonuses.filter(filterByDate),
        };
    }, [transactions, bonuses, dateRange]);

    const stats = useMemo(() => {
        const totalDeposits = filteredTransactions
            .filter(t => t.type === 'Deposit')
            .reduce((sum, t) => sum + t.amount, 0);

        const totalWithdrawals = filteredTransactions
            .filter(t => t.type === 'Withdrawal')
            .reduce((sum, t) => sum + t.amount, 0);
        
        const totalBonuses = filteredBonuses.reduce((sum, b) => sum + b.amount, 0);

        const netFlow = totalDeposits - totalWithdrawals;

        const bonusBreakdown = filteredBonuses.reduce((acc, bonus) => {
            acc[bonus.type] = (acc[bonus.type] || 0) + bonus.amount;
            return acc;
        }, {} as Record<Bonus['type'], number>);

        return { totalDeposits, totalWithdrawals, netFlow, totalBonuses, bonusBreakdown };
    }, [filteredTransactions, filteredBonuses]);

    const netFlowChartData = useMemo(() => {
        const dailyData: { [date: string]: number } = {};
        filteredTransactions.forEach(tx => {
            if (!dailyData[tx.date]) {
                dailyData[tx.date] = 0;
            }
            if (tx.type === 'Deposit') {
                dailyData[tx.date] += tx.amount;
            } else if (tx.type === 'Withdrawal') {
                dailyData[tx.date] -= tx.amount;
            }
        });
        return Object.entries(dailyData)
            .map(([date, netFlow]) => ({ date, netFlow }))
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }, [filteredTransactions]);

    const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode; colorClass?: string }> = ({ title, value, icon, colorClass = 'text-white' }) => (
        <div className="bg-gray-700 p-6 rounded-lg shadow-lg flex items-start space-x-4">
            <div className="bg-gray-800 p-3 rounded-full">{icon}</div>
            <div>
                <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">{title}</h3>
                <p className={`text-2xl font-bold ${colorClass}`}>{value}</p>
            </div>
        </div>
    );
    
    return (
        <div className="space-y-6">
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                <h3 className="text-lg font-semibold text-white mb-4">{t('admin.reports.filtersTitle')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                    <div>
                        <label className="text-xs text-gray-400">{t('admin.reports.startDate')}</label>
                        <input 
                            type="date"
                            name="start"
                            value={dateRange.start}
                            onChange={handleDateChange}
                            className="w-full bg-gray-600 text-white rounded-md mt-1 px-3 py-2 text-sm"
                        />
                    </div>
                    <div>
                        <label className="text-xs text-gray-400">{t('admin.reports.endDate')}</label>
                        <input 
                            type="date"
                            name="end"
                            value={dateRange.end}
                            onChange={handleDateChange}
                            className="w-full bg-gray-600 text-white rounded-md mt-1 px-3 py-2 text-sm"
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title={t('admin.reports.totalDeposits')} value={`$${stats.totalDeposits.toLocaleString(undefined, {minimumFractionDigits: 2})}`} icon={<TrendingUpIcon className="w-6 h-6 text-green-400" />} colorClass="text-green-400" />
                <StatCard title={t('admin.reports.totalWithdrawals')} value={`$${stats.totalWithdrawals.toLocaleString(undefined, {minimumFractionDigits: 2})}`} icon={<TrendingDownIcon className="w-6 h-6 text-red-400" />} colorClass="text-red-400" />
                <StatCard title={t('admin.reports.netFlow')} value={`${stats.netFlow < 0 ? '-' : ''}$${Math.abs(stats.netFlow).toLocaleString(undefined, {minimumFractionDigits: 2})}`} icon={<DollarSignIcon className={`w-6 h-6 ${stats.netFlow >= 0 ? 'text-green-400' : 'text-red-400'}`} />} colorClass={stats.netFlow >= 0 ? 'text-green-400' : 'text-red-400'} />
                <StatCard title={t('admin.reports.totalBonusPayouts')} value={`$${stats.totalBonuses.toLocaleString(undefined, {minimumFractionDigits: 2})}`} icon={<DollarSignIcon className="w-6 h-6 text-yellow-400" />} colorClass="text-yellow-400" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">{t('admin.reports.dailyNetFlow')}</h3>
                     <div className="h-72">
                        <NetFlowChart data={netFlowChartData} />
                    </div>
                 </div>
                 <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">{t('admin.reports.bonusBreakdown')}</h3>
                     <div className="space-y-4">
                        {Object.entries(stats.bonusBreakdown)
                            .sort(([, a], [, b]) => (b as number) - (a as number))
                            .map(([type, amount]) => {
                                const percentage = stats.totalBonuses > 0 ? ((amount as number) / stats.totalBonuses) * 100 : 0;
                                return (
                                    <div key={type} title={t('admin.reports.bonusTitle', { percentage: percentage.toFixed(2) })}>
                                        <div className="flex justify-between items-center mb-1 text-sm">
                                            <span className="font-medium text-gray-300">{t(`bonusType.${type}`)}</span>
                                            <span className="font-semibold text-yellow-400">
                                                ${(amount as number).toLocaleString(undefined, {minimumFractionDigits: 2})}
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-600 rounded-full h-2.5">
                                            <div 
                                                className="bg-brand-secondary h-2.5 rounded-full" 
                                                style={{ width: `${percentage}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                );
                        })}
                        {Object.keys(stats.bonusBreakdown).length === 0 && (
                            <p className="text-gray-400 text-center py-4">{t('admin.reports.noBonusData')}</p>
                        )}
                    </div>
                 </div>
            </div>
        </div>
    );
};
export default FinancialReports;