import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { useLocalization } from '../../hooks/useLocalization';
import { Rank, TreasuryWallets } from '../../types';

const PlatformSettings: React.FC = () => {
    const { 
        ranks, updateRankSettings, 
        runMonthlyCycle, currentDate, 
        instantBonusRates, teamBuilderBonusRates, updateBonusRates,
        treasuryWallets, updateTreasuryWallets 
    } = useAppContext();
    const { t } = useLocalization();
    const [localRanks, setLocalRanks] = useState<Rank[]>(ranks);
    const [localInstantRates, setLocalInstantRates] = useState(instantBonusRates);
    const [localTeamRates, setLocalTeamRates] = useState(teamBuilderBonusRates);
    const [localWallets, setLocalWallets] = useState<TreasuryWallets>(treasuryWallets);

    useEffect(() => {
        setLocalRanks(ranks);
        setLocalInstantRates(instantBonusRates);
        setLocalTeamRates(teamBuilderBonusRates);
        setLocalWallets(treasuryWallets);
    }, [ranks, instantBonusRates, teamBuilderBonusRates, treasuryWallets]);

    const handleRankChange = (level: number, field: keyof Rank, value: string) => {
        const updatedRanks = localRanks.map(rank => {
            if (rank.level === level) {
                return { ...rank, [field]: Number(value) };
            }
            return rank;
        });
        setLocalRanks(updatedRanks);
    };
    
    const handleInstantRateChange = (field: keyof typeof localInstantRates, value: string) => {
        setLocalInstantRates(prev => ({ ...prev, [field]: Number(value) / 100 }));
    };

    const handleTeamRateChange = (index: number, value: string) => {
        const newRates = [...localTeamRates];
        newRates[index] = Number(value) / 100;
        setLocalTeamRates(newRates);
    };

    const handleWalletChange = (chain: keyof TreasuryWallets, value: string) => {
        setLocalWallets(prev => ({ ...prev, [chain]: value }));
    };

    const handleSave = () => {
        updateRankSettings(localRanks);
        updateBonusRates(localInstantRates, localTeamRates);
        updateTreasuryWallets(localWallets);
    };

    const handleRunCycle = () => {
        const cycleDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        cycleDate.setDate(cycleDate.getDate() - 1); // Get last day of previous month
        if(window.confirm(t('admin.settings.confirmRunCycle', { month: cycleDate.toLocaleString('default', { month: 'long', year: 'numeric' }) }))) {
            runMonthlyCycle(cycleDate);
        }
    }

    return (
        <div className="space-y-8">
             <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                <h3 className="text-lg font-semibold text-white">{t('admin.settings.treasuryWalletsTitle')}</h3>
                <p className="text-sm text-gray-400 mb-4">{t('admin.settings.walletsSubtitle')}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300">{t('admin.settings.erc20')}</label>
                        <input type="text" value={localWallets.erc20} onChange={e => handleWalletChange('erc20', e.target.value)} className="w-full bg-gray-700 text-white rounded-md mt-1 px-3 py-2 text-sm font-mono" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300">{t('admin.settings.trc20')}</label>
                        <input type="text" value={localWallets.trc20} onChange={e => handleWalletChange('trc20', e.target.value)} className="w-full bg-gray-700 text-white rounded-md mt-1 px-3 py-2 text-sm font-mono" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300">{t('admin.settings.polygon')}</label>
                        <input type="text" value={localWallets.polygon} onChange={e => handleWalletChange('polygon', e.target.value)} className="w-full bg-gray-700 text-white rounded-md mt-1 px-3 py-2 text-sm font-mono" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300">{t('admin.settings.solana')}</label>
                        <input type="text" value={localWallets.solana} onChange={e => handleWalletChange('solana', e.target.value)} className="w-full bg-gray-700 text-white rounded-md mt-1 px-3 py-2 text-sm font-mono" />
                    </div>
                </div>
            </div>
            
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                <h3 className="text-lg font-semibold text-white mb-4">{t('admin.settings.bonusConfigTitle')}</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div>
                        <h4 className="font-semibold text-brand-primary mb-2">{t('admin.settings.instantBonus')}</h4>
                        <div className="space-y-3">
                            <div className="flex items-center">
                                <label className="w-24 text-sm text-gray-300">{t('admin.settings.investor')}</label>
                                <input type="number" value={localInstantRates.investor * 100} onChange={e => handleInstantRateChange('investor', e.target.value)} className="w-24 bg-gray-700 text-white rounded-md px-2 py-1 text-sm" step="0.1" />
                                <span className="ml-2 text-gray-400">%</span>
                            </div>
                            <div className="flex items-center">
                                <label className="w-24 text-sm text-gray-300">{t('admin.settings.referrer')}</label>
                                <input type="number" value={localInstantRates.referrer * 100} onChange={e => handleInstantRateChange('referrer', e.target.value)} className="w-24 bg-gray-700 text-white rounded-md px-2 py-1 text-sm" step="0.1" />
                                <span className="ml-2 text-gray-400">%</span>
                            </div>
                            <div className="flex items-center">
                                <label className="w-24 text-sm text-gray-300">{t('admin.settings.uplineL1')}</label>
                                <input type="number" value={localInstantRates.upline * 100} onChange={e => handleInstantRateChange('upline', e.target.value)} className="w-24 bg-gray-700 text-white rounded-md px-2 py-1 text-sm" step="0.1" />
                                <span className="ml-2 text-gray-400">%</span>
                            </div>
                        </div>
                    </div>
                     <div>
                        <h4 className="font-semibold text-brand-primary mb-2">{t('admin.settings.teamBuilderBonus')}</h4>
                         <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                            {localTeamRates.map((rate, index) => (
                                <div key={index} className="flex items-center">
                                    <label className="w-16 text-sm text-gray-300">{t('admin.settings.level', { level: index + 1 })}</label>
                                    <input type="number" value={rate * 100} onChange={e => handleTeamRateChange(index, e.target.value)} className="w-24 bg-gray-700 text-white rounded-md px-2 py-1 text-sm" step="0.1" />
                                    <span className="ml-2 text-gray-400">%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                <h3 className="text-lg font-semibold text-white mb-4">{t('admin.settings.rankConfigTitle')}</h3>
                <div className="space-y-4">
                    {localRanks.sort((a,b) => a.level - b.level).map(rank => (
                        <div key={rank.level} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center p-3 bg-gray-700 rounded-md">
                            <div className="font-bold text-white text-lg">{rank.name}</div>
                            <div>
                                <label className="block text-xs text-gray-400">{t('admin.settings.minAccounts')}</label>
                                <input
                                    type="number"
                                    value={rank.minAccounts}
                                    onChange={(e) => handleRankChange(rank.level, 'minAccounts', e.target.value)}
                                    className="w-full bg-gray-600 text-white rounded-md mt-1 px-3 py-1.5"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-400">{t('admin.settings.newlyQualified')}</label>
                                <input
                                    type="number"
                                    value={rank.newlyQualified}
                                    onChange={(e) => handleRankChange(rank.level, 'newlyQualified', e.target.value)}
                                    className="w-full bg-gray-600 text-white rounded-md mt-1 px-3 py-1.5"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-400">{t('admin.settings.fixedBonus')}</label>
                                <input
                                    type="number"
                                    value={rank.fixedBonus}
                                    onChange={(e) => handleRankChange(rank.level, 'fixedBonus', e.target.value)}
                                    className="w-full bg-gray-600 text-white rounded-md mt-1 px-3 py-1.5"
                                />
                            </div>
                        </div>
                    ))}
                </div>
                <div className="flex justify-between items-center mt-6">
                    <button
                        onClick={handleRunCycle}
                        className="px-6 py-2 rounded-md bg-green-600 text-white font-semibold hover:bg-green-500"
                    >
                        {t('admin.settings.runManualCycle')}
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-6 py-2 rounded-md bg-brand-primary text-white font-semibold hover:bg-brand-primary/90"
                    >
                        {t('admin.settings.saveAllSettings')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PlatformSettings;