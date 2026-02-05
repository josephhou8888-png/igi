
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
  runMonthlyCycle: (cycleDate: Date) => Promise<void>;
  advanceDate: (days: number) => Promise<void>;
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
  login: (email: string, password: string) => Promise<void>;
  signup: (userData: Partial<User>) => Promise<void>;
  logout: () => void;
  sendPasswordResetEmail: (email: string) => Promise<void>;
  updateUserPassword: (password: string) => Promise<void>;
  passwordResetMode: boolean;
  setPasswordResetMode: (mode: boolean) => void;
  inviteModalOpen: boolean;
  setInviteModalOpen: (open: boolean) => void;
  loading: boolean;
  isDemoMode: boolean;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

const getStoredData = <T,>(key: string, defaultData: T): T => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultData;
  } catch (error) { return defaultData; }
};

const setStoredData = <T,>(key: string, data: T) => {
  try { localStorage.setItem(key, JSON.stringify(data)); } catch (error) {}
};

const sanitizeString = (val: string | null | undefined, fallback: string): string => {
    if (!val || val === 'null' || val === 'undefined') return fallback;
    return val;
};

export const AppContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { t } = useLocalization();
  const [loading, setLoading] = useState(true);

  // Data State
  const [users, setUsers] = useState<User[]>(() => !supabase ? getStoredData('igi_demo_users', MOCK_USERS) : []);
  const [investments, setInvestments] = useState<Investment[]>(() => !supabase ? getStoredData('igi_demo_investments', MOCK_INVESTMENTS) : []);
  const [transactions, setTransactions] = useState<Transaction[]>(() => !supabase ? getStoredData('igi_demo_transactions', MOCK_TRANSACTIONS) : []);
  const [bonuses, setBonuses] = useState<Bonus[]>(() => !supabase ? getStoredData('igi_demo_bonuses', MOCK_BONUSES) : []);
  const [projects, setProjects] = useState<Project[]>(() => !supabase ? getStoredData('igi_demo_projects', MOCK_PROJECTS) : []);
  const [investmentPools, setInvestmentPools] = useState<InvestmentPool[]>(() => !supabase ? getStoredData('igi_demo_pools', MOCK_INVESTMENT_POOLS) : []);
  const [news, setNews] = useState<NewsPost[]>(() => !supabase ? getStoredData('igi_demo_news', MOCK_NEWS) : []);
  const [notifications, setNotifications] = useState<Notification[]>(() => !supabase ? getStoredData('igi_demo_notifications', []) : []);

  // Settings State
  const [ranks, setRanks] = useState<Rank[]>(() => getStoredData('igi_ranks', INITIAL_RANKS));
  const [currentDate, setCurrentDate] = useState(new Date('2023-11-28T12:00:00Z'));
  const [instantBonusRates, setInstantBonusRates] = useState(() => getStoredData('igi_instantRates', INITIAL_INSTANT_BONUS_RATES));
  const [teamBuilderBonusRates, setTeamBuilderBonusRates] = useState(() => getStoredData('igi_teamRates', INITIAL_TEAM_BUILDER_BONUS_RATES));
  const [treasuryWallets, setTreasuryWallets] = useState<TreasuryWallets>(() => getStoredData('igi_wallets', INITIAL_TREASURY_WALLETS));
  const [socialLinks, setSocialLinks] = useState<PlatformSocialLinks>(() => getStoredData('igi_socials', INITIAL_PLATFORM_SOCIAL_LINKS));
  const [withdrawalLimit, setWithdrawalLimit] = useState<number>(() => getStoredData('igi_withdrawalLimit', 10000));
  const [minWithdrawalLimit, setMinWithdrawalLimit] = useState<number>(() => getStoredData('igi_minWithdrawalLimit', 50));
  
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [passwordResetMode, setPasswordResetMode] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [solanaWalletAddress, setSolanaWalletAddress] = useState<string | null>(null);
  const [igiTokenBalance, setIgiTokenBalance] = useState<number | null>(null);
  const [solBalance, setSolBalance] = useState<number | null>(null);

  const refreshData = useCallback(async () => {
    if (!supabase) { setLoading(false); return; }
    try {
      const [{ data: usersData }, { data: invData }, { data: txData }, { data: bnsData }, { data: projData }, { data: poolData }, { data: newsData }, { data: notifData }] = await Promise.all([
        supabase.from('profiles').select('*'),
        supabase.from('investments').select('*'),
        supabase.from('transactions').select('*'),
        supabase.from('bonuses').select('*'),
        supabase.from('projects').select('*'),
        supabase.from('investment_pools').select('*'),
        supabase.from('news').select('*'),
        supabase.from('notifications').select('*')
      ]);

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
        projectName: i.project_name,
        poolName: i.pool_name,
        totalProfitEarned: Number(i.total_profit_earned || 0),
        source: i.source,
        apy: Number(i.apy || 0)
      })));

      if (txData) setTransactions(txData.map(t => ({
        ...t,
        userId: t.user_id,
        txHash: t.tx_hash,
        investmentId: t.investment_id,
        rejectionReason: t.rejection_reason,
        status: t.status
      })));

      if (bnsData) setBonuses(bnsData.map(b => ({ ...b, userId: b.user_id, sourceId: b.source_id })));

      if (projData) setProjects(projData.map(p => ({
          id: p.id,
          tokenName: sanitizeString(p.token_name, 'Token'),
          tokenTicker: sanitizeString(p.token_ticker, 'TKN'),
          assetType: p.asset_type || '',
          assetIdentifier: p.asset_identifier || '',
          assetDescription: p.asset_description || '',
          assetLocation: p.asset_location || '',
          assetImageUrl: p.asset_image_url || '',
          assetValuation: Number(p.asset_valuation || 0),
          valuationMethod: p.valuation_method || '',
          valuationDate: p.valuation_date || '',
          performanceHistory: p.performance_history || '',
          expectedYield: Number(p.expected_yield || 0),
          proofOfOwnership: p.proof_of_ownership || '',
          legalStructure: p.legal_structure || '',
          legalWrapper: p.legal_wrapper || '',
          jurisdiction: p.jurisdiction || '',
          regulatoryStatus: p.regulatory_status || '',
          investorRequirements: p.investor_requirements || '',
          totalTokenSupply: Number(p.total_token_supply || 0),
          tokenPrice: Number(p.token_price || 0),
          minInvestment: Number(p.min_investment || 0),
          blockchain: p.blockchain || '',
          smartContractAddress: p.smart_contract_address || '',
          distribution: p.distribution || '',
          rightsConferred: p.rights_conferred || '',
          assetCustodian: p.asset_custodian || '',
          assetManager: p.asset_manager || '',
          oracles: p.oracles || '',
          customBonusConfig: p.custom_bonus_config,
          customRankConfig: p.custom_rank_config
      })));

      if (poolData) setInvestmentPools(poolData.map(p => ({
          id: p.id,
          name: sanitizeString(p.name, 'Fund'),
          description: p.description || '',
          apy: Number(p.apy || 0),
          minInvestment: Number(p.min_investment || 0),
          customBonusConfig: p.custom_bonus_config,
          customRankConfig: p.custom_rank_config,
          projectUrl: p.project_url || '',
          linkedProjectId: p.linked_project_id || ''
      })));

      if (newsData) setNews(newsData);
      if (notifData) setNotifications(notifData.map(n => ({...n, userId: n.user_id})));
    } catch (error) { console.error("Error loading data", error); } finally { setLoading(false); }
  }, []);

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

  // Persistent storage for demo mode
  useEffect(() => { if (!supabase) setStoredData('igi_demo_users', users) }, [users]);
  useEffect(() => { if (!supabase) setStoredData('igi_demo_projects', projects) }, [projects]);
  useEffect(() => { if (!supabase) setStoredData('igi_demo_pools', investmentPools) }, [investmentPools]);
  useEffect(() => { if (!supabase) setStoredData('igi_demo_investments', investments) }, [investments]);
  useEffect(() => { if (!supabase) setStoredData('igi_demo_transactions', transactions) }, [transactions]);

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

  const executeInvestment = useCallback(async (userId: string, amount: number, assetId: string, investmentType: 'project' | 'pool', source: 'deposit' | 'profit_reinvestment') => {
    try {
        const investingUser = users.find(u => u.id === userId);
        if (!investingUser) throw new Error("User not found");

        let snapshotApy = 0;
        let assetName = '';
        
        if (investmentType === 'pool') {
            const pool = investmentPools.find(p => p.id === assetId);
            if (pool) { snapshotApy = pool.apy; assetName = pool.name; }
        } else {
            const project = projects.find(p => p.id === assetId);
            if (project) { snapshotApy = project.expectedYield; assetName = project.tokenName; }
        }
        
        const dateStr = currentDate.toISOString().split('T')[0];

        if (!supabase) {
            const newInvestment: Investment = {
                id: `inv-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                userId, amount: preciseMath(amount), date: dateStr,
                status: 'Active',
                projectId: investmentType === 'project' ? assetId : undefined,
                poolId: investmentType === 'pool' ? assetId : undefined,
                projectName: investmentType === 'project' ? assetName : undefined,
                poolName: investmentType === 'pool' ? assetName : undefined,
                totalProfitEarned: 0, source, apy: snapshotApy
            };
            setInvestments(prev => [...prev, newInvestment]);
            setTransactions(prev => [...prev, {
                id: `tx-${Date.now()}`, userId, type: source === 'profit_reinvestment' ? 'Reinvestment' : 'Investment',
                amount: preciseMath(amount), txHash: 'DEMO-HASH', date: dateStr, investmentId: newInvestment.id
            }]);
            setUsers(prev => prev.map(u => u.id === userId ? { ...u, totalInvestment: preciseMath(u.totalInvestment + amount) } : u));
        } else {
            const { data: invData, error: invError } = await supabase.from('investments').insert({
                user_id: userId, amount: preciseMath(amount), date: dateStr,
                status: 'Active', project_id: investmentType === 'project' ? assetId : null, 
                pool_id: investmentType === 'pool' ? assetId : null,
                project_name: investmentType === 'project' ? assetName : null,
                pool_name: investmentType === 'pool' ? assetName : null,
                total_profit_earned: 0, source: source, apy: snapshotApy
            }).select().single();

            if (invError) throw invError;
            
            await supabase.from('transactions').insert({
                user_id: userId, type: source === 'profit_reinvestment' ? 'Reinvestment' : 'Investment',
                amount: preciseMath(amount), tx_hash: `INTERNAL-${Date.now()}`, date: dateStr,
                investment_id: invData.id,
            });
            await supabase.from('profiles').update({ total_investment: preciseMath(investingUser.totalInvestment + amount) }).eq('id', userId);
        }
        await refreshData();
    } catch (e: any) {
        console.error("Investment failed:", e);
        alert("Investment failed: " + e.message);
    }
  }, [users, currentDate, projects, investmentPools, refreshData]);

  const addProject = useCallback(async (p: Partial<Omit<Project, 'id'>>) => {
    if (!supabase) { 
        setProjects(prev => [...prev, { id: `proj-${Date.now()}`, ...p } as Project]); 
        return; 
    } 
    // FIXED: Only include 'Core' columns to avoid errors if extended columns like 'asset_custodian' are missing from DB
    const { error } = await supabase.from('projects').insert({
        token_name: p.tokenName, 
        token_ticker: p.tokenTicker, 
        asset_type: p.assetType, 
        asset_description: p.assetDescription, 
        asset_image_url: p.assetImageUrl,
        asset_valuation: p.assetValuation, 
        expected_yield: p.expectedYield, 
        total_token_supply: p.totalTokenSupply,
        token_price: p.tokenPrice, 
        min_investment: p.minInvestment, 
        blockchain: p.blockchain, 
        custom_bonus_config: p.customBonusConfig, 
        custom_rank_config: p.customRankConfig
    });
    if (error) { 
        console.error("Error adding project:", error); 
        alert("Save failed: " + error.message); 
    }
    else { await refreshData(); }
  }, [refreshData]);

  const updateProject = useCallback(async (p: Project) => {
    if (!supabase) { setProjects(prev => prev.map(x => x.id === p.id ? p : x)); return; }
    // FIXED: Only update 'Core' columns for resilience
    const { error } = await supabase.from('projects').update({
        token_name: p.tokenName, 
        token_ticker: p.tokenTicker, 
        asset_type: p.assetType, 
        asset_description: p.assetDescription, 
        asset_image_url: p.assetImageUrl,
        asset_valuation: p.assetValuation, 
        expected_yield: p.expectedYield, 
        total_token_supply: p.totalTokenSupply,
        token_price: p.tokenPrice, 
        min_investment: p.minInvestment, 
        blockchain: p.blockchain, 
        custom_bonus_config: p.customBonusConfig, 
        custom_rank_config: p.customRankConfig
    }).eq('id', p.id);
    if (error) { 
        console.error("Error updating project:", error); 
        alert("Update failed: " + error.message); 
    }
    else { await refreshData(); }
  }, [refreshData]);

  const addInvestmentPool = useCallback(async (pool: Omit<InvestmentPool, 'id'>) => {
    if (!supabase) { setInvestmentPools(prev => [...prev, { id: `pool-${Date.now()}`, ...pool }]); return; }
    const { error } = await supabase.from('investment_pools').insert({ 
        name: pool.name, 
        description: pool.description, 
        apy: pool.apy, 
        min_investment: pool.minInvestment, 
        project_url: pool.projectUrl,
        linked_project_id: pool.linkedProjectId
    });
    if (error) { console.error("Error adding fund:", error); alert("Save failed: " + error.message); }
    else { await refreshData(); }
  }, [refreshData]);

  const updateInvestmentPool = useCallback(async (pool: InvestmentPool) => {
    if (!supabase) { setInvestmentPools(prev => prev.map(p => p.id === pool.id ? pool : p)); return; }
    const { error } = await supabase.from('investment_pools').update({ 
        name: pool.name, 
        description: pool.description, 
        apy: pool.apy, 
        min_investment: pool.minInvestment, 
        project_url: pool.projectUrl,
        linked_project_id: pool.linkedProjectId
    }).eq('id', pool.id);
    if (error) { console.error("Error updating fund:", error); alert("Update failed: " + error.message); }
    else { await refreshData(); }
  }, [refreshData]);

  const advanceDate = useCallback(async (days: number) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + days);
    setCurrentDate(newDate);

    const dailyProfitTransactions: any[] = [];
    const updatedInvestments = [...investments];

    for (let i = 1; i <= days; i++) {
        const stepDate = new Date(currentDate);
        stepDate.setDate(stepDate.getDate() + i);
        const dateStr = stepDate.toISOString().split('T')[0];

        updatedInvestments.forEach(inv => {
            if (inv.status !== 'Active') return;
            const apy = inv.apy || 0;
            if (apy > 0) {
                const dailyProfit = preciseMath(inv.amount * (apy / 100 / 365), 8);
                if (dailyProfit > 0) {
                    dailyProfitTransactions.push({
                        user_id: inv.userId,
                        type: 'Profit Share',
                        amount: dailyProfit,
                        date: dateStr,
                        tx_hash: `AUTO-PROFIT-${inv.id.slice(-4)}`,
                        investment_id: inv.id
                    });
                    inv.totalProfitEarned = preciseMath(inv.totalProfitEarned + dailyProfit);
                }
            }
        });
    }

    if (dailyProfitTransactions.length > 0) {
        if (!supabase) {
            setTransactions(prev => [...prev, ...dailyProfitTransactions.map(t => ({ ...t, userId: t.user_id, txHash: t.tx_hash, investmentId: t.investment_id }))]);
            setInvestments(updatedInvestments);
        } else {
            await supabase.from('transactions').insert(dailyProfitTransactions);
            for (const inv of updatedInvestments) {
                await supabase.from('investments').update({ total_profit_earned: inv.totalProfitEarned }).eq('id', inv.id);
            }
            await refreshData();
        }
    }
  }, [currentDate, investments, refreshData]);

  const runMonthlyCycle = useCallback(async (cycleDate: Date) => {
    const dateStr = cycleDate.toISOString().split('T')[0];
    const userUpdates: any[] = [];
    
    const getDownlineCount = (rootId: string): number => {
        const visited = new Set<string>([rootId]);
        const queue = [rootId];
        let count = 0;
        while (queue.length > 0) {
            const currentId = queue.shift()!;
            const children = users.filter(u => u.uplineId === currentId);
            for (const child of children) {
                if (!visited.has(child.id)) {
                    visited.add(child.id);
                    queue.push(child.id);
                    count++;
                }
            }
        }
        return count;
    };

    users.forEach(user => {
        if (user.role === 'admin') return;
        const teamSize = getDownlineCount(user.id);
        const currentRank = user.rank;
        let newRank = currentRank;
        
        const sortedRanks = [...ranks].sort((a,b) => b.level - a.level);
        for (const r of sortedRanks) {
            if (user.totalInvestment >= r.minTotalInvestment && teamSize >= r.minAccounts) {
                newRank = r.level;
                break;
            }
        }

        if (newRank > currentRank) {
            userUpdates.push({ id: user.id, rank: newRank, teamSize });
        }
    });

    if (userUpdates.length > 0) {
        if (!supabase) {
            setUsers(prev => prev.map(u => {
                const update = userUpdates.find(x => x.id === u.id);
                return update ? { ...u, rank: update.rank, totalDownline: update.teamSize } : u;
            }));
        } else {
            for (const up of userUpdates) {
                await supabase.from('profiles').update({ rank: up.rank, total_downline: up.teamSize }).eq('id', up.id);
                await supabase.from('notifications').insert({
                    user_id: up.id,
                    type: 'Rank Promotion',
                    message: `Congratulations! You have reached Rank L${up.rank}!`,
                    date: dateStr
                });
            }
            await refreshData();
        }
    }
  }, [users, ranks, refreshData]);

  const login = useCallback(async (email: string, password: string) => {
    if (!supabase) {
        const user = users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());
        if (user && (user.password === password || password === 'password')) {
             if(user.isFrozen) throw new Error("Account is frozen.");
             setCurrentUser(user);
             localStorage.setItem('igi_demo_session', user.id);
        } else throw new Error("Invalid credentials");
        return;
    }
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }, [users]);

  const signup = useCallback(async (userData: Partial<User>) => {
      if (!supabase) {
          const newUser: User = { id: `user-${Date.now()}`, name: userData.name!, email: userData.email!, password: userData.password, wallet: `0x${Math.random().toString(16).slice(2, 42)}`, rank: 1, uplineId: userData.uplineId || null, referralCode: `${userData.name?.split(' ')[0].toUpperCase() || 'USER'}${Math.floor(1000 + Math.random() * 9000)}`, totalInvestment: 0, totalDownline: 0, monthlyIncome: 0, kycStatus: 'Not Submitted', avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name || 'User')}&background=random&color=fff&size=128`, country: userData.country || 'Global', isFrozen: false, role: 'user', achievements: [], joinDate: new Date().toISOString().split('T')[0] };
          setUsers(prev => [...prev, newUser]);
          alert("Account created! (Demo Mode)");
      } else {
          const { error } = await supabase.auth.signUp({ email: userData.email!, password: userData.password!, options: { data: { name: userData.name, upline_id: userData.uplineId } } });
          if (error) throw error;
          alert("Check your email for confirmation!");
      }
  }, []);

  const logout = useCallback(async () => { if (supabase) await supabase.auth.signOut(); localStorage.removeItem('igi_demo_session'); setCurrentUser(null); }, []);
  const sendPasswordResetEmail = useCallback(async (email: string) => { if (supabase) await supabase.auth.resetPasswordForEmail(email); }, []);
  const updateUserPassword = useCallback(async (password: string) => { if (supabase) await supabase.auth.updateUser({ password }); }, []);
  const toggleFreezeUser = useCallback(async (userId: string) => { const user = users.find(u => u.id === userId); if (user && supabase) await supabase.from('profiles').update({ is_frozen: !user.isFrozen }).eq('id', userId); await refreshData(); }, [users, refreshData]);
  const updateKycStatus = useCallback(async (userId: string, status: any) => { if (supabase) await supabase.from('profiles').update({ kyc_status: status }).eq('id', userId); await refreshData(); }, [refreshData]);
  const updateUser = useCallback(async (updatedUser: User) => { if (supabase) await supabase.from('profiles').update({ name: updatedUser.name, avatar: updatedUser.avatar, wallet: updatedUser.wallet, rank: updatedUser.rank }).eq('id', updatedUser.id); await refreshData(); }, [refreshData]);
  const deleteUser = useCallback(async (id: string) => { if(window.confirm('Delete user?')) { if (supabase) await supabase.from('profiles').delete().eq('id', id); await refreshData(); } }, [refreshData]);
  const deleteInvestment = useCallback(async (id: string) => { if(window.confirm('Delete?')) { if (supabase) await supabase.from('investments').delete().eq('id', id); await refreshData(); } }, [refreshData]);
  const deleteProject = useCallback(async (id: string) => { if(window.confirm('Delete project?')) { if (supabase) await supabase.from('projects').delete().eq('id', id); await refreshData(); } }, [refreshData]);
  const deleteInvestmentPool = useCallback(async (id: string) => { if(window.confirm('Delete fund?')) { if (supabase) await supabase.from('investment_pools').delete().eq('id', id); await refreshData(); } }, [refreshData]);
  const updateRankSettings = useCallback((r: Rank[]) => setRanks(r), []);
  const addManualTransaction = useCallback(async (userId: string, type: any, amount: number, reason: string) => { if (supabase) await supabase.from('transactions').insert({ user_id: userId, type, amount, reason, date: currentDate.toISOString().split('T')[0], tx_hash: `MANUAL-${Date.now()}` }); await refreshData(); }, [currentDate, refreshData]);
  const addNewsPost = useCallback(async (post: any) => { if (supabase) await supabase.from('news').insert(post); await refreshData(); }, [refreshData]);
  const deleteNewsPost = useCallback(async (id: string) => { if (supabase) await supabase.from('news').delete().eq('id', id); await refreshData(); }, [refreshData]);
  const adjustUserRank = useCallback(async (userId: string, newRank: number, reason: string) => { if (supabase) await supabase.from('profiles').update({ rank: newRank }).eq('id', userId); await refreshData(); }, [refreshData]);
  const connectSolanaWallet = useCallback(async () => { if (window.solana) { try { const r = await window.solana.connect(); setSolanaWalletAddress(r.publicKey.toString()); } catch (err) {} } }, []);
  const disconnectSolanaWallet = useCallback(() => { if (window.solana) window.solana.disconnect(); setSolanaWalletAddress(null); }, []);
  const fetchAllBalances = useCallback(async () => {}, []);
  const approveDeposit = useCallback(async (id: string, bonus: number = 0, autoInvest?: any) => {
    if (supabase) {
        await supabase.from('transactions').update({ status: 'completed' }).eq('id', id);
        if (bonus > 0) await supabase.from('transactions').insert({ user_id: transactions.find(t=>t.id===id)?.userId, type: 'Manual Bonus', amount: bonus, reason: 'Deposit Bonus', date: currentDate.toISOString().split('T')[0], tx_hash: `BONUS-${Date.now()}` });
        if (autoInvest) {
            const tx = transactions.find(t=>t.id===id);
            if (tx) await executeInvestment(tx.userId, tx.amount, autoInvest.id, autoInvest.type, 'deposit');
        }
        await refreshData();
    }
  }, [refreshData, transactions, currentDate, executeInvestment]);
  
  const rejectDeposit = useCallback(async (id: string, reason: string) => { if (supabase) await supabase.from('transactions').update({ status: 'rejected', rejection_reason: reason }).eq('id', id); await refreshData(); }, [refreshData]);
  const approveWithdrawal = useCallback(async (id: string, txHash: string) => { if (supabase) await supabase.from('transactions').update({ status: 'completed', tx_hash: txHash }).eq('id', id); await refreshData(); }, [refreshData]);
  const rejectWithdrawal = useCallback(async (id: string, reason: string) => { if (supabase) await supabase.from('transactions').update({ status: 'rejected', rejection_reason: reason }).eq('id', id); await refreshData(); }, [refreshData]);
  const createUser = useCallback(async (u: any, init?: any[]) => { alert("API usage only for bulk creation."); }, []);
  const updateUserRole = useCallback(async (id: string, role: string) => { if (supabase) await supabase.from('profiles').update({ role: role.toLowerCase() }).eq('id', id); await refreshData(); }, [refreshData]);
  const addInvestmentForUser = useCallback(async (id: string, amt: number, aid: string, t: any, s: any) => { await executeInvestment(id, amt, aid, t, s); }, [executeInvestment]);
  const confirmCryptoInvestment = useCallback(async (id: string, amt: number, aid: string, t: any) => { await executeInvestment(id, amt, aid, t, 'deposit'); }, [executeInvestment]);
  const updateInvestment = useCallback(async (inv: any) => { if (supabase) await supabase.from('investments').update({ amount: inv.amount, status: inv.status }).eq('id', inv.id); await refreshData(); }, [refreshData]);
  const updateNewsPost = useCallback(async (p: any) => { if (supabase) await supabase.from('news').update({ title: p.title, content: p.content }).eq('id', p.id); await refreshData(); }, [refreshData]);
  const updateBonusRates = useCallback((i: any, t: any) => { setInstantBonusRates(i); setTeamBuilderBonusRates(t); }, []);
  const updateTreasuryWallets = useCallback((w: any) => setTreasuryWallets(w), []);
  const updateSocialLinks = useCallback((s: any) => setSocialLinks(s), []);
  const updateWithdrawalLimit = useCallback((l: any) => setWithdrawalLimit(l), []);
  const updateMinWithdrawalLimit = useCallback((l: any) => setMinWithdrawalLimit(l), []);
  const seedDatabase = useCallback(async () => { if (supabase) { setLoading(true); await supabase.from('news').insert(MOCK_NEWS.map(n => ({ title: n.title, content: n.content, author: n.author, date: n.date }))); refreshData(); } }, [refreshData]);
  const sendReferralInvite = useCallback(async (email: string) => { window.location.href = `mailto:${email}?subject=Invitation`; }, []);
  const addInvestmentFromBalance = useCallback(async (amt: number, aid: string, type: any, src: any) => { if (currentUser) await executeInvestment(currentUser.id, amt, aid, type, src); }, [currentUser, executeInvestment]);
  const addCryptoDeposit = useCallback(async (amt: number, tx: string, r?: string) => { if (supabase && currentUser) { await supabase.from('transactions').insert({ user_id: currentUser.id, type: 'Deposit', amount: amt, tx_hash: tx, status: 'pending', reason: r, date: currentDate.toISOString().split('T')[0] }); await refreshData(); } }, [currentUser, currentDate, refreshData]);
  const markNotificationsAsRead = useCallback(async () => { if (supabase && currentUser) { await supabase.from('notifications').update({ read: true }).eq('user_id', currentUser.id); await refreshData(); } }, [currentUser, refreshData]);
  const addWithdrawal = useCallback(async (amt: number, addr: string) => { if (supabase && currentUser) { await supabase.from('transactions').insert({ user_id: currentUser.id, type: 'Withdrawal', amount: amt, status: 'pending', reason: `Withdraw to: ${addr}`, date: currentDate.toISOString().split('T')[0], tx_hash: 'PENDING' }); await refreshData(); } }, [currentUser, currentDate, refreshData]);

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
