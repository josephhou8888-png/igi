import React, { useState } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { useLocalization } from '../hooks/useLocalization';
import { MOCK_RESOURCES } from '../constants';
import { CopyIcon, FileTextIcon, WhatsAppIcon, TwitterIcon, FacebookIcon } from '../constants';

const Resources: React.FC = () => {
    const { currentUser } = useAppContext();
    const { t } = useLocalization();
    const [copiedTextId, setCopiedTextId] = useState<string | null>(null);

    const handleCopy = (text: string, id: string) => {
        if (!currentUser) return;
        const personalizedText = text.replace('{referralCode}', currentUser.referralCode);
        navigator.clipboard.writeText(personalizedText);
        setCopiedTextId(id);
        setTimeout(() => setCopiedTextId(null), 2000);
    };

    const handleDownload = (url: string, filename: string) => {
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    
    const handleSocialShare = (platform: 'whatsapp' | 'twitter' | 'facebook', text: string) => {
        if (!currentUser) return;
        const personalizedText = text.replace('{referralCode}', currentUser.referralCode);
        const encodedText = encodeURIComponent(personalizedText);
        const url = window.location.origin;

        let shareUrl = '';

        switch (platform) {
            case 'whatsapp':
                shareUrl = `https://api.whatsapp.com/send?text=${encodedText}`;
                break;
            case 'twitter':
                shareUrl = `https://twitter.com/intent/tweet?text=${encodedText}`;
                break;
            case 'facebook':
                shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodedText}`;
                break;
        }

        if (shareUrl) {
            window.open(shareUrl, '_blank', 'noopener,noreferrer');
        }
    };
    
    // In a real app, this data would also come from a source that supports i18n
    // For this demo, we'll map keys to the translated content.
    const getResourceContent = (resource: typeof MOCK_RESOURCES[0]) => {
        const keyMap: { [key: string]: { title: string; description: string; content?: string } } = {
            'banner-1': { title: t('resources.banners.banner1.title'), description: t('resources.banners.banner1.description') },
            'banner-2': { title: t('resources.banners.banner2.title'), description: t('resources.banners.banner2.description') },
            'text-1': { title: t('resources.messages.text1.title'), description: t('resources.messages.text1.description'), content: t('resources.messages.text1.content') },
            'text-2': { title: t('resources.messages.text2.title'), description: t('resources.messages.text2.description'), content: t('resources.messages.text2.content') },
            'presentation-1': { title: t('resources.presentation.title'), description: t('resources.presentation.description') },
        };
        const mapped = keyMap[resource.id];
        return {
            ...resource,
            title: mapped?.title || resource.title,
            description: mapped?.description || resource.description,
            content: mapped?.content || resource.content,
        };
    };

    const banners = MOCK_RESOURCES.filter(r => r.type === 'banner').map(getResourceContent);
    const texts = MOCK_RESOURCES.filter(r => r.type === 'text').map(getResourceContent);
    const presentation = MOCK_RESOURCES.find(r => r.type === 'presentation');
    const localizedPresentation = presentation ? getResourceContent(presentation) : null;

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-semibold text-white">{t('resources.title')}</h2>
                <p className="text-gray-400 mt-1">{t('resources.subtitle')}</p>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                <h3 className="text-xl font-semibold text-white mb-4">{t('resources.banners.title')}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {banners.map(banner => (
                        <div key={banner.id} className="bg-gray-700 rounded-lg overflow-hidden group">
                            <img src={banner.thumbnailUrl} alt={banner.title} className="w-full h-48 object-cover"/>
                            <div className="p-4">
                                <h4 className="font-bold text-white">{banner.title}</h4>
                                <p className="text-sm text-gray-400 mt-1">{banner.description}</p>
                                <button
                                    onClick={() => handleDownload(banner.content, `${banner.title.replace(' ', '_')}.png`)}
                                    className="w-full mt-4 bg-brand-primary hover:bg-brand-primary/90 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                                >
                                    {t('resources.download')}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                    <h3 className="text-xl font-semibold text-white mb-4">{t('resources.messages.title')}</h3>
                    <div className="space-y-4">
                        {texts.map(text => (
                            <div key={text.id} className="bg-gray-700 p-4 rounded-lg">
                                <h4 className="font-bold text-white">{text.title}</h4>
                                <p className="text-sm text-gray-300 my-2 italic">"{text.content.replace('{referralCode}', currentUser?.referralCode || 'YOUR_CODE')}"</p>
                                <div className="flex items-center space-x-2 mt-3">
                                    <button
                                        onClick={() => handleCopy(text.content, text.id)}
                                        className="flex-1 flex items-center justify-center bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                                    >
                                        <CopyIcon className="w-4 h-4 mr-2" />
                                        {copiedTextId === text.id ? t('resources.copied') : t('resources.copyText')}
                                    </button>
                                    <button onClick={() => handleSocialShare('whatsapp', text.content)} className="p-2 bg-green-500 hover:bg-green-600 rounded-lg text-white" title={t('resources.shareOn', { platform: 'WhatsApp' })}>
                                        <WhatsAppIcon className="w-5 h-5" />
                                    </button>
                                    <button onClick={() => handleSocialShare('twitter', text.content)} className="p-2 bg-black hover:bg-gray-800 rounded-lg text-white" title={t('resources.shareOn', { platform: 'X/Twitter' })}>
                                        <TwitterIcon className="w-5 h-5" />
                                    </button>
                                    <button onClick={() => handleSocialShare('facebook', text.content)} className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white" title={t('resources.shareOn', { platform: 'Facebook' })}>
                                        <FacebookIcon className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                {localizedPresentation && (
                    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                        <h3 className="text-xl font-semibold text-white mb-4">{t('resources.presentation.mainTitle')}</h3>
                         <div className="bg-gray-700 p-4 rounded-lg flex flex-col items-center text-center">
                            <FileTextIcon className="w-16 h-16 text-brand-secondary mb-4" />
                            <h4 className="font-bold text-white text-lg">{localizedPresentation.title}</h4>
                            <p className="text-sm text-gray-400 my-2">{localizedPresentation.description}</p>
                            <button
                                onClick={() => handleDownload(localizedPresentation.content, 'IGI_Partnership_Presentation.pdf')}
                                className="w-full mt-4 bg-brand-secondary hover:bg-brand-secondary/90 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                            >
                                {t('resources.downloadPdf')}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Resources;