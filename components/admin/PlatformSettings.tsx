
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { useLocalization } from '../../hooks/useLocalization';
import { Rank, TreasuryWallets, PlatformSocialLinks } from '../../types';
import { TelegramIcon, WhatsAppIcon, TwitterIcon, FacebookIcon, InstagramIcon, YoutubeIcon, DiscordIcon } from '../../constants';

const PlatformSettings: React.FC = () => {
    const { 
        ranks, updateRankSettings, 
        runMonthlyCycle, currentDate, 
        instantBonusRates, teamBuilderBonusRates, updateBonusRates,
        treasuryWallets, updateTreasuryWallets,
        socialLinks, updateSocialLinks,
        withdrawalLimit, updateWithdrawalLimit,
        minWithdrawalLimit, updateMinWithdrawalLimit,
        seedDatabase, isDemoMode
    } = useAppContext();
    const { t } = useLocalization();
    const [localRanks, setLocalRanks] = useState<Rank[]>(ranks);
    const [localInstantRates, setLocalInstantRates] = useState(instantBonusRates);
    const [localTeamRates, setLocalTeamRates] = useState(teamBuilderBonusRates);
    const [localWallets, setLocalWallets] = useState<TreasuryWallets>(treasuryWallets);
    const [localSocialLinks, setLocalSocialLinks] = useState<PlatformSocialLinks>(socialLinks);
    const [localWithdrawalLimit, setLocalWithdrawalLimit] = useState(withdrawalLimit);
    const [localMinWithdrawalLimit, setLocalMinWithdrawalLimit] = useState(minWithdrawalLimit);

    useEffect(() => {
        setLocalRanks(ranks);
        setLocalInstantRates(instantBonusRates);
        setLocalTeamRates(teamBuilderBonusRates);
        setLocalWallets(treasuryWallets);
        setLocalSocialLinks(socialLinks);
        setLocalWithdrawalLimit(withdrawalLimit);
        setLocalMinWithdrawalLimit(minWithdrawalLimit);
    }, [ranks, instantBonusRates, teamBuilderBonusRates, treasuryWallets, socialLinks, withdrawalLimit, minWithdrawalLimit]);

    const handleRankChange = (level: number, field: keyof Rank, value: string) => {
        const updatedRanks = localRanks.map(rank => {
            if (rank.level === level) {
                // If it's a percentage field, convert from input percentage to decimal
                const val = field === 'leadershipBonusPercentage' ? Number(value) / 100 : Number(value);
                return { ...rank, [field]: val };
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

    const handleSocialLinkChange = (key: keyof PlatformSocialLinks, value: string) => {
        setLocalSocialLinks(prev => ({ ...prev, [key]: value }));
    };

    const handleSave = () => {
        updateRankSettings(localRanks);
        updateBonusRates(localInstantRates, localTeamRates);
        updateTreasuryWallets(localWallets);
        updateSocialLinks(localSocialLinks);
        updateWithdrawalLimit(localWithdrawalLimit);
        updateMinWithdrawalLimit(localMinWithdrawalLimit);
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
                <h3 className="text-lg font-semibold text-white mb-4">{t('admin.settings.withdrawalConfigTitle')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300">{t('admin.settings.maxWithdrawalAmount')}</label>
                        <input 
                            type="number" 
                            value={localWithdrawalLimit} 
                            onChange={e => setLocalWithdrawalLimit(Number(e.target.value))} 
                            className="w-full bg-gray-700 text-white rounded-md mt-1 px-3 py-2 text-sm" 
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300">{t('admin.settings.minWithdrawalAmount')}</label>
                        <input 
                            type="number" 
                            value={localMinWithdrawalLimit} 
                            onChange={e => setLocalMinWithdrawalLimit(Number(e.target.value))} 
                            className="w-full bg-gray-700 text-white rounded-md mt-1 px-3 py-2 text-sm" 
                        />
                    </div>
                </div>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                <h3 className="text-lg font-semibold text-white mb-4">{t('admin.settings.socialLinksTitle')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="flex items-center space-x-2 bg-gray-700 p-2 rounded-md">
                        <TelegramIcon className="w-5 h-5 text-blue-400" />
                        <div className="flex-grow">
                            <label className="block text-xs text-gray-400">{t('admin.settings.social.telegram')}</label>
                            <input type="text" value={localSocialLinks.telegram} onChange={e => handleSocialLinkChange('telegram', e.target.value)} className="w-full bg-transparent text-white text-sm focus:outline-none" placeholder="https://t.me/..." />
                        </div>
                    </div>
                    <div className="flex items-center space-x-2 bg-gray-700 p-2 rounded-md">
                        <WhatsAppIcon className="w-5 h-5 text-green-400" />
                        <div className="flex-grow">
                            <label className="block text-xs text-gray-400">{t('admin.settings.social.whatsapp')}</label>
                            <input type="text" value={localSocialLinks.whatsapp} onChange={e => handleSocialLinkChange('whatsapp', e.target.value)} className="w-full bg-transparent text-white text-sm focus:outline-none" placeholder="https://wa.me/..." />
                        </div>
                    </div>
                    <div className="flex items-center space-x-2 bg-gray-700 p-2 rounded-md">
                        <TwitterIcon className="w-5 h-5 text-white" />
                        <div className="flex-grow">
                            <label className="block text-xs text-gray-400">{t('admin.settings.social.twitter')}</label>
                            <input type="text" value={localSocialLinks.twitter} onChange={e => handleSocialLinkChange('twitter', e.target.value)} className="w-full bg-transparent text-white text-sm focus:outline-none" placeholder="https://twitter.com/..." />
                        </div>
                    </div>
                    <div className="flex items-center space-x-2 bg-gray-700 p-2 rounded-md">
                        <FacebookIcon className="w-5 h-5 text-blue-600" />
                        <div className="flex-grow">
                            <label className="block text-xs text-gray-400">{t('admin.settings.social.facebook')}</label>
                            <input type="text" value={localSocialLinks.facebook} onChange={e => handleSocialLinkChange('facebook', e.target.value)} className="w-full bg-transparent text-white text-sm focus:outline-none" placeholder="https://facebook.com/..." />
                        </div>
                    </div>
                    <div className="flex items-center space-x-2 bg-gray-700 p-2 rounded-md">
                        <InstagramIcon className="w-5 h-5 text-pink-500" />
                        <div className="flex-grow">
                            <label className="block text-xs text-gray-400">{t('admin.settings.social.instagram')}</label>
                            <input type="text" value={localSocialLinks.instagram} onChange={e => handleSocialLinkChange('instagram', e.target.value)} className="w-full bg-transparent text-white text-sm focus:outline-none" placeholder="https://instagram.com/..." />
                        </div>
                    </div>
                    <div className="flex items-center space-x-2 bg-gray-700 p-2 rounded-md">
                        <YoutubeIcon className="w-5 h-5 text-red-500" />
                        <div className="flex-grow">
                            <label className="block text-xs text-gray-400">{t('admin.settings.social.youtube')}</label>
                            <input type="text" value={localSocialLinks.youtube} onChange={e => handleSocialLinkChange('youtube', e.target.value)} className="w-full bg-transparent text-white text-sm focus:outline-none" placeholder="https://youtube.com/..." />
                        </div>
                    </div>
                    <div className="flex items-center space-x-2 bg-gray-700 p-2 rounded-md">
                        <DiscordIcon className="w-5 h-5 text-indigo-400" />
                        <div className="flex-grow">
                            <label className="block text-xs text-gray-400">{t('admin.settings.social.discord')}</label>
                            <input type="text" value={localSocialLinks.discord} onChange={e => handleSocialLinkChange('discord', e.target.value)} className="w-full bg-transparent text-white text-sm focus:outline-none" placeholder="https://discord.gg/..." />
                        </div>
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
                                <label className="w-32 text-sm text-gray-300">{t('admin.settings.investor')}</label>
                                <input type="number" value={localInstantRates.investor * 100} onChange={e => handleInstantRateChange('investor', e.target.value)} className="w-24 bg-gray-700 text-white rounded-md px-2 py-1 text-sm" step="0.1" />
                                <span className="ml-2 text-gray-400">%</span>
                            </div>
                            <div className="flex items-center">
                                <label className="w-32 text-sm text-gray-300">{t('admin.settings.referrer')}</label>
                                <input type="number" value={localInstantRates.referrer * 100} onChange={e => handleInstantRateChange('referrer', e.target.value)} className="w-24 bg-gray-700 text-white rounded-md px-2 py-1 text-sm" step="0.1" />
                                <span className="ml-2 text-gray-400">%</span>
                            </div>
                            <div className="flex items-center">
                                <label className="w-32 text-sm text-gray-300">{t('admin.settings.uplineL1')}</label>
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
                        <div key={rank.level} className="grid grid-cols-2 md:grid-cols-6 gap-4 items-end p-4 bg-gray-700 rounded-md">
                            <div className="col-span-2 md:col-span-1 font-bold text-white text-lg">{rank.name}</div>
                            <div>
                                <label className="block text-xs text-gray-400">{t('admin.settings.minAccounts')}</label>
                                <input
                                    type="number"
                                    value={rank.minAccounts}
                                    onChange={(e) => handleRankChange(rank.level, 'minAccounts', e.target.value)}
                                    className="w-full bg-gray-600 text-white rounded-md mt-1 px-3 py-1.5 text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-400">{t('admin.settings.newlyQualified')}</label>
                                <input
                                    type="number"
                                    value={rank.newlyQualified}
                                    onChange={(e) => handleRankChange(rank.level, 'newlyQualified', e.target.value)}
                                    className="w-full bg-gray-600 text-white rounded-md mt-1 px-3 py-1.5 text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-400">{t('admin.settings.minTotalInvestment')} ($)</label>
                                <input
                                    type="number"
                                    value={rank.minTotalInvestment}
                                    onChange={(e) => handleRankChange(rank.level, 'minTotalInvestment', e.target.value)}
                                    className="w-full bg-gray-600 text-white rounded-md mt-1 px-3 py-1.5 text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-400">{t('admin.settings.fixedBonus')} ($)</label>
                                <input
                                    type="number"
                                    value={rank.fixedBonus}
                                    onChange={(e) => handleRankChange(rank.level, 'fixedBonus', e.target.value)}
                                    className="w-full bg-gray-600 text-white rounded-md mt-1 px-3 py-1.5 text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-400">Leadership %</label>
                                <div className="flex items-center">
                                    <input
                                        type="number"
                                        value={rank.leadershipBonusPercentage * 100}
                                        onChange={(e) => handleRankChange(rank.level, 'leadershipBonusPercentage', e.target.value)}
                                        className="w-full bg-gray-600 text-white rounded-md mt-1 px-3 py-1.5 text-sm"
                                        step="0.01"
                                    />
                                    <span className="ml-1 text-gray-400">%</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
                    <div className="flex gap-4">
                        <button
                            onClick={handleRunCycle}
                            className="px-6 py-2 rounded-md bg-green-600 text-white font-semibold hover:bg-green-500"
                        >
                            {t('admin.settings.runManualCycle')}
                        </button>
                        {!isDemoMode && (
                            <button
                                onClick={() => { if(window.confirm('Insert demo projects, pools and news?')) seedDatabase() }}
                                className="px-6 py-2 rounded-md bg-purple-600 text-white font-semibold hover:bg-purple-500"
                            >
                                {t('admin.settings.seedDatabase')}
                            </button>
                        )}
                    </div>
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
