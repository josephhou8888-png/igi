
import React, { useState } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { useLocalization } from '../../hooks/useLocalization';
import { Project } from '../../types';
import ProjectEditorModal from './ProjectEditorModal';
import { PlusCircleIcon, EditIcon, TrashIcon } from '../../constants';

const ProjectManagement: React.FC = () => {
    const { projects, deleteProject } = useAppContext();
    const { t } = useLocalization();
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [editingProject, setEditingProject] = useState<Project | null>(null);

    const handleCreate = () => {
        setEditingProject(null);
        setIsEditorOpen(true);
    };

    const handleEdit = (project: Project) => {
        setEditingProject(project);
        setIsEditorOpen(true);
    };

    return (
        <>
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-white">{t('admin.projects.title')}</h3>
                    <button
                        onClick={handleCreate}
                        className="flex items-center bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-4 rounded-lg text-sm"
                    >
                        <PlusCircleIcon className="w-5 h-5 mr-2" />
                        {t('admin.projects.createNew')}
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-300">
                        <thead className="text-xs text-gray-400 uppercase bg-gray-700">
                            <tr>
                                <th className="px-6 py-3">{t('investModal.projectLabel')}</th>
                                <th className="px-6 py-3">{t('projectDetail.assetType')}</th>
                                <th className="px-6 py-3">{t('projectDetail.assetValuation')}</th>
                                <th className="px-6 py-3">{t('projectDetail.expectedYield')}</th>
                                <th className="px-6 py-3">{t('projectDetail.minInvestment')}</th>
                                <th className="px-6 py-3">{t('admin.investments.table.actions')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {projects.map(project => (
                                <tr key={project.id} className="border-b border-gray-700 hover:bg-gray-600 bg-gray-800">
                                    <td className="px-6 py-4 font-medium text-white">{project.tokenName}</td>
                                    <td className="px-6 py-4">{project.assetType}</td>
                                    <td className="px-6 py-4">${project.assetValuation.toLocaleString()}</td>
                                    <td className="px-6 py-4">{project.expectedYield}%</td>
                                    <td className="px-6 py-4">${project.minInvestment.toLocaleString()}</td>
                                    <td className="px-6 py-4 space-x-4">
                                        <button onClick={() => handleEdit(project)} className="text-cyan-400 hover:text-cyan-300">
                                            <EditIcon className="w-5 h-5" />
                                        </button>
                                        <button onClick={() => deleteProject(project.id)} className="text-red-400 hover:text-red-300">
                                            <TrashIcon className="w-5 h-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            {isEditorOpen && (
                <ProjectEditorModal 
                    projectToEdit={editingProject}
                    onClose={() => setIsEditorOpen(false)}
                />
            )}
        </>
    );
};

export default ProjectManagement;
