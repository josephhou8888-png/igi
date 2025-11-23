import React, { useState } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { useLocalization } from '../../hooks/useLocalization';
import { User } from '../../types';
import { PlusCircleIcon, TrashIcon } from '../../constants';

interface InitialInvestment {
  id: number;
  type: 'project' | 'pool';
  assetId: string;
  amount: number;
}

interface CreateUserModalProps {
  onClose: () => void;
}

const CreateUserModal: React.FC<CreateUserModalProps> = ({ onClose }) => {
  const { createUser, users, currentDate, projects, investmentPools } = useAppContext();
  const { t } = useLocalization();
  const [initialInvestments, setInitialInvestments] = useState<InitialInvestment[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    wallet: `0x...${Math.random().toString(16).substr(2, 8)}`,
    rank: 1,
    uplineId: null as string | null,
    referralCode: '',
    kycStatus: 'Not Submitted' as User['kycStatus'],
    avatar: 'https://picsum.photos/id/10/200/200',
    country: 'USA',
    isFrozen: false,
    role: 'user' as 'user' | 'admin',
    joinDate: currentDate.toISOString().split('T')[0],
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'rank' ? Number(value) : value }));
  };
  
  const handleAddInvestment = () => {
      const defaultType = 'pool';
      const defaultAssetId = investmentPools.length > 0 ? investmentPools[0].id : '';
      const defaultAmount = investmentPools.length > 0 ? investmentPools[0].minInvestment : 3000;

      setInitialInvestments(prev => [...prev, {
          id: Date.now(),
          type: defaultType,
          assetId: defaultAssetId,
          amount: defaultAmount,
      }]);
  };

  const handleInvestmentChange = (id: number, field: keyof Omit<InitialInvestment, 'id'>, value: string) => {
      setInitialInvestments(prev => prev.map(inv => {
          if (inv.id === id) {
              const updatedInv = { ...inv, [field]: value };
              if (field === 'type') {
                  const newType = value as 'project' | 'pool';
                  const options = newType === 'project' ? projects : investmentPools;
                  updatedInv.assetId = options.length > 0 ? options[0].id : '';
              }
              return updatedInv;
          }
          return inv;
      }));
  };
  
  const handleRemoveInvestment = (id: number) => {
      setInitialInvestments(prev => prev.filter(inv => inv.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      alert(t('admin.createUser.errorNameEmailRequired'));
      return;
    }
    const referralCode = formData.referralCode || `${formData.name.split(' ')[0].toUpperCase()}${Math.floor(100 + Math.random() * 900)}`;
    const finalInvestments = initialInvestments.map(({ id, ...rest }) => rest);
    createUser({ ...formData, referralCode }, finalInvestments);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg shadow-xl p-8 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-white mb-6">{t('admin.createUser.title')}</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300">{t('admin.createUser.fullName')}</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full bg-gray-700 text-white rounded-md mt-1 px-3 py-2" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300">{t('admin.createUser.email')}</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-gray-700 text-white rounded-md mt-1 px-3 py-2" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300">{t('admin.createUser.role')}</label>
              <select name="role" value={formData.role} onChange={handleChange} className="w-full bg-gray-700 text-white rounded-md mt-1 px-3 py-2">
                <option value="user">{t('admin.createUser.roleUser')}</option>
                <option value="admin">{t('admin.createUser.roleAdmin')}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300">{t('admin.createUser.upline')}</label>
              <select name="uplineId" value={formData.uplineId || ''} onChange={handleChange} className="w-full bg-gray-700 text-white rounded-md mt-1 px-3 py-2">
                <option value="">{t('admin.createUser.uplineNone')}</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
              <h3 className="text-lg font-semibold text-white border-t border-gray-700 pt-4 mt-4">{t('admin.createUser.initialInvestments')}</h3>
              <div className="space-y-3 mt-2">
                  {initialInvestments.map(inv => {
                      const options = inv.type === 'project' ? projects : investmentPools;
                      return (
                          <div key={inv.id} className="grid grid-cols-12 gap-2 items-center bg-gray-700 p-2 rounded-lg">
                              <select value={inv.type} onChange={e => handleInvestmentChange(inv.id, 'type', e.target.value)} className="col-span-3 bg-gray-600 text-white rounded-md px-2 py-2 text-sm">
                                  <option value="pool">{t('reinvestModal.legacyFund')}</option>
                                  <option value="project">{t('reinvestModal.rwaProject')}</option>
                              </select>
                              <select value={inv.assetId} onChange={e => handleInvestmentChange(inv.id, 'assetId', e.target.value)} className="col-span-5 bg-gray-600 text-white rounded-md px-2 py-2 text-sm">
                                  {options.map(o => <option key={o.id} value={o.id}>{('tokenName' in o) ? o.tokenName : o.name}</option>)}
                              </select>
                              <input type="number" value={inv.amount} onChange={e => handleInvestmentChange(inv.id, 'amount', e.target.value)} min="1" placeholder="Amount" className="col-span-3 bg-gray-600 text-white rounded-md px-2 py-2 text-sm" />
                              <button type="button" onClick={() => handleRemoveInvestment(inv.id)} className="col-span-1 text-red-400 hover:text-red-300"><TrashIcon className="w-5 h-5 mx-auto" /></button>
                          </div>
                      );
                  })}
              </div>
              <button type="button" onClick={handleAddInvestment} className="flex items-center space-x-2 text-sm text-green-400 hover:text-green-300 mt-3">
                  <PlusCircleIcon className="w-5 h-5" />
                  <span>{t('admin.createUser.addInvestment')}</span>
              </button>
          </div>

          <div className="flex justify-end space-x-4 pt-4 border-t border-gray-700 mt-6">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-md bg-gray-600 text-white hover:bg-gray-500">{t('common.cancel')}</button>
            <button type="submit" className="px-4 py-2 rounded-md bg-brand-primary text-white hover:bg-brand-primary/90">{t('admin.createUser.createUser')}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateUserModal;