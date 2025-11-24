
import React, { createContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { useLocalization } from '../hooks/useLocalization';
import { User, Investment, Transaction, Bonus, Rank, NewsPost, Notification, Project, InvestmentPool, TreasuryWallets } from '../types';
import { 
  INITIAL_RANKS, 
  INITIAL_TEAM_BUILDER_BONUS_RATES, 
  INITIAL_INSTANT_BONUS_RATES, 
  INITIAL_TREASURY_WALLETS, 
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
  currentUser: User | null;
  currentDate: Date;
  addInvestmentFromBalance: (amount: number, assetId: string, type: 'project' | 'pool', source: 'deposit' | 'profit_reinvestment') => void;
  addCryptoDeposit: (amount: number, txHash: string, reason?: string) => void;
  addWithdrawal: (amount: number, balance: number) => void;
  updateKycStatus: (userId: string, status: 'Verified' | 'Pending' | 'Rejected' | 'Not Submitted') => void;
  toggleFreezeUser: (userId: string) => void;
  markNotificationsAsRead: () => void;
  updateUser: (updatedUser: User) => void;
  deleteUser: (userId: string) => void;
  deleteInvestment: (investmentId: string) => void;
  updateRankSettings: (updatedRanks: Rank[]) => void;
  addManualTransaction: (userId: string, type: 'Manual Bonus' | 'Manual Deduction', amount: number, reason: string) => void;
  addNewsPost: (post: Omit<NewsPost, 'id'>) => void;
  deleteNewsPost: (postId: string) => void;
  runMonthlyCycle: (cycleDate: Date) => void;
  advanceDate: (days: number) => void;
  addProject: (project: Partial<Omit<Project, 'id'>>) => void;
  updateProject: (project: Project) => void;
  deleteProject: (projectId: string) => void;
  addInvestmentPool: (pool: Omit<InvestmentPool, 'id'>) => void;
  updateInvestmentPool: (pool: InvestmentPool) => void;
  deleteInvestmentPool: (poolId: string) => void;
  adjustUserRank: (userId: string, newRank: number, reason: string) => void;
  getUserBalances: (userId: string) => { depositBalance: number, profitBalance: number };
  solanaWalletAddress: string | null;
  igiTokenBalance: number | null;
  solBalance: number | null;
  connectSolanaWallet: () => Promise<void>;
  disconnectSolanaWallet: () => void;
  fetchAllBalances: () => Promise<void>;
  // Admin functions
  approveDeposit: (transactionId: string, bonusAmount?: number, autoInvestTarget?: { type: 'project' | 'pool', id: string }) => void;
  rejectDeposit: (transactionId: string, reason: string) => void;
  createUser: (user: Omit<User, 'id' | 'totalInvestment' | 'totalDownline' | 'monthlyIncome' | 'achievements'>, initialInvestments?: InitialInvestmentData[]) => void;
  updateUserRole: (userId: string, role: 'user' | 'admin') => void;
  addInvestmentForUser: (userId: string, amount: number, assetId: string, type: 'project' | 'pool', source: 'deposit' | 'profit_reinvestment') => void;
  confirmCryptoInvestment: (userId: string, amount: number, assetId: string, type: 'project' | 'pool') => void;
  updateInvestment: (investment: Investment) => void;
  updateNewsPost: (post: NewsPost) => void;
  updateBonusRates: (newInstantRates: { investor: number, referrer: number, upline: number }, newTeamRates: number[]) => void;
  updateTreasuryWallets: (wallets: TreasuryWallets) => void;
  seedDatabase: () => Promise<void>;
  // Auth functions
  login: (email: string, password: string) => Promise<void>;
  signup: (userData: Partial<User>) => Promise<void>;
  logout: () => void;
  loading: boolean;
  isDemoMode: boolean;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppContextProviderProps {
  children: ReactNode;
}

// --- LOCAL STORAGE HELPERS ---
const getStoredData = <T,>(key: string, defaultData: T): T => {
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : defaultData;
};

const setStoredData = <T,>(key: string, data: T) => {
  localStorage.setItem(key, JSON.stringify(data));
};


export const AppContextProvider: React.FC<AppContextProviderProps> = ({ children }) => {
  const { t } = useLocalization();
  const [loading, setLoading] = useState(true);

  // Data State - Fallback to Mocks if Supabase is not configured
  const [users, setUsers] = useState<User[]>(() => supabase ? [] : MOCK_USERS);
  const [investments, setInvestments] = useState<Investment[]>(() => supabase ? [] : MOCK_INVESTMENTS);
  const [transactions, setTransactions] = useState<Transaction[]>(() => supabase ? [] : MOCK_TRANSACTIONS);
  const [bonuses, setBonuses] = useState<Bonus[]>(() => supabase ? [] : MOCK_BONUSES);
  const [projects, setProjects] = useState<Project[]>(() => supabase ? [] : MOCK_PROJECTS);
  const [investmentPools, setInvestmentPools] = useState<InvestmentPool[]>(() => supabase ? [] : MOCK_INVESTMENT_POOLS);
  const [news, setNews] = useState<NewsPost[]>(() => supabase ? [] : MOCK_NEWS);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Settings State
  const [ranks, setRanks] = useState<Rank[]>(() => getStoredData('igi_ranks', INITIAL_RANKS));
  const [currentDate, setCurrentDate] = useState(new Date('2023-11-28T12:00:00Z'));
  const [instantBonusRates, setInstantBonusRates] = useState(() => getStoredData('igi_instantRates', INITIAL_INSTANT_BONUS_RATES));
  const [teamBuilderBonusRates, setTeamBuilderBonusRates] = useState(() => getStoredData('igi_teamRates', INITIAL_TEAM_BUILDER_BONUS_RATES));
  const [treasuryWallets, setTreasuryWallets] = useState<TreasuryWallets>(() => getStoredData('igi_wallets', INITIAL_TREASURY_WALLETS));
  
  // Auth State
  const [currentUser, setCurrentUser] = useState<User | null>(null);

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
          ...p,
          tokenName: p.token_name,
          tokenTicker: p.token_ticker,
          assetType: p.asset_type,
          assetIdentifier: p.asset_identifier,
          assetDescription: p.asset_description,
          assetLocation: p.asset_location,
          assetImageUrl: p.asset_image_url,
          assetValuation: Number(p.asset_valuation),
          expectedYield: Number(p.expected_yield),
          minInvestment: Number(p.min_investment),
          tokenPrice: Number(p.token_price),
          totalTokenSupply: Number(p.total_token_supply),
          smartContractAddress: p.smart_contract_address,
          valuationMethod: 'Appraisal', // defaults
          valuationDate: p.valuation_date,
          performanceHistory: 'Track record available',
          proofOfOwnership: 'On File',
          legalStructure: 'LLC',
          legalWrapper: 'Tokenized',
          jurisdiction: 'USA',
          regulatoryStatus: 'Compliant',
          investorRequirements: 'KYC',
          distribution: 'Public',
          rightsConferred: 'Equity',
          assetCustodian: 'Custody Co',
          assetManager: 'Manager Co',
          oracles: 'Chainlink'
      })));

      if (poolData) setInvestmentPools(poolData.map(p => ({
          ...p,
          minInvestment: Number(p.min_investment)
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
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if(session?.user) {
         refreshData(); // Reload data when auth changes
      } else {
         setCurrentUser(null);
      }
    });

    refreshData();

    return () => subscription.unsubscribe();
  }, [refreshData]);

  // Sync currentUser with updated users data from global refresh
  useEffect(() => {
    if (currentUser && users.length > 0) {
        const updatedProfile = users.find(u => u.id === currentUser.id);
        if (updatedProfile) {
            // Deep equality check to avoid loops, simplified for key fields
            const roleChanged = updatedProfile.role !== currentUser.role;
            const frozenChanged = updatedProfile.isFrozen !== currentUser.isFrozen;
            const rankChanged = updatedProfile.rank !== currentUser.rank;
            
            if (roleChanged || frozenChanged || rankChanged) {
                console.log(`Syncing user profile for ${currentUser.email}`);
                setCurrentUser(prev => prev ? ({ ...prev, ...updatedProfile }) : updatedProfile);
                
                if (roleChanged) {
                    // Optional: Alert user if role specifically changes
                    // alert(`Your account role has been updated to: ${updatedProfile.role}`);
                }
            }
        }
    }
  }, [users, currentUser]);

  // Persist Settings to LocalStorage
  useEffect(() => { setStoredData('igi_ranks', ranks) }, [ranks]);
  useEffect(() => { setStoredData('igi_instantRates', instantBonusRates) }, [instantBonusRates]);
  useEffect(() => { setStoredData('igi_teamRates', teamBuilderBonusRates) }, [teamBuilderBonusRates]);
  useEffect(() => { setStoredData('igi_wallets', treasuryWallets) }, [treasuryWallets]);


  // --- AUTHENTICATION LOGIC ---
  const login = useCallback(async (email: string, password: string) => {
    if (!supabase) {
        // Local Mock Login for Demo Mode
        const normalizedEmail = email.toLowerCase().trim();
        const user = users.find(u => u.email.toLowerCase() === normalizedEmail);
        
        if (user && (user.password === password || password === 'password')) {
             if(user.isFrozen) throw new Error("Account is frozen.");
             setCurrentUser(user);
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
          alert("Sign up not available in Demo Mode without Supabase connection.");
          return;
      }
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
      setCurrentUser(null);
  }, []);


  const addNotification = useCallback(async (notification: Omit<Notification, 'id'>) => {
    if (!supabase) return;
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
        
        // alert("Investment created in Demo Mode (Local Only)");
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

    // Simplified Bonus Logic for Client Demo
    await supabase.from('bonuses').insert({
      user_id: userId, type: 'Instant', source_id: invData.id, amount: amount * instantBonusRates.investor,
      date: currentDate.toISOString().split('T')[0], read: false,
    });
    await supabase.from('transactions').insert({ user_id: userId, type: 'Bonus', amount: amount * instantBonusRates.investor, date: currentDate.toISOString().split('T')[0], tx_hash: `0x...BONUS` });

    if (investingUser.uplineId) {
        await supabase.from('bonuses').insert({
            user_id: investingUser.uplineId, type: 'Instant', source_id: invData.id, amount: amount * instantBonusRates.referrer,
            date: currentDate.toISOString().split('T')[0], read: false,
        });
        await supabase.from('transactions').insert({ user_id: investingUser.uplineId, type: 'Bonus', amount: amount * instantBonusRates.referrer, date: currentDate.toISOString().split('T')[0], tx_hash: `0x...REF` });
    }
    
    await supabase.from('profiles').update({ total_investment: investingUser.totalInvestment + amount }).eq('id', userId);

    // Realtime subscription will pick up changes
  }, [users, currentDate, projects, investmentPools, instantBonusRates, currentUser]);

  const addInvestmentFromBalance = useCallback((amount: number, assetId: string, type: 'project' | 'pool', source: 'deposit' | 'profit_reinvestment') => {
    if (!currentUser) return;
    executeInvestment(currentUser.id, amount, assetId, type, source);
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
      // Realtime subscription will pick up changes
  }, [currentUser, currentDate]);


  const addWithdrawal = useCallback(async (amount: number, balance: number) => {
    if (!currentUser) return;
    if (amount > balance) {
        alert("Withdrawal amount cannot exceed balance.");
        return;
    }
    
    if (!supabase) {
        setTransactions(prev => [...prev, {
            id: `tx-wd-${Date.now()}`, userId: currentUser.id, type: 'Withdrawal', amount, txHash: 'DEMO-WD', date: currentDate.toISOString().split('T')[0]
        }]);
        return;
    }

    await supabase.from('transactions').insert({
      user_id: currentUser.id, type: 'Withdrawal', amount,
      date: currentDate.toISOString().split('T')[0], tx_hash: `0x...wdw${Date.now().toString().slice(-4)}`,
    });
    // Realtime subscription will pick up changes
  }, [currentUser, currentDate]);

  const updateKycStatus = useCallback(async (userId: string, status: 'Verified' | 'Pending' | 'Rejected' | 'Not Submitted') => {
      if (!supabase) {
          setUsers(prev => prev.map(u => u.id === userId ? { ...u, kycStatus: status } : u));
          if(currentUser?.id === userId) setCurrentUser(prev => prev ? {...prev, kycStatus: status} : null);
          return;
      }
      
      await supabase.from('profiles').update({ kyc_status: status }).eq('id', userId);
      if (status === 'Verified' || status === 'Rejected') {
          addNotification({
              userId, type: 'KYC Update', message: `Your KYC application has been ${status}.`,
              date: currentDate.toISOString().split('T')[0], read: false,
          });
      }
      // Realtime subscription will pick up changes
  }, [currentDate, addNotification, currentUser]);

  const toggleFreezeUser = useCallback(async (userId: string) => {
    const user = users.find(u => u.id === userId);
    if(user) {
        if (!supabase) {
            setUsers(prev => prev.map(u => u.id === userId ? { ...u, isFrozen: !u.isFrozen } : u));
            return;
        }
        await supabase.from('profiles').update({ is_frozen: !user.isFrozen }).eq('id', userId);
        // Realtime subscription will pick up changes
    }
  }, [users]);

  const markNotificationsAsRead = useCallback(async () => {
    if(!currentUser) return;
    if (!supabase) return; 
    await supabase.from('bonuses').update({ read: true }).eq('user_id', currentUser.id);
    await supabase.from('notifications').update({ read: true }).eq('user_id', currentUser.id);
    // Realtime subscription will pick up changes
  }, [currentUser]);

  const updateUser = useCallback(async (updatedUser: User) => {
    if (!supabase) {
        setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
        if (currentUser?.id === updatedUser.id) setCurrentUser(updatedUser);
        return;
    }
    await supabase.from('profiles').update({
        name: updatedUser.name,
        avatar: updatedUser.avatar,
        wallet: updatedUser.wallet
    }).eq('id', updatedUser.id);
    // Realtime subscription will pick up changes
  }, [currentUser]);

  const deleteUser = useCallback(async (userId: string) => {
    if(window.confirm('Are you sure?')) {
        if (!supabase) {
            setUsers(prev => prev.filter(u => u.id !== userId));
            return;
        }
        await supabase.from('profiles').delete().eq('id', userId); 
        // Realtime subscription will pick up changes
    }
  }, []);

  const deleteInvestment = useCallback(async (investmentId: string) => {
     if(window.confirm('Are you sure?')) {
        if (!supabase) {
            setInvestments(prev => prev.filter(i => i.id !== investmentId));
            return;
        }
        await supabase.from('investments').delete().eq('id', investmentId);
        // Realtime subscription will pick up changes
     }
  }, []);

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
    // Realtime subscription will pick up changes
  }, [currentDate]);
  
  const addNewsPost = useCallback(async (post: Omit<NewsPost, 'id'>) => {
    if (!supabase) {
        setNews(prev => [...prev, { id: `news-${Date.now()}`, ...post }]);
        return;
    }
    await supabase.from('news').insert(post);
    // Realtime subscription will pick up changes
  }, []);

  const deleteNewsPost = useCallback(async (postId: string) => {
    if(window.confirm('Are you sure?')) {
        if (!supabase) {
            setNews(prev => prev.filter(n => n.id !== postId));
            return;
        }
        await supabase.from('news').delete().eq('id', postId);
        // Realtime subscription will pick up changes
    }
  }, []);

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
    if (!supabase) return; 
    await supabase.from('projects').insert({
        token_name: project.tokenName,
        asset_type: project.assetType,
        asset_valuation: project.assetValuation,
        expected_yield: project.expectedYield,
        min_investment: project.minInvestment,
        // ... others
    });
    // Realtime subscription will pick up changes
  }, []);

  const updateProject = useCallback(async (project: Project) => {
    if (!supabase) return;
    await supabase.from('projects').update({
        token_name: project.tokenName,
    }).eq('id', project.id);
    // Realtime subscription will pick up changes
  }, []);

  const deleteProject = useCallback(async (projectId: string) => {
      if (!supabase) return;
      await supabase.from('projects').delete().eq('id', projectId);
      // Realtime subscription will pick up changes
  }, []);

  const addInvestmentPool = useCallback(async (pool: Omit<InvestmentPool, 'id'>) => {
    if (!supabase) return;
    await supabase.from('investment_pools').insert({
        name: pool.name,
        description: pool.description,
        apy: pool.apy,
        min_investment: pool.minInvestment
    });
    // Realtime subscription will pick up changes
  }, []);

  const updateInvestmentPool = useCallback(async (pool: InvestmentPool) => {
    if (!supabase) return;
    await supabase.from('investment_pools').update({
        name: pool.name,
        description: pool.description,
        apy: pool.apy,
        min_investment: pool.minInvestment
    }).eq('id', pool.id);
    // Realtime subscription will pick up changes
  }, []);

  const deleteInvestmentPool = useCallback(async (poolId: string) => {
      if (!supabase) return;
      await supabase.from('investment_pools').delete().eq('id', poolId);
      // Realtime subscription will pick up changes
  }, []);


  const adjustUserRank = useCallback(async (userId: string, newRank: number, reason: string) => {
    if (!supabase) {
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, rank: newRank } : u));
        return;
    }
    await supabase.from('profiles').update({ rank: newRank }).eq('id', userId);
    addNotification({
        userId,
        type: 'Rank Promotion',
        message: `An admin adjusted your rank to L${newRank}. Reason: ${reason}`,
        date: currentDate.toISOString().split('T')[0],
        read: false,
    });
    // Realtime subscription will pick up changes
  }, [addNotification, currentDate]);

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
      const totalWithdrawals = userTransactions.filter(t => t.type === 'Withdrawal' || t.type === 'Manual Deduction').reduce((sum, t) => sum + t.amount, 0);

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
        executeInvestment(transaction.userId, transaction.amount, autoInvestTarget.id, autoInvestTarget.type, 'deposit');
    }

    // Realtime subscription will pick up changes
  }, [transactions, currentDate, executeInvestment]);

  const rejectDeposit = useCallback(async (transactionId: string, reason: string) => {
    if (!supabase) {
        setTransactions(prev => prev.map(t => t.id === transactionId ? { ...t, status: 'rejected', rejectionReason: reason } : t));
        return;
    }
    await supabase.from('transactions').update({ status: 'rejected', rejection_reason: reason }).eq('id', transactionId);
    // Realtime subscription will pick up changes
  }, []);

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
        alert("User created in Demo Mode");
        return;
    }
    alert("Admin User Creation requires Supabase Admin API (Service Role) to avoid logging out the current admin. Implement via Edge Function.");
  }, []);

  const updateUserRole = useCallback(async (userId: string, role: 'user' | 'admin') => {
    if (!supabase) {
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, role } : u));
        return;
    }
    await supabase.from('profiles').update({ role: role.toLowerCase().trim() }).eq('id', userId);
    // Realtime subscription will pick up changes
  }, []);

  const addInvestmentForUser = useCallback((userId: string, amount: number, assetId: string, type: 'project' | 'pool', source: 'deposit' | 'profit_reinvestment' = 'deposit') => {
    executeInvestment(userId, amount, assetId, type, source);
  }, [executeInvestment]);

  const confirmCryptoInvestment = useCallback((userId: string, amount: number, assetId: string, type: 'project' | 'pool') => {
    executeInvestment(userId, amount, assetId, type, 'deposit');
  }, [executeInvestment]);

  const updateInvestment = useCallback(async (investment: Investment) => {
    if (!supabase) {
        setInvestments(prev => prev.map(i => i.id === investment.id ? investment : i));
        return;
    }
    await supabase.from('investments').update({ amount: investment.amount, date: investment.date, status: investment.status }).eq('id', investment.id);
    // Realtime subscription will pick up changes
  }, []);

  const updateNewsPost = useCallback(async (post: NewsPost) => {
    if (!supabase) {
        setNews(prev => prev.map(n => n.id === post.id ? post : n));
        return;
    }
    await supabase.from('news').update({ title: post.title, content: post.content }).eq('id', post.id);
    // Realtime subscription will pick up changes
  }, []);

  const updateBonusRates = useCallback((newInstantRates: { investor: number, referrer: number, upline: number }, newTeamRates: number[]) => {
    setInstantBonusRates(newInstantRates);
    setTeamBuilderBonusRates(newTeamRates);
    alert('Bonus rates updated!');
  }, []);
  
  const updateTreasuryWallets = useCallback((wallets: TreasuryWallets) => {
    setTreasuryWallets(wallets);
  }, []);

  const seedDatabase = useCallback(async () => {
    if (!supabase) return;
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

  return (
    <AppContext.Provider value={{
      users, investments, transactions, bonuses, ranks, news, notifications, projects, investmentPools,
      instantBonusRates, teamBuilderBonusRates, treasuryWallets,
      currentUser, currentDate,
      addInvestmentFromBalance, addCryptoDeposit, addWithdrawal, updateKycStatus, toggleFreezeUser,
      markNotificationsAsRead, updateUser, deleteUser, deleteInvestment, updateRankSettings,
      addManualTransaction, addNewsPost, deleteNewsPost, runMonthlyCycle, advanceDate,
      addProject, updateProject, deleteProject, addInvestmentPool, updateInvestmentPool, deleteInvestmentPool,
      adjustUserRank, getUserBalances,
      solanaWalletAddress, igiTokenBalance, solBalance, connectSolanaWallet, disconnectSolanaWallet, fetchAllBalances,
      approveDeposit, rejectDeposit,
      createUser, updateUserRole, addInvestmentForUser, confirmCryptoInvestment, updateInvestment,
      updateNewsPost, updateBonusRates, updateTreasuryWallets,
      seedDatabase,
      login, signup, logout, loading,
      isDemoMode: !supabase
    }}>
      {children}
    </AppContext.Provider>
  );
};
