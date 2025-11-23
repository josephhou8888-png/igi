
import React from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { useLocalization } from '../hooks/useLocalization';
import { DollarSignIcon, TrendingUpIcon, PercentIcon } from '../constants';
import { Project } from '../types';

interface ProjectsProps {
  onSelectProject: (projectId: string) => void;
}

const ProjectCard: React.FC<{ project: Project, onSelect: () => void }> = ({ project, onSelect }) => {
    const { t } = useLocalization();
    return (
        <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden flex flex-col group">
            <img src={project.assetImageUrl} alt={project.tokenName} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" />
            <div className="p-6 flex flex-col flex-grow">
                <h3 className="text-xl font-bold text-white">{project.tokenName}</h3>
                <p className="text-sm text-gray-400 mt-1">{project.assetType}</p>
                <div className="mt-4 space-y-3 text-sm flex-grow">
                    <div className="flex items-center">
                        <DollarSignIcon className="w-5 h-5 text-green-400 mr-3" />
                        <span className="text-gray-300">{t('projectDetail.assetValuation')}:</span>
                        <span className="font-semibold text-white ml-auto">${project.assetValuation.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center">
                        <PercentIcon className="w-5 h-5 text-blue-400 mr-3" />
                        <span className="text-gray-300">{t('projectDetail.expectedYield')}:</span>
                        <span className="font-semibold text-white ml-auto">{project.expectedYield}% APY</span>
                    </div>
                    <div className="flex items-center">
                        <TrendingUpIcon className="w-5 h-5 text-yellow-400 mr-3" />
                        <span className="text-gray-300">{t('projectDetail.minInvestment')}:</span>
                        <span className="font-semibold text-white ml-auto">${project.minInvestment.toLocaleString()}</span>
                    </div>
                </div>
                <button
                    onClick={onSelect}
                    className="w-full mt-6 bg-brand-primary hover:bg-brand-primary/90 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                >
                    {t('projects.viewDetails')}
                </button>
            </div>
        </div>
    );
};


const Projects: React.FC<ProjectsProps> = ({ onSelectProject }) => {
  const { projects } = useAppContext();
  const { t } = useLocalization();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-white">{t('projects.title')}</h2>
        <p className="text-gray-400 mt-1">{t('projects.subtitle')}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map(project => (
            <ProjectCard key={project.id} project={project} onSelect={() => onSelectProject(project.id)} />
        ))}
      </div>
    </div>
  );
};

export default Projects;
