
import React, { createContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { useLocalization } from '../hooks/useLocalization';
import { User, Investment, Transaction, Bonus, Rank, NewsPost, Notification, Project, InvestmentPool, TreasuryWallets, PlatformSocialLinks } from '../types';
import { 
  INITIAL_RANKS, 
  INITIAL_TEAM_BUILDER_BONUS_RATES, 
  INITIAL_INSTANT_BONUS_RATES, 
  INITIAL_TREASURY_WALLETS, 
  INITIAL_PLATFORM_SOCIAL_LINKS,
  IGI_TOKEN_MINT_ADDRESS,
  MOCK_USERS,
  MOCK_INVESTMENTS,
  MOCK_TRANSACTIONS,
  MOCK_BONUSES,
  MOCK_NEWS,
  MOCK_PROJECTS,
  MOCK_INVESTMENT_POOLS
} from '../constants';
import { supabase } from '../supabaseClient';

type InitialInvestmentData = { type: 'project' | 'pool', assetId: string, amount: number };

// Helper for financial precision - using 8 for internal, 4 for common display
const preciseMath = (value: number, precision = 8) => {
    return parseFloat(value.toFixed(precision));
};

interface AppContextType {
  users: User[];
  investments: Investment[];
  transactions: Transaction[];
  bonuses: Bonus[];
  ranks: Rank[];
  news: NewsPost[];
  notifications: Notification[];
  projects: Project[];
  investmentPools: InvestmentPool[];
  instantBonusRates: { investor: number, referrer: number, upline: number };
  teamBuilderBonusRates: number[];
  treasuryWallets: TreasuryWallets;
  socialLinks: PlatformSocialLinks;
  withdrawalLimit: number;
  minWithdrawalLimit: number;
  currentUser: User | null;
  currentDate: Date;
  addInvestmentFromBalance: (amount: number, assetId: string, type: 'project' | 'pool', source: 'deposit' | 'profit_reinvestment') => Promise<void>;
  addCryptoDeposit: (amount: number, txHash: string, reason?: string) => Promise<void>;
  addWithdrawal: (amount: number, walletAddress: string) => Promise<void>;
  updateKycStatus: (userId: string, status: 'Verified' | 'Pending' | 'Rejected' | 'Not Submitted') => Promise<void>;
  toggleFreezeUser: (userId: string) => Promise<void>;
  markNotificationsAsRead: () => Promise<void>;
  updateUser: (updatedUser: User) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  deleteInvestment: (investmentId: string) => Promise<void>;
  updateRankSettings: (updatedRanks: Rank[]) => void;
  addManualTransaction: (userId: string, type: 'Manual Bonus' | 'Manual Deduction', amount: number, reason: string) => Promise<void>;
  addNewsPost: (post: Omit<NewsPost, 'id'>) => Promise<void>;
  deleteNewsPost: (postId: string) => Promise<void>;
  runMonthlyCycle: (cycleDate: Date) => void;
  advanceDate: (days: number) => void;
  addProject: (project: Partial<Omit<Project, 'id'>>) => Promise<void>;
  updateProject: (project: Project) => Promise<void>;
  deleteProject: (projectId: string) => Promise<void>;
  addInvestmentPool: (pool: Omit<InvestmentPool, 'id'>) => Promise<void>;
  updateInvestmentPool: (pool: InvestmentPool) => Promise<void>;
  deleteInvestmentPool: (poolId: string) => Promise<void>;
  adjustUserRank: (userId: string, newRank: number, reason: string) => Promise<void>;
  getUserBalances: (userId: string) => { depositBalance: number, profitBalance: number };
  solanaWalletAddress: string | null;
  igiTokenBalance: number | null;
  solBalance: number | null;
  connectSolanaWallet: () => Promise<void>;
  disconnectSolanaWallet: () => void;
  fetchAllBalances: () => Promise<void>;
  // Admin functions
  approveDeposit: (transactionId: string, bonusAmount?: number, autoInvestTarget?: { type: 'project' | 'pool', id: string }) => Promise<void>;
  rejectDeposit: (transactionId: string, reason: string) => Promise<void>;
  approveWithdrawal: (transactionId: string, txHash: string) => Promise<void>;
  rejectWithdrawal: (transactionId: string, reason: string) => Promise<void>;
  createUser: (user: Omit<User, 'id' | 'totalInvestment' | 'totalDownline' | 'monthlyIncome' | 'achievements'>, initialInvestments?: InitialInvestmentData[]) => Promise<void>;
  updateUserRole: (userId: string, role: 'user' | 'admin') => Promise<void>;
  addInvestmentForUser: (userId: string, amount: number, assetId: string, type: 'project' | 'pool', source: 'deposit' | 'profit_reinvestment') => Promise<void>;
  confirmCryptoInvestment: (userId: string, amount: number, assetId: string, type: 'project' | 'pool') => Promise<void>;
  updateInvestment: (investment: Investment) => Promise<void>;
  updateNewsPost: (post: NewsPost) => Promise<void>;
  updateBonusRates: (newInstantRates: { investor: number, referrer: number, upline: number }, newTeamRates: number[]) => void;
  updateTreasuryWallets: (wallets: TreasuryWallets) => void;
  updateSocialLinks: (links: PlatformSocialLinks) => void;
  updateWithdrawalLimit: (limit: number) => void;
  updateMinWithdrawalLimit: (limit: number) => void;
  seedDatabase: () => Promise<void>;
  seedLocalDatabase?: () => void; // Optional for testing
  sendReferralInvite: (email: string) => Promise<void>;
  // Auth functions
  login: (email: string, password: string) => Promise<void>;
  signup: (userData: Partial<User>) => Promise<void>;
  logout: () => void;
  sendPasswordResetEmail: (email: string) => Promise<void>;
  updateUserPassword: (password: string) => Promise<void>;
  passwordResetMode: boolean;
  setPasswordResetMode: (mode: boolean) => void;
  // UI State
  inviteModalOpen: boolean;
  setInviteModalOpen: (open: boolean) => void;
  loading: boolean;
  isDemoMode: boolean;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppContextProviderProps {
  children: ReactNode;
}

const getStoredData = <T,>(key: string, defaultData: T): T => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultData;
  } catch (error) {
    return defaultData;
  }
};

const setStoredData = <T,>(key: string, data: T) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {}
};

const sanitizeString = (val: string | null | undefined, fallback: string): string => {
    if (!val || val === 'null' || val === 'undefined') return fallback;
    return val;
};

export const AppContextProvider: React.FC<AppContextProviderProps> = ({ children }) => {
  const { t } = useLocalization();
  const [loading, setLoading] = useState(true);

  // Data State
  const [users, setUsers] = useState<User[]>(() => {
      if (supabase) return [];
      return getStoredData('igi_demo_users', MOCK_USERS);
  });
  const [investments, setInvestments] = useState<Investment[]>(() => {
      if (supabase) return [];
      return getStoredData('igi_demo_investments', MOCK_INVESTMENTS);
  });
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
      if (supabase) return [];
      return getStoredData('igi_demo_transactions', MOCK_TRANSACTIONS);
  });
  const [bonuses, setBonuses] = useState<Bonus[]>(() => {
      if (supabase) return [];
      return getStoredData('igi_demo_bonuses', MOCK_BONUSES);
  });
  const [projects, setProjects] = useState<Project[]>(() => {
      if (supabase) return [];
      return getStoredData('igi_demo_projects', MOCK_PROJECTS);
  });
  const [investmentPools, setInvestmentPools] = useState<InvestmentPool[]>(() => {
      if (supabase) return [];
      return getStoredData('igi_demo_pools', MOCK_INVESTMENT_POOLS);
  });
  const [news, setNews] = useState<NewsPost[]>(() => {
      if (supabase) return [];
      return getStoredData('igi_demo_news', MOCK_NEWS);
  });
  const [notifications, setNotifications] = useState<Notification[]>(() => {
      if (supabase) return [];
      return getStoredData('igi_demo_notifications', []);
  });

  // Settings State
  const [ranks, setRanks] = useState<Rank[]>(() => getStoredData('igi_ranks', INITIAL_RANKS));
  const [currentDate, setCurrentDate] = useState(new Date('2023-11-28T12:00:00Z'));
  const [instantBonusRates, setInstantBonusRates] = useState(() => getStoredData('igi_instantRates', INITIAL_INSTANT_BONUS_RATES));
  const [teamBuilderBonusRates, setTeamBuilderBonusRates] = useState(() => getStoredData('igi_teamRates', INITIAL_TEAM_BUILDER_BONUS_RATES));
  const [treasuryWallets, setTreasuryWallets] = useState<TreasuryWallets>(() => getStoredData('igi_wallets', INITIAL_TREASURY_WALLETS));
  const [socialLinks, setSocialLinks] = useState<PlatformSocialLinks>(() => getStoredData('igi_socials', INITIAL_PLATFORM_SOCIAL_LINKS));
  const [withdrawalLimit, setWithdrawalLimit] = useState<number>(() => getStoredData('igi_withdrawalLimit', 10000));
  const [minWithdrawalLimit, setMinWithdrawalLimit] = useState<number>(() => getStoredData('igi_minWithdrawalLimit', 50));
  
  // Auth State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [passwordResetMode, setPasswordResetMode] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);

  const [solanaWalletAddress, setSolanaWalletAddress] = useState<string | null>(null);
  const [igiTokenBalance, setIgiTokenBalance] = useState<number | null>(null);
  const [solBalance, setSolBalance] = useState<number | null>(null);

  const refreshData = useCallback(async () => {
    if (!supabase) {
        setLoading(false);
        return;
    }
    try {
      const { data: usersData } = await supabase.from('profiles').select('*');
      const { data: invData } = await supabase.from('investments').select('*');
      const { data: txData } = await supabase.from('transactions').select('*');
      const { data: bnsData } = await supabase.from('bonuses').select('*');
      const { data: projData } = await supabase.from('projects').select('*');
      const { data: poolData } = await supabase.from('investment_pools').select('*');
      const { data: newsData } = await supabase.from('news').select('*');
      const { data: notifData } = await supabase.from('notifications').select('*');

      if (usersData) setUsers(usersData.map(u => ({
          ...u,
          name: sanitizeString(u.name, 'User'),
          country: sanitizeString(u.country, 'Global'),
          avatar: sanitizeString(u.avatar, `https://ui-avatars.com/api/?name=${encodeURIComponent(sanitizeString(u.name, 'User'))}&background=random&color=fff`),
          totalInvestment: Number(u.total_investment || 0),
          totalDownline: Number(u.total_downline || 0),
          monthlyIncome: Number(u.monthly_income || 0),
          uplineId: u.upline_id,
          referralCode: u.referral_code,
          kycStatus: u.kyc_status,
          isFrozen: u.is_frozen,
          joinDate: u.join_date,
          role: u.role ? u.role.toLowerCase().trim() : 'user',
          achievements: u.achievements || []
      })));
      
      if (invData) setInvestments(invData.map(i => ({
          ...i,
          userId: i.user_id,
          projectId: i.project_id,
          poolId: i.pool_id,
          totalProfitEarned: Number(i.total_profit_earned)
      })));

      if (txData) setTransactions(txData.map(t => ({
          ...t,
          userId: t.user_id,
          txHash: t.tx_hash,
          investmentId: t.investment_id,
          rejectionReason: t.rejection_reason
      })));

      if (bnsData) setBonuses(bnsData.map(b => ({
          ...b,
          userId: b.user_id,
          sourceId: b.source_id
      })));

      if (projData) setProjects(projData.map(p => ({
          id: p.id,
          tokenName: p.token_name,
          tokenTicker: p.token_ticker,
          assetType: p.asset_type,
          assetIdentifier: p.asset_identifier,
          assetDescription: p.asset_description,
          assetLocation: p.asset_location,
          assetImageUrl: p.asset_image_url,
          assetValuation: Number(p.asset_valuation),
          valuationMethod: p.valuation_method,
          valuationDate: p.valuation_date || '',
          performanceHistory: p.performance_history,
          expectedYield: Number(p.expected_yield),
          proofOfOwnership: p.proof_of_ownership,
          legalStructure: p.legal_structure,
          legalWrapper: p.legal_wrapper,
          jurisdiction: p.jurisdiction,
          regulatoryStatus: p.regulatory_status,
          investorRequirements: p.investor_requirements,
          totalTokenSupply: Number(p.total_token_supply),
          tokenPrice: Number(p.token_price),
          minInvestment: Number(p.min_investment),
          blockchain: p.blockchain,
          smartContractAddress: p.smart_contract_address,
          distribution: p.distribution,
          rightsConferred: p.rights_conferred,
          assetCustodian: p.asset_custodian,
          assetManager: p.asset_manager,
          oracles: p.oracles,
          customBonusConfig: p.custom_bonus_config,
          customRankConfig: p.custom_rank_config
      })));

      if (poolData) setInvestmentPools(poolData.map(p => ({
          id: p.id,
          name: p.name,
          description: p.description,
          apy: Number(p.apy),
          minInvestment: Number(p.min_investment),
          customBonusConfig: p.custom_bonus_config,
          customRankConfig: p.custom_rank_config,
          projectUrl: p.project_url,
          linkedProjectId: p.linked_project_id
      })));

      if (newsData) setNews(newsData);
      if (notifData) setNotifications(notifData.map(n => ({...n, userId: n.user_id})));

    } catch (error) {
      console.error("Error loading data", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!supabase) return;
    const channels = supabase.channel('custom-all-channel')
      .on('postgres_changes', { event: '*', schema: 'public' }, () => {
          refreshData();
      })
      .subscribe();
    return () => { supabase.removeChannel(channels); }
  }, [refreshData]);

  useEffect(() => {
    if (!supabase) {
        const storedSessionId = localStorage.getItem('igi_demo_session');
        if (storedSessionId) {
            const user = users.find(u => u.id === storedSessionId);
            if (user) setCurrentUser(user);
        }
        setLoading(false);
        return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        supabase.from('profiles').select('*').eq('id', session.user.id).single()
        .then(({data}) => {
            if(data) setCurrentUser({
                ...data,
                id: data.id,
                name: sanitizeString(data.name, 'User'),
                country: sanitizeString(data.country, 'Global'),
                avatar: sanitizeString(data.avatar, `https://ui-avatars.com/api/?name=${encodeURIComponent(sanitizeString(data.name, 'User'))}&background=random&color=fff`),
                totalInvestment: Number(data.total_investment),
                totalDownline: Number(data.total_downline),
                monthlyIncome: Number(data.monthly_income),
                uplineId: data.upline_id,
                referralCode: data.referral_code,
                kycStatus: data.kyc_status,
                isFrozen: data.is_frozen,
                joinDate: data.join_date,
                role: data.role ? data.role.toLowerCase().trim() : 'user',
                achievements: data.achievements || []
            });
        });
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') setPasswordResetMode(true);
      if(session?.user) refreshData(); else setCurrentUser(null);
    });

    refreshData();
    return () => subscription.unsubscribe();
  }, [refreshData]);

  useEffect(() => {
    if (currentUser && users.length > 0) {
        const updatedProfile = users.find(u => u.id === currentUser.id);
        if (updatedProfile) {
            const roleChanged = updatedProfile.role !== currentUser.role;
            const frozenChanged = updatedProfile.isFrozen !== currentUser.isFrozen;
            const rankChanged = updatedProfile.rank !== currentUser.rank;
            const balanceChanged = updatedProfile.totalInvestment !== currentUser.totalInvestment;
            const kycChanged = updatedProfile.kycStatus !== currentUser.kycStatus;
            
            if (roleChanged || frozenChanged || rankChanged || balanceChanged || kycChanged) {
                setCurrentUser(prev => prev ? ({ ...prev, ...updatedProfile }) : updatedProfile);
            }
        }
    }
  }, [users, currentUser]);

  useEffect(() => { setStoredData('igi_ranks', ranks) }, [ranks]);
  useEffect(() => { setStoredData('igi_instantRates', instantBonusRates) }, [instantBonusRates]);
  useEffect(() => { setStoredData('igi_teamRates', teamBuilderBonusRates) }, [teamBuilderBonusRates]);
  useEffect(() => { setStoredData('igi_wallets', treasuryWallets) }, [treasuryWallets]);
  useEffect(() => { setStoredData('igi_socials', socialLinks) }, [socialLinks]);
  useEffect(() => { setStoredData('igi_withdrawalLimit', withdrawalLimit) }, [withdrawalLimit]);
  useEffect(() => { setStoredData('igi_minWithdrawalLimit', minWithdrawalLimit) }, [minWithdrawalLimit]);

  useEffect(() => { if (!supabase) setStoredData('igi_demo_users', users) }, [users]);
  useEffect(() => { if (!supabase) setStoredData('igi_demo_investments', investments) }, [investments]);
  useEffect(() => { if (!supabase) setStoredData('igi_demo_transactions', transactions) }, [transactions]);
  useEffect(() => { if (!supabase) setStoredData('igi_demo_bonuses', bonuses) }, [bonuses]);
  useEffect(() => { if (!supabase) setStoredData('igi_demo_projects', projects) }, [projects]);
  useEffect(() => { if (!supabase) setStoredData('igi_demo_pools', investmentPools) }, [investmentPools]);
  useEffect(() => { if (!supabase) setStoredData('igi_demo_news', news) }, [news]);
  useEffect(() => { if (!supabase) setStoredData('igi_demo_notifications', notifications) }, [notifications]);

  const getUserBalances = useCallback((userId: string) => {
      const userTransactions = transactions.filter(t => t.userId === userId);
      const userInvestments = investments.filter(i => i.userId === userId);

      const totalDeposits = userTransactions
        .filter(t => (t.type === 'Deposit' && (t.status === 'completed' || t.status === undefined)) || t.type === 'Manual Bonus')
        .reduce((sum, t) => sum + t.amount, 0);

      const totalProfits = userTransactions.filter(t => t.type === 'Profit Share' || t.type === 'Bonus').reduce((sum, t) => sum + t.amount, 0);
      const totalWithdrawals = userTransactions.filter(t => (t.type === 'Withdrawal' && t.status !== 'rejected') || t.type === 'Manual Deduction').reduce((sum, t) => sum + t.amount, 0);

      const investmentsFromDeposit = userInvestments.filter(i => i.source === 'deposit').reduce((sum, i) => sum + i.amount, 0);
      const reinvestmentsFromProfit = userInvestments.filter(i => i.source === 'profit_reinvestment').reduce((sum, i) => sum + i.amount, 0);
      
      const profitBalanceAfterReinvestment = preciseMath(totalProfits - reinvestmentsFromProfit);
      const withdrawalsFromProfit = Math.min(Math.max(0, profitBalanceAfterReinvestment), totalWithdrawals);
      const profitBalance = preciseMath(profitBalanceAfterReinvestment - withdrawalsFromProfit);

      const depositBalanceAfterInvestment = preciseMath(totalDeposits - investmentsFromDeposit);
      const withdrawalsFromDeposit = preciseMath(totalWithdrawals - withdrawalsFromProfit);
      const depositBalance = preciseMath(depositBalanceAfterInvestment - withdrawalsFromDeposit);

      return { depositBalance: Math.max(0, depositBalance), profitBalance: Math.max(0, profitBalance) };
  }, [transactions, investments]);

  const login = useCallback(async (email: string, password: string) => {
    if (!supabase) {
        const normalizedEmail = email.toLowerCase().trim();
        const user = users.find(u => u.email.toLowerCase() === normalizedEmail);
        if (user && (user.password === password || password === 'password')) {
             if(user.isFrozen) throw new Error("Account is frozen.");
             setCurrentUser(user);
             localStorage.setItem('igi_demo_session', user.id);
        } else {
            throw new Error("Invalid credentials (Local Demo Mode: try password 'password')");
        }
        return;
    }
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    if (data.user) {
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', data.user.id).single();
        if (profile) {
             if(profile.is_frozen) { await supabase.auth.signOut(); throw new Error("Account is frozen."); }
             setCurrentUser({
                ...profile,
                name: sanitizeString(profile.name, 'User'),
                country: sanitizeString(profile.country, 'Global'),
                avatar: sanitizeString(profile.avatar, `https://ui-avatars.com/api/?name=${encodeURIComponent(sanitizeString(profile.name, 'User'))}&background=random&color=fff`),
                totalInvestment: Number(profile.total_investment),
                totalDownline: Number(profile.total_downline),
                monthlyIncome: Number(profile.monthly_income),
                uplineId: profile.upline_id,
                referralCode: profile.referral_code,
                kycStatus: profile.kyc_status,
                isFrozen: profile.is_frozen,
                joinDate: profile.join_date,
                role: profile.role ? profile.role.toLowerCase().trim() : 'user',
                achievements: profile.achievements || []
             });
        }
    }
  }, [users]);

  const signup = useCallback(async (userData: Partial<User>) => {
      if (!supabase) {
          const newUser: User = {
              id: `user-${Date.now()}`,
              name: userData.name!,
              email: userData.email!,
              password: userData.password,
              wallet: `0x${Math.random().toString(16).slice(2, 42)}`,
              rank: 1,
              uplineId: userData.uplineId || null,
              referralCode: `${userData.name?.split(' ')[0].toUpperCase() || 'USER'}${Math.floor(1000 + Math.random() * 9000)}`,
              totalInvestment: 0,
              totalDownline: 0,
              monthlyIncome: 0,
              kycStatus: 'Not Submitted',
              avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name || 'User')}&background=random&color=fff&size=128`,
              country: userData.country || 'Global',
              isFrozen: false,
              role: 'user',
              achievements: [],
              joinDate: new Date().toISOString().split('T')[0]
          };
          setUsers(prev => [...prev, newUser]);
          if (userData.uplineId) {
              setNotifications(prev => [...prev, {
                  id: `notif-${Date.now()}`,
                  userId: userData.uplineId!,
                  type: 'New Downline',
                  message: `${newUser.name} has joined your team!`,
                  date: new Date().toISOString().split('T')[0],
                  read: false
              }]);
          }
          alert("Account created in Demo Mode! You can now log in.");
          return;
      }
      const referralCode = `${userData.name?.split(' ')[0].toUpperCase() || 'USER'}${Math.floor(1000 + Math.random() * 9000)}`;
      const wallet = `0x${Math.random().toString(16).slice(2, 42)}`;
      const { data, error } = await supabase.auth.signUp({
        email: userData.email!,
        password: userData.password!,
        options: { data: { name: userData.name, wallet: wallet, referralCode: referralCode, uplineId: userData.uplineId } }
      });
      if (error) throw error;
      if (data.user && userData.uplineId) {
          await supabase.from('profiles').update({ upline_id: userData.uplineId }).eq('id', data.user.id);
          await supabase.from('notifications').insert({
            user_id: userData.uplineId,
            type: 'New Downline',
            message: `${userData.name} has joined your team!`,
            date: new Date().toISOString().split('T')[0],
        });
      }
      alert("Account created! Please check your email to confirm, then log in.");
  }, []);

  const logout = useCallback(async () => {
      if (supabase) await supabase.auth.signOut();
      localStorage.removeItem('igi_demo_session');
      setCurrentUser(null);
  }, []);

  const sendPasswordResetEmail = useCallback(async (email: string) => {
    if (!supabase) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        alert('Password reset email sent (Simulation).');
        return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin });
    if (error) throw error;
  }, []);

  const updateUserPassword = useCallback(async (password: string) => {
    if (!supabase) {
        if (currentUser) setUsers(prev => prev.map(u => u.id === currentUser.id ? { ...u, password } : u));
        await new Promise(resolve => setTimeout(resolve, 1000));
        return;
    }
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw error;
  }, [currentUser]);

  const addNotification = useCallback(async (notification: Omit<Notification, 'id'>) => {
    if (!supabase) {
        setNotifications(prev => [...prev, { id: `notif-${Date.now()}`, ...notification }]);
        return;
    }
    const { error } = await supabase.from('notifications').insert({
        user_id: notification.userId,
        type: notification.type,
        message: notification.message,
        date: notification.date,
        read: false
    });
    if (!error) refreshData();
  }, [refreshData]);

  const executeInvestment = useCallback(async (userId: string, amount: number, assetId: string, investmentType: 'project' | 'pool', source: 'deposit' | 'profit_reinvestment') => {
    try {
        const investingUser = users.find(u => u.id === userId);
        if (!investingUser) throw new Error("User not found");

        let effectiveInstantRates = instantBonusRates;
        let effectiveTeamRates = teamBuilderBonusRates;
        let snapshotApy = 0;
        
        if (investmentType === 'pool') {
            const pool = investmentPools.find(p => p.id === assetId);
            if (pool) {
                snapshotApy = pool.apy;
                if (pool.customBonusConfig) {
                    effectiveInstantRates = pool.customBonusConfig.instant;
                    effectiveTeamRates = pool.customBonusConfig.teamBuilder;
                }
            }
        } else if (investmentType === 'project') {
            const project = projects.find(p => p.id === assetId);
            if (project) {
                snapshotApy = project.expectedYield;
                if (project.customBonusConfig) {
                    effectiveInstantRates = project.customBonusConfig.instant;
                    effectiveTeamRates = project.customBonusConfig.teamBuilder;
                }
            }
        }
        
        const investmentId = `inv-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
        const bonusInserts: any[] = [];
        const transactionInserts: any[] = [];

        const queueBonus = (recipientId: string, type: 'Instant' | 'Team Builder', bonusAmount: number, sourceId: string) => {
            const amount = preciseMath(bonusAmount, 8);
            if (amount <= 0 || isNaN(amount)) return;
            
            if (!supabase) {
                setBonuses(prev => [...prev, { id: `bns-${Date.now()}-${Math.random()}`, userId: recipientId, type, sourceId, amount, date: currentDate.toISOString().split('T')[0], read: false }]);
                setTransactions(prev => [...prev, { id: `tx-bns-${Date.now()}-${Math.random()}`, userId: recipientId, type: 'Bonus', amount, txHash: `BONUS-${type.toUpperCase()}`, date: currentDate.toISOString().split('T')[0] }]);
            } else {
                bonusInserts.push({ user_id: recipientId, type, source_id: sourceId, amount, date: currentDate.toISOString().split('T')[0], read: false });
                transactionInserts.push({ user_id: recipientId, type: 'Bonus', amount, date: currentDate.toISOString().split('T')[0], tx_hash: `0x...${type}` });
            }
        };

        if (!supabase) {
            const newInvestment: Investment = {
                id: investmentId,
                userId, amount: preciseMath(amount, 8), date: currentDate.toISOString().split('T')[0],
                status: 'Active',
                projectId: investmentType === 'project' ? assetId : undefined,
                poolId: investmentType === 'pool' ? assetId : undefined,
                projectName: investmentType === 'project' ? projects.find(p => p.id === assetId)?.tokenName : undefined,
                poolName: investmentType === 'pool' ? investmentPools.find(p => p.id === assetId)?.name : undefined,
                totalProfitEarned: 0, source,
                apy: snapshotApy
            };
            setInvestments(prev => [...prev, newInvestment]);
            setTransactions(prev => [...prev, {
                id: `tx-${Date.now()}`, userId, type: source === 'profit_reinvestment' ? 'Reinvestment' : 'Investment',
                amount: preciseMath(amount, 8), txHash: 'DEMO-HASH', date: currentDate.toISOString().split('T')[0], investmentId: newInvestment.id
            }]);
            setUsers(prev => prev.map(u => u.id === userId ? { ...u, totalInvestment: preciseMath(u.totalInvestment + amount) } : u));
            if (currentUser?.id === userId) setCurrentUser(prev => prev ? { ...prev, totalInvestment: preciseMath(prev.totalInvestment + amount) } : null);
        } else {
            let projectId = investmentType === 'project' ? assetId : null;
            let poolId = investmentType === 'pool' ? assetId : null;
            
            const { data: invData, error: invError } = await supabase.from('investments').insert({
                user_id: userId, amount: preciseMath(amount, 8), date: currentDate.toISOString().split('T')[0],
                status: 'Active', project_id: projectId, pool_id: poolId,
                total_profit_earned: 0, source: source, apy: snapshotApy
            }).select().single();

            if (invError || !invData) throw new Error(invError?.message || "Investment creation failed");
            
            await supabase.from('transactions').insert({
                user_id: userId, type: source === 'profit_reinvestment' ? 'Reinvestment' : 'Investment',
                amount: preciseMath(amount, 8), tx_hash: `0x...${Date.now().toString().slice(-4)}`, date: currentDate.toISOString().split('T')[0],
                investment_id: invData.id,
            });
            await supabase.from('profiles').update({ total_investment: preciseMath(investingUser.totalInvestment + amount) }).eq('id', userId);
            
            const realInvestmentId = invData.id;
            queueBonus(userId, 'Instant', amount * effectiveInstantRates.investor, realInvestmentId);
            if (investingUser.uplineId) {
                queueBonus(investingUser.uplineId, 'Instant', amount * effectiveInstantRates.referrer, realInvestmentId);
                const directUpline = users.find(u => u.id === investingUser.uplineId);
                if (directUpline && directUpline.uplineId) queueBonus(directUpline.uplineId, 'Instant', amount * effectiveInstantRates.upline, realInvestmentId);
            }

            let currentUplineId = investingUser.uplineId;
            let level = 0;
            const visitedUsers = new Set<string>([userId]);
            while (currentUplineId && level < Math.min(9, effectiveTeamRates.length)) {
                if (visitedUsers.has(currentUplineId)) break;
                visitedUsers.add(currentUplineId);
                const rate = effectiveTeamRates[level] || 0;
                if (rate > 0) queueBonus(currentUplineId, 'Team Builder', amount * rate, realInvestmentId);
                const uplineUser = users.find(u => u.id === currentUplineId);
                currentUplineId = uplineUser ? uplineUser.uplineId : null;
                level++;
            }
            if (bonusInserts.length > 0) await supabase.from('bonuses').insert(bonusInserts);
            if (transactionInserts.length > 0) await supabase.from('transactions').insert(transactionInserts);
        }
        if(supabase) await refreshData();
    } catch (e) {
        alert("Investment failed.");
    }
  }, [users, currentDate, projects, investmentPools, instantBonusRates, teamBuilderBonusRates, currentUser, refreshData]);

  const addInvestmentFromBalance = useCallback(async (amount: number, assetId: string, type: 'project' | 'pool', source: 'deposit' | 'profit_reinvestment') => {
    if (!currentUser) return;
    await executeInvestment(currentUser.id, amount, assetId, type, source);
  }, [currentUser, executeInvestment]);

  const addCryptoDeposit = useCallback(async (amount: number, txHash: string, reason?: string) => {
      if (!currentUser) return;
      if (!supabase) {
          setTransactions(prev => [...prev, {
              id: `tx-dep-${Date.now()}`, userId: currentUser.id, type: 'Deposit', amount: preciseMath(amount), txHash, date: currentDate.toISOString().split('T')[0], status: 'pending', reason: reason
          }]);
          return;
      }
      await supabase.from('transactions').insert({
          user_id: currentUser.id, type: 'Deposit', amount: preciseMath(amount), tx_hash: txHash,
          date: currentDate.toISOString().split('T')[0], status: 'pending', reason: reason
      });
      await refreshData();
  }, [currentUser, currentDate, refreshData]);

  const addWithdrawal = useCallback(async (amount: number, walletAddress: string) => {
    if (!currentUser) return;
    if (currentUser.kycStatus !== 'Verified') { alert(t('profile.kyc.notSubmittedMessage')); return; }
    const { depositBalance, profitBalance } = getUserBalances(currentUser.id);
    const availableTotal = preciseMath(depositBalance + profitBalance);
    if (amount > availableTotal) { alert("Withdrawal amount cannot exceed balance."); return; }
    
    if (!supabase) {
        setTransactions(prev => [...prev, {
            id: `tx-wd-${Date.now()}`, userId: currentUser.id, type: 'Withdrawal', amount: preciseMath(amount),
            txHash: 'PENDING', date: currentDate.toISOString().split('T')[0], status: 'pending', reason: `Withdraw to: ${walletAddress}`
        }]);
        return;
    }
    await supabase.from('transactions').insert({
      user_id: currentUser.id, type: 'Withdrawal', amount: preciseMath(amount),
      date: currentDate.toISOString().split('T')[0], tx_hash: 'PENDING', status: 'pending', reason: `Withdraw to: ${walletAddress}`
    });
    await refreshData();
  }, [currentUser, currentDate, refreshData, t, getUserBalances]);

  const updateKycStatus = useCallback(async (userId: string, status: 'Verified' | 'Pending' | 'Rejected' | 'Not Submitted') => {
      if (!supabase) {
          setUsers(prev => prev.map(u => u.id === userId ? { ...u, kycStatus: status } : u));
          if(currentUser?.id === userId) setCurrentUser(prev => prev ? {...prev, kycStatus: status} : null);
          return;
      }
      await supabase.from('profiles').update({ kyc_status: status }).eq('id', userId);
      if (status === 'Verified' || status === 'Rejected') {
          await addNotification({ userId, type: 'KYC Update', message: `Your KYC application has been ${status}.`, date: currentDate.toISOString().split('T')[0], read: false });
      }
      await refreshData();
  }, [currentDate, addNotification, currentUser, refreshData]);

  const toggleFreezeUser = useCallback(async (userId: string) => {
    const user = users.find(u => u.id === userId);
    if(user) {
        if (!supabase) { setUsers(prev => prev.map(u => u.id === userId ? { ...u, isFrozen: !u.isFrozen } : u)); return; }
        await supabase.from('profiles').update({ is_frozen: !user.isFrozen }).eq('id', userId);
        await refreshData();
    }
  }, [users, refreshData]);

  const markNotificationsAsRead = useCallback(async () => {
    if(!currentUser) return;
    if (!supabase) {
        setNotifications(prev => prev.map(n => n.userId === currentUser.id ? { ...n, read: true } : n));
        setBonuses(prev => prev.map(b => b.userId === currentUser.id ? { ...b, read: true } : b));
        return; 
    }
    await supabase.from('bonuses').update({ read: true }).eq('user_id', currentUser.id);
    await supabase.from('notifications').update({ read: true }).eq('user_id', currentUser.id);
    await refreshData();
  }, [currentUser, refreshData]);

  const updateUser = useCallback(async (updatedUser: User) => {
    if (!supabase) {
        setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
        if (currentUser?.id === updatedUser.id) setCurrentUser(updatedUser);
        return;
    }
    await supabase.from('profiles').update({
        name: updatedUser.name, avatar: updatedUser.avatar, wallet: updatedUser.wallet,
        rank: updatedUser.rank, upline_id: updatedUser.uplineId, total_investment: updatedUser.totalInvestment
    }).eq('id', updatedUser.id);
    await refreshData();
  }, [currentUser, refreshData]);

  const deleteUser = useCallback(async (userId: string) => {
    if(window.confirm('Are you sure?')) {
        if (!supabase) { setUsers(prev => prev.filter(u => u.id !== userId)); return; }
        await supabase.from('profiles').delete().eq('id', userId); 
        await refreshData();
    }
  }, [refreshData]);

  const deleteInvestment = useCallback(async (investmentId: string) => {
     if(window.confirm('Are you sure? Refunds are manual.')) {
        if (!supabase) {
            setInvestments(prev => prev.filter(i => i.id !== investmentId));
            setBonuses(prev => prev.filter(b => b.sourceId !== investmentId));
            setTransactions(prev => prev.filter(t => t.investmentId !== investmentId));
            return;
        }
        await supabase.from('bonuses').delete().eq('source_id', investmentId);
        await supabase.from('transactions').delete().eq('investment_id', investmentId);
        await supabase.from('investments').delete().eq('id', investmentId);
        await refreshData();
     }
  }, [refreshData]);

  const updateRankSettings = useCallback((updatedRanks: Rank[]) => { setRanks(updatedRanks); }, []);

  const addManualTransaction = useCallback(async (userId: string, type: 'Manual Bonus' | 'Manual Deduction', amount: number, reason: string) => {
    if (!supabase) {
        setTransactions(prev => [...prev, { id: `tx-man-${Date.now()}`, userId, type, amount: preciseMath(amount), reason, date: currentDate.toISOString().split('T')[0], txHash: 'DEMO-MANUAL' }]);
        return;
    }
    await supabase.from('transactions').insert({ user_id: userId, type, amount: preciseMath(amount), reason, date: currentDate.toISOString().split('T')[0], tx_hash: `MANUAL-${Date.now()}` });
    await refreshData();
  }, [currentDate, refreshData]);
  
  const addNewsPost = useCallback(async (post: Omit<NewsPost, 'id'>) => {
    if (!supabase) { setNews(prev => [...prev, { id: `news-${Date.now()}`, ...post }]); return; }
    await supabase.from('news').insert(post);
    await refreshData();
  }, [refreshData]);

  const deleteNewsPost = useCallback(async (postId: string) => {
    if(window.confirm('Are you sure?')) {
        if (!supabase) { setNews(prev => prev.filter(n => n.id !== postId)); return; }
        await supabase.from('news').delete().eq('id', postId);
        await refreshData();
    }
  }, [refreshData]);

  const runMonthlyCycle = useCallback((cycleDate: Date) => {
    const downlineCounts: Record<string, number> = {};
    const calculateDownline = (userId: string, visited = new Set<string>()): number => {
        if (visited.has(userId)) return 0;
        visited.add(userId);
        if (downlineCounts[userId] !== undefined) return downlineCounts[userId];
        const directs = users.filter(u => u.uplineId === userId);
        let count = directs.length;
        for (const direct of directs) count += calculateDownline(direct.id, new Set(visited));
        downlineCounts[userId] = count;
        return count;
    };

    let promotions = 0;
    const promotedUsers: User[] = [];

    users.forEach(user => {
        if (user.role === 'admin') return;
        const actualDownlineCount = calculateDownline(user.id);
        const currentRank = user.rank;
        let newRank = currentRank;
        const sortedRanks = [...ranks].sort((a,b) => b.level - a.level);
        for (const rankConfig of sortedRanks) {
            if (rankConfig.level <= currentRank) break; 
            if (user.totalInvestment >= rankConfig.minTotalInvestment && actualDownlineCount >= rankConfig.minAccounts) {
                newRank = rankConfig.level;
                break;
            }
        }
        if (newRank > currentRank) { promotedUsers.push({ ...user, rank: newRank, totalDownline: actualDownlineCount }); promotions++; }
    });

    if (promotions > 0) {
        if (!supabase) {
            setUsers(prev => prev.map(u => { const p = promotedUsers.find(x => x.id === u.id); return p || u; }));
            promotedUsers.forEach(u => addNotification({ userId: u.id, type: 'Rank Promotion', message: `Promoted to Rank L${u.rank}!`, date: cycleDate.toISOString().split('T')[0], read: false }));
        } else {
            Promise.all(promotedUsers.map(async (u) => {
                await supabase.from('profiles').update({ rank: u.rank }).eq('id', u.id);
                await supabase.from('notifications').insert({ user_id: u.id, type: 'Rank Promotion', message: `Promoted to Rank L${u.rank}!`, date: cycleDate.toISOString().split('T')[0], read: false });
            })).then(() => refreshData());
        }
    }
  }, [users, ranks, addNotification, refreshData]);
  
  const advanceDate = useCallback(async (days: number) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + days);
    setCurrentDate(newDate);

    if (!supabase || window.confirm('Generate simulated profits?')) {
        let profitTransactions: any[] = [];
        const investmentProfitUpdates: Record<string, number> = {};
        
        for (let i = 1; i <= days; i++) {
            const simulationDate = new Date(currentDate);
            simulationDate.setDate(simulationDate.getDate() + i);
            const dateStr = simulationDate.toISOString().split('T')[0];

            investments.forEach(inv => {
                if (inv.status !== 'Active') return;
                let apy = inv.apy || 0;
                if (!apy) {
                    if (inv.projectId) apy = projects.find(p => p.id === inv.projectId)?.expectedYield || 0;
                    else if (inv.poolId) apy = investmentPools.find(p => p.id === inv.poolId)?.apy || 0;
                }
                if (apy > 0) {
                    const dailyProfit = preciseMath(inv.amount * (apy / 100 / 365), 8);
                    profitTransactions.push({ userId: inv.userId, investmentId: inv.id, amount: dailyProfit, date: dateStr });
                    investmentProfitUpdates[inv.id] = (investmentProfitUpdates[inv.id] || 0) + dailyProfit;
                }
            });
        }

        if (profitTransactions.length > 0) {
            if (!supabase) {
                const newTxns = profitTransactions.map((pt, idx) => ({ id: `tx-profit-${Date.now()}-${idx}`, userId: pt.userId, type: 'Profit Share' as const, amount: pt.amount, txHash: 'AUTO-PROFIT', date: pt.date, investmentId: pt.investmentId }));
                const updatedInvestments = [...investments];
                profitTransactions.forEach(pt => { const inv = updatedInvestments.find(i => i.id === pt.investmentId); if (inv) inv.totalProfitEarned = preciseMath(inv.totalProfitEarned + pt.amount); });
                setTransactions(prev => [...prev, ...newTxns]);
                setInvestments(updatedInvestments);
            } else {
                await supabase.from('transactions').insert(profitTransactions.map(pt => ({ user_id: pt.userId, type: 'Profit Share', amount: pt.amount, tx_hash: 'AUTO-PROFIT', date: pt.date, investment_id: pt.investmentId })));
                for (const [invId, earned] of Object.entries(investmentProfitUpdates)) {
                    const currentInv = investments.find(i => i.id === invId);
                    if (currentInv) await supabase.from('investments').update({ total_profit_earned: preciseMath(currentInv.totalProfitEarned + earned) }).eq('id', invId);
                }
                await refreshData();
            }
        }
    }
  }, [currentDate, investments, projects, investmentPools, refreshData]);

  const addProject = useCallback(async (p: Partial<Omit<Project, 'id'>>) => {
    if (!supabase) { setProjects(prev => [...prev, { id: `proj-${Date.now()}`, ...p } as Project]); return; } 
    const { error } = await supabase.from('projects').insert({
        token_name: p.tokenName, token_ticker: p.tokenTicker, asset_type: p.assetType, asset_identifier: p.assetIdentifier,
        asset_description: p.assetDescription, asset_location: p.assetLocation, asset_image_url: p.assetImageUrl,
        asset_valuation: p.assetValuation, valuation_method: p.valuationMethod, valuation_date: p.valuationDate || null, 
        performance_history: p.performanceHistory, expected_yield: p.expectedYield, proof_of_ownership: p.proofOfOwnership,
        legal_structure: p.legalStructure, legal_wrapper: p.legalWrapper, jurisdiction: p.jurisdiction,
        regulatory_status: p.regulatoryStatus, investor_requirements: p.investorRequirements, total_token_supply: p.totalTokenSupply,
        token_price: p.tokenPrice, min_investment: p.minInvestment, blockchain: p.blockchain, smart_contract_address: p.smart_contract_address,
        distribution: p.distribution, rights_conferred: p.rightsConferred, asset_custodian: p.assetCustodian, asset_manager: p.assetManager, oracles: p.oracles,
    });
    if (!error) await refreshData();
  }, [refreshData]);

  const updateProject = useCallback(async (p: Project) => {
    if (!supabase) { setProjects(prev => prev.map(x => x.id === p.id ? p : x)); return; }
    const { error } = await supabase.from('projects').update({
        token_name: p.tokenName, token_ticker: p.tokenTicker, asset_type: p.assetType, asset_identifier: p.assetIdentifier,
        asset_description: p.assetDescription, asset_location: p.assetLocation, asset_image_url: p.assetImageUrl,
        asset_valuation: p.assetValuation, valuation_method: p.valuationMethod, valuation_date: p.valuationDate || null, 
        performance_history: p.performance_history, expected_yield: p.expectedYield, proof_of_ownership: p.proofOfOwnership,
        legal_structure: p.legalStructure, legal_wrapper: p.legalWrapper, jurisdiction: p.jurisdiction,
        regulatory_status: p.regulatoryStatus, investor_requirements: p.investorRequirements, total_token_supply: p.totalTokenSupply,
        token_price: p.tokenPrice, min_investment: p.minInvestment, blockchain: p.blockchain, smart_contract_address: p.smart_contract_address,
        distribution: p.distribution, rights_conferred: p.rightsConferred, asset_custodian: p.assetCustodian, asset_manager: p.assetManager, oracles: p.oracles,
    }).eq('id', p.id);
    if (!error) await refreshData();
  }, [refreshData]);

  const deleteProject = useCallback(async (id: string) => {
      if (!supabase) { setProjects(prev => prev.filter(p => p.id !== id)); return; }
      await supabase.from('projects').delete().eq('id', id);
      await refreshData();
  }, [refreshData]);

  const addInvestmentPool = useCallback(async (pool: Omit<InvestmentPool, 'id'>) => {
    if (!supabase) { setInvestmentPools(prev => [...prev, { id: `pool-${Date.now()}`, ...pool }]); return; }
    await supabase.from('investment_pools').insert({ name: pool.name, description: pool.description, apy: pool.apy, min_investment: pool.minInvestment });
    await refreshData();
  }, [refreshData]);

  const updateInvestmentPool = useCallback(async (pool: InvestmentPool) => {
    if (!supabase) { setInvestmentPools(prev => prev.map(p => p.id === pool.id ? pool : p)); return; }
    await supabase.from('investment_pools').update({ name: pool.name, description: pool.description, apy: pool.apy, min_investment: pool.minInvestment }).eq('id', pool.id);
    await refreshData();
  }, [refreshData]);

  const deleteInvestmentPool = useCallback(async (id: string) => {
      if (!supabase) { setInvestmentPools(prev => prev.filter(p => p.id !== id)); return; }
      await supabase.from('investment_pools').delete().eq('id', id);
      await refreshData();
  }, [refreshData]);

  const adjustUserRank = useCallback(async (userId: string, newRank: number, reason: string) => {
    if (!supabase) { setUsers(prev => prev.map(u => u.id === userId ? { ...u, rank: newRank } : u)); return; }
    await supabase.from('profiles').update({ rank: newRank }).eq('id', userId);
    await addNotification({ userId, type: 'Rank Promotion', message: `Rank adjusted to L${newRank}. Reason: ${reason}`, date: currentDate.toISOString().split('T')[0], read: false });
    await refreshData();
  }, [addNotification, currentDate, refreshData]);

  const connectSolanaWallet = useCallback(async () => {
    if (window.solana) { try { const r = await window.solana.connect(); setSolanaWalletAddress(r.publicKey.toString()); } catch (err) {} }
    else { alert(t('wallet.solana.notFound')); }
  }, [t]);

  const disconnectSolanaWallet = useCallback(() => { if (window.solana) window.solana.disconnect(); setSolanaWalletAddress(null); setIgiTokenBalance(null); setSolBalance(null); }, []);

  const fetchAllBalances = useCallback(async () => {
    if (!solanaWalletAddress || !window.solanaWeb3 || !window.splToken) return;
    const connection = new window.solanaWeb3.Connection(window.solanaWeb3.clusterApiUrl('mainnet-beta'));
    const publicKey = new window.solanaWeb3.PublicKey(solanaWalletAddress);
    try { const b = await connection.getBalance(publicKey); setSolBalance(b / window.solanaWeb3.LAMPORTS_PER_SOL); } catch (e) { setSolBalance(null); }
    try {
      const mintPublicKey = new window.solanaWeb3.PublicKey(IGI_TOKEN_MINT_ADDRESS);
      const ta = await connection.getParsedTokenAccountsByOwner(publicKey, { mint: mintPublicKey });
      setIgiTokenBalance(ta.value.length > 0 ? ta.value[0].account.data.parsed.info.uiAmount : 0);
    } catch (e) { setIgiTokenBalance(null); }
  }, [solanaWalletAddress]);

  useEffect(() => { if (solanaWalletAddress) fetchAllBalances(); }, [solanaWalletAddress, fetchAllBalances]);

  const approveDeposit = useCallback(async (id: string, bonus: number = 0, autoInvest?: { type: 'project' | 'pool', id: string }) => {
    const tx = transactions.find(t => t.id === id);
    if (!tx) return;
    if (!supabase) {
        setTransactions(prev => prev.map(t => t.id === id ? { ...t, status: 'completed' } : t));
        if (bonus > 0) setTransactions(prev => [...prev, { id: `tx-bonus-${Date.now()}`, userId: tx.userId, type: 'Manual Bonus', amount: bonus, reason: 'Deposit Bonus', date: currentDate.toISOString().split('T')[0], txHash: 'BONUS-DEP' }]);
        if (autoInvest) executeInvestment(tx.userId, tx.amount, autoInvest.id, autoInvest.type, 'deposit');
        return;
    }
    await supabase.from('transactions').update({ status: 'completed' }).eq('id', id);
    if (bonus > 0) await supabase.from('transactions').insert({ user_id: tx.userId, type: 'Manual Bonus', amount: bonus, reason: 'Deposit Bonus', date: currentDate.toISOString().split('T')[0], tx_hash: `BONUS-${Date.now()}` });
    if (autoInvest) await executeInvestment(tx.userId, tx.amount, autoInvest.id, autoInvest.type, 'deposit');
    await refreshData();
  }, [transactions, currentDate, executeInvestment, refreshData]);

  const rejectDeposit = useCallback(async (id: string, reason: string) => {
    if (!supabase) { setTransactions(prev => prev.map(t => t.id === id ? { ...t, status: 'rejected', rejectionReason: reason } : t)); return; }
    await supabase.from('transactions').update({ status: 'rejected', rejection_reason: reason }).eq('id', id);
    await refreshData();
  }, [refreshData]);

  const approveWithdrawal = useCallback(async (id: string, txHash: string) => {
      if (!supabase) { setTransactions(prev => prev.map(t => t.id === id ? { ...t, status: 'completed', txHash } : t)); return; }
      await supabase.from('transactions').update({ status: 'completed', tx_hash: txHash }).eq('id', id);
      await refreshData();
  }, [refreshData]);

  const rejectWithdrawal = useCallback(async (id: string, reason: string) => {
      if (!supabase) { setTransactions(prev => prev.map(t => t.id === id ? { ...t, status: 'rejected', rejectionReason: reason } : t)); return; }
      await supabase.from('transactions').update({ status: 'rejected', rejection_reason: reason }).eq('id', id);
      await refreshData();
  }, [refreshData]);

  const createUser = useCallback(async (u: Omit<User, 'id' | 'totalInvestment' | 'totalDownline' | 'monthlyIncome' | 'achievements'>, init: InitialInvestmentData[] = []) => {
    if (!supabase) {
        const nu: User = { id: `user-${Date.now()}`, ...u, totalInvestment: 0, totalDownline: 0, monthlyIncome: 0, achievements: [] };
        setUsers(prev => [...prev, nu]);
        for (const i of init) {
             const nid = `inv-${Date.now()}-${Math.random()}`;
             setInvestments(prev => [...prev, { id: nid, userId: nu.id, amount: i.amount, date: currentDate.toISOString().split('T')[0], status: 'Active', projectId: i.type === 'project' ? i.assetId : undefined, poolId: i.type === 'pool' ? i.assetId : undefined, projectName: i.type === 'project' ? projects.find(p => p.id === i.assetId)?.tokenName : undefined, poolName: i.type === 'pool' ? investmentPools.find(p => p.id === i.assetId)?.name : undefined, totalProfitEarned: 0, source: 'deposit', apy: i.type === 'project' ? projects.find(p => p.id === i.assetId)?.expectedYield : investmentPools.find(p => p.id === i.assetId)?.apy }]);
             setTransactions(prev => [...prev, { id: `tx-init-${Date.now()}-${Math.random()}`, userId: nu.id, type: 'Investment', amount: i.amount, txHash: 'ADMIN-INIT-INV', date: currentDate.toISOString().split('T')[0], investmentId: nid }, { id: `tx-init-dep-${Date.now()}-${Math.random()}`, userId: nu.id, type: 'Deposit', amount: i.amount, txHash: 'ADMIN-INIT-DEP', date: currentDate.toISOString().split('T')[0], status: 'completed' }]);
             nu.totalInvestment += i.amount;
        }
        return;
    }
    alert("Admin creation via API only.");
  }, [currentDate, projects, investmentPools]);

  const updateUserRole = useCallback(async (id: string, role: 'user' | 'admin') => {
    if (!supabase) { setUsers(prev => prev.map(u => u.id === id ? { ...u, role } : u)); return; }
    await supabase.from('profiles').update({ role: role.toLowerCase().trim() }).eq('id', id);
    await refreshData();
  }, [refreshData]);

  const addInvestmentForUser = useCallback(async (id: string, amt: number, aid: string, t: 'project' | 'pool', s: 'deposit' | 'profit_reinvestment' = 'deposit') => {
    await executeInvestment(id, amt, aid, t, s);
  }, [executeInvestment]);

  const confirmCryptoInvestment = useCallback(async (id: string, amt: number, aid: string, t: 'project' | 'pool') => {
    if (!supabase) setTransactions(prev => [...prev, { id: `tx-adm-dep-${Date.now()}`, userId: id, type: 'Deposit', amount: preciseMath(amt, 8), txHash: 'ADMIN-ADD', date: currentDate.toISOString().split('T')[0], status: 'completed' }]);
    else await supabase.from('transactions').insert({ user_id: id, type: 'Deposit', amount: preciseMath(amt, 8), tx_hash: `ADMIN-ADD-${Date.now()}`, date: currentDate.toISOString().split('T')[0], status: 'completed' });
    await executeInvestment(id, amt, aid, t, 'deposit');
  }, [executeInvestment, currentDate]);

  const updateInvestment = useCallback(async (inv: Investment) => {
    if (!supabase) { setInvestments(prev => prev.map(i => i.id === inv.id ? inv : i)); return; }
    await supabase.from('investments').update({ amount: inv.amount, date: inv.date, status: inv.status }).eq('id', inv.id);
    await refreshData();
  }, [refreshData]);

  const updateNewsPost = useCallback(async (p: NewsPost) => {
    if (!supabase) { setNews(prev => prev.map(n => n.id === p.id ? p : n)); return; }
    await supabase.from('news').update({ title: p.title, content: p.content }).eq('id', p.id);
    await refreshData();
  }, [refreshData]);

  // Fix: Implementation of missing update functions required by context interface
  const updateBonusRates = useCallback((newInstantRates: { investor: number, referrer: number, upline: number }, newTeamRates: number[]) => {
    setInstantBonusRates(newInstantRates);
    setTeamBuilderBonusRates(newTeamRates);
  }, []);

  const updateTreasuryWallets = useCallback((wallets: TreasuryWallets) => {
    setTreasuryWallets(wallets);
  }, []);

  const updateSocialLinks = useCallback((links: PlatformSocialLinks) => {
    setSocialLinks(links);
  }, []);

  const updateWithdrawalLimit = useCallback((limit: number) => {
    setWithdrawalLimit(limit);
  }, []);

  const updateMinWithdrawalLimit = useCallback((limit: number) => {
    setMinWithdrawalLimit(limit);
  }, []);

  const seedDatabase = useCallback(async () => {
    if (!supabase) {
        setUsers(MOCK_USERS); setInvestments(MOCK_INVESTMENTS); setTransactions(MOCK_TRANSACTIONS); setBonuses(MOCK_BONUSES); setProjects(MOCK_PROJECTS); setInvestmentPools(MOCK_INVESTMENT_POOLS); setNews(MOCK_NEWS); setNotifications([]);
        localStorage.removeItem('igi_demo_session'); setCurrentUser(null);
        return;
    }
    setLoading(true);
    try {
        await supabase.from('projects').insert(MOCK_PROJECTS.map(p => ({
            token_name: p.tokenName, token_ticker: p.tokenTicker, asset_type: p.assetType, asset_identifier: p.assetIdentifier, asset_description: p.assetDescription, asset_location: p.assetLocation, asset_image_url: p.assetImageUrl, asset_valuation: p.assetValuation, valuation_method: p.valuationMethod, valuation_date: p.valuationDate, performance_history: p.performanceHistory, expected_yield: p.expectedYield, proof_of_ownership: p.proofOfOwnership, legal_structure: p.legalStructure, legal_wrapper: p.legalWrapper, jurisdiction: p.jurisdiction, regulatory_status: p.regulatoryStatus, investor_requirements: p.investorRequirements, total_token_supply: p.totalTokenSupply, token_price: p.tokenPrice, min_investment: p.minInvestment, blockchain: p.blockchain, smart_contract_address: p.smart_contract_address, distribution: p.distribution, rights_conferred: p.rightsConferred, asset_custodian: p.assetCustodian, asset_manager: p.assetManager, oracles: p.oracles
        })));
        await supabase.from('investment_pools').insert(MOCK_INVESTMENT_POOLS.map(p => ({ name: p.name, description: p.description, apy: p.apy, min_investment: p.minInvestment })));
        await supabase.from('news').insert(MOCK_NEWS.map(n => ({ title: n.title, content: n.content, date: n.date, author: n.author })));
        refreshData();
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }, [refreshData]);

  const sendReferralInvite = useCallback(async (email: string) => {
    if (!currentUser) return;
    const subj = t('dashboard.referral.emailSubject');
    const body = t('dashboard.referral.emailBody', { referralLink: `${window.location.origin}?ref=${currentUser.referralCode}` });
    const mailto = `mailto:${email}?subject=${encodeURIComponent(subj)}&body=${encodeURIComponent(body)}`;
    const isMock = !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(currentUser.id);
    if (!supabase || isMock) { window.location.href = mailto; return; }
    try {
        const { error, data } = await supabase.functions.invoke('send-referral-invite', {
            body: { recipient_email: email, code: currentUser.referralCode, referrer_id: currentUser.id, inviter_name: currentUser.name, referral_link: `${window.location.origin}?ref=${currentUser.referralCode}` }
        });
        if (error || (data && data.error)) throw error;
    } catch (e) { window.location.href = mailto; }
  }, [currentUser, t]);

  return (
    <AppContext.Provider value={{
      users, investments, transactions, bonuses, ranks, news, notifications, projects, investmentPools,
      instantBonusRates, teamBuilderBonusRates, treasuryWallets, socialLinks, withdrawalLimit, minWithdrawalLimit,
      currentUser, currentDate, addInvestmentFromBalance, addCryptoDeposit, addWithdrawal, updateKycStatus, toggleFreezeUser,
      markNotificationsAsRead, updateUser, deleteUser, deleteInvestment, updateRankSettings, addManualTransaction, addNewsPost, deleteNewsPost, runMonthlyCycle, advanceDate,
      addProject, updateProject, deleteProject, addInvestmentPool, updateInvestmentPool, deleteInvestmentPool,
      adjustUserRank, getUserBalances, solanaWalletAddress, igiTokenBalance, solBalance, connectSolanaWallet, disconnectSolanaWallet, fetchAllBalances,
      approveDeposit, rejectDeposit, approveWithdrawal, rejectWithdrawal, createUser, updateUserRole, addInvestmentForUser, confirmCryptoInvestment, updateInvestment,
      updateNewsPost, updateBonusRates, updateTreasuryWallets, updateSocialLinks, updateWithdrawalLimit, updateMinWithdrawalLimit, seedDatabase, sendReferralInvite,
      login, signup, logout, sendPasswordResetEmail, updateUserPassword, passwordResetMode, setPasswordResetMode, inviteModalOpen, setInviteModalOpen, loading, isDemoMode: !supabase
    }}>
      {children}
    </AppContext.Provider>
  );
};
