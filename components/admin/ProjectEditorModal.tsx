
import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { useLocalization } from '../../hooks/useLocalization';
import { Project, BonusConfig, Rank } from '../../types';
import { CameraIcon } from '../../constants';

interface ProjectEditorModalProps {
    projectToEdit: Project | null;
    onClose: () => void;
}

type Tab = 'general' | 'bonuses' | 'ranks';

// Helper components moved OUTSIDE to prevent re-mounting and focus loss
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
    step?: string
}> = ({ name, label, value, onChange, type='text', required=true, disabled=false, step }) => (
    <div>
        <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">{label}</label>
        <input 
            type={type} 
            name={name} 
            value={String(value || '')} 
            onChange={onChange} 
            disabled={disabled}
            step={step}
            className="w-full bg-gray-700 text-white rounded-md px-3 py-2 text-sm border border-gray-600 focus:border-brand-primary outline-none transition-all disabled:opacity-50" 
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
            className="w-full bg-gray-700 text-white rounded-md px-3 py-2 text-sm border border-gray-600 focus:border-brand-primary outline-none transition-all disabled:opacity-50" 
            required={required} 
        />
    </div>
);

const ProjectEditorModal: React.FC<ProjectEditorModalProps> = ({ projectToEdit, onClose }) => {
    const { addProject, updateProject, currentDate, ranks: globalRanks, instantBonusRates: globalInstant, teamBuilderBonusRates: globalTeam } = useAppContext();
    const { t } = useLocalization();
    const [activeTab, setActiveTab] = useState<Tab>('general');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const getInitialState = (): Partial<Omit<Project, 'id'>> => {
        if (projectToEdit) return { ...projectToEdit };
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
    const [bonusConfig, setBonusConfig] = useState<BonusConfig>({ instant: globalInstant, teamBuilder: globalTeam });
    const [rankConfig, setRankConfig] = useState<Rank[]>(globalRanks);

    useEffect(() => {
        if (projectToEdit) {
            setFormData({ ...projectToEdit });
            if (projectToEdit.customBonusConfig) setBonusConfig(projectToEdit.customBonusConfig);
            if (projectToEdit.customRankConfig) setRankConfig(projectToEdit.customRankConfig);
        }
    }, [projectToEdit]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'number' ? Number(value) : value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.size > 2 * 1024 * 1024) {
                alert("Image size must be less than 2MB");
                return;
            }

            setIsUploading(true);
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, assetImageUrl: reader.result as string }));
                setIsUploading(false);
            };
            reader.onerror = () => {
                alert("Error reading file");
                setIsUploading(false);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleBonusChange = (section: 'instant' | 'teamBuilder', key: string | number, value: string) => {
        const numValue = parseFloat(value) / 100;
        if (section === 'instant') {
            setBonusConfig(prev => ({ ...prev, instant: { ...prev.instant, [key]: numValue } }));
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
        if (isSubmitting) return;
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
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-xl shadow-2xl p-8 w-full max-w-5xl max-h-[95vh] flex flex-col border border-gray-700">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white">
                        {projectToEdit ? t('admin.projectEditor.editTitle') : t('admin.projectEditor.createTitle')}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
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
                        {activeTab === 'general' && (
                            <div className="space-y-6">
                                <FormSection title={t('projectDetail.assetDetails')}>
                                    <FormInput name="tokenName" label="Token Name" value={formData.tokenName || ''} onChange={handleChange} />
                                    <FormInput name="tokenTicker" label="Token Ticker" value={formData.tokenTicker || ''} onChange={handleChange} />
                                    <FormInput name="assetType" label={t('projectDetail.assetType')} value={formData.assetType || ''} onChange={handleChange} />
                                    <FormInput name="assetLocation" label={t('projectDetail.location')} value={formData.assetLocation || ''} onChange={handleChange} />
                                    
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Asset Image</label>
                                        <div className="flex flex-col sm:flex-row gap-4 items-start">
                                            <div className="relative group w-full sm:w-48 h-32 bg-gray-700 rounded-lg overflow-hidden border-2 border-dashed border-gray-600 hover:border-brand-primary transition-colors cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                                {formData.assetImageUrl ? (
                                                    <img src={formData.assetImageUrl} alt="Preview" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-500">
                                                        <CameraIcon className="w-8 h-8 mb-2" />
                                                        <span className="text-[10px] uppercase font-bold">Upload Image</span>
                                                    </div>
                                                )}
                                                {isUploading && (
                                                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                                                    </div>
                                                )}
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                                    <span className="text-white text-[10px] font-bold uppercase">Change Image</span>
                                                </div>
                                            </div>
                                            
                                            <div className="flex-1 w-full space-y-2">
                                                <input 
                                                    type="file" 
                                                    ref={fileInputRef} 
                                                    className="hidden" 
                                                    accept="image/*" 
                                                    onChange={handleFileChange} 
                                                />
                                                <FormInput 
                                                    name="assetImageUrl" 
                                                    label="Or Manual Image URL" 
                                                    value={formData.assetImageUrl || ''} 
                                                    onChange={handleChange} 
                                                    required={false}
                                                />
                                                <p className="text-[10px] text-gray-500 italic">Recommended size: 1200x800px. Max file size: 2MB.</p>
                                            </div>
                                        </div>
                                    </div>

                                    <FormTextarea name="assetDescription" label="Asset Description" value={formData.assetDescription || ''} onChange={handleChange} />
                                    <FormInput name="blockchain" label={t('projectDetail.blockchain')} value={formData.blockchain || ''} onChange={handleChange} />
                                </FormSection>
                                <FormSection title={t('projectDetail.financials')}>
                                    <FormInput name="assetValuation" label={t('projectDetail.assetValuation')} value={formData.assetValuation || 0} onChange={handleChange} type="number" step="any" />
                                    <FormInput name="expectedYield" label={`${t('projectDetail.expectedYield')} (%)`} value={formData.expectedYield || 0} onChange={handleChange} type="number" step="any" />
                                    <FormInput name="minInvestment" label={t('projectDetail.minInvestment')} value={formData.minInvestment || 0} onChange={handleChange} type="number" step="any" />
                                    <FormInput name="tokenPrice" label={t('projectDetail.tokenPrice')} value={formData.tokenPrice || 0} onChange={handleChange} type="number" step="any" />
                                    <FormInput name="totalTokenSupply" label="Total Token Supply" value={formData.totalTokenSupply || 0} onChange={handleChange} type="number" step="any" />
                                </FormSection>
                            </div>
                        )}
                        {activeTab === 'bonuses' && (
                            <div className="space-y-6">
                                <div className="bg-gray-700/50 p-6 rounded-lg border border-gray-600">
                                    <h4 className="font-semibold text-brand-primary mb-4 text-sm uppercase tracking-wider">{t('admin.settings.instantBonus')}</h4>
                                    <div className="grid grid-cols-3 gap-6">
                                        <div>
                                            <label className="block text-xs text-gray-400 mb-1">{t('admin.settings.investor')} (%)</label>
                                            <input type="number" value={(bonusConfig.instant.investor * 100).toFixed(2)} onChange={e => handleBonusChange('instant', 'investor', e.target.value)} className="w-full bg-gray-600 text-white rounded px-3 py-2 text-sm border border-gray-500" step="0.1" />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-gray-400 mb-1">{t('admin.settings.referrer')} (%)</label>
                                            <input type="number" value={(bonusConfig.instant.referrer * 100).toFixed(2)} onChange={e => handleBonusChange('instant', 'referrer', e.target.value)} className="w-full bg-gray-600 text-white rounded px-3 py-2 text-sm border border-gray-500" step="0.1" />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-gray-400 mb-1">{t('admin.settings.uplineL1')} (%)</label>
                                            <input type="number" value={(bonusConfig.instant.upline * 100).toFixed(2)} onChange={e => handleBonusChange('instant', 'upline', e.target.value)} className="w-full bg-gray-600 text-white rounded px-3 py-2 text-sm border border-gray-500" step="0.1" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        {activeTab === 'ranks' && (
                            <div className="space-y-4">
                                {rankConfig.map(rank => (
                                    <div key={rank.level} className="bg-gray-700/50 p-4 rounded-lg border border-gray-600 grid grid-cols-2 md:grid-cols-5 gap-3">
                                        <div className="col-span-2 md:col-span-1 font-bold text-brand-secondary">L{rank.level}</div>
                                        <div>
                                            <label className="block text-[10px] text-gray-400 uppercase">Min Accounts</label>
                                            <input type="number" value={rank.minAccounts} onChange={e => handleRankChange(rank.level, 'minAccounts', e.target.value)} className="w-full bg-gray-600 text-white rounded px-2 py-1 text-xs border border-gray-500" />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] text-gray-400 uppercase">Min Invest</label>
                                            <input type="number" value={rank.minTotalInvestment} onChange={e => handleRankChange(rank.level, 'minTotalInvestment', e.target.value)} className="w-full bg-gray-600 text-white rounded px-2 py-1 text-xs border border-gray-500" />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] text-gray-400 uppercase">Bonus ($)</label>
                                            <input type="number" value={rank.fixedBonus} onChange={e => handleRankChange(rank.level, 'fixedBonus', e.target.value)} className="w-full bg-gray-600 text-white rounded px-2 py-1 text-xs border border-gray-500" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    
                    <div className="flex justify-end space-x-4 pt-6 mt-4 border-t border-gray-700 shrink-0">
                        <button type="button" onClick={onClose} disabled={isSubmitting} className="px-6 py-2 rounded-lg bg-gray-700 text-white font-bold hover:bg-gray-600 border border-gray-600 transition-colors">
                            {t('common.cancel')}
                        </button>
                        <button type="submit" disabled={isSubmitting} className="px-8 py-2 rounded-lg bg-brand-primary text-white font-bold hover:bg-brand-primary/90 transition-all shadow-lg">
                            {isSubmitting ? 'Saving...' : t('admin.projectEditor.saveProject')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProjectEditorModal;
