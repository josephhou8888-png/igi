import React from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { useLocalization } from '../hooks/useLocalization';

interface ProjectDetailProps {
  projectId: string;
  onBack: () => void;
}

const DetailItem: React.FC<{ label: string, value: string | number, isCurrency?: boolean }> = ({ label, value, isCurrency }) => (
    <div>
        <p className="text-xs text-gray-400 uppercase tracking-wider">{label}</p>
        <p className="text-lg font-semibold text-white">
            {isCurrency && '$'}{typeof value === 'number' ? value.toLocaleString() : value}
        </p>
    </div>
);

const ProjectDetail: React.FC<ProjectDetailProps> = ({ projectId, onBack }) => {
  const { projects } = useAppContext();
  const { t } = useLocalization();

  const project = projects.find(p => p.id === projectId);

  if (!project) {
    return (
      <div>
        <h2 className="text-2xl font-semibold text-white">Project not found</h2>
        <button onClick={onBack} className="mt-4 text-brand-primary hover:underline">
          &larr; {t('common.back')}
        </button>
      </div>
    );
  }

  const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-gray-800 p-6 rounded-lg">
        <h3 className="text-xl font-bold text-brand-primary mb-4">{title}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {children}
        </div>
    </div>
  );

  return (
    <>
      <div className="space-y-8">
        <div>
          <button onClick={onBack} className="mb-4 text-sm text-brand-primary hover:underline">
            &larr; {t('common.back')} to Projects
          </button>
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <img src={project.assetImageUrl} alt={project.tokenName} className="w-full md:w-1/3 rounded-lg shadow-lg object-cover" />
            <div className="flex-1">
              <h2 className="text-4xl font-extrabold text-white">{project.tokenName}</h2>
              <p className="text-lg text-gray-400 mt-2">{project.assetDescription}</p>
               <div className="mt-6 bg-gray-800 border-l-4 border-brand-primary p-4 rounded-r-lg">
                    <h4 className="font-bold text-white">{t('reinvestModal.rwaProject')}</h4>
                    <p className="text-sm text-gray-300 mt-1">{t('projectDetail.reinvestmentNote')}</p>
                </div>
            </div>
          </div>
        </div>

        <Section title={t('projectDetail.assetDetails')}>
            <DetailItem label={t('projectDetail.assetType')} value={project.assetType} />
            <DetailItem label={t('projectDetail.location')} value={project.assetLocation} />
            <DetailItem label="Asset ID" value={project.assetIdentifier} />
        </Section>
        
        <Section title={t('projectDetail.financials')}>
            <DetailItem label={t('projectDetail.assetValuation')} value={project.assetValuation} isCurrency />
            <DetailItem label={t('projectDetail.expectedYield')} value={`${project.expectedYield}% APY`} />
            <DetailItem label={t('projectDetail.minInvestment')} value={project.minInvestment} isCurrency />
            <DetailItem label={t('projectDetail.valuationDate')} value={project.valuationDate} />
            <DetailItem label="Valuation Method" value={project.valuationMethod} />
            <DetailItem label="Performance History" value={project.performanceHistory} />
        </Section>

        <Section title={t('projectDetail.tokenomics')}>
            <DetailItem label="Token Ticker" value={project.tokenTicker} />
            <DetailItem label={t('projectDetail.tokenPrice')} value={project.tokenPrice} isCurrency />
            <DetailItem label="Total Supply" value={project.totalTokenSupply} />
            <DetailItem label={t('projectDetail.blockchain')} value={project.blockchain} />
            <DetailItem label="Distribution" value={project.distribution} />
            <DetailItem label="Rights Conferred" value={project.rightsConferred} />
        </Section>

        <Section title={t('projectDetail.legal')}>
            <DetailItem label="Legal Structure" value={project.legalStructure} />
            <DetailItem label="Jurisdiction" value={project.jurisdiction} />
            <DetailItem label="Regulatory Status" value={project.regulatoryStatus} />
            <DetailItem label="Investor Requirements" value={project.investorRequirements} />
        </Section>
        
        <Section title={t('projectDetail.management')}>
            <DetailItem label="Asset Custodian" value={project.assetCustodian} />
            <DetailItem label="Asset Manager" value={project.assetManager} />
            <DetailItem label="Oracles" value={project.oracles} />
        </Section>

      </div>
    </>
  );
};

export default ProjectDetail;