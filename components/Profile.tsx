import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { useLocalization } from '../hooks/useLocalization';
import { User } from '../types';
import AchievementBadge from './AchievementBadge';
import { CameraIcon, CopyIcon, ShareIcon } from '../constants';

const Profile: React.FC = () => {
  const { currentUser, updateUser } = useAppContext();
  const { t } = useLocalization();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<User>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (currentUser) {
      setFormData({
        name: currentUser.name,
        avatar: currentUser.avatar,
        wallet: currentUser.wallet,
      });
    }
  }, [currentUser]);

  if (!currentUser) return <div>{t('dashboard.loading')}</div>;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAvatarClick = () => {
    if (isEditing) {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, avatar: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };


  const handleSave = () => {
    if (!currentUser) return;
    updateUser({ ...currentUser, ...formData });
    setIsEditing(false);
  };

  const copyToClipboard = () => {
    if (!currentUser) return;
    navigator.clipboard.writeText(currentUser.referralCode);
    alert(t('dashboard.referral.copied'));
  };

  const handleShare = async () => {
    if (!currentUser) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: t('dashboard.share.title'),
          text: t('dashboard.share.text', { referralCode: currentUser.referralCode }),
          url: window.location.origin,
        });
      } catch (error) {
        console.error('Error sharing referral code:', error);
      }
    } else {
      alert(t('dashboard.share.notSupported'));
    }
  };

  const KycStatusBadge: React.FC<{ status: User['kycStatus'] }> = ({ status }) => {
    const baseClasses = "px-3 py-1 text-sm font-semibold rounded-full inline-block";
    const statusMap = {
      Verified: { text: t('kyc.verified'), classes: "bg-green-900 text-green-300" },
      Pending: { text: t('kyc.pending'), classes: "bg-yellow-900 text-yellow-300" },
      Rejected: { text: t('kyc.rejected'), classes: "bg-red-900 text-red-300" },
      "Not Submitted": { text: t('kyc.notSubmitted'), classes: "bg-gray-600 text-gray-300" },
    };
    const { text, classes } = statusMap[status];
    return <span className={`${baseClasses} ${classes}`}>{text}</span>;
  };

  const InfoField: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
    <div>
        <label className="block text-sm font-medium text-gray-400 mb-1">{label}</label>
        {children}
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <h2 className="text-2xl font-semibold text-white">{t('profile.title')}</h2>
        {isEditing ? (
          <div className="space-x-2">
            <button onClick={() => setIsEditing(false)} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg">{t('common.cancel')}</button>
            <button onClick={handleSave} className="bg-brand-primary hover:bg-brand-primary/90 text-white font-bold py-2 px-4 rounded-lg">{t('common.saveChanges')}</button>
          </div>
        ) : (
          <button onClick={() => setIsEditing(true)} className="bg-brand-primary hover:bg-brand-primary/90 text-white font-bold py-2 px-4 rounded-lg">{t('profile.editProfile')}</button>
        )}
      </div>

      <div className="bg-gray-800 p-8 rounded-lg shadow-lg grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <div className="relative group">
            <img 
                src={formData.avatar || currentUser.avatar} 
                alt="User Avatar" 
                className={`w-32 h-32 rounded-full mb-4 border-4 border-gray-700 ${isEditing ? 'cursor-pointer group-hover:opacity-75' : ''} transition-opacity`} 
                onClick={handleAvatarClick} 
            />
            {isEditing && (
              <div 
                className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 rounded-full flex items-center justify-center mb-4 transition-colors cursor-pointer"
                onClick={handleAvatarClick}
              >
                <CameraIcon className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            )}
            </div>
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/png, image/jpeg, image/gif"
            />
          
          {isEditing ? (
            <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full bg-gray-700 text-white rounded-md mt-1 px-3 py-2 text-center text-2xl font-bold" />
          ) : (
            <>
                <h3 className="text-2xl font-bold text-white">{formData.name}</h3>
                <p className="text-gray-400">{currentUser.email}</p>
            </>
          )}
        </div>

        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <InfoField label={t('profile.walletAddress')}>
            {isEditing ? (
              <input type="text" name="wallet" value={formData.wallet} onChange={handleInputChange} className="w-full bg-gray-700 text-white rounded-md px-3 py-2 font-mono text-sm" />
            ) : (
              <p className="text-md text-white font-mono break-all">{formData.wallet}</p>
            )}
          </InfoField>

          <InfoField label={t('profile.kycStatus')}>
            <KycStatusBadge status={currentUser.kycStatus} />
          </InfoField>

          <InfoField label={t('profile.referralCode')}>
             <div className="flex items-center justify-between bg-gray-700 rounded-md px-3 py-2">
                <p className="text-md text-white font-mono">{currentUser.referralCode}</p>
                <div className="flex items-center space-x-3">
                    <button onClick={copyToClipboard} className="text-gray-400 hover:text-white" title={t('dashboard.referral.copy')}>
                        <CopyIcon className="w-5 h-5" />
                    </button>
                    <button onClick={handleShare} className="text-gray-400 hover:text-white" title={t('dashboard.referral.share')}>
                        <ShareIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>
          </InfoField>
          
           <InfoField label={t('profile.totalInvestment')}>
              <p className="text-xl font-bold text-green-400">${currentUser.totalInvestment.toLocaleString()}</p>
           </InfoField>

           <InfoField label={t('profile.totalDownline')}>
              <p className="text-xl font-bold text-blue-400">{currentUser.totalDownline.toLocaleString()} {t('profile.members')}</p>
           </InfoField>
        </div>
      </div>

      {['Not Submitted', 'Rejected'].includes(currentUser.kycStatus) && (
        <div className="bg-gray-800 p-8 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold text-white mb-2">{t('profile.kyc.title')}</h3>
            <p className="text-gray-400 mb-4">
                {currentUser.kycStatus === 'Rejected'
                    ? t('profile.kyc.rejectedMessage')
                    : t('profile.kyc.notSubmittedMessage')}
            </p>
            <form onSubmit={(e) => {
                e.preventDefault();
                updateUser({ ...currentUser, kycStatus: 'Pending' });
                alert(t('profile.kyc.submittedAlert'));
            }}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">{t('profile.kyc.identityDocument')}</label>
                        <input type="file" className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-primary file:text-white hover:file:bg-brand-primary/90"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">{t('profile.kyc.proofOfAddress')}</label>
                        <input type="file" className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-primary file:text-white hover:file:bg-brand-primary/90"/>
                    </div>
                </div>
                <button type="submit" className="bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-4 rounded-lg">
                    {t('profile.kyc.submitForReview')}
                </button>
            </form>
        </div>
      )}

      <div className="bg-gray-800 p-8 rounded-lg shadow-lg">
        <h3 className="text-xl font-semibold text-white mb-4">{t('profile.achievements.title')}</h3>
        {currentUser.achievements.length > 0 ? (
          <div className="flex flex-wrap gap-4">
            {currentUser.achievements.map(achId => <AchievementBadge key={achId} achievementId={achId} />)}
          </div>
        ) : (
          <p className="text-gray-400">{t('profile.achievements.noAchievements')}</p>
        )}
      </div>
    </div>
  );
};

export default Profile;