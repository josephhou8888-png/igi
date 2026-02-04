
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
    <div>
        <h3 className="text-lg font-semibold text-brand-primary mb-3">{title}</h3>
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
}> = ({ name, label, value, onChange, type='text', required=true }) => (
    <div>
        <label className="block text-sm font-medium text-gray-300">{label}</label>
        <input 
            type={type} 
            name={name} 
            value={String(value || '')} 
            onChange={onChange} 
            className="w-full bg-gray-700 text-white rounded-md mt-1 px-3 py-2 text-sm" 
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
}> = ({ name, label, value, onChange, required=true }) => (
    <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-300">{label}</label>
        <textarea 
            name={name} 
            value={value || ''} 
            onChange={onChange} 
            rows={2} 
            className="w-full bg-gray-700 text-white rounded-md mt-1 px-3 py-2 text-sm" 
            required={required} 
        />
    </div>
);

const ProjectEditorModal: React.FC<ProjectEditorModalProps> = ({ projectToEdit, onClose }) => {
    const { addProject, updateProject, currentDate, ranks: globalRanks, instantBonusRates: globalInstant, teamBuilderBonusRates: globalTeam } = useAppContext();
    const { t } = useLocalization();
    const [activeTab, setActiveTab] = useState<Tab>('general');

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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const projectData = {
            ...formData,
            customBonusConfig: bonusConfig,
            customRankConfig: rankConfig
        };

        if (projectToEdit) {
            updateProject({ ...projectToEdit, ...projectData } as Project);
        } else {
            addProject(projectData);
        }
        onClose();
    };

    const renderGeneralTab = () => (
        <div className="space-y-6">
            <FormSection title={t('projectDetail.assetDetails')}>
                <FormInput name="tokenName" label="Token Name" value={formData.tokenName || ''} onChange={handleChange} />
                <FormInput name="tokenTicker" label="Token Ticker (e.g. MSOT)" value={formData.tokenTicker || ''} onChange={handleChange} />
                <FormInput name="assetType" label={t('projectDetail.assetType')} value={formData.assetType || ''} onChange={handleChange} />
                <FormInput name="assetLocation" label={t('projectDetail.location')} value={formData.assetLocation || ''} onChange={handleChange} />
                <FormInput name="assetImageUrl" label="Asset Image URL" value={formData.assetImageUrl || ''} onChange={handleChange} />
                <FormTextarea name="assetDescription" label="Asset Description" value={formData.assetDescription || ''} onChange={handleChange} />
            </FormSection>

            <FormSection title={t('projectDetail.financials')}>
                <FormInput name="assetValuation" label={t('projectDetail.assetValuation')} value={formData.assetValuation || 0} onChange={handleChange} type="number" />
                <FormInput name="expectedYield" label={`${t('projectDetail.expectedYield')} (%)`} value={formData.expectedYield || 0} onChange={handleChange} type="number" />
                <FormInput name="minInvestment" label={t('projectDetail.minInvestment')} value={formData.minInvestment || 0} onChange={handleChange} type="number" />
                <FormInput name="tokenPrice" label={t('projectDetail.tokenPrice')} value={formData.tokenPrice || 0} onChange={handleChange} type="number" />
                <FormInput name="totalTokenSupply" label="Total Token Supply" value={formData.totalTokenSupply || 0} onChange={handleChange} type="number" />
            </FormSection>
        </div>
    );

    const renderBonusesTab = () => (
        <div className="space-y-6">
            <p className="text-sm text-gray-400 italic">Configure specific bonus rates for this project. Defaults are loaded from global settings.</p>
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
            <p className="text-sm text-gray-400 italic">Configure rank requirements specifically for this project.</p>
            {rankConfig.sort((a,b) => a.level - b.level).map(rank => (
                <div key={rank.level} className="bg-gray-700 p-3 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-white">Rank {rank.name}</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
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
                        <div>
                            <label className="block text-[10px] text-gray-400 mb-1">Leadership %</label>
                            <input type="number" value={rank.leadershipBonusPercentage * 100} onChange={e => handleRankChange(rank.level, 'leadershipBonusPercentage', e.target.value)} className="w-full bg-gray-600 text-white rounded px-2 py-1 text-xs" step="0.01" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-4xl max-h-[90vh] flex flex-col">
                <h2 className="text-2xl font-bold text-white mb-6">
                    {projectToEdit ? t('admin.projectEditor.editTitle') : t('admin.projectEditor.createTitle')}
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
                        <button type="submit" className="px-4 py-2 rounded-md bg-brand-primary text-white hover:bg-brand-primary/90">{t('admin.projectEditor.saveProject')}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProjectEditorModal;
