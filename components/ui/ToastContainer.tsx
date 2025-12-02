
import React from 'react';
import { useToast } from '../../hooks/useToast';
import { CheckCircleIcon, ShieldIcon, ZapIcon } from '../../constants'; // Reuse existing icons or add generic ones

// Simple X Icon
const XIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
);

const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`
            pointer-events-auto flex items-start w-80 p-4 rounded-lg shadow-lg transform transition-all duration-300 ease-in-out animation-slide-in
            ${toast.type === 'success' ? 'bg-gray-800 border-l-4 border-green-500 text-white' : ''}
            ${toast.type === 'error' ? 'bg-gray-800 border-l-4 border-red-500 text-white' : ''}
            ${toast.type === 'info' ? 'bg-gray-800 border-l-4 border-blue-500 text-white' : ''}
          `}
        >
          <div className="flex-shrink-0 mr-3">
            {toast.type === 'success' && <CheckCircleIcon className="w-5 h-5 text-green-500" />}
            {toast.type === 'error' && <ShieldIcon className="w-5 h-5 text-red-500" />}
            {toast.type === 'info' && <ZapIcon className="w-5 h-5 text-blue-500" />}
          </div>
          <div className="flex-1 text-sm font-medium">{toast.message}</div>
          <button
            onClick={() => removeToast(toast.id)}
            className="ml-3 text-gray-400 hover:text-white transition-colors"
          >
            <XIcon className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;
