
import React, { useState, useMemo } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { useLocalization } from '../hooks/useLocalization';
import { useToast } from '../hooks/useToast';
import WithdrawModal from './WithdrawModal';
import ReinvestModal from './ReinvestModal';
import CryptoDepositModal from './CryptoDepositModal';
import LoadingSpinner from './ui/LoadingSpinner';
import { Transaction, TreasuryWallets } from '../types';
import { TokenIcon, SolanaIcon, DollarSignIcon, FileTextIcon } from '../constants';

const Wallet: React.FC = () => {
  const { 
    currentUser, transactions, investments, getUserBalances,
    solanaWalletAddress, igiTokenBalance, connectSolanaWallet,
    disconnectSolanaWallet, fetchAllBalances
  } = useAppContext();
  const { t } = useLocalization();
  const { addToast } = useToast();
  const [isCryptoDepositOpen, setIsCryptoDepositOpen] = useState(false);
  const [selectedDepositNetwork, setSelectedDepositNetwork] = useState<keyof TreasuryWallets>('erc20');
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [isReinvestOpen, setIsReinvestOpen] = useState(false);

  // Memoize transaction list to avoid re-sorting on every render
  const userTransactions = useMemo(() => {
      if (!currentUser) return [];
      return transactions
        .filter(t => t.userId === currentUser.id)
        .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, currentUser]);
  
  const { depositBalance, profitBalance } = useMemo(() => {
    if (!currentUser) return { depositBalance: 0, profitBalance: 0 };
    return getUserBalances(currentUser.id);
  }, [currentUser, getUserBalances, transactions]);

  const totalInvestment = useMemo(() => {
      if (!currentUser) return 0;
      return investments
        .filter(inv => inv.userId === currentUser.id && inv.status === 'Active')
        .reduce((sum, inv) => sum + inv.amount, 0);
  }, [investments, currentUser]);

  if (!currentUser) return <LoadingSpinner />;

  const handleOpenDeposit = (network: keyof TreasuryWallets) => {
      setSelectedDepositNetwork(network);
      setIsCryptoDepositOpen(true);
  };

  const handleConnectWallet = async () => {
      try {
          await connectSolanaWallet();
      } catch (e) {
          addToast(t('wallet.solana.notFound'), 'error');
      }
  }

  const getTransactionColor = (type: string) => {
    switch(type) {
      case 'Deposit':
      case 'Bonus':
      case 'Manual Bonus':
      case 'Profit Share':
        return 'text-green-400';
      case 'Withdrawal':
      case 'Investment':
      case 'Reinvestment':
      case 'Manual Deduction':
        return 'text-red-400';
      default:
        return 'text-yellow-400';
    }
  }
  
  const getTransactionSign = (type: string) => {
     switch(type) {
      case 'Deposit':
      case 'Bonus':
      case 'Manual Bonus':
      case 'Profit Share':
        return '+';
      case 'Withdrawal':
      case 'Investment':
      case 'Reinvestment':
      case 'Manual Deduction':
        return '-';
      default:
        return '';
    }
  }

  const transactionTypeMap: { [key in Transaction['type']]: string } = {
    'Deposit': t('wallet.transactionTypes.Deposit'),
    'Withdrawal': t('wallet.transactionTypes.Withdrawal'),
    'Bonus': t('wallet.transactionTypes.Bonus'),
    'Reinvestment': t('wallet.transactionTypes.Reinvestment'),
    'Investment': t('wallet.transactionTypes.Investment'),
    'Manual Bonus': t('wallet.transactionTypes.ManualBonus'),
    'Manual Deduction': t('wallet.transactionTypes.ManualDeduction'),
    'Profit Share': t('wallet.transactionTypes.ProfitShare'),
  };

  const getStatusBadge = (tx: Transaction) => {
    if ((tx.type !== 'Deposit' && tx.type !== 'Withdrawal') || !tx.status) return null;
    
    const statusClasses = {
        pending: 'bg-yellow-900 text-yellow-300',
        completed: 'bg-green-900 text-green-300',
        rejected: 'bg-red-900 text-red-300',
    };

    return (
        <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-semibold ${statusClasses[tx.status]}`}>
            {t(`transactionStatus.${tx.status}`)}
        </span>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold text-white">{t('wallet.title')}</h2>
        
        <div className="bg-gray-800 p-6 sm:p-8 rounded-lg shadow-lg border border-gray-700/50">
          <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-6">
            <div className="flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-gray-400 text-sm mb-1">{t('wallet.depositBalance')}</p>
                  <p className="text-3xl sm:text-4xl font-bold text-white">${depositBalance.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-1">{t('wallet.profitBalance')}</p>
                  <p className="text-3xl sm:text-4xl font-bold text-green-400">${profitBalance.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                </div>
                 <div>
                  <p className="text-gray-400 text-sm mb-1">{t('wallet.totalActiveInvestment')}</p>
                  <p className="text-2xl font-bold text-cyan-400">${totalInvestment.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                </div>
              </div>
              <p className="text-gray-500 font-mono mt-4 pt-4 border-t border-gray-700 text-sm break-all">{currentUser.wallet}</p>
            </div>
            <div className="flex flex-col space-y-2 sm:flex-row sm:flex-wrap sm:justify-end sm:space-x-4 sm:space-y-0 w-full sm:w-auto [&>button]:flex-shrink-0">
              <button onClick={() => handleOpenDeposit('erc20')} className="bg-brand-primary hover:bg-brand-primary/90 text-white font-bold py-2 px-4 rounded-lg shadow-lg">{t('wallet.depositFunds')}</button>
              <button onClick={() => setIsWithdrawOpen(true)} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg shadow-lg">{t('wallet.withdraw')}</button>
              <button onClick={() => setIsReinvestOpen(true)} className="bg-brand-secondary hover:bg-brand-secondary/90 text-white font-bold py-2 px-4 rounded-lg shadow-lg">{t('wallet.invest')}</button>
            </div>
          </div>
        </div>

        {/* Fund Your Account Section */}
        <div>
            <h3 className="text-lg font-semibold text-white mb-4">{t('wallet.fundAccount')}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div 
                    onClick={() => handleOpenDeposit('erc20')}
                    className="bg-gray-800 p-4 rounded-lg border border-gray-700 hover:border-brand-primary cursor-pointer transition-colors flex items-center space-x-4 group"
                >
                    <div className="bg-gray-700 group-hover:bg-gray-600 p-3 rounded-full transition-colors">
                        <DollarSignIcon className="w-6 h-6 text-green-400" />
                    </div>
                    <div>
                        <p className="font-bold text-white">USDT (ERC20)</p>
                        <p className="text-xs text-gray-400">Ethereum Network</p>
                    </div>
                </div>

                <div 
                    onClick={() => handleOpenDeposit('trc20')}
                    className="bg-gray-800 p-4 rounded-lg border border-gray-700 hover:border-brand-primary cursor-pointer transition-colors flex items-center space-x-4 group relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 bg-green-600 text-[10px] px-2 py-0.5 rounded-bl text-white font-bold">Recommended</div>
                    <div className="bg-gray-700 group-hover:bg-gray-600 p-3 rounded-full transition-colors">
                        <TokenIcon className="w-6 h-6 text-red-400" />
                    </div>
                    <div>
                        <p className="font-bold text-white">USDT (TRC20)</p>
                        <p className="text-xs text-gray-400">Tron Network</p>
                    </div>
                </div>

                <div 
                    onClick={() => handleOpenDeposit('polygon')}
                    className="bg-gray-800 p-4 rounded-lg border border-gray-700 hover:border-brand-primary cursor-pointer transition-colors flex items-center space-x-4 group"
                >
                    <div className="bg-gray-700 group-hover:bg-gray-600 p-3 rounded-full transition-colors">
                        <TokenIcon className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                        <p className="font-bold text-white">USDT (Polygon)</p>
                        <p className="text-xs text-gray-400">Matic Network</p>
                    </div>
                </div>

                <div 
                    onClick={() => handleOpenDeposit('solana')}
                    className="bg-gray-800 p-4 rounded-lg border border-gray-700 hover:border-brand-primary cursor-pointer transition-colors flex items-center space-x-4 group"
                >
                    <div className="bg-gray-700 group-hover:bg-gray-600 p-3 rounded-full transition-colors">
                        <SolanaIcon className="w-6 h-6 text-teal-400" />
                    </div>
                    <div>
                        <p className="font-bold text-white">USDT (Solana)</p>
                        <p className="text-xs text-gray-400">Solana Network</p>
                    </div>
                </div>
            </div>
        </div>
        
        {/* Solana Wallet Integration */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700/50">
            <h3 className="text-lg font-semibold text-white mb-4">{t('wallet.solana.title')}</h3>
            {!solanaWalletAddress ? (
                <button 
                    onClick={handleConnectWallet} 
                    className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 px-4 rounded-lg shadow-lg"
                >
                    {t('wallet.solana.connect')}
                </button>
            ) : (
                <div className="space-y-4">
                    <div className="flex items-center justify-between bg-gray-700 p-3 rounded-lg">
                        <div>
                            <p className="text-sm text-gray-400">{t('wallet.solana.connectedAs')}</p>
                            <p className="text-xs font-mono text-white break-all">{solanaWalletAddress}</p>
                        </div>
                        <button onClick={disconnectSolanaWallet} className="bg-red-600 hover:bg-red-500 text-white font-bold py-1 px-3 rounded-lg text-sm">
                            {t('wallet.solana.disconnect')}
                        </button>
                    </div>

                    {igiTokenBalance !== null && (
                        <div className="bg-gray-700 p-4 rounded-lg">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-sm text-gray-300">{t('wallet.solana.igiBalance')}</p>
                                    <p className="text-2xl font-bold text-white">{igiTokenBalance.toLocaleString()}</p>
                                </div>
                                <button onClick={fetchAllBalances} className="text-gray-400 hover:text-white" title={t('wallet.solana.refresh')}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>

        <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700/50">
          <div className="p-6 border-b border-gray-700">
            <h3 className="text-lg font-semibold text-white">{t('wallet.transactionHistory')}</h3>
          </div>
          
          {userTransactions.length > 0 ? (
            <>
                {/* Desktop Table */}
                <div className="overflow-x-auto hidden md:block">
                    <table className="w-full text-sm text-left text-gray-300">
                    <thead className="text-xs text-gray-400 uppercase bg-gray-700/50">
                        <tr>
                        <th scope="col" className="px-6 py-3">{t('wallet.table.date')}</th>
                        <th scope="col" className="px-6 py-3">{t('wallet.table.type')}</th>
                        <th scope="col" className="px-6 py-3">{t('wallet.table.amount')}</th>
                        <th scope="col" className="px-6 py-3">{t('wallet.table.details')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {userTransactions.map(tx => (
                        <tr key={tx.id} className="border-b border-gray-700 hover:bg-gray-700/30 transition-colors">
                            <td className="px-6 py-4">{new Date(tx.date).toLocaleDateString()}</td>
                            <td className="px-6 py-4">
                            <div className="flex items-center">
                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                    ['Deposit', 'Bonus', 'Manual Bonus', 'Profit Share'].includes(tx.type) ? 'bg-green-900 text-green-300' :
                                    ['Withdrawal', 'Investment', 'Reinvestment', 'Manual Deduction'].includes(tx.type) ? 'bg-red-900 text-red-300' :
                                    'bg-yellow-900 text-yellow-300'
                                }`}>{transactionTypeMap[tx.type] || tx.type}</span>
                                {getStatusBadge(tx)}
                            </div>
                            </td>
                            <td className={`px-6 py-4 font-semibold ${getTransactionColor(tx.type)}`}>
                            {getTransactionSign(tx.type)} ${tx.amount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                            </td>
                            <td className="px-6 py-4 font-mono text-gray-500 truncate max-w-xs text-xs">
                                {tx.rejectionReason ? <span className="text-red-400 italic">{tx.rejectionReason}</span> : (tx.reason || tx.txHash)}
                            </td>
                        </tr>
                        ))}
                    </tbody>
                    </table>
                </div>
                {/* Mobile Cards */}
                <div className="md:hidden px-4 pb-4 space-y-3 pt-4">
                    {userTransactions.map(tx => (
                    <div key={tx.id} className="bg-gray-700 p-4 rounded-lg">
                        <div className="flex justify-between items-start">
                        <div>
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                ['Deposit', 'Bonus', 'Manual Bonus', 'Profit Share'].includes(tx.type) ? 'bg-green-900 text-green-300' :
                                ['Withdrawal', 'Investment', 'Reinvestment', 'Manual Deduction'].includes(tx.type) ? 'bg-red-900 text-red-300' :
                                'bg-yellow-900 text-yellow-300'
                            }`}>{transactionTypeMap[tx.type] || tx.type}</span>
                            {getStatusBadge(tx)}
                            <p className="text-xs text-gray-400 mt-2">{new Date(tx.date).toLocaleDateString()}</p>
                        </div>
                        <p className={`font-semibold text-lg ${getTransactionColor(tx.type)}`}>
                            {getTransactionSign(tx.type)} ${tx.amount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                        </p>
                        </div>
                        <p className="text-xs font-mono text-gray-500 mt-2 truncate">
                            {tx.rejectionReason ? <span className="text-red-400 italic">{tx.rejectionReason}</span> : (tx.reason || tx.txHash)}
                        </p>
                    </div>
                    ))}
                </div>
            </>
          ) : (
            <div className="text-center py-12 flex flex-col items-center">
                <div className="bg-gray-700 p-4 rounded-full mb-3">
                    <FileTextIcon className="w-8 h-8 text-gray-500" />
                </div>
                <p className="text-gray-400">No transactions found.</p>
                <button 
                    onClick={() => handleOpenDeposit('erc20')}
                    className="mt-4 text-brand-primary hover:text-brand-secondary font-medium text-sm"
                >
                    Make your first deposit
                </button>
            </div>
          )}
        </div>
      </div>

      {isCryptoDepositOpen && <CryptoDepositModal onClose={() => setIsCryptoDepositOpen(false)} initialNetwork={selectedDepositNetwork} />}
      {isWithdrawOpen && <WithdrawModal currentBalance={depositBalance + profitBalance} onClose={() => setIsWithdrawOpen(false)} />}
      {isReinvestOpen && <ReinvestModal depositBalance={depositBalance} profitBalance={profitBalance} onClose={() => setIsReinvestOpen(false)} />}
    </>
  );
};

export default Wallet;
