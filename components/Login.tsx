import React, { useState } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { useLocalization } from '../hooks/useLocalization';

const Login: React.FC = () => {
  const { login, signup, users } = useAppContext();
  const { t } = useLocalization();
  
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
          throw new Error("Passwords do not match");
        }
        if (formData.password.length < 6) {
            throw new Error("Password must be at least 6 characters");
        }
        
        // Handle referral logic if code is provided
        let uplineId = null;
        if (formData.referralCode) {
            const upline = users.find(u => u.referralCode === formData.referralCode);
            if (upline) uplineId = upline.id;
        }

        await signup({
            name: formData.name,
            email: formData.email,
            password: formData.password,
            uplineId: uplineId,
            country: formData.country || 'Global'
        });
      } else {
        await login(formData.email, formData.password);
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 p-4">
      <div className="w-full max-w-md p-8 space-y-8 bg-gray-800 rounded-xl shadow-2xl border border-gray-700">
        <div className="text-center">
            <h1 className="text-3xl font-bold text-white mb-2">
              IGI <span className="text-brand-primary">{t('sidebar.title')}</span>
            </h1>
            <p className="text-gray-400 text-sm">
                {isSignup ? "Join the future of asset management" : "Welcome back, partner"}
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
                <label className="block text-sm font-medium text-gray-300 mb-1">Full Name</label>
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
            <label className="block text-sm font-medium text-gray-300 mb-1">Email Address</label>
            <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 text-white bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all"
                placeholder="you@example.com"
                required
            />
          </div>

          <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
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
                    <label className="block text-sm font-medium text-gray-300 mb-1">Confirm Password</label>
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
                    <label className="block text-sm font-medium text-gray-300 mb-1">Country</label>
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
                    <label className="block text-sm font-medium text-gray-300 mb-1">Referral Code</label>
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
                    Processing...
                </span>
            ) : (
                isSignup ? "Create Account" : t('login.signIn')
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
                {isSignup ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
            </button>
        </div>

        <div className="text-center text-xs text-gray-500 mt-4">
            <p>Demo Mode: Use mock credentials or create a new account. Data is persisted locally.</p>
            {!isSignup && (
                <div className="mt-2 bg-gray-700/50 p-2 rounded border border-gray-600/50 inline-block text-left">
                    <p className="font-mono">User: alex@example.com</p>
                    <p className="font-mono">Pass: password</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default Login;