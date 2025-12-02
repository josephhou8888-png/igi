
import React, { useState } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { useLocalization } from '../hooks/useLocalization';
import { useToast } from '../hooks/useToast';
import { MailIcon, CopyIcon, CheckCircleIcon } from '../constants';

const InviteModal: React.FC = () => {
  const { inviteModalOpen, setInviteModalOpen, currentUser, sendReferralInvite } = useAppContext();
  const { t } = useLocalization();
  const { addToast } = useToast();
  const [email, setEmail] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);

  if (!inviteModalOpen || !currentUser) return null;

  const handleCopy = () => {
    const link = `${window.location.origin}?ref=${currentUser.referralCode}`;
    navigator.clipboard.writeText(link);
    addToast(t('dashboard.referral.copied'), 'success');
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSending(true);
    try {
        await sendReferralInvite(email);
        setSentSuccess(true);
        addToast(t('dashboard.referral.inviteSentAction'), 'success');
        setEmail('');
        setTimeout(() => setSentSuccess(false), 3000);
    } catch (e) {
        // Error handling managed by context fallback, but we stop loading here
    } finally {
        setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[100] p-4">
      <div className="bg-gray-800 rounded-lg shadow-2xl p-8 w-full max-w-md relative border border-gray-700">
        <button 
            onClick={() => setInviteModalOpen(false)}
            className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>

        <h2 className="text-2xl font-bold text-white mb-2">{t('inviteModal.title')}</h2>
        <p className="text-gray-400 text-sm mb-6">{t('dashboard.referral.subtitle')}</p>

        <div className="bg-gray-700 p-4 rounded-lg mb-6">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">{t('inviteModal.shareLink')}</label>
            <div className="flex items-center space-x-2 bg-gray-800 rounded p-2 border border-gray-600">
                <p className="text-sm text-white font-mono truncate flex-1">
                    {window.location.origin}?ref={currentUser.referralCode}
                </p>
                <button 
                    onClick={handleCopy}
                    className="p-2 hover:bg-gray-700 rounded-md text-brand-primary transition-colors"
                    title={t('inviteModal.copyLink')}
                >
                    <CopyIcon className="w-5 h-5" />
                </button>
            </div>
        </div>

        <div className="relative flex items-center mb-6">
            <div className="flex-grow border-t border-gray-700"></div>
            <span className="flex-shrink-0 mx-4 text-gray-500 text-xs uppercase">Or send email</span>
            <div className="flex-grow border-t border-gray-700"></div>
        </div>

        <form onSubmit={handleSend} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">{t('inviteModal.emailLabel')}</label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MailIcon className="h-5 w-5 text-gray-500" />
                    </div>
                    <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={t('dashboard.referral.emailPlaceholder')}
                        className="w-full bg-gray-700 text-white rounded-md border border-gray-600 pl-10 pr-4 py-2 focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none"
                        required
                    />
                </div>
            </div>

            <button 
                type="submit"
                disabled={isSending || sentSuccess}
                className={`w-full py-3 rounded-lg font-bold text-white transition-all flex items-center justify-center shadow-lg ${
                    sentSuccess 
                    ? 'bg-green-600 cursor-default' 
                    : 'bg-brand-primary hover:bg-brand-primary/90'
                }`}
            >
                {isSending ? (
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                ) : sentSuccess ? (
                    <>
                        <CheckCircleIcon className="w-5 h-5 mr-2" />
                        {t('inviteModal.inviteSentAction')}
                    </>
                ) : (
                    t('inviteModal.send')
                )}
            </button>
        </form>
      </div>
    </div>
  );
};

export default InviteModal;
