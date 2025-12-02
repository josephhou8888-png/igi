
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { useLocalization } from '../../hooks/useLocalization';
import { InvestmentPool, Rank, BonusConfig } from '../../types';

interface PoolEditorModalProps {
    poolToEdit: InvestmentPool | null;
    onClose: () => void;
}

type Tab = 'general' | 'bonuses' | 'ranks';

const PoolEditorModal: React.FC<PoolEditorModalProps> = ({ poolToEdit, onClose }) => {
    const { addInvestmentPool, updateInvestmentPool, ranks: globalRanks, instantBonusRates: globalInstant, teamBuilderBonusRates: globalTeam, projects } = useAppContext();
    const { t } = useLocalization();
    const [activeTab, setActiveTab] = useState<Tab>('general');
    
    // General Data
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        minInvestment: 3000,
        apy: 10,
        projectUrl: '',
        linkedProjectId: '',
    });

    // Custom Configurations - defaulting to global values if new, or pool specific if editing
    const [bonusConfig, setBonusConfig] = useState<BonusConfig>({
        instant: globalInstant,
        teamBuilder: globalTeam
    });

    const [rankConfig, setRankConfig] = useState<Rank[]>(globalRanks);

    useEffect(() => {
        if (poolToEdit) {
            setFormData({
                name: poolToEdit.name,
                description: poolToEdit.description,
                minInvestment: poolToEdit.minInvestment,
                apy: poolToEdit.apy,
                projectUrl: poolToEdit.projectUrl || '',
                linkedProjectId: poolToEdit.linkedProjectId || '',
            });
            if (poolToEdit.customBonusConfig) {
                setBonusConfig(poolToEdit.customBonusConfig);
            }
            if (poolToEdit.customRankConfig) {
                setRankConfig(poolToEdit.customRankConfig);
            }
        }
    }, [poolToEdit]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'number' ? Number(value) : value }));
    };

    const handleBonusChange = (section: 'instant' | 'teamBuilder', key: string | number, value: string) => {
        const numValue = parseFloat(value) / 100; // Convert percentage to decimal
        if (section === 'instant') {
            setBonusConfig(prev => ({
                ...prev,
                instant: { ...prev.instant, [key]: numValue }
            }));
        } else {
            const index = Number(key);
            const newRates = [...bonusConfig.teamBuilder];
            newRates[index] = numValue;
            setBonusConfig(prev => ({ ...prev, teamBuilder: newRates }));
        }
    };

    const handleRankChange = (level: number, field: keyof Rank, value: string) => {
        setRankConfig(prev => prev.map(r => r.level === level ? { ...r, [field]: Number(value) } : r));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const poolData = {
            ...formData,
            customBonusConfig: bonusConfig,
            customRankConfig: rankConfig
        };

        if (poolToEdit) {
            updateInvestmentPool({ ...poolToEdit, ...poolData });
        } else {
            addInvestmentPool(poolData);
        }
        onClose();
    };

    const renderGeneralTab = () => (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-300">{t('admin.legacyFundEditor.fundName')}</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full bg-gray-700 text-white rounded-md mt-1 px-3 py-2" required />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-300">{t('admin.legacyFundEditor.description')}</label>
                <textarea name="description" value={formData.description} onChange={handleChange} rows={3} className="w-full bg-gray-700 text-white rounded-md mt-1 px-3 py-2" required />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-300">Linked Project (Optional)</label>
                    <select name="linkedProjectId" value={formData.linkedProjectId} onChange={handleChange} className="w-full bg-gray-700 text-white rounded-md mt-1 px-3 py-2">
                        <option value="">None</option>
                        {projects.map(p => (
                            <option key={p.id} value={p.id}>{p.tokenName}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300">Project URL</label>
                    <input type="url" name="projectUrl" value={formData.projectUrl} onChange={handleChange} className="w-full bg-gray-700 text-white rounded-md mt-1 px-3 py-2" placeholder="https://..." />
                </div>
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
        </div>
    );

    const renderBonusesTab = () => (
        <div className="space-y-6">
            <div className="bg-gray-700 p-4 rounded-lg">
                <h4 className="font-semibold text-brand-primary mb-3 text-sm uppercase tracking-wider">{t('admin.settings.instantBonus')}</h4>
                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <label className="block text-xs text-gray-400 mb-1">{t('admin.settings.investor')} (%)</label>
                        <input type="number" value={(bonusConfig.instant.investor * 100).toFixed(2)} onChange={e => handleBonusChange('instant', 'investor', e.target.value)} className="w-full bg-gray-600 text-white rounded px-2 py-1 text-sm" step="0.1" />
                    </div>
                    <div>
                        <label className="block text-xs text-gray-400 mb-1">{t('admin.settings.referrer')} (%)</label>
                        <input type="number" value={(bonusConfig.instant.referrer * 100).toFixed(2)} onChange={e => handleBonusChange('instant', 'referrer', e.target.value)} className="w-full bg-gray-600 text-white rounded px-2 py-1 text-sm" step="0.1" />
                    </div>
                    <div>
                        <label className="block text-xs text-gray-400 mb-1">{t('admin.settings.uplineL1')} (%)</label>
                        <input type="number" value={(bonusConfig.instant.upline * 100).toFixed(2)} onChange={e => handleBonusChange('instant', 'upline', e.target.value)} className="w-full bg-gray-600 text-white rounded px-2 py-1 text-sm" step="0.1" />
                    </div>
                </div>
            </div>
            <div className="bg-gray-700 p-4 rounded-lg">
                <h4 className="font-semibold text-brand-primary mb-3 text-sm uppercase tracking-wider">{t('admin.settings.teamBuilderBonus')}</h4>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                    {bonusConfig.teamBuilder.map((rate, index) => (
                        <div key={index}>
                            <label className="block text-xs text-gray-400 mb-1">L{index + 1} (%)</label>
                            <input type="number" value={(rate * 100).toFixed(2)} onChange={e => handleBonusChange('teamBuilder', index, e.target.value)} className="w-full bg-gray-600 text-white rounded px-2 py-1 text-sm" step="0.1" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    const renderRanksTab = () => (
        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
            <p className="text-sm text-gray-400 italic">Configure rank requirements specifically for this fund.</p>
            {rankConfig.sort((a,b) => a.level - b.level).map(rank => (
                <div key={rank.level} className="bg-gray-700 p-3 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-white">Rank {rank.name}</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div>
                            <label className="block text-[10px] text-gray-400 mb-1">{t('admin.settings.minAccounts')}</label>
                            <input type="number" value={rank.minAccounts} onChange={e => handleRankChange(rank.level, 'minAccounts', e.target.value)} className="w-full bg-gray-600 text-white rounded px-2 py-1 text-xs" />
                        </div>
                        <div>
                            <label className="block text-[10px] text-gray-400 mb-1">{t('admin.settings.newlyQualified')}</label>
                            <input type="number" value={rank.newlyQualified} onChange={e => handleRankChange(rank.level, 'newlyQualified', e.target.value)} className="w-full bg-gray-600 text-white rounded px-2 py-1 text-xs" />
                        </div>
                        <div>
                            <label className="block text-[10px] text-gray-400 mb-1">Min Invest ($)</label>
                            <input type="number" value={rank.minTotalInvestment} onChange={e => handleRankChange(rank.level, 'minTotalInvestment', e.target.value)} className="w-full bg-gray-600 text-white rounded px-2 py-1 text-xs" />
                        </div>
                        <div>
                            <label className="block text-[10px] text-gray-400 mb-1">Fixed Bonus ($)</label>
                            <input type="number" value={rank.fixedBonus} onChange={e => handleRankChange(rank.level, 'fixedBonus', e.target.value)} className="w-full bg-gray-600 text-white rounded px-2 py-1 text-xs" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] flex flex-col">
                <h2 className="text-2xl font-bold text-white mb-6">
                    {poolToEdit ? t('admin.legacyFundEditor.editTitle') : t('admin.legacyFundEditor.createTitle')}
                </h2>
                
                <div className="flex border-b border-gray-700 mb-4 space-x-4">
                    <button onClick={() => setActiveTab('general')} className={`pb-2 px-1 text-sm font-medium transition-colors ${activeTab === 'general' ? 'text-brand-primary border-b-2 border-brand-primary' : 'text-gray-400 hover:text-white'}`}>
                        General Info
                    </button>
                    <button onClick={() => setActiveTab('bonuses')} className={`pb-2 px-1 text-sm font-medium transition-colors ${activeTab === 'bonuses' ? 'text-brand-primary border-b-2 border-brand-primary' : 'text-gray-400 hover:text-white'}`}>
                        Bonus Config
                    </button>
                    <button onClick={() => setActiveTab('ranks')} className={`pb-2 px-1 text-sm font-medium transition-colors ${activeTab === 'ranks' ? 'text-brand-primary border-b-2 border-brand-primary' : 'text-gray-400 hover:text-white'}`}>
                        Rank Requirements
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex-grow overflow-hidden flex flex-col">
                    <div className="flex-grow overflow-y-auto pr-1">
                        {activeTab === 'general' && renderGeneralTab()}
                        {activeTab === 'bonuses' && renderBonusesTab()}
                        {activeTab === 'ranks' && renderRanksTab()}
                    </div>

                    <div className="flex justify-end space-x-4 pt-6 mt-2 border-t border-gray-700 shrink-0">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-md bg-gray-600 text-white hover:bg-gray-500">{t('common.cancel')}</button>
                        <button type="submit" className="px-4 py-2 rounded-md bg-brand-primary text-white hover:bg-brand-primary/90">{t('admin.legacyFundEditor.saveFund')}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PoolEditorModal;
