import React, { useState } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { useLocalization } from '../../hooks/useLocalization';
import { User } from '../../types';

interface AdjustRankModalProps {
  user: User;
  onClose: () => void;
}

const AdjustRankModal: React.FC<AdjustRankModalProps> = ({ user, onClose }) => {
  const { adjustUserRank } = useAppContext();
  const { t } = useLocalization();
  const [newRank, setNewRank] = useState(user.rank);
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError(t('admin.adjustRank.errorReason'));
      return;
    }
    if (newRank < 1 || newRank > 9) {
      setError(t('admin.adjustRank.errorLevel'));
      return;
    }
    setError('');
    adjustUserRank(user.id, newRank, reason);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg shadow-xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-white mb-2">{t('admin.adjustRank.title')}</h2>
        <p className="text-gray-400 mb-6">{t('admin.adjustRank.forUser', { name: user.name })}</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300">{t('admin.adjustRank.newRank')}</label>
            <input 
                type="number" 
                value={newRank} 
                onChange={e => setNewRank(Number(e.target.value))} 
                min="1" 
                max="9" 
                className="w-full bg-gray-700 text-white rounded-md mt-1 px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">{t('admin.adjustRank.reason')}</label>
            <textarea 
                value={reason} 
                onChange={e => setReason(e.target.value)} 
                rows={3}
                placeholder={t('admin.adjustRank.reasonPlaceholder')} 
                className="w-full bg-gray-700 text-white rounded-md mt-1 px-3 py-2"
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div className="flex justify-end space-x-4 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-md bg-gray-600 text-white hover:bg-gray-500">{t('common.cancel')}</button>
            <button type="submit" className="px-4 py-2 rounded-md bg-brand-primary text-white hover:bg-brand-primary/90">{t('admin.adjustRank.confirm')}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdjustRankModal;