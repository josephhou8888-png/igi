
import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { useLocalization } from '../hooks/useLocalization';
import { useToast } from '../hooks/useToast';
import { User } from '../types';
import AchievementBadge from './AchievementBadge';
import { CameraIcon, CopyIcon, ShareIcon } from '../constants';

const Profile: React.FC = () => {
  const { currentUser, updateUser } = useAppContext();
  const { t } = useLocalization();
  const { addToast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<User>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (currentUser) {
      setFormData({
        name: currentUser.name,
        avatar: currentUser.avatar,
        wallet: currentUser.wallet,
        country: currentUser.country
      });
    }
  }, [currentUser]);

  if (!currentUser) return <div>{t('dashboard.loading')}</div>;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAvatarClick = () => {
    if (isEditing && !isUploading) {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 1024 * 1024) {
          addToast(t('profile.imageSizeError'), 'error');
          if (fileInputRef.current) fileInputRef.current.value = '';
          return;
      }
      setIsUploading(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, avatar: reader.result as string }));
        setIsUploading(false);
      };
      reader.onerror = () => {
          addToast("Error reading file", 'error');
          setIsUploading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!currentUser || isSaving) return;
    setIsSaving(true);
    try {
        await updateUser({ ...currentUser, ...formData } as User);
        setIsEditing(false);
        addToast("Profile updated successfully!", 'success');
    } catch (e: any) {
        addToast(e.message || "Failed to update profile", 'error');
    } finally {
        setIsSaving(false);
    }
  };

  const copyToClipboard = () => {
    if (!currentUser) return;
    navigator.clipboard.writeText(currentUser.referralCode);
    addToast(t('dashboard.referral.copied'), 'success');
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
      addToast(t('dashboard.share.notSupported'), 'info');
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
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">{label}</label>
        {children}
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
            <h2 className="text-3xl font-black text-white uppercase tracking-tight">{t('profile.title')}</h2>
            <p className="text-gray-400 text-sm">Manage your personal settings and verification.</p>
        </div>
        {isEditing ? (
          <div className="flex space-x-2">
            <button onClick={() => setIsEditing(false)} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-6 rounded-lg transition-colors" disabled={isSaving}>{t('common.cancel')}</button>
            <button 
                onClick={handleSave} 
                className="bg-brand-primary hover:bg-brand-primary/90 text-white font-bold py-2 px-6 rounded-lg shadow-lg flex items-center transition-all"
                disabled={isSaving}
            >
              {isSaving && <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
              {isSaving ? "Saving..." : t('common.saveChanges')}
            </button>
          </div>
        ) : (
          <button onClick={() => setIsEditing(true)} className="bg-brand-primary hover:bg-brand-primary/90 text-white font-bold py-2 px-6 rounded-lg shadow-lg transition-all">{t('profile.editProfile')}</button>
        )}
      </div>

      <div className="bg-gray-800 p-8 rounded-xl shadow-2xl grid grid-cols-1 md:grid-cols-3 gap-10 items-start border border-gray-700/50">
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <div className="relative mb-6 group w-40 h-40">
            <img 
                src={formData.avatar || currentUser.avatar} 
                alt="User Avatar" 
                className={`w-full h-full rounded-full border-4 border-gray-700 object-cover shadow-2xl transition-opacity ${isEditing ? 'cursor-pointer' : ''}`}
                onClick={handleAvatarClick}
            />
            {isUploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full z-20">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                </div>
            )}
            {isEditing && !isUploading && (
              <div 
                className="absolute inset-0 bg-black/40 hover:bg-black/50 rounded-full flex items-center justify-center transition-all cursor-pointer opacity-0 group-hover:opacity-100"
                onClick={handleAvatarClick}
              >
                <CameraIcon className="w-10 h-10 text-white" />
              </div>
            )}
          </div>

          <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
          
          {isEditing ? (
            <div className="w-full space-y-3">
                <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full bg-gray-700 text-white rounded-md px-3 py-2 text-center text-xl font-bold border border-gray-600 focus:border-brand-primary outline-none" placeholder="Name" />
                <input type="text" name="country" value={formData.country} onChange={handleInputChange} className="w-full bg-gray-700 text-gray-400 rounded-md px-3 py-1.5 text-center text-sm border border-gray-600 focus:border-brand-primary outline-none" placeholder="Country" />
            </div>
          ) : (
            <>
                <h3 className="text-3xl font-black text-white">{currentUser.name}</h3>
                <p className="text-gray-400 font-medium">{currentUser.email}</p>
                <p className="text-xs text-brand-primary font-black mt-2 uppercase tracking-tighter bg-brand-primary/10 px-2 py-0.5 rounded">Rank L{currentUser.rank} Partner</p>
            </>
          )}
        </div>

        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-8">
          <InfoField label={t('profile.walletAddress')}>
            {isEditing ? (
              <input type="text" name="wallet" value={formData.wallet} onChange={handleInputChange} className="w-full bg-gray-700 text-white rounded-md px-3 py-2 font-mono text-sm border border-gray-600 focus:border-brand-primary outline-none" placeholder="Primary USDT Wallet" />
            ) : (
              <p className="text-md text-white font-mono break-all bg-gray-900/50 p-3 rounded-lg border border-gray-700">{formData.wallet || 'Not Set'}</p>
            )}
          </InfoField>

          <InfoField label={t('profile.kycStatus')}>
            <div className="mt-1"><KycStatusBadge status={currentUser.kycStatus} /></div>
          </InfoField>

          <InfoField label={t('profile.referralCode')}>
             <div className="flex items-center justify-between bg-gray-900/50 rounded-lg px-3 py-2 border border-gray-700">
                <p className="text-md text-white font-mono font-bold">{currentUser.referralCode}</p>
                <div className="flex items-center space-x-2">
                    <button onClick={copyToClipboard} className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded-md transition-all" title={t('dashboard.referral.copy')}>
                        <CopyIcon className="w-5 h-5" />
                    </button>
                    <button onClick={handleShare} className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded-md transition-all" title={t('dashboard.referral.share')}>
                        <ShareIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>
          </InfoField>
          
           <InfoField label={t('profile.totalInvestment')}>
              <p className="text-2xl font-black text-green-400">${currentUser.totalInvestment.toLocaleString()}</p>
           </InfoField>

           <InfoField label={t('profile.totalDownline')}>
              <p className="text-2xl font-black text-blue-400">{currentUser.totalDownline.toLocaleString()} <span className="text-sm font-bold text-gray-500">{t('profile.members')}</span></p>
           </InfoField>
           
           <InfoField label="Primary Currency">
              <p className="text-lg font-bold text-white flex items-center gap-2">
                <span className="w-6 h-6 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center text-xs">$</span>
                USDT (Tether)
              </p>
           </InfoField>
        </div>
      </div>

      {['Not Submitted', 'Rejected'].includes(currentUser.kycStatus) && (
        <div className="bg-gray-800 p-8 rounded-xl shadow-lg border border-yellow-500/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5">
                <CameraIcon className="w-24 h-24 text-white" />
            </div>
            <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-2">{t('profile.kyc.title')}</h3>
            <p className="text-gray-400 mb-6 max-w-2xl">
                {currentUser.kycStatus === 'Rejected'
                    ? t('profile.kyc.rejectedMessage')
                    : t('profile.kyc.notSubmittedMessage')}
            </p>
            <form onSubmit={(e) => {
                e.preventDefault();
                updateUser({ ...currentUser, kycStatus: 'Pending' });
                addToast(t('profile.kyc.submittedAlert'), 'success');
            }}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    <div className="bg-gray-700/50 p-4 rounded-lg border border-gray-600 border-dashed">
                        <label className="block text-sm font-bold text-gray-300 mb-3">{t('profile.kyc.identityDocument')}</label>
                        <input type="file" className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-black file:bg-brand-primary file:text-white hover:file:bg-brand-primary/90 cursor-pointer"/>
                        <p className="text-[10px] text-gray-500 mt-2">Accepted formats: Passport, National ID, Driver's License.</p>
                    </div>
                    <div className="bg-gray-700/50 p-4 rounded-lg border border-gray-600 border-dashed">
                        <label className="block text-sm font-bold text-gray-300 mb-3">{t('profile.kyc.proofOfAddress')}</label>
                        <input type="file" className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-black file:bg-brand-primary file:text-white hover:file:bg-brand-primary/90 cursor-pointer"/>
                        <p className="text-[10px] text-gray-500 mt-2">Accepted formats: Utility bill, Bank statement (less than 3 months old).</p>
                    </div>
                </div>
                <button type="submit" className="bg-green-600 hover:bg-green-500 text-white font-black py-3 px-8 rounded-lg shadow-xl shadow-green-900/20 transition-all uppercase tracking-widest text-sm">
                    {t('profile.kyc.submitForReview')}
                </button>
            </form>
        </div>
      )}

      <div className="bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-700/50">
        <h3 className="text-xl font-black text-white uppercase tracking-tight mb-6">{t('profile.achievements.title')}</h3>
        {currentUser.achievements.length > 0 ? (
          <div className="flex flex-wrap gap-4">
            {currentUser.achievements.map(achId => <AchievementBadge key={achId} achievementId={achId} />)}
          </div>
        ) : (
          <div className="text-center py-10 bg-gray-900/30 rounded-lg border border-dashed border-gray-700">
            <p className="text-gray-500 italic">{t('profile.achievements.noAchievements')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
