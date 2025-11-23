import React, { useState } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { useLocalization } from '../../hooks/useLocalization';
import { User } from '../../types';

interface EditUserModalProps {
  user: User;
  onClose: () => void;
}

const EditUserModal: React.FC<EditUserModalProps> = ({ user, onClose }) => {
  const { updateUser, users } = useAppContext();
  const { t } = useLocalization();
  const [formData, setFormData] = useState<User>(user);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'rank' || name === 'totalInvestment' || name === 'monthlyIncome' ? Number(value) : value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg shadow-xl p-8 w-full max-w-lg">
        <h2 className="text-2xl font-bold text-white mb-6">{t('admin.editUser.title')}: {user.name}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300">{t('admin.editUser.name')}</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full bg-gray-700 text-white rounded-md mt-1 px-3 py-2"/>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">{t('admin.editUser.rank')}</label>
            <input type="number" name="rank" min="1" max="9" value={formData.rank} onChange={handleChange} className="w-full bg-gray-700 text-white rounded-md mt-1 px-3 py-2"/>
          </div>
           <div>
            <label className="block text-sm font-medium text-gray-300">{t('admin.editUser.upline')}</label>
            <select name="uplineId" value={formData.uplineId || ''} onChange={handleChange} className="w-full bg-gray-700 text-white rounded-md mt-1 px-3 py-2">
              <option value="">{t('admin.editUser.uplineNone')}</option>
              {users.filter(u => u.id !== user.id).map(u => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </div>
           <div>
            <label className="block text-sm font-medium text-gray-300">{t('admin.editUser.totalInvestment')}</label>
            <input type="number" name="totalInvestment" value={formData.totalInvestment} onChange={handleChange} className="w-full bg-gray-700 text-white rounded-md mt-1 px-3 py-2"/>
          </div>
          <div className="flex justify-end space-x-4 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-md bg-gray-600 text-white hover:bg-gray-500">{t('common.cancel')}</button>
            <button type="submit" className="px-4 py-2 rounded-md bg-brand-primary text-white hover:bg-brand-primary/90">{t('common.saveChanges')}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUserModal;