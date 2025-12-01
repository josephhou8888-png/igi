
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { useLocalization } from '../hooks/useLocalization';
import { locales } from '../locales';
import { ChevronDownIcon } from '../constants';

const Login: React.FC = () => {
  const { login, signup, users, isDemoMode } = useAppContext();
  const { t, locale, setLocale } = useLocalization();
  
  const [isSignup, setIsSignup] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    referralCode: '',
    country: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);

  const currentLocaleData = locales[locale as keyof typeof locales];

  useEffect(() => {
    try {
        const params = new URLSearchParams(window.location.search);
        const refParam = params.get('ref');
        const path = window.location.pathname;

        // Handle 404/Unknown paths by defaulting to Signup and redirecting to root
        // This effectively catches any "page not found" logic for unauthenticated users
        if (path !== '/' && path !== '/index.html') {
            setIsSignup(true);
            // Clean URL but preserve query params (like ref)
            const newUrl = '/' + window.location.search;
            window.history.replaceState(null, '', newUrl);
        }

        if (refParam) {
          setIsSignup(true);
          setFormData(prev => ({ ...prev, referralCode: refParam }));
        }
    } catch (e) {
        console.warn("Could not access window.location or history:", e);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignup) {
        if (formData.password !== formData.confirmPassword) {
          throw new Error(t('login.error.passwordMismatch'));
        }
        if (formData.password.length < 6) {
            throw new Error(t('login.error.passwordLength'));
        }
        
        // Handle referral logic if code is provided
        let uplineId = null;
        if (formData.referralCode) {
            const upline = users.find(u => u.referralCode === formData.referralCode);
            if (upline) uplineId = upline.id;
        }

        await signup({
            name: formData.name,
            email: formData.email.trim(),
            password: formData.password,
            uplineId: uplineId,
            country: formData.country || 'Global'
        });
      } else {
        await login(formData.email.trim(), formData.password);
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const handleLanguageSelect = (lang: string) => {
    setLocale(lang);
    setIsLanguageOpen(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 p-4">
      <div className="w-full max-w-md p-8 space-y-8 bg-gray-800 rounded-xl shadow-2xl border border-gray-700 relative overflow-visible">
        
        {/* Top Right Controls Container */}
        <div className="absolute top-4 right-4 flex items-center space-x-3 z-20">
            {/* Mode Indicator Badge */}
            <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${isDemoMode ? 'bg-yellow-900 text-yellow-300 border border-yellow-700' : 'bg-green-900 text-green-300 border border-green-700'}`}>
                {isDemoMode ? t('login.demoMode') : t('login.liveMode')}
            </div>

            {/* Language Selector */}
            <div className="relative">
                <button 
                    onClick={() => setIsLanguageOpen(!isLanguageOpen)} 
                    className="flex items-center bg-gray-700 hover:bg-gray-600 text-white px-2 py-1 rounded-md border border-gray-600 transition-colors"
                >
                    <span className="text-lg mr-1">{currentLocaleData.flag}</span>
                    <ChevronDownIcon className={`h-4 w-4 text-gray-400 transition-transform ${isLanguageOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {isLanguageOpen && (
                    <div className="absolute right-0 mt-2 w-40 bg-gray-700 rounded-md shadow-xl z-50 border border-gray-600 overflow-hidden">
                        {Object.entries(locales).map(([langCode, langData]) => (
                        <button
                            key={langCode}
                            onClick={() => handleLanguageSelect(langCode)}
                            className={`w-full text-left px-4 py-2 text-sm flex items-center ${
                            locale === langCode ? 'bg-brand-primary text-white' : 'text-gray-200 hover:bg-gray-600'
                            }`}
                        >
                            <span className="mr-3 text-lg">{langData.flag}</span>
                            <span>{langData.name}</span>
                        </button>
                        ))}
                    </div>
                )}
            </div>
        </div>

        <div className="text-center pt-4">
            <h1 className="text-3xl font-bold text-white mb-2">
              IGI <span className="text-brand-primary">{t('sidebar.title')}</span>
            </h1>
            <p className="text-gray-400 text-sm">
                {isSignup ? t('login.subtitle.signup') : t('login.subtitle.signin')}
            </p>
        </div>

        {error && (
            <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded relative text-sm" role="alert">
                <span className="block sm:inline">{error}</span>
            </div>
        )}

        <form className="space-y-5" onSubmit={handleSubmit}>
          
          {isSignup && (
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">{t('login.fullName')}</label>
                <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 text-white bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all"
                    placeholder="John Doe"
                    required
                />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">{t('login.email')}</label>
            <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 text-white bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all"
                placeholder="you@example.com"
                autoCapitalize="none"
                autoComplete="email"
                required
            />
          </div>

          <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">{t('login.password')}</label>
                <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-4 py-2 text-white bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all"
                    placeholder="••••••••"
                    required
                />
              </div>
              
              {isSignup && (
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">{t('login.confirmPassword')}</label>
                    <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="w-full px-4 py-2 text-white bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all"
                        placeholder="••••••••"
                        required
                    />
                </div>
              )}
          </div>

          {isSignup && (
             <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">{t('login.country')}</label>
                    <input
                        type="text"
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                        className="w-full px-4 py-2 text-white bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all"
                        placeholder="USA"
                    />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">{t('login.referralCode')}</label>
                    <input
                        type="text"
                        name="referralCode"
                        value={formData.referralCode}
                        onChange={handleChange}
                        className="w-full px-4 py-2 text-white bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all"
                        placeholder="Optional"
                    />
                 </div>
             </div>
          )}
          
          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-3 text-sm font-bold text-white bg-brand-primary rounded-lg shadow-lg hover:bg-brand-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-brand-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02]"
          >
            {loading ? (
                <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {t('login.processing')}
                </span>
            ) : (
                isSignup ? t('login.createAccount') : t('login.signIn')
            )}
          </button>
        </form>

        <div className="relative">
            <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-800 text-gray-400">or</span>
            </div>
        </div>

        <div className="text-center">
            <button 
                onClick={() => { setIsSignup(!isSignup); setError(''); }}
                className="text-brand-secondary hover:text-white text-sm font-medium transition-colors"
            >
                {isSignup ? t('login.haveAccount') : t('login.noAccount')}
            </button>
        </div>

        {isDemoMode && (
            <div className="text-center text-xs text-gray-500 mt-4">
                <p>{t('login.demoHint')}</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default Login;
