
import React, { createContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { useLocalization } from '../hooks/useLocalization';
import { User, Investment, Transaction, Bonus, Rank, NewsPost, Notification, Project, InvestmentPool, TreasuryWallets, PlatformSocialLinks } from '../types';
import { 
  INITIAL_RANKS, 
  INITIAL_TEAM_BUILDER_BONUS_RATES, 
  INITIAL_INSTANT_BONUS_RATES, 
  INITIAL_TREASURY_WALLETS, 
  INITIAL_PLATFORM_SOCIAL_LINKS,
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
  setIsLoading: (loading: boolean) => void;
  isDemoMode: boolean;
  refreshData: () => Promise<void>;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

const sanitizeString = (val: string | null | undefined, fallback: string): string => {
    if (!val || val === 'null' || val === 'undefined') return fallback;
    return val;
};

export const AppContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { t } = useLocalization();
  const [loading, setLoading] = useState(true);

  // Data State
  const [users, setUsers] = useState<User[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [bonuses, setBonuses] = useState<Bonus[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [investmentPools, setInvestmentPools] = useState<InvestmentPool[]>([]);
  const [news, setNews] = useState<NewsPost[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Platform Settings
  const [ranks, setRanks] = useState<Rank[]>(INITIAL_RANKS);
  const [currentDate, setCurrentDate] = useState(new Date('2023-11-28T12:00:00Z'));
  const [instantBonusRates, setInstantBonusRates] = useState(INITIAL_INSTANT_BONUS_RATES);
  const [teamBuilderBonusRates, setTeamBuilderBonusRates] = useState(INITIAL_TEAM_BUILDER_BONUS_RATES);
  const [treasuryWallets, setTreasuryWallets] = useState<TreasuryWallets>(INITIAL_TREASURY_WALLETS);
  const [socialLinks, setSocialLinks] = useState<PlatformSocialLinks>(INITIAL_PLATFORM_SOCIAL_LINKS);
  const [withdrawalLimit, setWithdrawalLimit] = useState<number>(10000);
  const [minWithdrawalLimit, setMinWithdrawalLimit] = useState<number>(50);
  
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
      const results = await Promise.allSettled([
        supabase.from('profiles').select('*'),
        supabase.from('investments').select('*'),
        supabase.from('transactions').select('*'),
        supabase.from('bonuses').select('*'),
        supabase.from('projects').select('*'),
        supabase.from('investment_pools').select('*'),
        supabase.from('news').select('*'),
        supabase.from('notifications').select('*')
      ]);

      const [usersRes, invRes, txRes, bnsRes, projRes, poolRes, newsRes, notifRes] = results;

      let freshUsers: User[] = [];
      if (usersRes.status === 'fulfilled' && usersRes.value.data) {
          freshUsers = usersRes.value.data.map(u => ({
              ...u,
              id: u.id,
              name: sanitizeString(u.name, 'User'),
              email: u.email,
              wallet: u.wallet || '',
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
          }));
          setUsers(freshUsers);

          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
              const freshSelf = freshUsers.find(u => u.id === session.user.id);
              if (freshSelf) {
                  setCurrentUser(freshSelf);
              }
          }
      }
      
      if (invRes.status === 'fulfilled' && invRes.value.data) setInvestments(invRes.value.data.map(i => ({
        ...i,
        userId: i.user_id,
        projectId: i.project_id,
        poolId: i.pool_id,
        projectName: i.project_name,
        poolName: i.pool_name,
        totalProfitEarned: Number(i.total_profit_earned || 0),
        source: i.source,
        apy: i.apy !== undefined ? Number(i.apy || 0) : undefined
      })));

      if (txRes.status === 'fulfilled' && txRes.value.data) setTransactions(txRes.value.data.map(t => ({
        ...t,
        userId: t.user_id,
        txHash: t.tx_hash,
        investmentId: t.investment_id,
        rejectionReason: t.rejection_reason,
        status: t.status
      })));

      if (bnsRes.status === 'fulfilled' && bnsRes.value.data) setBonuses(bnsRes.value.data.map(b => ({ ...b, userId: b.user_id, sourceId: b.source_id })));

      if (projRes.status === 'fulfilled' && projRes.value.data) setProjects(projRes.value.data.map(p => ({
          ...p,
          id: p.id,
          tokenName: sanitizeString(p.token_name, 'Project'),
          expectedYield: Number(p.expected_yield || 0),
          minInvestment: Number(p.min_investment || 0)
      })));

      if (poolRes.status === 'fulfilled' && poolRes.value.data) setInvestmentPools(poolRes.value.data.map(p => ({
          ...p,
          id: p.id,
          name: sanitizeString(p.name, 'Fund'),
          apy: Number(p.apy || 0),
          minInvestment: Number(p.min_investment || 0)
      })));

      if (newsRes.status === 'fulfilled' && newsRes.value.data) setNews(newsRes.value.data);
      if (notifRes.status === 'fulfilled' && notifRes.value.data) setNotifications(notifRes.value.data.map(n => ({...n, userId: n.user_id})));
    } catch (error) { 
        console.error("Critical error in refreshData:", error); 
    } finally { 
        setLoading(false); 
    }
  }, []);

  useEffect(() => {
    if (!supabase) {
        setUsers(MOCK_USERS);
        setInvestments(MOCK_INVESTMENTS);
        setTransactions(MOCK_TRANSACTIONS);
        setBonuses(MOCK_BONUSES);
        setProjects(MOCK_PROJECTS);
        setInvestmentPools(MOCK_INVESTMENT_POOLS);
        setNews(MOCK_NEWS);
        const storedSessionId = localStorage.getItem('igi_demo_session');
        if (storedSessionId) {
            const user = MOCK_USERS.find(u => u.id === storedSessionId);
            if (user) setCurrentUser(user);
        }
        setLoading(false);
        return;
    }
    
    let isSubscribed = true;

    const initialize = async () => {
        try {
            await refreshData();
        } catch (e) {
            console.error("Initialization failed", e);
        } finally {
            if (isSubscribed) setLoading(false);
        }
    };

    initialize();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'PASSWORD_RECOVERY') setPasswordResetMode(true);
      if (session?.user) {
          // If we already have a user, refreshData will update them
          await refreshData();
      } else {
          setCurrentUser(null);
          if (isSubscribed) setLoading(false);
      }
    });

    return () => {
        isSubscribed = false;
        subscription.unsubscribe();
    };
  }, [refreshData]);

  const login = useCallback(async (email: string, password: string) => {
    if (!supabase) {
        const user = MOCK_USERS.find(u => u.email.toLowerCase() === email.toLowerCase().trim());
        if (user && (user.password === password || password === 'password')) {
             if(user.isFrozen) throw new Error("Account is frozen.");
             setCurrentUser(user);
             localStorage.setItem('igi_demo_session', user.id);
        } else throw new Error("Invalid credentials");
        return;
    }
    
    const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) throw error;

    if (data.user) {
        // Attempt to fetch profile immediately
        let { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .maybeSingle();
        
        // Auto-create profile if missing
        if (!profile) {
            const { data: newProfile, error: createError } = await supabase
                .from('profiles')
                .insert({
                    id: data.user.id,
                    email: data.user.email,
                    name: data.user.user_metadata?.name || email.split('@')[0],
                    role: 'user',
                    rank: 1,
                    kyc_status: 'Not Submitted',
                    join_date: new Date().toISOString().split('T')[0],
                    referral_code: `IGI${Math.floor(1000 + Math.random() * 9000)}`
                })
                .select()
                .single();
            
            if (createError) {
                console.error("Error creating profile:", createError);
                throw new Error("Login successful but failed to initialize your profile. Please contact support.");
            }
            profile = newProfile;
        }
        
        if (profile?.is_frozen) {
            await supabase.auth.signOut();
            throw new Error("Account is frozen.");
        }
        
        // Map and set the user immediately so the UI can transition
        const loggedInUser: User = {
            ...profile,
            id: profile.id,
            name: profile.name,
            email: profile.email,
            wallet: profile.wallet || '',
            role: (profile.role || 'user').toLowerCase().trim(),
            rank: profile.rank || 1,
            totalInvestment: Number(profile.total_investment || 0),
            totalDownline: Number(profile.total_downline || 0),
            monthlyIncome: Number(profile.monthly_income || 0),
            kycStatus: profile.kyc_status,
            joinDate: profile.join_date,
            referralCode: profile.referral_code,
            avatar: profile.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=random`,
            achievements: profile.achievements || []
        };
        
        setCurrentUser(loggedInUser);
        
        // Trigger background refresh for other data tables
        refreshData(); 
    }
  }, [refreshData]);
  
  // Rest of the AppContext remains the same
  const signup = useCallback(async (userData: Partial<User>) => {
      if (!supabase) {
        alert("Signup is disabled in demo mode.");
        return;
      }
      const { error } = await supabase.auth.signUp({ 
          email: userData.email!.trim(), 
          password: userData.password!, 
          options: { 
              data: { 
                  name: userData.name, 
                  upline_id: userData.uplineId, 
                  country: userData.country 
              } 
          } 
      });
      if (error) throw error;
      alert("Registration successful! Check your email for verification.");
  }, []);

  const getUserBalances = useCallback((userId: string) => {
      const userTransactions = transactions.filter(t => t.userId === userId);
      const userInvestments = investments.filter(i => i.userId === userId);

      const totalDeposits = userTransactions
        .filter(t => (t.type === 'Deposit' && t.status === 'completed') || (t.type === 'Deposit' && t.status === undefined) || t.type === 'Manual Bonus')
        .reduce((sum, t) => sum + t.amount, 0);

      const totalProfits = userTransactions.filter(t => t.type === 'Profit Share' || t.type === 'Bonus').reduce((sum, t) => sum + t.amount, 0);
      
      const totalWithdrawals = userTransactions
        .filter(t => (t.type === 'Withdrawal' && t.status !== 'rejected') || t.type === 'Manual Deduction')
        .reduce((sum, t) => sum + t.amount, 0);

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

        let assetName = '';
        if (investmentType === 'pool') {
            const pool = investmentPools.find(p => p.id === assetId);
            if (pool) assetName = pool.name;
        } else {
            const project = projects.find(p => p.id === assetId);
            if (project) assetName = project.tokenName;
        }
        
        const dateStr = currentDate.toISOString().split('T')[0];

        if (!supabase) {
            const newInvestment: Investment = {
                id: `inv-${Date.now()}`,
                userId, amount: preciseMath(amount), date: dateStr,
                status: 'Active',
                projectId: investmentType === 'project' ? assetId : undefined,
                poolId: investmentType === 'pool' ? assetId : undefined,
                projectName: investmentType === 'project' ? assetName : undefined,
                poolName: investmentType === 'pool' ? assetName : undefined,
                totalProfitEarned: 0, source
            };
            setInvestments(prev => [...prev, newInvestment]);
            setTransactions(prev => [...prev, {
                id: `tx-${Date.now()}`, userId, type: source === 'profit_reinvestment' ? 'Reinvestment' : 'Investment',
                amount: preciseMath(amount), txHash: 'INTERNAL', date: dateStr, investmentId: newInvestment.id
            }]);
            setUsers(prev => prev.map(u => u.id === userId ? { ...u, totalInvestment: preciseMath(u.totalInvestment + amount) } : u));
        } else {
            const insertPayload: any = {
                user_id: userId,
                amount: preciseMath(amount),
                date: dateStr,
                status: 'Active',
                project_id: investmentType === 'project' ? assetId : null, 
                pool_id: investmentType === 'pool' ? assetId : null,
                project_name: investmentType === 'project' ? assetName : null,
                pool_name: investmentType === 'pool' ? assetName : null,
                total_profit_earned: 0,
                source: source
            };

            const { data: invData, error: invError } = await supabase.from('investments').insert(insertPayload).select().single();
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
        console.error("Investment execution failed:", e);
        throw e;
    }
  }, [users, currentDate, projects, investmentPools, refreshData]);

  const updateUser = useCallback(async (updatedUser: User) => {
    if (!supabase) {
        setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
        if (currentUser?.id === updatedUser.id) setCurrentUser(updatedUser);
        return;
    }
    const { error } = await supabase.from('profiles').update({
        name: updatedUser.name,
        avatar: updatedUser.avatar,
        wallet: updatedUser.wallet,
        rank: updatedUser.rank,
        country: updatedUser.country
    }).eq('id', updatedUser.id);
    if (error) throw error;
    await refreshData();
  }, [refreshData, currentUser]);

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
            let apy = 0;
            if (inv.projectId) {
                const p = projects.find(proj => proj.id === inv.projectId);
                apy = p ? p.expectedYield : 0;
            } else if (inv.poolId) {
                const pool = investmentPools.find(p => p.id === inv.poolId);
                apy = pool ? pool.apy : 0;
            }

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
  }, [currentDate, investments, projects, investmentPools, refreshData]);

  const logout = useCallback(async () => { 
    if (supabase) await supabase.auth.signOut(); 
    localStorage.removeItem('igi_demo_session'); 
    setCurrentUser(null); 
  }, []);

  const runMonthlyCycle = useCallback(async (cycleDate: Date) => {
    if (supabase) {
        await refreshData();
    }
  }, [refreshData]);

  const sendPasswordResetEmail = useCallback(async (email: string) => { if (supabase) await supabase.auth.resetPasswordForEmail(email.trim()); }, []);
  const updateUserPassword = useCallback(async (password: string) => { if (supabase) await supabase.auth.updateUser({ password }); }, []);
  const toggleFreezeUser = useCallback(async (userId: string) => { const user = users.find(u => u.id === userId); if (user && supabase) await supabase.from('profiles').update({ is_frozen: !user.isFrozen }).eq('id', userId); await refreshData(); }, [users, refreshData]);
  const updateKycStatus = useCallback(async (userId: string, status: any) => { if (supabase) await supabase.from('profiles').update({ kyc_status: status }).eq('id', userId); await refreshData(); }, [refreshData]);
  const deleteUser = useCallback(async (id: string) => { if(window.confirm('Delete user?')) { if (supabase) await supabase.from('profiles').delete().eq('id', id); await refreshData(); } }, [refreshData]);
  const deleteInvestment = useCallback(async (id: string) => { if(window.confirm('Delete?')) { if (supabase) await supabase.from('investments').delete().eq('id', id); await refreshData(); } }, [refreshData]);
  const updateRankSettings = useCallback((r: Rank[]) => setRanks(r), []);
  const addManualTransaction = useCallback(async (userId: string, type: any, amount: number, reason: string) => { if (supabase) await supabase.from('transactions').insert({ user_id: userId, type, amount: preciseMath(amount), reason, date: currentDate.toISOString().split('T')[0], tx_hash: `MANUAL-${Date.now()}` }); await refreshData(); }, [currentDate, refreshData]);
  const addNewsPost = useCallback(async (post: any) => { if (supabase) await supabase.from('news').insert(post); await refreshData(); }, [refreshData]);
  const deleteNewsPost = useCallback(async (id: string) => { if (supabase) await supabase.from('news').delete().eq('id', id); await refreshData(); } , [refreshData]);
  const addProject = useCallback(async (p: any) => { if (supabase) await supabase.from('projects').insert(p); await refreshData(); }, [refreshData]);
  const updateProject = useCallback(async (p: any) => { if (supabase) await supabase.from('projects').update(p).eq('id', p.id); await refreshData(); }, [refreshData]);
  const deleteProject = useCallback(async (id: string) => { if (supabase) await supabase.from('projects').delete().eq('id', id); await refreshData(); }, [refreshData]);
  const addInvestmentPool = useCallback(async (pool: any) => { if (supabase) await supabase.from('investment_pools').insert(pool); await refreshData(); }, [refreshData]);
  const updateInvestmentPool = useCallback(async (pool: any) => { if (supabase) await supabase.from('investment_pools').update(pool).eq('id', pool.id); await refreshData(); }, [refreshData]);
  const deleteInvestmentPool = useCallback(async (id: string) => { if (supabase) await supabase.from('investment_pools').delete().eq('id', id); await refreshData(); }, [refreshData]);
  const adjustUserRank = useCallback(async (userId: string, newRank: number, reason: string) => { if (supabase) await supabase.from('profiles').update({ rank: newRank }).eq('id', userId); await refreshData(); }, [refreshData]);
  const connectSolanaWallet = useCallback(async () => { if (window.solana) { try { const r = await window.solana.connect(); setSolanaWalletAddress(r.publicKey.toString()); } catch (err) {} } }, []);
  const disconnectSolanaWallet = useCallback(() => { if (window.solana) window.solana.disconnect(); setSolanaWalletAddress(null); }, []);
  const fetchAllBalances = useCallback(async () => {}, []);
  const approveDeposit = useCallback(async (id: string, bonus: number = 0, autoInvest?: any) => {
    if (supabase) {
        await supabase.from('transactions').update({ status: 'completed' }).eq('id', id);
        if (bonus > 0) {
            const tx = transactions.find(t => t.id === id);
            await supabase.from('transactions').insert({ user_id: tx?.userId, type: 'Manual Bonus', amount: preciseMath(bonus), reason: 'Deposit Bonus', date: currentDate.toISOString().split('T')[0], tx_hash: `BONUS-${Date.now()}` });
        }
        if (autoInvest) {
            const tx = transactions.find(t => t.id === id);
            if (tx) await executeInvestment(tx.userId, tx.amount, autoInvest.id, autoInvest.type, 'deposit');
        }
        await refreshData();
    }
  }, [refreshData, transactions, currentDate, executeInvestment]);
  
  const rejectDeposit = useCallback(async (id: string, reason: string) => { if (supabase) await supabase.from('transactions').update({ status: 'rejected', rejection_reason: reason }).eq('id', id); await refreshData(); }, [refreshData]);
  const approveWithdrawal = useCallback(async (id: string, txHash: string) => { if (supabase) await supabase.from('transactions').update({ status: 'completed', tx_hash: txHash }).eq('id', id); await refreshData(); }, [refreshData]);
  const rejectWithdrawal = useCallback(async (id: string, reason: string) => { if (supabase) await supabase.from('transactions').update({ status: 'rejected', rejection_reason: reason }).eq('id', id); await refreshData(); }, [refreshData]);
  const createUser = useCallback(async (u: any, init?: any[]) => {}, []);
  const updateUserRole = useCallback(async (id: string, role: string) => { if (supabase) await supabase.from('profiles').update({ role: role.toLowerCase() }).eq('id', id); await refreshData(); }, [refreshData]);
  const addInvestmentForUser = useCallback(async (id: string, amt: number, aid: string, t: any, s: any) => { await executeInvestment(id, amt, aid, t, s); }, [executeInvestment]);
  const confirmCryptoInvestment = useCallback(async (id: string, amt: number, aid: string, t: any) => { await executeInvestment(id, amt, aid, t, 'deposit'); }, [executeInvestment]);
  const updateInvestment = useCallback(async (inv: any) => { if (supabase) await supabase.from('investments').update({ amount: preciseMath(inv.amount), status: inv.status }).eq('id', inv.id); await refreshData(); }, [refreshData]);
  const updateNewsPost = useCallback(async (p: any) => { if (supabase) await supabase.from('news').update({ title: p.title, content: p.content }).eq('id', p.id); await refreshData(); }, [refreshData]);
  const updateBonusRates = useCallback((i: any, t: any) => { setInstantBonusRates(i); setTeamBuilderBonusRates(t); }, []);
  const updateTreasuryWallets = useCallback((w: any) => setTreasuryWallets(w), []);
  const updateSocialLinks = useCallback((s: any) => setSocialLinks(s), []);
  const updateWithdrawalLimit = useCallback((l: any) => setWithdrawalLimit(l), []);
  const updateMinWithdrawalLimit = useCallback((l: any) => setMinWithdrawalLimit(l), []);
  const seedDatabase = useCallback(async () => {}, []);
  const sendReferralInvite = useCallback(async (email: string) => { window.location.href = `mailto:${email.trim()}?subject=Invitation`; }, []);
  const addInvestmentFromBalance = useCallback(async (amt: number, aid: string, type: any, src: any) => { if (currentUser) await executeInvestment(currentUser.id, amt, aid, type, src); }, [currentUser, executeInvestment]);
  const addCryptoDeposit = useCallback(async (amt: number, tx: string, r?: string) => { if (supabase && currentUser) { await supabase.from('transactions').insert({ user_id: currentUser.id, type: 'Deposit', amount: preciseMath(amt), tx_hash: tx, status: 'pending', reason: r, date: currentDate.toISOString().split('T')[0] }); await refreshData(); } }, [currentUser, currentDate, refreshData]);
  const markNotificationsAsRead = useCallback(async () => { if (supabase && currentUser) { await supabase.from('notifications').update({ read: true }).eq('user_id', currentUser.id); await refreshData(); } }, [currentUser, refreshData]);
  const addWithdrawal = useCallback(async (amt: number, addr: string) => { if (supabase && currentUser) { await supabase.from('transactions').insert({ user_id: currentUser.id, type: 'Withdrawal', amount: preciseMath(amt), status: 'pending', reason: `Withdraw to: ${addr}`, date: currentDate.toISOString().split('T')[0], tx_hash: 'PENDING' }); await refreshData(); } }, [currentUser, currentDate, refreshData]);

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
      login, signup, logout, sendPasswordResetEmail, updateUserPassword, passwordResetMode, setPasswordResetMode, inviteModalOpen, setInviteModalOpen, loading, setIsLoading: setLoading, isDemoMode: !supabase,
      refreshData
    }}>
      {children}
    </AppContext.Provider>
  );
};
