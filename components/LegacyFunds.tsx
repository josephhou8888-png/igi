
import React, { useState } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { useLocalization } from '../hooks/useLocalization';
import { DollarSignIcon, PercentIcon, ExternalLinkIcon } from '../constants';
import ReinvestModal from './ReinvestModal';

const LegacyFunds: React.FC = () => {
  const { investmentPools, getUserBalances, currentUser } = useAppContext();
  const { t } = useLocalization();
  const [selectedFundId, setSelectedFundId] = useState<string | null>(null);

  if (!currentUser) return null;

  const { depositBalance, profitBalance } = getUserBalances(currentUser.id);

  const handleInvest = (fundId: string) => {
    setSelectedFundId(fundId);
  };

  const handleCloseModal = () => {
    setSelectedFundId(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-white">{t('funds.title')}</h2>
        <p className="text-gray-400 mt-1">{t('funds.subtitle')}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {investmentPools.map(pool => (
            <div key={pool.id} className="bg-gray-800 rounded-lg shadow-lg overflow-hidden flex flex-col border border-gray-700">
                <div className="p-6 flex flex-col flex-grow">
                    <h3 className="text-xl font-bold text-white">{pool.name}</h3>
                    <p className="text-sm text-gray-400 mt-2">{pool.description}</p>
                    
                    {pool.projectUrl && (
                        <a 
                            href={pool.projectUrl} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="inline-flex items-center text-brand-primary hover:text-brand-secondary text-sm mt-3 font-medium transition-colors"
                        >
                            Visit Website <ExternalLinkIcon className="w-4 h-4 ml-1" />
                        </a>
                    )}

                    <div className="mt-6 space-y-3 flex-grow">
                        <div className="flex items-center">
                            <PercentIcon className="w-5 h-5 text-green-400 mr-3" />
                            <span className="text-gray-300">{t('admin.legacyFunds.apy')}:</span>
                            <span className="font-semibold text-white ml-auto">{pool.apy}%</span>
                        </div>
                        <div className="flex items-center">
                            <DollarSignIcon className="w-5 h-5 text-blue-400 mr-3" />
                            <span className="text-gray-300">{t('admin.projects.minInvestment')}:</span>
                            <span className="font-semibold text-white ml-auto">${pool.minInvestment.toLocaleString()}</span>
                        </div>
                    </div>
                    <button
                        onClick={() => handleInvest(pool.id)}
                        className="w-full mt-6 bg-brand-primary hover:bg-brand-primary/90 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                    >
                        {t('wallet.invest')}
                    </button>
                </div>
            </div>
        ))}
      </div>
      {selectedFundId && (
        <ReinvestModal 
            onClose={handleCloseModal} 
            depositBalance={depositBalance} 
            profitBalance={profitBalance}
            initialAssetId={selectedFundId}
        />
      )}
    </div>
  );
};

export default LegacyFunds;
