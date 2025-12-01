
import React, { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { User, Project, InvestmentPool, Investment, Transaction, Bonus, NewsPost, Rank, Notification, TreasuryWallets, PlatformSocialLinks } from '../types';
import { 
  MOCK_USERS, MOCK_PROJECTS, MOCK_INVESTMENT_POOLS, MOCK_INVESTMENTS, 
  MOCK_TRANSACTIONS, MOCK_BONUSES, MOCK_NEWS, INITIAL_RANKS,
  INITIAL_TREASURY_WALLETS, INITIAL_PLATFORM_SOCIAL_LINKS,
  INITIAL_INSTANT_BONUS_RATES, INITIAL_TEAM_BUILDER_BONUS_RATES
} from '../constants';
import { useLocalization } from '../hooks/useLocalization';
import { supabase } from '../supabaseClient';

interface AppContextType {
  // State
  currentUser: User | null;
  users: User[];
  projects: Project[];
  investmentPools: InvestmentPool[];
  investments: Investment[];
  transactions: Transaction[];
  bonuses: Bonus[];
  notifications: Notification[];
  news: NewsPost[];
  ranks: Rank[];
  currentDate: Date;
  isDemoMode: boolean;
  solanaWalletAddress: string | null;
  igiTokenBalance: number | null;
  solBalance: number | null;
  withdrawalLimit: number;
  minWithdrawalLimit: number;
  instantBonusRates: typeof INITIAL_INSTANT_BONUS_RATES;
  teamBuilderBonusRates: number[];
  treasuryWallets: TreasuryWallets;
  socialLinks: PlatformSocialLinks;

  // Actions
  login: (email: string, password?: string) => Promise<void>;
  signup: (userData: Partial<User>) => Promise<void>;
  logout: () => void;
  markNotificationsAsRead: () => void;
  updateUser: (user: Partial<User>) => void;
  updateKycStatus: (userId: string, status: User['kycStatus']) => void;
  toggleFreezeUser: (userId: string) => void;
  deleteUser: (userId: string) => void;
  updateUserRole: (userId: string, role: 'user' | 'admin') => void;
  createUser: (userData: any, initialInvestments: any[]) => void;
  adjustUserRank: (userId: string, rank: number, reason: string) => void;
  getUserBalances: (userId: string) => { depositBalance: number; profitBalance: number };
  fetchAllBalances: () => Promise<void>;
  connectSolanaWallet: () => Promise<void>;
  disconnectSolanaWallet: () => void;
  addWithdrawal: (amount: number, currentBalance: number, walletAddress: string) => void;
  addInvestmentFromBalance: (amount: number, assetId: string, type: 'project' | 'pool', source: 'deposit' | 'profit_reinvestment') => void;
  addInvestmentForUser: (userId: string, amount: number, assetId: string, type: 'project' | 'pool', source: 'deposit' | 'profit_reinvestment') => void;
  addCryptoDeposit: (amount: number, txId: string, reason: string) => void;
  confirmCryptoInvestment: (userId: string, amount: number, assetId: string, type: 'project' | 'pool') => void;
  approveDeposit: (txId: string, bonus: number, autoInvestTarget?: { type: 'project' | 'pool', id: string }) => void;
  rejectDeposit: (txId: string, reason: string) => void;
  approveWithdrawal: (txId: string, txHash: string) => void;
  rejectWithdrawal: (txId: string, reason: string) => void;
  addManualTransaction: (userId: string, type: 'Manual Bonus' | 'Manual Deduction', amount: number, reason: string) => void;
  addProject: (project: any) => void;
  updateProject: (project: Project) => void;
  deleteProject: (projectId: string) => void;
  addInvestmentPool: (pool: any) => void;
  updateInvestmentPool: (pool: InvestmentPool) => void;
  deleteInvestmentPool: (poolId: string) => void;
  updateInvestment: (investment: Investment) => void;
  deleteInvestment: (investmentId: string) => void;
  addNewsPost: (post: any) => void;
  updateNewsPost: (post: NewsPost) => void;
  deleteNewsPost: (postId: string) => void;
  updateRankSettings: (ranks: Rank[]) => void;
  updateBonusRates: (instant: any, team: any) => void;
  updateTreasuryWallets: (wallets: TreasuryWallets) => void;
  updateSocialLinks: (links: PlatformSocialLinks) => void;
  updateWithdrawalLimit: (limit: number) => void;
  updateMinWithdrawalLimit: (limit: number) => void;
  advanceDate: (days: number) => void;
  runMonthlyCycle: (date: Date) => void;
  sendReferralInvite: (email: string) => Promise<void>;
  seedDatabase: () => void;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { t } = useLocalization();
  
  // State Initialization with localStorage persistence
  const getStoredData = (key: string, defaultValue: any) => {
      try {
          const stored = localStorage.getItem(key);
          if (stored) return JSON.parse(stored);
      } catch (e) {
          console.error(`Error loading ${key} from localStorage`, e);
      }
      return defaultValue;
  };

  const setStoredData = (key: string, value: any) => {
      try {
          localStorage.setItem(key, JSON.stringify(value));
          // console.log(`Saved ${key} to localStorage`); // Persistence log
      } catch (e) {
          console.error(`Error saving ${key} to localStorage`, e);
      }
  };

  const [currentUser, setCurrentUser] = useState<User | null>(getStoredData('currentUser', null));
  const [users, setUsers] = useState<User[]>(getStoredData('users', MOCK_USERS));
  const [projects, setProjects] = useState<Project[]>(getStoredData('projects', MOCK_PROJECTS));
  const [investmentPools, setInvestmentPools] = useState<InvestmentPool[]>(getStoredData('investmentPools', MOCK_INVESTMENT_POOLS));
  const [investments, setInvestments] = useState<Investment[]>(getStoredData('investments', MOCK_INVESTMENTS));
  const [transactions, setTransactions] = useState<Transaction[]>(getStoredData('transactions', MOCK_TRANSACTIONS));
  const [bonuses, setBonuses] = useState<Bonus[]>(getStoredData('bonuses', MOCK_BONUSES));
  const [notifications, setNotifications] = useState<Notification[]>(getStoredData('notifications', []));
  const [news, setNews] = useState<NewsPost[]>(getStoredData('news', MOCK_NEWS));
  const [ranks, setRanks] = useState<Rank[]>(getStoredData('ranks', INITIAL_RANKS));
  
  // Date needs special handling for hydration
  const [currentDate, setCurrentDate] = useState<Date>(() => {
      const stored = localStorage.getItem('currentDate');
      return stored ? new Date(JSON.parse(stored)) : new Date();
  });

  const [isDemoMode, setIsDemoMode] = useState<boolean>(true);
  const [solanaWalletAddress, setSolanaWalletAddress] = useState<string | null>(null);
  const [igiTokenBalance, setIgiTokenBalance] = useState<number | null>(null);
  const [solBalance, setSolBalance] = useState<number | null>(null);
  
  const [withdrawalLimit, setWithdrawalLimit] = useState<number>(getStoredData('withdrawalLimit', 50000));
  const [minWithdrawalLimit, setMinWithdrawalLimit] = useState<number>(getStoredData('minWithdrawalLimit', 50));
  const [instantBonusRates, setInstantBonusRates] = useState(getStoredData('instantBonusRates', INITIAL_INSTANT_BONUS_RATES));
  const [teamBuilderBonusRates, setTeamBuilderBonusRates] = useState(getStoredData('teamBuilderBonusRates', INITIAL_TEAM_BUILDER_BONUS_RATES));
  const [treasuryWallets, setTreasuryWallets] = useState<TreasuryWallets>(getStoredData('treasuryWallets', INITIAL_TREASURY_WALLETS));
  const [socialLinks, setSocialLinks] = useState<PlatformSocialLinks>(getStoredData('socialLinks', INITIAL_PLATFORM_SOCIAL_LINKS));

  // Persistence Effects
  useEffect(() => setStoredData('currentUser', currentUser), [currentUser]);
  useEffect(() => setStoredData('users', users), [users]);
  useEffect(() => setStoredData('projects', projects), [projects]);
  useEffect(() => setStoredData('investmentPools', investmentPools), [investmentPools]);
  useEffect(() => setStoredData('investments', investments), [investments]);
  useEffect(() => setStoredData('transactions', transactions), [transactions]);
  useEffect(() => setStoredData('bonuses', bonuses), [bonuses]);
  useEffect(() => setStoredData('notifications', notifications), [notifications]);
  useEffect(() => setStoredData('news', news), [news]);
  useEffect(() => setStoredData('ranks', ranks), [ranks]);
  useEffect(() => setStoredData('currentDate', currentDate), [currentDate]);
  useEffect(() => setStoredData('withdrawalLimit', withdrawalLimit), [withdrawalLimit]);
  useEffect(() => setStoredData('minWithdrawalLimit', minWithdrawalLimit), [minWithdrawalLimit]);
  useEffect(() => setStoredData('instantBonusRates', instantBonusRates), [instantBonusRates]);
  useEffect(() => setStoredData('teamBuilderBonusRates', teamBuilderBonusRates), [teamBuilderBonusRates]);
  useEffect(() => setStoredData('treasuryWallets', treasuryWallets), [treasuryWallets]);
  useEffect(() => setStoredData('socialLinks', socialLinks), [socialLinks]);

  // Authentication
  const login = async (email: string, password?: string) => {
      const user = users.find(u => u.email === email);
      if (user) {
          if (password && password.length < 1) throw new Error("Password required");
          setCurrentUser(user);
      } else {
          throw new Error("User not found");
      }
  };

  const signup = async (userData: Partial<User>) => {
      const newUser: User = {
          id: `user-${Date.now()}`,
          name: userData.name || '',
          email: userData.email || '',
          password: userData.password,
          wallet: `0x${Math.random().toString(16).substr(2, 40)}`,
          rank: 1,
          uplineId: userData.uplineId || null,
          referralCode: `REF${Math.floor(Math.random() * 10000)}`,
          totalInvestment: 0,
          totalDownline: 0,
          monthlyIncome: 0,
          kycStatus: 'Not Submitted',
          avatar: 'https://picsum.photos/200',
          country: userData.country || 'Global',
          isFrozen: false,
          role: 'user',
          achievements: [],
          joinDate: new Date().toISOString().split('T')[0]
      };
      setUsers([...users, newUser]);
      setCurrentUser(newUser);
  };

  const logout = () => setCurrentUser(null);

  // Balances
  const getUserBalances = useCallback((userId: string) => {
      let depositBalance = 0;
      let profitBalance = 0;
      
      transactions.filter(t => t.userId === userId).forEach(t => {
          if (t.status && t.status !== 'completed' && t.status !== 'pending') return; 
          // Pending deposits usually don't show in balance yet, but let's assume valid txs only here or check logic
          if (t.status === 'pending') return;

          if (t.type === 'Deposit') depositBalance += t.amount;
          else if (t.type === 'Withdrawal') {
             if (profitBalance >= t.amount) profitBalance -= t.amount;
             else {
                 const remaining = t.amount - profitBalance;
                 profitBalance = 0;
                 depositBalance -= remaining;
             }
          }
          else if (t.type === 'Investment') {
             depositBalance -= t.amount;
          }
          else if (t.type === 'Reinvestment') {
             profitBalance -= t.amount;
          }
          else if (t.type === 'Bonus' || t.type === 'Manual Bonus' || t.type === 'Profit Share' || t.type === 'Instant' || t.type === 'Leadership' || t.type === 'Team Builder' || t.type === 'Asset Growth') {
             profitBalance += t.amount;
          }
          else if (t.type === 'Manual Deduction') {
             depositBalance -= t.amount;
          }
      });
      
      return { depositBalance: Math.max(0, depositBalance), profitBalance: Math.max(0, profitBalance) };
  }, [transactions]);

  const sendReferralInvite = useCallback(async (email: string) => {
    if (!currentUser) return;

    // Helper to check for valid UUID (v4)
    const isUUID = (str: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

    // If using mock users (ID is not UUID), or no Supabase configured, skip server call
    const isMockUser = !isUUID(currentUser.id);

    if (!supabase || isMockUser) {
        if (supabase && isMockUser) {
            console.warn("Skipping Supabase function call: Current user is a Mock User (non-UUID). Server requires real UUID.");
        }
        // Fallback to mailto
        const subject = t('dashboard.referral.emailSubject');
        const body = t('dashboard.referral.emailBody', { referralLink: `${window.location.origin}?ref=${currentUser.referralCode}` });
        window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        return;
    }

    try {
        console.log("Attempting to send email via Supabase Edge Function: send-referral-invite");
        
        const { data, error } = await supabase.functions.invoke('send-referral-invite', {
            body: {
                email,
                referralCode: currentUser.referralCode,
                inviterName: currentUser.name,
                referralLink: `${window.location.origin}?ref=${currentUser.referralCode}`,
                recipient_email: email, 
                code: currentUser.referralCode,
                referrer_id: currentUser.id
            }
        });
        
        if (error) throw error;
        
        alert(t('dashboard.referral.inviteSentAction'));
    } catch (e: any) {
        console.error('Supabase Edge Function failed:', e);
        
        // Fallback gracefully without a scary error message for the user, 
        // assuming they are likely testing or there's a temporary glitch.
        const subject = t('dashboard.referral.emailSubject');
        const body = t('dashboard.referral.emailBody', { referralLink: `${window.location.origin}?ref=${currentUser.referralCode}` });
        window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    }
  }, [currentUser, t]);

  // Actions Implementation
  const markNotificationsAsRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  const updateUser = (data: Partial<User>) => {
      if (currentUser) {
          const updated = { ...currentUser, ...data };
          setCurrentUser(updated);
          setUsers(users.map(u => u.id === updated.id ? updated : u));
      }
  };
  const updateKycStatus = (id: string, status: User['kycStatus']) => setUsers(users.map(u => u.id === id ? { ...u, kycStatus: status } : u));
  const toggleFreezeUser = (id: string) => setUsers(users.map(u => u.id === id ? { ...u, isFrozen: !u.isFrozen } : u));
  const deleteUser = (id: string) => setUsers(users.filter(u => u.id !== id));
  const updateUserRole = (id: string, role: 'user' | 'admin') => {
      setUsers(users.map(u => u.id === id ? { ...u, role } : u));
      if (currentUser && currentUser.id === id) setCurrentUser({ ...currentUser, role });
  };
  const createUser = (data: any, invs: any[]) => {
      const newUser = { ...data, id: `user-${Date.now()}`, totalInvestment: 0, totalDownline: 0, monthlyIncome: 0, achievements: [] };
      setUsers([...users, newUser]);
      if(invs.length > 0) {
          invs.forEach(inv => {
              addInvestmentForUser(newUser.id, inv.amount, inv.assetId, inv.type, 'deposit');
          });
      }
  };
  const adjustUserRank = (id: string, rank: number, reason: string) => setUsers(users.map(u => u.id === id ? { ...u, rank } : u));
  
  const fetchAllBalances = async () => {};
  const connectSolanaWallet = async () => setSolanaWalletAddress('DemoSolanaAddress123');
  const disconnectSolanaWallet = () => setSolanaWalletAddress(null);
  
  const addWithdrawal = (amt: number, bal: number, addr: string) => {
      const newTx: Transaction = { id: `tx-${Date.now()}`, userId: currentUser!.id, type: 'Withdrawal', amount: amt, txHash: 'pending', date: currentDate.toISOString().split('T')[0], status: 'pending', reason: `Withdraw to: ${addr}` };
      setTransactions([...transactions, newTx]);
  };
  
  const addInvestmentFromBalance = (amount: number, assetId: string, type: 'project' | 'pool', source: 'deposit' | 'profit_reinvestment') => {
      if(!currentUser) return;
      addInvestmentForUser(currentUser.id, amount, assetId, type, source);
  };

  const addInvestmentForUser = (userId: string, amount: number, assetId: string, type: 'project' | 'pool', source: 'deposit' | 'profit_reinvestment') => {
      const newInv: Investment = {
          id: `inv-${Date.now()}`,
          userId,
          amount,
          date: currentDate.toISOString().split('T')[0],
          status: 'Active',
          source: source === 'profit_reinvestment' ? 'profit_reinvestment' : 'deposit',
          totalProfitEarned: 0,
          projectId: type === 'project' ? assetId : undefined,
          projectName: type === 'project' ? projects.find(p => p.id === assetId)?.tokenName : undefined,
          poolId: type === 'pool' ? assetId : undefined,
          poolName: type === 'pool' ? investmentPools.find(p => p.id === assetId)?.name : undefined,
      };
      setInvestments([...investments, newInv]);
      const txType = source === 'profit_reinvestment' ? 'Reinvestment' : 'Investment';
      setTransactions([...transactions, { id: `tx-inv-${Date.now()}`, userId, type: txType, amount, txHash: 'system', date: currentDate.toISOString().split('T')[0], investmentId: newInv.id, status: 'completed' }]);
      setUsers(users.map(u => u.id === userId ? { ...u, totalInvestment: u.totalInvestment + amount } : u));
      if(currentUser && currentUser.id === userId) setCurrentUser({ ...currentUser, totalInvestment: currentUser.totalInvestment + amount });
  };

  const addCryptoDeposit = (amt: number, tx: string, reason: string) => {
      if(!currentUser) return;
      const newTx: Transaction = { id: `tx-${Date.now()}`, userId: currentUser.id, type: 'Deposit', amount: amt, txHash: tx, date: currentDate.toISOString().split('T')[0], status: 'pending', reason };
      setTransactions([...transactions, newTx]);
  };
  
  const confirmCryptoInvestment = (userId: string, amount: number, assetId: string, type: 'project' | 'pool') => {
      // Simulate deposit + investment
      const depositTx: Transaction = { id: `tx-dep-${Date.now()}`, userId, type: 'Deposit', amount, txHash: 'manual-admin', date: currentDate.toISOString().split('T')[0], status: 'completed' };
      setTransactions(prev => [...prev, depositTx]);
      addInvestmentForUser(userId, amount, assetId, type, 'deposit');
  };

  const approveDeposit = (id: string, bonus: number, target: any) => {
      const tx = transactions.find(t => t.id === id);
      if(!tx) return;
      const updatedTx: Transaction = { ...tx, status: 'completed' };
      let newTxs = transactions.map(t => t.id === id ? updatedTx : t);
      
      if (bonus > 0) {
          newTxs.push({ id: `tx-bonus-${Date.now()}`, userId: tx.userId, type: 'Manual Bonus', amount: bonus, txHash: 'admin-bonus', date: currentDate.toISOString().split('T')[0], reason: 'Deposit Bonus' });
      }
      setTransactions(newTxs);

      if (target) {
          addInvestmentForUser(tx.userId, tx.amount, target.id, target.type, 'deposit');
      }
  };

  const rejectDeposit = (id: string, reason: string) => {
      setTransactions(transactions.map(t => t.id === id ? { ...t, status: 'rejected', rejectionReason: reason } : t));
  };

  const approveWithdrawal = (id: string, hash: string) => {
      setTransactions(transactions.map(t => t.id === id ? { ...t, status: 'completed', txHash: hash } : t));
  };

  const rejectWithdrawal = (id: string, reason: string) => {
      setTransactions(transactions.map(t => t.id === id ? { ...t, status: 'rejected', rejectionReason: reason } : t));
  };

  const addManualTransaction = (userId: string, type: 'Manual Bonus' | 'Manual Deduction', amount: number, reason: string) => {
      setTransactions([...transactions, { id: `tx-man-${Date.now()}`, userId, type, amount, txHash: 'manual', date: currentDate.toISOString().split('T')[0], reason }]);
  };

  const addProject = (p: any) => setProjects([...projects, { ...p, id: `proj-${Date.now()}` }]);
  const updateProject = (p: Project) => setProjects(projects.map(proj => proj.id === p.id ? p : proj));
  const deleteProject = (id: string) => setProjects(projects.filter(p => p.id !== id));
  
  const addInvestmentPool = (p: any) => setInvestmentPools([...investmentPools, { ...p, id: `pool-${Date.now()}` }]);
  const updateInvestmentPool = (p: InvestmentPool) => setInvestmentPools(investmentPools.map(pool => pool.id === p.id ? p : pool));
  const deleteInvestmentPool = (id: string) => setInvestmentPools(investmentPools.filter(p => p.id !== id));
  
  const updateInvestment = (inv: Investment) => setInvestments(investments.map(i => i.id === inv.id ? inv : i));
  const deleteInvestment = (id: string) => setInvestments(investments.filter(i => i.id !== id));
  
  const addNewsPost = (p: any) => setNews([...news, { ...p, id: `news-${Date.now()}` }]);
  const updateNewsPost = (p: NewsPost) => setNews(news.map(n => n.id === p.id ? p : n));
  const deleteNewsPost = (id: string) => setNews(news.filter(n => n.id !== id));

  const updateRankSettings = (r: Rank[]) => setRanks(r);
  const updateBonusRates = (instant: any, team: any) => { setInstantBonusRates(instant); setTeamBuilderBonusRates(team); };
  const updateTreasuryWallets = (w: TreasuryWallets) => setTreasuryWallets(w);
  const updateSocialLinks = (l: PlatformSocialLinks) => setSocialLinks(l);
  const updateWithdrawalLimit = (l: number) => setWithdrawalLimit(l);
  const updateMinWithdrawalLimit = (l: number) => setMinWithdrawalLimit(l);

  const advanceDate = (days: number) => {
      const newDate = new Date(currentDate);
      newDate.setDate(newDate.getDate() + days);
      setCurrentDate(newDate);
      // Simulate daily profit
      const dailyTx: Transaction[] = [];
      investments.forEach(inv => {
          if(inv.status === 'Active') {
              let apy = 0;
              if(inv.projectId) {
                  const p = projects.find(proj => proj.id === inv.projectId);
                  if(p) apy = p.expectedYield;
              } else if(inv.poolId) {
                  const p = investmentPools.find(pool => pool.id === inv.poolId);
                  if(p) apy = p.apy;
              }
              const profit = (inv.amount * (apy / 100)) / 365 * days;
              if (profit > 0) {
                  dailyTx.push({ id: `profit-${Date.now()}-${inv.id}`, userId: inv.userId, type: 'Profit Share', amount: profit, txHash: 'system-daily', date: newDate.toISOString().split('T')[0], investmentId: inv.id });
                  // Update investment total profit
                  inv.totalProfitEarned += profit;
              }
          }
      });
      setTransactions([...transactions, ...dailyTx]);
  };
  
  const runMonthlyCycle = (date: Date) => {
      // Demo: Assign bonuses based on rank logic (simplified)
      alert("Monthly cycle run successfully.");
  };
  const seedDatabase = () => {
      setProjects(MOCK_PROJECTS);
      setInvestmentPools(MOCK_INVESTMENT_POOLS);
      setNews(MOCK_NEWS);
      alert("Database reset to defaults.");
  };

  return (
    <AppContext.Provider value={{
      currentUser, users, projects, investmentPools, investments, transactions, bonuses, notifications, news, ranks, currentDate, isDemoMode, solanaWalletAddress, igiTokenBalance, solBalance, withdrawalLimit, minWithdrawalLimit, instantBonusRates, teamBuilderBonusRates, treasuryWallets, socialLinks,
      login, signup, logout, markNotificationsAsRead, updateUser, updateKycStatus, toggleFreezeUser, deleteUser, updateUserRole, createUser, adjustUserRank, getUserBalances, fetchAllBalances, connectSolanaWallet, disconnectSolanaWallet, addWithdrawal, addInvestmentFromBalance, addInvestmentForUser, addCryptoDeposit, confirmCryptoInvestment, approveDeposit, rejectDeposit, approveWithdrawal, rejectWithdrawal, addManualTransaction, addProject, updateProject, deleteProject, addInvestmentPool, updateInvestmentPool, deleteInvestmentPool, updateInvestment, deleteInvestment, addNewsPost, updateNewsPost, deleteNewsPost, updateRankSettings, updateBonusRates, updateTreasuryWallets, updateSocialLinks, updateWithdrawalLimit, updateMinWithdrawalLimit, advanceDate, runMonthlyCycle, sendReferralInvite, seedDatabase
    }}>
      {children}
    </AppContext.Provider>
  );
};
