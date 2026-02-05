
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { useLocalization } from '../../hooks/useLocalization';
import { Project, BonusConfig, Rank } from '../../types';

interface ProjectEditorModalProps {
    projectToEdit: Project | null;
    onClose: () => void;
}

type Tab = 'general' | 'bonuses' | 'ranks';

// Helper components moved OUTSIDE to prevent re-mounting on state updates
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

const FormTextarea: React.FC<{ 
    name: string, 
    label: string, 
    value: string, 
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void,
    required?: boolean 
    disabled?: boolean
}> = ({ name, label, value, onChange, required=true, disabled=false }) => (
    <div className="md:col-span-2">
        <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">{label}</label>
        <textarea 
            name={name} 
            value={value || ''} 
            onChange={onChange} 
            rows={3} 
            disabled={disabled}
            className="w-full bg-gray-700 text-white rounded-md px-3 py-2 text-sm border border-gray-600 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition-all disabled:opacity-50" 
            required={required} 
        />
    </div>
);

const ProjectEditorModal: React.FC<ProjectEditorModalProps> = ({ projectToEdit, onClose }) => {
    const { addProject, updateProject, currentDate, ranks: globalRanks, instantBonusRates: globalInstant, teamBuilderBonusRates: globalTeam } = useAppContext();
    const { t } = useLocalization();
    const [activeTab, setActiveTab] = useState<Tab>('general');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const getInitialState = (): Partial<Omit<Project, 'id'>> => {
        if (projectToEdit) return projectToEdit;
        return {
            tokenName: '', assetType: '', assetIdentifier: '', assetDescription: '',
            assetLocation: '', assetImageUrl: '', assetValuation: 1000000,
            valuationMethod: 'Professional Appraisal', valuationDate: currentDate.toISOString().split('T')[0],
            performanceHistory: 'N/A', expectedYield: 8.5, proofOfOwnership: 'On File',
            legalStructure: 'SPV LLC', legalWrapper: 'Token represents fractional ownership', jurisdiction: 'Delaware, USA',
            regulatoryStatus: 'Reg D', investorRequirements: 'Accredited Investors Only', tokenTicker: '',
            totalTokenSupply: 100000, tokenPrice: 100, minInvestment: 5000,
            blockchain: 'Ethereum', smartContractAddress: '0x...', distribution: 'Private Placement',
            rightsConferred: 'Fractional Ownership, Pro-rata share of income', assetCustodian: 'Third-Party Custodian', 
            assetManager: 'IGI Asset Management', oracles: 'Chainlink',
        };
    };

    const [formData, setFormData] = useState(getInitialState());

    // Custom Configurations
    const [bonusConfig, setBonusConfig] = useState<BonusConfig>({
        instant: globalInstant,
        teamBuilder: globalTeam
    });

    const [rankConfig, setRankConfig] = useState<Rank[]>(globalRanks);

    useEffect(() => {
        if (projectToEdit) {
            if (projectToEdit.customBonusConfig) {
                setBonusConfig(projectToEdit.customBonusConfig);
            }
            if (projectToEdit.customRankConfig) {
                setRankConfig(projectToEdit.customRankConfig);
            }
        }
    }, [projectToEdit]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
            const projectData = {
                ...formData,
                customBonusConfig: bonusConfig,
                customRankConfig: rankConfig
            };

            if (projectToEdit) {
                await updateProject({ ...projectToEdit, ...projectData } as Project);
            } else {
                await addProject(projectData);
            }
            onClose();
        } catch (error) {
            console.error("Failed to save project:", error);
            alert("Error saving project. Please check console for details.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderGeneralTab = () => (
        <div className="space-y-6">
            <FormSection title={t('projectDetail.assetDetails')}>
                <FormInput name="tokenName" label="Token Name" value={formData.tokenName || ''} onChange={handleChange} disabled={isSubmitting} />
                <FormInput name="tokenTicker" label="Token Ticker (e.g. MSOT)" value={formData.tokenTicker || ''} onChange={handleChange} disabled={isSubmitting} />
                <FormInput name="assetType" label={t('projectDetail.assetType')} value={formData.assetType || ''} onChange={handleChange} disabled={isSubmitting} />
                <FormInput name="assetLocation" label={t('projectDetail.location')} value={formData.assetLocation || ''} onChange={handleChange} disabled={isSubmitting} />
                <FormInput name="assetImageUrl" label="Asset Image URL" value={formData.assetImageUrl || ''} onChange={handleChange} disabled={isSubmitting} />
                <FormTextarea name="assetDescription" label="Asset Description" value={formData.assetDescription || ''} onChange={handleChange} disabled={isSubmitting} />
            </FormSection>

            <FormSection title={t('projectDetail.financials')}>
                <FormInput name="assetValuation" label={t('projectDetail.assetValuation')} value={formData.assetValuation || 0} onChange={handleChange} type="number" disabled={isSubmitting} />
                <FormInput name="expectedYield" label={`${t('projectDetail.expectedYield')} (%)`} value={formData.expectedYield || 0} onChange={handleChange} type="number" disabled={isSubmitting} />
                <FormInput name="minInvestment" label={t('projectDetail.minInvestment')} value={formData.minInvestment || 0} onChange={handleChange} type="number" disabled={isSubmitting} />
                <FormInput name="tokenPrice" label={t('projectDetail.tokenPrice')} value={formData.tokenPrice || 0} onChange={handleChange} type="number" disabled={isSubmitting} />
                <FormInput name="totalTokenSupply" label="Total Token Supply" value={formData.totalTokenSupply || 0} onChange={handleChange} type="number" disabled={isSubmitting} />
            </FormSection>
        </div>
    );

    const renderBonusesTab = () => (
        <div className="space-y-6">
            <p className="text-sm text-gray-400 italic">Configure specific bonus rates for this project. Defaults are loaded from global settings.</p>
            <div className="bg-gray-700/50 p-6 rounded-lg border border-gray-600">
                <h4 className="font-semibold text-brand-primary mb-4 text-sm uppercase tracking-wider">{t('admin.settings.instantBonus')}</h4>
                <div className="grid grid-cols-3 gap-6">
                    <div>
                        <label className="block text-xs text-gray-400 mb-1">{t('admin.settings.investor')} (%)</label>
                        <input type="number" disabled={isSubmitting} value={(bonusConfig.instant.investor * 100).toFixed(2)} onChange={e => handleBonusChange('instant', 'investor', e.target.value)} className="w-full bg-gray-600 text-white rounded px-3 py-2 text-sm border border-gray-500" step="0.1" />
                    </div>
                    <div>
                        <label className="block text-xs text-gray-400 mb-1">{t('admin.settings.referrer')} (%)</label>
                        <input type="number" disabled={isSubmitting} value={(bonusConfig.instant.referrer * 100).toFixed(2)} onChange={e => handleBonusChange('instant', 'referrer', e.target.value)} className="w-full bg-gray-600 text-white rounded px-3 py-2 text-sm border border-gray-500" step="0.1" />
                    </div>
                    <div>
                        <label className="block text-xs text-gray-400 mb-1">{t('admin.settings.uplineL1')} (%)</label>
                        <input type="number" disabled={isSubmitting} value={(bonusConfig.instant.upline * 100).toFixed(2)} onChange={e => handleBonusChange('instant', 'upline', e.target.value)} className="w-full bg-gray-600 text-white rounded px-3 py-2 text-sm border border-gray-500" step="0.1" />
                    </div>
                </div>
            </div>
            <div className="bg-gray-700/50 p-6 rounded-lg border border-gray-600">
                <h4 className="font-semibold text-brand-primary mb-4 text-sm uppercase tracking-wider">{t('admin.settings.teamBuilderBonus')}</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                    {bonusConfig.teamBuilder.map((rate, index) => (
                        <div key={index}>
                            <label className="block text-[10px] text-gray-400 mb-1 uppercase tracking-tight">Level {index + 1} (%)</label>
                            <input type="number" disabled={isSubmitting} value={(rate * 100).toFixed(2)} onChange={e => handleBonusChange('teamBuilder', index, e.target.value)} className="w-full bg-gray-600 text-white rounded px-2 py-1.5 text-sm border border-gray-500" step="0.1" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    const renderRanksTab = () => (
        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
            <p className="text-sm text-gray-400 italic mb-4">Configure rank requirements specifically for this project.</p>
            {rankConfig.sort((a,b) => a.level - b.level).map(rank => (
                <div key={rank.level} className="bg-gray-700/50 p-4 rounded-lg border border-gray-600">
                    <div className="flex justify-between items-center mb-3">
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
            <div className="bg-gray-800 rounded-xl shadow-2xl p-8 w-full max-w-5xl max-h-[95vh] flex flex-col border border-gray-700">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white">
                        {projectToEdit ? t('admin.projectEditor.editTitle') : t('admin.projectEditor.createTitle')}
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
                    <div className="flex-grow overflow-y-auto pr-4 custom-scrollbar">
                        {activeTab === 'general' && renderGeneralTab()}
                        {activeTab === 'bonuses' && renderBonusesTab()}
                        {activeTab === 'ranks' && renderRanksTab()}
                    </div>
                    
                    <div className="flex justify-end space-x-4 pt-6 mt-4 border-t border-gray-700 shrink-0">
                        <button type="button" onClick={onClose} disabled={isSubmitting} className="px-6 py-2 rounded-lg bg-gray-700 text-white font-bold hover:bg-gray-600 transition-colors border border-gray-600">
                            {t('common.cancel')}
                        </button>
                        <button type="submit" disabled={isSubmitting} className="px-8 py-2 rounded-lg bg-brand-primary text-white font-bold hover:bg-brand-primary/90 transition-all shadow-lg flex items-center">
                            {isSubmitting ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Saving...
                                </>
                            ) : (
                                t('admin.projectEditor.saveProject')
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProjectEditorModal;
