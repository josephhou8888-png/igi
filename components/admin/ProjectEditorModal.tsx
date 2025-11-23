
import React, { useState } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { useLocalization } from '../../hooks/useLocalization';
import { Project } from '../../types';

interface ProjectEditorModalProps {
    projectToEdit: Project | null;
    onClose: () => void;
}

const ProjectEditorModal: React.FC<ProjectEditorModalProps> = ({ projectToEdit, onClose }) => {
    const { addProject, updateProject, currentDate } = useAppContext();
    const { t } = useLocalization();

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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'number' ? Number(value) : value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (projectToEdit) {
            updateProject({ ...projectToEdit, ...formData });
        } else {
            addProject(formData);
        }
        onClose();
    };

    const FormSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
        <div>
            <h3 className="text-lg font-semibold text-brand-primary mb-3">{title}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>
        </div>
    );
    
    const FormInput: React.FC<{ name: keyof typeof formData, label: string, type?: string, required?: boolean }> = ({ name, label, type='text', required=true }) => (
        <div>
            <label className="block text-sm font-medium text-gray-300">{label}</label>
            <input type={type} name={name} value={String(formData[name] || '')} onChange={handleChange} className="w-full bg-gray-700 text-white rounded-md mt-1 px-3 py-2 text-sm" required={required} />
        </div>
    );
    
    const FormTextarea: React.FC<{ name: keyof typeof formData, label: string, required?: boolean }> = ({ name, label, required=true }) => (
        <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-300">{label}</label>
            <textarea name={name} value={String(formData[name] || '')} onChange={handleChange} rows={2} className="w-full bg-gray-700 text-white rounded-md mt-1 px-3 py-2 text-sm" required={required} />
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <form onSubmit={handleSubmit} className="bg-gray-800 rounded-lg shadow-xl p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <h2 className="text-2xl font-bold text-white mb-6">
                    {projectToEdit ? t('admin.projectEditor.editTitle') : t('admin.projectEditor.createTitle')}
                </h2>
                <div className="space-y-6">
                    <FormSection title={t('projectDetail.assetDetails')}>
                        <FormInput name="tokenName" label="Token Name" />
                        <FormInput name="tokenTicker" label="Token Ticker (e.g. MSOT)" />
                        <FormInput name="assetType" label={t('projectDetail.assetType')} />
                        <FormInput name="assetLocation" label={t('projectDetail.location')} />
                        <FormInput name="assetImageUrl" label="Asset Image URL" />
                        <FormTextarea name="assetDescription" label="Asset Description" />
                    </FormSection>

                    <FormSection title={t('projectDetail.financials')}>
                        <FormInput name="assetValuation" label={t('projectDetail.assetValuation')} type="number" />
                        <FormInput name="expectedYield" label={`${t('projectDetail.expectedYield')} (%)`} type="number" />
                        <FormInput name="minInvestment" label={t('projectDetail.minInvestment')} type="number" />
                        <FormInput name="tokenPrice" label={t('projectDetail.tokenPrice')} type="number" />
                        <FormInput name="totalTokenSupply" label="Total Token Supply" type="number" />
                    </FormSection>
                </div>
                <div className="flex justify-end space-x-4 pt-6 mt-6 border-t border-gray-700">
                    <button type="button" onClick={onClose} className="px-4 py-2 rounded-md bg-gray-600 text-white hover:bg-gray-500">{t('common.cancel')}</button>
                    <button type="submit" className="px-4 py-2 rounded-md bg-brand-primary text-white hover:bg-brand-primary/90">{t('admin.projectEditor.saveProject')}</button>
                </div>
            </form>
        </div>
    );
};

export default ProjectEditorModal;
