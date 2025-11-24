
import React from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string; // Added for auth
  wallet: string;
  rank: number; // L1-L9 represented as 1-9
  uplineId: string | null;
  referralCode: string;
  totalInvestment: number;
  totalDownline: number;
  monthlyIncome: number;
  kycStatus: 'Verified' | 'Pending' | 'Rejected' | 'Not Submitted';
  avatar: string;
  country: string;
  isFrozen?: boolean;
  role: 'user' | 'admin';
  achievements: string[]; // Stores achievement IDs now, not names
  joinDate: string;
}

export interface Project {
  id: string;
  
  // Asset Details
  assetType: string;
  assetIdentifier: string;
  assetDescription: string;
  assetLocation: string;
  assetImageUrl: string;

  // Financial & Valuation
  assetValuation: number;
  valuationMethod: string;
  valuationDate: string;
  performanceHistory: string;
  expectedYield: number; // This replaces APY

  // Legal & Compliance
  proofOfOwnership: string;
  legalStructure: string;
  legalWrapper: string;
  jurisdiction: string;
  regulatoryStatus: string;
  investorRequirements: string;

  // Tokenomics
  tokenName: string;
  tokenTicker: string;
  totalTokenSupply: number;
  tokenPrice: number;
  minInvestment: number;
  blockchain: string;
  smartContractAddress: string;
  distribution: string;
  rightsConferred: string;

  // Custody & Management
  assetCustodian: string;
  assetManager: string;
  oracles: string;
}

export interface InvestmentPool {
  id: string;
  name: string;
  description: string;
  apy: number; // Annual Percentage Yield
  minInvestment: number;
}


export interface Investment {
  id: string;
  userId: string;
  amount: number;
  date: string;
  status: 'Active' | 'Completed';
  projectId?: string;
  projectName?: string;
  poolId?: string;
  poolName?: string;
  totalProfitEarned: number;
  source: 'deposit' | 'profit_reinvestment';
}

export interface Bonus {
  id: string;
  userId: string;
  type: 'Instant' | 'Team Builder' | 'Leadership' | 'Asset Growth';
  sourceId: string; // e.g., investment ID or user ID
  amount: number;
  date: string;
  read?: boolean;
}

export interface Transaction {
  id: string;
  userId: string;
  type: 'Deposit' | 'Withdrawal' | 'Bonus' | 'Reinvestment' | 'Investment' | 'Manual Bonus' | 'Manual Deduction' | 'Profit Share';
  amount: number;
  txHash: string;
  date: string;
  reason?: string; // For manual adjustments
  investmentId?: string;
  status?: 'pending' | 'completed' | 'rejected'; // For deposits
  rejectionReason?: string; // For rejected deposits
}

export interface Rank {
  level: number;
  name: string;
  minAccounts: number;
  newlyQualified: number;
  fixedBonus: number;
}

export interface NewsPost {
  id:string;
  title: string;
  content: string;
  date: string;
  author: string;
}

export interface Achievement {
  id: string;
  nameKey: string;
  descriptionKey: string;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  criteria: (user: User, allUsers: User[]) => boolean;
}

export interface MarketingResource {
    id: string;
    type: 'banner' | 'text' | 'presentation';
    title: string;
    description: string;
    content: string; // URL for banner/presentation, template for text
    thumbnailUrl?: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'Rank Promotion' | 'New Downline' | 'KYC Update';
  message: string;
  date: string;
  read?: boolean;
}

export interface TreasuryWallets {
  erc20: string;
  trc20: string;
  polygon: string;
  solana: string;
}


export enum View {
  DASHBOARD = 'dashboard',
  NETWORK = 'network',
  WALLET = 'wallet',
  PROFILE = 'profile',
  LEADERBOARD = 'leaderboard',
  RESOURCES = 'resources',
  USER_MANUAL = 'user_manual',
  PROJECTS = 'projects',
  FUNDS = 'funds',
}

declare global {
  interface Window {
    solana?: any;
    solanaWeb3?: any;
    splToken?: any;
  }
}
