
import React, { useState } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { useLocalization } from '../hooks/useLocalization';

const PasswordResetModal: React.FC = () => {
  const { passwordResetMode, setPasswordResetMode, updateUserPassword } = useAppContext();
  const { t } = useLocalization();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!passwordResetMode) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await updateUserPassword(password);
      alert('Password updated successfully!');
      setPasswordResetMode(false);
    } catch (err: any) {
      setError(err.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[100] p-4">
      <div className="bg-gray-800 rounded-lg shadow-2xl p-8 w-full max-w-md border border-gray-700">
        <h2 className="text-2xl font-bold text-white mb-2">Set New Password</h2>
        <p className="text-sm text-gray-400 mb-6">Please enter a new password for your account.</p>
        
        {error && (
            <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded mb-4 text-sm">
                {error}
            </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">New Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-700 text-white rounded-md border border-gray-600 px-4 py-2 focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-gray-700 text-white rounded-md border border-gray-600 px-4 py-2 focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 px-4 py-3 bg-brand-primary hover:bg-brand-primary/90 text-white font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PasswordResetModal;
