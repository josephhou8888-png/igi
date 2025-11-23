import React from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { useLocalization } from '../../hooks/useLocalization';
import { User } from '../../types';

interface KycReviewModalProps {
  user: User;
  onClose: () => void;
}

const KycReviewModal: React.FC<KycReviewModalProps> = ({ user, onClose }) => {
  const { updateKycStatus } = useAppContext();
  const { t } = useLocalization();

  const handleApprove = () => {
    updateKycStatus(user.id, 'Verified');
    onClose();
  };

  const handleReject = () => {
    updateKycStatus(user.id, 'Rejected');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg shadow-xl p-8 w-full max-w-2xl">
        <h2 className="text-2xl font-bold text-white mb-2">{t('admin.kycReview.title')}</h2>
        <p className="text-gray-400 mb-6">{t('admin.kycReview.reviewingFor')}: <span className="font-semibold text-white">{user.name}</span></p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-700 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-white mb-2">{t('admin.kycReview.identityDocument')}</h3>
            <img src={`https://placehold.co/400x250/374151/E5E7EB?text=${encodeURIComponent(t('admin.kycReview.mockIdCard'))}`} alt="Mock ID Card" className="w-full rounded-md" />
            <p className="text-xs text-gray-400 mt-2 text-center">{t('admin.kycReview.idFront')}</p>
          </div>
           <div className="bg-gray-700 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-white mb-2">{t('admin.kycReview.proofOfAddress')}</h3>
            <img src={`https://placehold.co/400x250/374151/E5E7EB?text=${encodeURIComponent(t('admin.kycReview.mockUtilityBill'))}`} alt="Mock Utility Bill" className="w-full rounded-md" />
            <p className="text-xs text-gray-400 mt-2 text-center">{t('admin.kycReview.utilityBill')}</p>
          </div>
        </div>
        
        <div className="flex flex-wrap justify-end space-x-4 pt-6 mt-6 border-t border-gray-700">
          <button onClick={onClose} className="px-4 py-2 rounded-md bg-gray-600 text-white hover:bg-gray-500">{t('common.close')}</button>
          <button onClick={handleReject} className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-500">{t('admin.kycReview.reject')}</button>
          <button onClick={handleApprove} className="px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-500">{t('admin.kycReview.approve')}</button>
        </div>
      </div>
    </div>
  );
};

export default KycReviewModal;