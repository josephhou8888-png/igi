
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
  addWithdrawal: (amount: number, balance: number, walletAddress: string) => Promise<void>;
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

// --- LOCAL STORAGE HELPERS ---
const getStoredData = <T,>(key: string, defaultData: T): T => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultData;
  } catch (error) {
    console.warn(`Error loading ${key} from localStorage, using defaults.`, error);
    return defaultData;
  }
};

const setStoredData = <T,>(key: string, data: T) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    console.log(`Saved ${key} to localStorage`); // Log enabled to verify persistence
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error);
  }
};

const sanitizeString = (val: string | null | undefined, fallback: string): string => {
    if (!val || val === 'null' || val === 'undefined') return fallback;
    return val;
};


export const AppContextProvider: React.FC<AppContextProviderProps> = ({ children }) => {
  const { t } = useLocalization();
  const [loading, setLoading] = useState(true);

  // Data State - Persistence for Demo Mode, Fallback to Mocks
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

  // --- SUPABASE DATA FETCHING ---
  const refreshData = useCallback(async () => {
    if (!supabase) {
        setLoading(false);
        return;
    }
    // Don't set loading true here to avoid flickering on realtime updates
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
          role: u.role ? u.role.toLowerCase().trim() : 'user', // Normalize role
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
          valuationDate: p.valuation_date,
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
          ...p,
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

  // Realtime Subscription
  useEffect(() => {
    if (!supabase) return;

    const channels = supabase.channel('custom-all-channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public' },
        (payload) => {
          console.log('Change received!', payload);
          refreshData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channels);
    }
  }, [refreshData]);

  // Check active session on mount
  useEffect(() => {
    if (!supabase) {
        // Local Session persistence check
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
        // Fetch full profile
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
                role: data.role ? data.role.toLowerCase().trim() : 'user', // Normalize
                achievements: data.achievements || []
            });
        });
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setPasswordResetMode(true);
      }
      
      if(session?.user) {
         refreshData(); // Reload data when auth changes
      } else {
         setCurrentUser(null);
      }
    });

    refreshData();

    return () => subscription.unsubscribe();
  }, [refreshData]); // Depend on refreshData only, not users, to avoid loop during init

  // Sync currentUser with updated users data from global refresh
  useEffect(() => {
    if (currentUser && users.length > 0) {
        const updatedProfile = users.find(u => u.id === currentUser.id);
        if (updatedProfile) {
            // Deep equality check to avoid loops, simplified for key fields
            const roleChanged = updatedProfile.role !== currentUser.role;
            const frozenChanged = updatedProfile.isFrozen !== currentUser.isFrozen;
            const rankChanged = updatedProfile.rank !== currentUser.rank;
            const balanceChanged = updatedProfile.totalInvestment !== currentUser.totalInvestment;
            const kycChanged = updatedProfile.kycStatus !== currentUser.kycStatus;
            
            if (roleChanged || frozenChanged || rankChanged || balanceChanged || kycChanged) {
                // Keep the current user object identity but update fields to trigger re-renders only when needed
                // Using functional update to access latest state
                setCurrentUser(prev => prev ? ({ ...prev, ...updatedProfile }) : updatedProfile);
            }
        }
    }
  }, [users, currentUser]);

  // Persist Settings & Demo Data to LocalStorage
  useEffect(() => { setStoredData('igi_ranks', ranks) }, [ranks]);
  useEffect(() => { setStoredData('igi_instantRates', instantBonusRates) }, [instantBonusRates]);
  useEffect(() => { setStoredData('igi_teamRates', teamBuilderBonusRates) }, [teamBuilderBonusRates]);
  useEffect(() => { setStoredData('igi_wallets', treasuryWallets) }, [treasuryWallets]);
  useEffect(() => { setStoredData('igi_socials', socialLinks) }, [socialLinks]);
  useEffect(() => { setStoredData('igi_withdrawalLimit', withdrawalLimit) }, [withdrawalLimit]);
  useEffect(() => { setStoredData('igi_minWithdrawalLimit', minWithdrawalLimit) }, [minWithdrawalLimit]);

  // Persist Demo Transactional Data
  useEffect(() => { if (!supabase) setStoredData('igi_demo_users', users) }, [users]);
  useEffect(() => { if (!supabase) setStoredData('igi_demo_investments', investments) }, [investments]);
  useEffect(() => { if (!supabase) setStoredData('igi_demo_transactions', transactions) }, [transactions]);
  useEffect(() => { if (!supabase) setStoredData('igi_demo_bonuses', bonuses) }, [bonuses]);
  useEffect(() => { if (!supabase) setStoredData('igi_demo_projects', projects) }, [projects]);
  useEffect(() => { if (!supabase) setStoredData('igi_demo_pools', investmentPools) }, [investmentPools]);
  useEffect(() => { if (!supabase) setStoredData('igi_demo_news', news) }, [news]);
  useEffect(() => { if (!supabase) setStoredData('igi_demo_notifications', notifications) }, [notifications]);


  // --- AUTHENTICATION LOGIC ---
  const login = useCallback(async (email: string, password: string) => {
    if (!supabase) {
        // Local Mock Login for Demo Mode
        const normalizedEmail = email.toLowerCase().trim();
        const user = users.find(u => u.email.toLowerCase() === normalizedEmail);
        
        if (user && (user.password === password || password === 'password')) {
             if(user.isFrozen) throw new Error("Account is frozen.");
             setCurrentUser(user);
             localStorage.setItem('igi_demo_session', user.id); // Persist session
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
             if(profile.is_frozen) {
                 await supabase.auth.signOut();
                 throw new Error("Account is frozen.");
             }
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
              password: userData.password, // Store password for demo login
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
      
      // Supabase Signup Logic
      const referralCode = `${userData.name?.split(' ')[0].toUpperCase() || 'USER'}${Math.floor(1000 + Math.random() * 9000)}`;
      const wallet = `0x${Math.random().toString(16).slice(2, 42)}`;
      
      const { data, error } = await supabase.auth.signUp({
        email: userData.email!,
        password: userData.password!,
        options: {
          data: {
            name: userData.name,
            wallet: wallet,
            referralCode: referralCode,
            uplineId: userData.uplineId 
          }
        }
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
        // Demo mode simulation
        console.log(`Sending password reset email to ${email}`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        alert('Password reset email sent (Simulation).');
        return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin
    });
    if (error) throw error;
  }, []);

  const updateUserPassword = useCallback(async (password: string) => {
    if (!supabase) {
        // Demo mode simulation
        console.log(`Updating password to ${password}`);
        if (currentUser) {
            setUsers(prev => prev.map(u => u.id === currentUser.id ? { ...u, password } : u));
        }
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

  // --- CRUD Operations replaced with Supabase calls ---

  const executeInvestment = useCallback(async (userId: string, amount: number, assetId: string, investmentType: 'project' | 'pool', source: 'deposit' | 'profit_reinvestment') => {
    const investingUser = users.find(u => u.id === userId);
    if (!investingUser) return;

    let effectiveBonusRates = instantBonusRates;
    
    // Check for custom pool/project bonus rates
    if (investmentType === 'pool') {
        const pool = investmentPools.find(p => p.id === assetId);
        if (pool && pool.customBonusConfig) {
            effectiveBonusRates = pool.customBonusConfig.instant;
        }
    } else if (investmentType === 'project') {
        const project = projects.find(p => p.id === assetId);
        if (project && project.customBonusConfig) {
            effectiveBonusRates = project.customBonusConfig.instant;
        }
    }
    
    // Local Demo Logic Update
    if (!supabase) {
        const newInvestment: Investment = {
            id: `inv-${Date.now()}`,
            userId, amount, date: currentDate.toISOString().split('T')[0],
            status: 'Active',
            projectId: investmentType === 'project' ? assetId : undefined,
            poolId: investmentType === 'pool' ? assetId : undefined,
            projectName: investmentType === 'project' ? projects.find(p => p.id === assetId)?.tokenName : undefined,
            poolName: investmentType === 'pool' ? investmentPools.find(p => p.id === assetId)?.name : undefined,
            totalProfitEarned: 0, source
        };
        setInvestments(prev => [...prev, newInvestment]);
        
        const newTx: Transaction = {
            id: `tx-${Date.now()}`, userId, type: source === 'profit_reinvestment' ? 'Reinvestment' : 'Investment',
            amount, txHash: 'DEMO-HASH', date: currentDate.toISOString().split('T')[0], investmentId: newInvestment.id
        };
        setTransactions(prev => [...prev, newTx]);
        
        // Update user
        const updatedUsers = users.map(u => u.id === userId ? { ...u, totalInvestment: u.totalInvestment + amount } : u);
        setUsers(updatedUsers);
        if (currentUser?.id === userId) setCurrentUser(prev => prev ? { ...prev, totalInvestment: prev.totalInvestment + amount } : null);
        return;
    }

    // Supabase Logic
    let projectId = null;
    let poolId = null;

    if (investmentType === 'project') {
      const project = projects.find(p => p.id === assetId);
      if (!project) return;
      projectId = project.id;
    } else { // 'pool'
      const pool = investmentPools.find(p => p.id === assetId);
      if (!pool) return;
      poolId = pool.id;
    }
    
    const { data: invData, error: invError } = await supabase.from('investments').insert({
      user_id: userId,
      amount,
      date: currentDate.toISOString().split('T')[0],
      status: 'Active',
      project_id: projectId,
      pool_id: poolId,
      total_profit_earned: 0,
      source: source,
    }).select().single();

    if (invError || !invData) { console.error(invError); return; }
    
    await supabase.from('transactions').insert({
        user_id: userId,
        type: source === 'profit_reinvestment' ? 'Reinvestment' : 'Investment',
        amount,
        tx_hash: `0x...${Date.now().toString().slice(-4)}`,
        date: currentDate.toISOString().split('T')[0],
        investment_id: invData.id,
    });

    // Bonus Logic using effective rates
    await supabase.from('bonuses').insert({
      user_id: userId, type: 'Instant', source_id: invData.id, amount: amount * effectiveBonusRates.investor,
      date: currentDate.toISOString().split('T')[0], read: false,
    });
    await supabase.from('transactions').insert({ user_id: userId, type: 'Bonus', amount: amount * effectiveBonusRates.investor, date: currentDate.toISOString().split('T')[0], tx_hash: `0x...BONUS` });

    if (investingUser.uplineId) {
        await supabase.from('bonuses').insert({
            user_id: investingUser.uplineId, type: 'Instant', source_id: invData.id, amount: amount * effectiveBonusRates.referrer,
            date: currentDate.toISOString().split('T')[0], read: false,
        });
        await supabase.from('transactions').insert({ user_id: investingUser.uplineId, type: 'Bonus', amount: amount * effectiveBonusRates.referrer, date: currentDate.toISOString().split('T')[0], tx_hash: `0x...REF` });
    }
    
    await supabase.from('profiles').update({ total_investment: investingUser.totalInvestment + amount }).eq('id', userId);

    await refreshData();
  }, [users, currentDate, projects, investmentPools, instantBonusRates, currentUser, refreshData]);

  const addInvestmentFromBalance = useCallback(async (amount: number, assetId: string, type: 'project' | 'pool', source: 'deposit' | 'profit_reinvestment') => {
    if (!currentUser) return;
    await executeInvestment(currentUser.id, amount, assetId, type, source);
  }, [currentUser, executeInvestment]);

  const addCryptoDeposit = useCallback(async (amount: number, txHash: string, reason?: string) => {
      if (!currentUser) return;
      
      if (!supabase) {
          setTransactions(prev => [...prev, {
              id: `tx-dep-${Date.now()}`, userId: currentUser.id, type: 'Deposit', amount, txHash, date: currentDate.toISOString().split('T')[0], status: 'pending', reason: reason
          }]);
          alert("Deposit request added locally (Demo Mode)");
          return;
      }

      await supabase.from('transactions').insert({
          user_id: currentUser.id,
          type: 'Deposit',
          amount,
          tx_hash: txHash,
          date: currentDate.toISOString().split('T')[0],
          status: 'pending',
          reason: reason
      });
      await refreshData();
  }, [currentUser, currentDate, refreshData]);


  const addWithdrawal = useCallback(async (amount: number, balance: number, walletAddress: string) => {
    if (!currentUser) return;
    if (amount > balance) {
        alert("Withdrawal amount cannot exceed balance.");
        return;
    }
    
    if (!supabase) {
        setTransactions(prev => [...prev, {
            id: `tx-wd-${Date.now()}`, 
            userId: currentUser.id, 
            type: 'Withdrawal', 
            amount, 
            txHash: 'PENDING', 
            date: currentDate.toISOString().split('T')[0],
            status: 'pending',
            reason: `Withdraw to: ${walletAddress}`
        }]);
        return;
    }

    await supabase.from('transactions').insert({
      user_id: currentUser.id, 
      type: 'Withdrawal', 
      amount,
      date: currentDate.toISOString().split('T')[0], 
      tx_hash: 'PENDING',
      status: 'pending',
      reason: `Withdraw to: ${walletAddress}`
    });
    await refreshData();
  }, [currentUser, currentDate, refreshData]);

  const updateKycStatus = useCallback(async (userId: string, status: 'Verified' | 'Pending' | 'Rejected' | 'Not Submitted') => {
      if (!supabase) {
          setUsers(prev => prev.map(u => u.id === userId ? { ...u, kycStatus: status } : u));
          if(currentUser?.id === userId) setCurrentUser(prev => prev ? {...prev, kycStatus: status} : null);
          return;
      }
      
      await supabase.from('profiles').update({ kyc_status: status }).eq('id', userId);
      if (status === 'Verified' || status === 'Rejected') {
          await addNotification({
              userId, type: 'KYC Update', message: `Your KYC application has been ${status}.`,
              date: currentDate.toISOString().split('T')[0], read: false,
          });
      }
      await refreshData();
  }, [currentDate, addNotification, currentUser, refreshData]);

  const toggleFreezeUser = useCallback(async (userId: string) => {
    const user = users.find(u => u.id === userId);
    if(user) {
        if (!supabase) {
            setUsers(prev => prev.map(u => u.id === userId ? { ...u, isFrozen: !u.isFrozen } : u));
            return;
        }
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
        name: updatedUser.name,
        avatar: updatedUser.avatar,
        wallet: updatedUser.wallet,
        rank: updatedUser.rank,
        upline_id: updatedUser.uplineId,
        total_investment: updatedUser.totalInvestment
    }).eq('id', updatedUser.id);
    await refreshData();
  }, [currentUser, refreshData]);

  const deleteUser = useCallback(async (userId: string) => {
    if(window.confirm('Are you sure?')) {
        if (!supabase) {
            setUsers(prev => prev.filter(u => u.id !== userId));
            return;
        }
        await supabase.from('profiles').delete().eq('id', userId); 
        await refreshData();
    }
  }, [refreshData]);

  const deleteInvestment = useCallback(async (investmentId: string) => {
     if(window.confirm('Are you sure?')) {
        if (!supabase) {
            setInvestments(prev => prev.filter(i => i.id !== investmentId));
            return;
        }
        await supabase.from('investments').delete().eq('id', investmentId);
        await refreshData();
     }
  }, [refreshData]);

  const updateRankSettings = useCallback((updatedRanks: Rank[]) => {
    setRanks(updatedRanks);
    alert('Platform rank settings have been updated!');
  }, []);

  const addManualTransaction = useCallback(async (userId: string, type: 'Manual Bonus' | 'Manual Deduction', amount: number, reason: string) => {
    if (!supabase) {
        setTransactions(prev => [...prev, {
            id: `tx-man-${Date.now()}`, userId, type, amount, reason, date: currentDate.toISOString().split('T')[0], txHash: 'DEMO-MANUAL'
        }]);
        return;
    }
    await supabase.from('transactions').insert({ user_id: userId, type, amount, reason, date: currentDate.toISOString().split('T')[0], tx_hash: `MANUAL-${Date.now()}` });
    await refreshData();
  }, [currentDate, refreshData]);
  
  const addNewsPost = useCallback(async (post: Omit<NewsPost, 'id'>) => {
    if (!supabase) {
        setNews(prev => [...prev, { id: `news-${Date.now()}`, ...post }]);
        return;
    }
    await supabase.from('news').insert(post);
    await refreshData();
  }, [refreshData]);

  const deleteNewsPost = useCallback(async (postId: string) => {
    if(window.confirm('Are you sure?')) {
        if (!supabase) {
            setNews(prev => prev.filter(n => n.id !== postId));
            return;
        }
        await supabase.from('news').delete().eq('id', postId);
        await refreshData();
    }
  }, [refreshData]);

  // --- SIMULATION LOGIC ---
  const runMonthlyCycle = useCallback((cycleDate: Date) => {
    console.log(`Running monthly cycle for ${cycleDate.toLocaleString('default', { month: 'long', year: 'numeric' })}...`);
    alert("Monthly cycle simulation logic executed (Log only in Demo).");
  }, []);
  
  const advanceDate = useCallback((days: number) => {
    setCurrentDate(prevDate => {
        const newDate = new Date(prevDate);
        newDate.setDate(newDate.getDate() + days);
        return newDate;
    });
  }, []);

  const addProject = useCallback(async (project: Partial<Omit<Project, 'id'>>) => {
    if (!supabase) {
        setProjects(prev => [...prev, { id: `proj-${Date.now()}`, ...project } as Project]);
        return;
    } 
    const { error } = await supabase.from('projects').insert({
        token_name: project.tokenName,
        token_ticker: project.tokenTicker,
        asset_type: project.assetType,
        asset_identifier: project.assetIdentifier,
        asset_description: project.assetDescription,
        asset_location: project.assetLocation,
        asset_image_url: project.assetImageUrl,
        asset_valuation: project.assetValuation,
        valuation_method: project.valuationMethod,
        valuation_date: project.valuationDate,
        performance_history: project.performanceHistory,
        expected_yield: project.expectedYield,
        proof_of_ownership: project.proofOfOwnership,
        legal_structure: project.legalStructure,
        legal_wrapper: project.legalWrapper,
        jurisdiction: project.jurisdiction,
        regulatory_status: project.regulatoryStatus,
        investor_requirements: project.investorRequirements,
        total_token_supply: project.totalTokenSupply,
        token_price: project.tokenPrice,
        min_investment: project.minInvestment,
        blockchain: project.blockchain,
        smart_contract_address: project.smartContractAddress,
        distribution: project.distribution,
        rights_conferred: project.rightsConferred,
        asset_custodian: project.assetCustodian,
        asset_manager: project.assetManager,
        oracles: project.oracles,
        custom_bonus_config: project.customBonusConfig,
        custom_rank_config: project.customRankConfig
    });
    if (error) {
        console.error('Error creating project:', error);
        alert(`Failed to create project: ${error.message}`);
    } else {
        await refreshData();
    }
  }, [refreshData]);

  const updateProject = useCallback(async (project: Project) => {
    if (!supabase) {
        setProjects(prev => prev.map(p => p.id === project.id ? project : p));
        return;
    }
    const { error } = await supabase.from('projects').update({
        token_name: project.tokenName,
        token_ticker: project.tokenTicker,
        asset_type: project.assetType,
        asset_identifier: project.assetIdentifier,
        asset_description: project.assetDescription,
        asset_location: project.assetLocation,
        asset_image_url: project.assetImageUrl,
        asset_valuation: project.assetValuation,
        valuation_method: project.valuationMethod,
        valuation_date: project.valuationDate,
        performance_history: project.performanceHistory,
        expected_yield: project.expectedYield,
        proof_of_ownership: project.proofOfOwnership,
        legal_structure: project.legalStructure,
        legal_wrapper: project.legalWrapper,
        jurisdiction: project.jurisdiction,
        regulatory_status: project.regulatoryStatus,
        investor_requirements: project.investorRequirements,
        total_token_supply: project.totalTokenSupply,
        token_price: project.tokenPrice,
        min_investment: project.minInvestment,
        blockchain: project.blockchain,
        smart_contract_address: project.smartContractAddress,
        distribution: project.distribution,
        rights_conferred: project.rightsConferred,
        asset_custodian: project.assetCustodian,
        asset_manager: project.assetManager,
        oracles: project.oracles,
        custom_bonus_config: project.customBonusConfig,
        custom_rank_config: project.customRankConfig
    }).eq('id', project.id);
    
    if (error) {
        console.error('Error updating project:', error);
        alert(`Failed to update project: ${error.message}`);
    } else {
        await refreshData();
    }
  }, [refreshData]);

  const deleteProject = useCallback(async (projectId: string) => {
      if (!supabase) {
          setProjects(prev => prev.filter(p => p.id !== projectId));
          return;
      }
      await supabase.from('projects').delete().eq('id', projectId);
      await refreshData();
  }, [refreshData]);

  const addInvestmentPool = useCallback(async (pool: Omit<InvestmentPool, 'id'>) => {
    if (!supabase) {
        setInvestmentPools(prev => [...prev, { id: `pool-${Date.now()}`, ...pool }]);
        return;
    }
    const { error } = await supabase.from('investment_pools').insert({
        name: pool.name,
        description: pool.description,
        apy: pool.apy,
        min_investment: pool.minInvestment,
        custom_bonus_config: pool.customBonusConfig,
        custom_rank_config: pool.customRankConfig,
        project_url: pool.projectUrl || null,
        linked_project_id: pool.linkedProjectId || null
    });
    
    if (error) {
        console.error('Error creating pool:', error);
        alert(`Failed to create pool: ${error.message}`);
    } else {
        await refreshData();
    }
  }, [refreshData]);

  const updateInvestmentPool = useCallback(async (pool: InvestmentPool) => {
    if (!supabase) {
        setInvestmentPools(prev => prev.map(p => p.id === pool.id ? pool : p));
        return;
    }
    const { error } = await supabase.from('investment_pools').update({
        name: pool.name,
        description: pool.description,
        apy: pool.apy,
        min_investment: pool.minInvestment,
        custom_bonus_config: pool.customBonusConfig,
        custom_rank_config: pool.customRankConfig,
        project_url: pool.projectUrl || null,
        linked_project_id: pool.linkedProjectId || null
    }).eq('id', pool.id);
    
    if (error) {
        console.error('Error updating pool:', error);
        alert(`Failed to update pool: ${error.message}`);
    } else {
        await refreshData();
    }
  }, [refreshData]);

  const deleteInvestmentPool = useCallback(async (poolId: string) => {
      if (!supabase) {
          setInvestmentPools(prev => prev.filter(p => p.id !== poolId));
          return;
      }
      await supabase.from('investment_pools').delete().eq('id', poolId);
      await refreshData();
  }, [refreshData]);


  const adjustUserRank = useCallback(async (userId: string, newRank: number, reason: string) => {
    if (!supabase) {
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, rank: newRank } : u));
        return;
    }
    await supabase.from('profiles').update({ rank: newRank }).eq('id', userId);
    await addNotification({
        userId,
        type: 'Rank Promotion',
        message: `An admin adjusted your rank to L${newRank}. Reason: ${reason}`,
        date: currentDate.toISOString().split('T')[0],
        read: false,
    });
    await refreshData();
  }, [addNotification, currentDate, refreshData]);

  const getUserBalances = useCallback((userId: string) => {
      const userTransactions = transactions.filter(t => t.userId === userId);
      const userInvestments = investments.filter(i => i.userId === userId);

      const totalDeposits = userTransactions
        .filter(t => 
            (t.type === 'Deposit' && (t.status === 'completed' || t.status === undefined)) || 
            t.type === 'Manual Bonus'
        )
        .reduce((sum, t) => sum + t.amount, 0);

      const totalProfits = userTransactions.filter(t => t.type === 'Profit Share' || t.type === 'Bonus').reduce((sum, t) => sum + t.amount, 0);
      const totalWithdrawals = userTransactions.filter(t => (t.type === 'Withdrawal' && t.status !== 'rejected') || t.type === 'Manual Deduction').reduce((sum, t) => sum + t.amount, 0);

      const investmentsFromDeposit = userInvestments.filter(i => i.source === 'deposit').reduce((sum, i) => sum + i.amount, 0);
      const reinvestmentsFromProfit = userInvestments.filter(i => i.source === 'profit_reinvestment').reduce((sum, i) => sum + i.amount, 0);
      
      const profitBalanceAfterReinvestment = totalProfits - reinvestmentsFromProfit;
      const withdrawalsFromProfit = Math.min(Math.max(0, profitBalanceAfterReinvestment), totalWithdrawals);
      const profitBalance = profitBalanceAfterReinvestment - withdrawalsFromProfit;

      const depositBalanceAfterInvestment = totalDeposits - investmentsFromDeposit;
      const withdrawalsFromDeposit = totalWithdrawals - withdrawalsFromProfit;
      const depositBalance = depositBalanceAfterInvestment - withdrawalsFromDeposit;

      return { depositBalance: Math.max(0, depositBalance), profitBalance: Math.max(0, profitBalance) };
  }, [transactions, investments]);

  const connectSolanaWallet = useCallback(async () => {
    if (window.solana) {
      try {
        const response = await window.solana.connect();
        const publicKey = response.publicKey.toString();
        setSolanaWalletAddress(publicKey);
      } catch (err) {
        console.error(err);
      }
    } else {
      alert(t('wallet.solana.notFound'));
    }
  }, [t]);

  const disconnectSolanaWallet = useCallback(() => {
    if (window.solana) {
      window.solana.disconnect();
    }
    setSolanaWalletAddress(null);
    setIgiTokenBalance(null);
    setSolBalance(null);
  }, []);

  const fetchAllBalances = useCallback(async () => {
    if (!solanaWalletAddress || !window.solanaWeb3 || !window.splToken) return;

    const connection = new window.solanaWeb3.Connection(window.solanaWeb3.clusterApiUrl('mainnet-beta'));
    const publicKey = new window.solanaWeb3.PublicKey(solanaWalletAddress);
    
    try {
        const balance = await connection.getBalance(publicKey);
        setSolBalance(balance / window.solanaWeb3.LAMPORTS_PER_SOL);
    } catch (e) {
        console.error("Could not fetch SOL balance", e);
        setSolBalance(null);
    }

    try {
      const mintPublicKey = new window.solanaWeb3.PublicKey(IGI_TOKEN_MINT_ADDRESS);
      const tokenAccounts = await connection.getParsedTokenAccountsByOwner(publicKey, { mint: mintPublicKey });
      if (tokenAccounts.value.length > 0) {
        const balance = tokenAccounts.value[0].account.data.parsed.info.uiAmount;
        setIgiTokenBalance(balance);
      } else {
        setIgiTokenBalance(0);
      }
    } catch (e) {
      console.error("Could not fetch token balance", e);
      setIgiTokenBalance(null);
    }
  }, [solanaWalletAddress]);

  useEffect(() => {
    if (solanaWalletAddress) fetchAllBalances();
  }, [solanaWalletAddress, fetchAllBalances]);

  // Admin functions
  const approveDeposit = useCallback(async (transactionId: string, bonusAmount: number = 0, autoInvestTarget?: { type: 'project' | 'pool', id: string }) => {
    const transaction = transactions.find(t => t.id === transactionId);
    if (!transaction) return;

    if (!supabase) {
        setTransactions(prev => prev.map(t => t.id === transactionId ? { ...t, status: 'completed' } : t));
        if (bonusAmount > 0) {
            setTransactions(prev => [...prev, {
                id: `tx-bonus-${Date.now()}`,
                userId: transaction.userId,
                type: 'Manual Bonus',
                amount: bonusAmount,
                reason: 'Deposit Bonus',
                date: currentDate.toISOString().split('T')[0],
                txHash: 'BONUS-DEP'
            }]);
        }
        // Auto-invest logic for demo
        if (autoInvestTarget) {
            setTimeout(() => {
                executeInvestment(transaction.userId, transaction.amount, autoInvestTarget.id, autoInvestTarget.type, 'deposit');
            }, 100);
        }
        return;
    }
    
    await supabase.from('transactions').update({ status: 'completed' }).eq('id', transactionId);
    
    if (bonusAmount > 0) {
        await supabase.from('transactions').insert({
            user_id: transaction.userId,
            type: 'Manual Bonus',
            amount: bonusAmount,
            reason: 'Deposit Bonus',
            date: currentDate.toISOString().split('T')[0],
            tx_hash: `BONUS-${Date.now()}`
        });
    }

    if (autoInvestTarget) {
        // Execute investment using the deposited amount
        await executeInvestment(transaction.userId, transaction.amount, autoInvestTarget.id, autoInvestTarget.type, 'deposit');
    }

    await refreshData();
  }, [transactions, currentDate, executeInvestment, refreshData]);

  const rejectDeposit = useCallback(async (transactionId: string, reason: string) => {
    if (!supabase) {
        setTransactions(prev => prev.map(t => t.id === transactionId ? { ...t, status: 'rejected', rejectionReason: reason } : t));
        return;
    }
    await supabase.from('transactions').update({ status: 'rejected', rejection_reason: reason }).eq('id', transactionId);
    await refreshData();
  }, [refreshData]);

  const approveWithdrawal = useCallback(async (transactionId: string, txHash: string) => {
      if (!supabase) {
          setTransactions(prev => prev.map(t => t.id === transactionId ? { ...t, status: 'completed', txHash } : t));
          return;
      }
      await supabase.from('transactions').update({ status: 'completed', tx_hash: txHash }).eq('id', transactionId);
      await refreshData();
  }, [refreshData]);

  const rejectWithdrawal = useCallback(async (transactionId: string, reason: string) => {
      if (!supabase) {
          setTransactions(prev => prev.map(t => t.id === transactionId ? { ...t, status: 'rejected', rejectionReason: reason } : t));
          return;
      }
      await supabase.from('transactions').update({ status: 'rejected', rejection_reason: reason }).eq('id', transactionId);
      await refreshData();
  }, [refreshData]);

  const createUser = useCallback(async (user: Omit<User, 'id' | 'totalInvestment' | 'totalDownline' | 'monthlyIncome' | 'achievements'>, initialInvestments: InitialInvestmentData[] = []) => {
    if (!supabase) {
        const newUser: User = {
            id: `user-${Date.now()}`,
            ...user,
            totalInvestment: 0,
            totalDownline: 0,
            monthlyIncome: 0,
            achievements: []
        };
        setUsers(prev => [...prev, newUser]);
        
        // Handle initial investments in demo mode
        for (const inv of initialInvestments) {
             // Mock execute investment without modifying wallet balance (admin creation)
             // Or we could reuse executeInvestment but that requires deposit source
             // For simplicity, let's just add the investment and update user total
             const newInvId = `inv-${Date.now()}-${Math.random()}`;
             setInvestments(prev => [...prev, {
                 id: newInvId,
                 userId: newUser.id,
                 amount: inv.amount,
                 date: currentDate.toISOString().split('T')[0],
                 status: 'Active',
                 projectId: inv.type === 'project' ? inv.assetId : undefined,
                 poolId: inv.type === 'pool' ? inv.assetId : undefined,
                 projectName: inv.type === 'project' ? projects.find(p => p.id === inv.assetId)?.tokenName : undefined,
                 poolName: inv.type === 'pool' ? investmentPools.find(p => p.id === inv.assetId)?.name : undefined,
                 totalProfitEarned: 0,
                 source: 'deposit'
             }]);
             // Add transaction for record
             setTransactions(prev => [...prev, {
                 id: `tx-init-${Date.now()}-${Math.random()}`,
                 userId: newUser.id,
                 type: 'Investment',
                 amount: inv.amount,
                 txHash: 'ADMIN-INIT',
                 date: currentDate.toISOString().split('T')[0],
                 investmentId: newInvId
             }]);
             // Update user total investment
             newUser.totalInvestment += inv.amount;
        }
        
        alert("User created in Demo Mode");
        return;
    }
    alert("Admin User Creation requires Supabase Admin API (Service Role) to avoid logging out the current admin. Implement via Edge Function.");
  }, [currentDate, projects, investmentPools]);

  const updateUserRole = useCallback(async (userId: string, role: 'user' | 'admin') => {
    if (!supabase) {
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, role } : u));
        return;
    }
    await supabase.from('profiles').update({ role: role.toLowerCase().trim() }).eq('id', userId);
    await refreshData();
  }, [refreshData]);

  const addInvestmentForUser = useCallback(async (userId: string, amount: number, assetId: string, type: 'project' | 'pool', source: 'deposit' | 'profit_reinvestment' = 'deposit') => {
    await executeInvestment(userId, amount, assetId, type, source);
  }, [executeInvestment]);

  const confirmCryptoInvestment = useCallback(async (userId: string, amount: number, assetId: string, type: 'project' | 'pool') => {
    await executeInvestment(userId, amount, assetId, type, 'deposit');
  }, [executeInvestment]);

  const updateInvestment = useCallback(async (investment: Investment) => {
    if (!supabase) {
        setInvestments(prev => prev.map(i => i.id === investment.id ? investment : i));
        return;
    }
    await supabase.from('investments').update({ amount: investment.amount, date: investment.date, status: investment.status }).eq('id', investment.id);
    await refreshData();
  }, [refreshData]);

  const updateNewsPost = useCallback(async (post: NewsPost) => {
    if (!supabase) {
        setNews(prev => prev.map(n => n.id === post.id ? post : n));
        return;
    }
    await supabase.from('news').update({ title: post.title, content: post.content }).eq('id', post.id);
    await refreshData();
  }, [refreshData]);

  const updateBonusRates = useCallback((newInstantRates: { investor: number, referrer: number, upline: number }, newTeamRates: number[]) => {
    setInstantBonusRates(newInstantRates);
    setTeamBuilderBonusRates(newTeamRates);
    alert('Bonus rates updated!');
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
        // RESET TO DEFAULTS
        setUsers(MOCK_USERS);
        setInvestments(MOCK_INVESTMENTS);
        setTransactions(MOCK_TRANSACTIONS);
        setBonuses(MOCK_BONUSES);
        setProjects(MOCK_PROJECTS);
        setInvestmentPools(MOCK_INVESTMENT_POOLS);
        setNews(MOCK_NEWS);
        setNotifications([]);
        localStorage.removeItem('igi_demo_session');
        setCurrentUser(null);
        alert('Demo data has been reset to defaults.');
        return;
    }
    
    setLoading(true);
    try {
        // Projects
        const projectsData = MOCK_PROJECTS.map(p => ({
            token_name: p.tokenName,
            token_ticker: p.tokenTicker,
            asset_type: p.assetType,
            asset_identifier: p.assetIdentifier,
            asset_description: p.assetDescription,
            asset_location: p.assetLocation,
            asset_image_url: p.assetImageUrl,
            asset_valuation: p.assetValuation,
            expected_yield: p.expectedYield,
            min_investment: p.minInvestment,
            token_price: p.tokenPrice,
            total_token_supply: p.totalTokenSupply,
            smart_contract_address: p.smartContractAddress,
            valuation_date: p.valuationDate
        }));
        const { error: projError } = await supabase.from('projects').insert(projectsData);
        if (projError) console.error('Error seeding projects:', projError);

        // Pools
        const poolsData = MOCK_INVESTMENT_POOLS.map(p => ({
            name: p.name,
            description: p.description,
            apy: p.apy,
            min_investment: p.minInvestment
        }));
        const { error: poolError } = await supabase.from('investment_pools').insert(poolsData);
        if (poolError) console.error('Error seeding pools:', poolError);

        // News
        const newsData = MOCK_NEWS.map(n => ({
            title: n.title,
            content: n.content,
            date: n.date,
            author: n.author
        }));
        const { error: newsError } = await supabase.from('news').insert(newsData);
        if (newsError) console.error('Error seeding news:', newsError);

        alert('Database seeded with Projects, Pools, and News!');
        refreshData();
    } catch (e) {
        console.error(e);
        alert('Error seeding database.');
    } finally {
        setLoading(false);
    }
  }, [refreshData]);

  const sendReferralInvite = useCallback(async (email: string) => {
    if (!currentUser) return;

    // Prepare Fallback content
    const subject = t('dashboard.referral.emailSubject');
    const body = t('dashboard.referral.emailBody', { referralLink: `${window.location.origin}?ref=${currentUser.referralCode}` });
    const mailtoLink = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    // Check constraints: Mock users (non-UUID) in Demo Mode cannot use server functions
    const isMockUser = !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(currentUser.id);
    
    if (!supabase || isMockUser) {
        console.warn("Skipping Supabase Edge Function: Demo Mode or Mock User.");
        window.location.href = mailtoLink;
        return;
    }

    try {
        const { error, data } = await supabase.functions.invoke('send-referral-invite', {
            body: {
                recipient_email: email,
                code: currentUser.referralCode,
                referrer_id: currentUser.id,
                inviter_name: currentUser.name,
                referral_link: `${window.location.origin}?ref=${currentUser.referralCode}`
            }
        });
        
        if (error) {
            throw error;
        }
        
        if (data && data.error) {
             throw new Error(data.error);
        }

        console.log("Email sent via Supabase Edge Function");

    } catch (e: any) {
        console.error('Edge Function Failed (Fallback to Mailto):', e.message);
        // Seamless fallback: Open default mail client without scaring the user with an alert
        window.location.href = mailtoLink;
    }
  }, [currentUser, t]);

  return (
    <AppContext.Provider value={{
      users, investments, transactions, bonuses, ranks, news, notifications, projects, investmentPools,
      instantBonusRates, teamBuilderBonusRates, treasuryWallets, socialLinks, withdrawalLimit, minWithdrawalLimit,
      currentUser, currentDate,
      addInvestmentFromBalance, addCryptoDeposit, addWithdrawal, updateKycStatus, toggleFreezeUser,
      markNotificationsAsRead, updateUser, deleteUser, deleteInvestment, updateRankSettings,
      addManualTransaction, addNewsPost, deleteNewsPost, runMonthlyCycle, advanceDate,
      addProject, updateProject, deleteProject, addInvestmentPool, updateInvestmentPool, deleteInvestmentPool,
      adjustUserRank, getUserBalances,
      solanaWalletAddress, igiTokenBalance, solBalance, connectSolanaWallet, disconnectSolanaWallet, fetchAllBalances,
      approveDeposit, rejectDeposit, approveWithdrawal, rejectWithdrawal,
      createUser, updateUserRole, addInvestmentForUser, confirmCryptoInvestment, updateInvestment,
      updateNewsPost, updateBonusRates, updateTreasuryWallets, updateSocialLinks, updateWithdrawalLimit, updateMinWithdrawalLimit,
      seedDatabase, sendReferralInvite,
      login, signup, logout, 
      sendPasswordResetEmail, updateUserPassword, passwordResetMode, setPasswordResetMode,
      inviteModalOpen, setInviteModalOpen,
      loading, isDemoMode: !supabase
    }}>
      {children}
    </AppContext.Provider>
  );
};
