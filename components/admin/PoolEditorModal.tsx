
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { useLocalization } from '../../hooks/useLocalization';
import { InvestmentPool, Rank, BonusConfig } from '../../types';

interface PoolEditorModalProps {
    poolToEdit: InvestmentPool | null;
    onClose: () => void;
}

type Tab = 'general' | 'bonuses' | 'ranks';

// Helper components moved OUTSIDE
const FormSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="space-y-4 mb-8">
        <h3 className="text-lg font-semibold text-brand-primary border-b border-gray-700 pb-2 mb-4">{title}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>
    </div>
);

const FormInput: React.FC<{ 
    name: string, 
    label: string, 
    value: string | number, 
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
    type?: string, 
    required?: boolean 
    disabled?: boolean
}> = ({ name, label, value, onChange, type='text', required=true, disabled=false }) => (
    <div>
        <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">{label}</label>
        <input 
            type={type} 
            name={name} 
            value={String(value || '')} 
            onChange={onChange} 
            disabled={disabled}
            className="w-full bg-gray-700 text-white rounded-md px-3 py-2 text-sm border border-gray-600 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition-all disabled:opacity-50" 
            required={required} 
        />
    </div>
);

const FormSelect: React.FC<{ 
    name: string, 
    label: string, 
    value: string, 
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void,
    children: React.ReactNode,
    disabled?: boolean
}> = ({ name, label, value, onChange, children, disabled=false }) => (
    <div>
        <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">{label}</label>
        <select 
            name={name} 
            value={value} 
            onChange={onChange} 
            disabled={disabled}
            className="w-full bg-gray-700 text-white rounded-md px-3 py-2 text-sm border border-gray-600 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition-all disabled:opacity-50"
        >
            {children}
        </select>
    </div>
);

const PoolEditorModal: React.FC<PoolEditorModalProps> = ({ poolToEdit, onClose }) => {
    const { addInvestmentPool, updateInvestmentPool, ranks: globalRanks, instantBonusRates: globalInstant, teamBuilderBonusRates: globalTeam, projects } = useAppContext();
    const { t } = useLocalization();
    const [activeTab, setActiveTab] = useState<Tab>('general');
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // General Data
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        minInvestment: 3000,
        apy: 10,
        projectUrl: '',
        linkedProjectId: '',
    });

    // Custom Configurations
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
        const numValue = parseFloat(value) / 100;
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
        setRankConfig(prev => prev.map(r => {
            if (r.level === level) {
                const val = field === 'leadershipBonusPercentage' ? Number(value) / 100 : Number(value);
                return { ...r, [field]: val };
            }
            return r;
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const poolData = {
                ...formData,
                customBonusConfig: bonusConfig,
                customRankConfig: rankConfig
            };

            if (poolToEdit) {
                await updateInvestmentPool({ ...poolToEdit, ...poolData });
            } else {
                await addInvestmentPool(poolData);
            }
            onClose();
        } catch (error) {
            console.error("Failed to save fund:", error);
            alert("Error saving fund. Please check console.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderGeneralTab = () => (
        <div className="space-y-4">
            <FormInput name="name" label={t('admin.legacyFundEditor.fundName')} value={formData.name} onChange={handleChange} disabled={isSubmitting} />
            <div>
                <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">{t('admin.legacyFundEditor.description')}</label>
                <textarea 
                    name="description" 
                    value={formData.description} 
                    onChange={handleChange} 
                    rows={3} 
                    disabled={isSubmitting}
                    className="w-full bg-gray-700 text-white rounded-md px-3 py-2 text-sm border border-gray-600 focus:border-brand-primary outline-none" 
                    required 
                />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormSelect name="linkedProjectId" label="Linked Project (Optional)" value={formData.linkedProjectId} onChange={handleChange} disabled={isSubmitting}>
                    <option value="">None</option>
                    {projects.map(p => (
                        <option key={p.id} value={p.id}>{p.tokenName}</option>
                    ))}
                </FormSelect>
                <FormInput name="projectUrl" label="Project URL" value={formData.projectUrl} onChange={handleChange} type="url" disabled={isSubmitting} required={false} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormInput name="minInvestment" label={t('admin.projects.minInvestment')} value={formData.minInvestment} onChange={handleChange} type="number" disabled={isSubmitting} />
                <FormInput name="apy" label={`${t('admin.legacyFunds.apy')} (%)`} value={formData.apy} onChange={handleChange} type="number" disabled={isSubmitting} />
            </div>
        </div>
    );

    const renderBonusesTab = () => (
        <div className="space-y-6">
            <div className="bg-gray-700/50 p-4 rounded-lg border border-gray-600">
                <h4 className="font-semibold text-brand-primary mb-3 text-sm uppercase tracking-wider">{t('admin.settings.instantBonus')}</h4>
                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <label className="block text-xs text-gray-400 mb-1">{t('admin.settings.investor')} (%)</label>
                        <input type="number" disabled={isSubmitting} value={(bonusConfig.instant.investor * 100).toFixed(2)} onChange={e => handleBonusChange('instant', 'investor', e.target.value)} className="w-full bg-gray-600 text-white rounded px-2 py-1 text-sm border border-gray-500" step="0.1" />
                    </div>
                    <div>
                        <label className="block text-xs text-gray-400 mb-1">{t('admin.settings.referrer')} (%)</label>
                        <input type="number" disabled={isSubmitting} value={(bonusConfig.instant.referrer * 100).toFixed(2)} onChange={e => handleBonusChange('instant', 'referrer', e.target.value)} className="w-full bg-gray-600 text-white rounded px-2 py-1 text-sm border border-gray-500" step="0.1" />
                    </div>
                    <div>
                        <label className="block text-xs text-gray-400 mb-1">{t('admin.settings.uplineL1')} (%)</label>
                        <input type="number" disabled={isSubmitting} value={(bonusConfig.instant.upline * 100).toFixed(2)} onChange={e => handleBonusChange('instant', 'upline', e.target.value)} className="w-full bg-gray-600 text-white rounded px-2 py-1 text-sm border border-gray-500" step="0.1" />
                    </div>
                </div>
            </div>
            <div className="bg-gray-700/50 p-4 rounded-lg border border-gray-600">
                <h4 className="font-semibold text-brand-primary mb-3 text-sm uppercase tracking-wider">{t('admin.settings.teamBuilderBonus')}</h4>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                    {bonusConfig.teamBuilder.map((rate, index) => (
                        <div key={index}>
                            <label className="block text-[10px] text-gray-400 mb-1 uppercase">L{index + 1} (%)</label>
                            <input type="number" disabled={isSubmitting} value={(rate * 100).toFixed(2)} onChange={e => handleBonusChange('teamBuilder', index, e.target.value)} className="w-full bg-gray-600 text-white rounded px-2 py-1 text-sm border border-gray-500" step="0.1" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    const renderRanksTab = () => (
        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            <p className="text-sm text-gray-400 italic mb-4">Configure rank requirements specifically for this fund.</p>
            {rankConfig.sort((a,b) => a.level - b.level).map(rank => (
                <div key={rank.level} className="bg-gray-700/50 p-3 rounded-lg border border-gray-600">
                    <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-brand-secondary text-sm uppercase">Rank {rank.name}</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                        <div>
                            <label className="block text-[10px] text-gray-400 mb-1 uppercase">Min accounts</label>
                            <input type="number" disabled={isSubmitting} value={rank.minAccounts} onChange={e => handleRankChange(rank.level, 'minAccounts', e.target.value)} className="w-full bg-gray-600 text-white rounded px-2 py-1 text-xs border border-gray-500" />
                        </div>
                        <div>
                            <label className="block text-[10px] text-gray-400 mb-1 uppercase">Qualified</label>
                            <input type="number" disabled={isSubmitting} value={rank.newlyQualified} onChange={e => handleRankChange(rank.level, 'newlyQualified', e.target.value)} className="w-full bg-gray-600 text-white rounded px-2 py-1 text-xs border border-gray-500" />
                        </div>
                        <div>
                            <label className="block text-[10px] text-gray-400 mb-1 uppercase">Min Invest ($)</label>
                            <input type="number" disabled={isSubmitting} value={rank.minTotalInvestment} onChange={e => handleRankChange(rank.level, 'minTotalInvestment', e.target.value)} className="w-full bg-gray-600 text-white rounded px-2 py-1 text-xs border border-gray-500" />
                        </div>
                        <div>
                            <label className="block text-[10px] text-gray-400 mb-1 uppercase">Fixed Bonus ($)</label>
                            <input type="number" disabled={isSubmitting} value={rank.fixedBonus} onChange={e => handleRankChange(rank.level, 'fixedBonus', e.target.value)} className="w-full bg-gray-600 text-white rounded px-2 py-1 text-xs border border-gray-500" />
                        </div>
                        <div>
                            <label className="block text-[10px] text-gray-400 mb-1 uppercase">Leadership %</label>
                            <input type="number" disabled={isSubmitting} value={(rank.leadershipBonusPercentage * 100).toFixed(2)} onChange={e => handleRankChange(rank.level, 'leadershipBonusPercentage', e.target.value)} className="w-full bg-gray-600 text-white rounded px-2 py-1 text-xs border border-gray-500" step="0.01" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-xl shadow-2xl p-8 w-full max-w-2xl max-h-[90vh] flex flex-col border border-gray-700">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white">
                        {poolToEdit ? t('admin.legacyFundEditor.editTitle') : t('admin.legacyFundEditor.createTitle')}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors" disabled={isSubmitting}>
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>
                
                <div className="flex border-b border-gray-700 mb-6 space-x-6">
                    {(['general', 'bonuses', 'ranks'] as Tab[]).map(tab => (
                        <button 
                            key={tab}
                            onClick={() => setActiveTab(tab)} 
                            className={`pb-3 px-1 text-sm font-bold uppercase tracking-widest transition-all ${activeTab === tab ? 'text-brand-primary border-b-2 border-brand-primary' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                <form onSubmit={handleSubmit} className="flex-grow overflow-hidden flex flex-col">
                    <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar">
                        {activeTab === 'general' && renderGeneralTab()}
                        {activeTab === 'bonuses' && renderBonusesTab()}
                        {activeTab === 'ranks' && renderRanksTab()}
                    </div>

                    <div className="flex justify-end space-x-4 pt-6 mt-4 border-t border-gray-700 shrink-0">
                        <button type="button" onClick={onClose} disabled={isSubmitting} className="px-6 py-2 rounded-lg bg-gray-700 text-white font-bold hover:bg-gray-600 border border-gray-600">
                            {t('common.cancel')}
                        </button>
                        <button type="submit" disabled={isSubmitting} className="px-8 py-2 rounded-lg bg-brand-primary text-white font-bold hover:bg-brand-primary/90 shadow-lg flex items-center">
                            {isSubmitting ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Saving...
                                </>
                            ) : (
                                t('admin.legacyFundEditor.saveFund')
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PoolEditorModal;
