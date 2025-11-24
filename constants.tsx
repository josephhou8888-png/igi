
import React from 'react';
import { Rank, User, Investment, Transaction, Bonus, NewsPost, Achievement, MarketingResource, Project, InvestmentPool, TreasuryWallets } from './types';

// SVG Icons as React Components
export const HomeIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
);
export const BriefcaseIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
);
export const NetworkIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="14" y="14" width="8" height="8" rx="2" ry="2"/><rect x="2" y="14" width="8" height="8" rx="2" ry="2"/><rect x="2" y="2" width="8" height="8" rx="2" ry="2"/><line x1="6" y1="14" x2="6" y2="10"/><line x1="18" y1="14" x2="18" y2="10"/><line x1="14" y1="6" x2="10" y2="6"/></svg>
);
export const WalletIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg>
);
export const AdminIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
);
export const UserIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
);
export const BellIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
);
export const ChevronDownIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="6 9 12 15 18 9"/></svg>
);
export const CopyIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
);
export const LogOutIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
);
export const TrophyIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
);
export const PlusCircleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
);
export const AwardIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>
);
export const FileTextIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
);
export const CameraIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
);
export const MegaphoneIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m3 11 18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/></svg>
);
export const ShareIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
);
export const TrendingUpIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
);
export const TrendingDownIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></svg>
);
export const PercentIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="19" y1="5" x2="5" y2="19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg>
);
export const BookOpenIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
);
export const GlobeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
);
export const MenuIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
);
export const MailIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
);


export const WhatsAppIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="currentColor" {...props}><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.886-.001 2.267.651 4.39 1.88 6.166l-1.29 4.721 4.793-1.251zm5.343-9.587c-.152-.076-.895-.442-1.032-.492s-.238-.076-.341.076c-.103.151-.391.491-.479.59c-.088.098-.176.113-.312.038c-.136-.076-1.031-.383-1.963-1.209c-.724-.658-1.212-1.47-1.358-1.716c-.146-.246-.013-.38.063-.503c.068-.113.151-.194.228-.291c.077-.098.102-.164.152-.271s.025-.208-.025-.283c-.05-.076-.341-.815-.465-.936s-.246-.102-.341-.102h-.341c-.102 0-.25.038-.376.19c-.125.151-.478.464-.478 1.144s.489 1.328.565 1.425c.076.098.969 1.554 2.353 2.203c.33.162.589.259.79.33c.312.102.593.09.814-.057c.246-.164.843-.701.963-.85c.12-.151.24-.125.412-.075c.173.05.895.42 1.058.498c.164.075.278.113.313.175c.035.062.035.488-.015.575c-.05.087-.341.391-.493.464z"/></svg>
);
export const TwitterIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="currentColor" {...props}><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
);
export const FacebookIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="currentColor" {...props}><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v7.028C18.343 21.128 22 16.991 22 12z"/></svg>
);


// New Icons for Achievements
export const StarIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
);
export const UsersIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="10" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
);
export const DollarSignIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
);
export const CheckCircleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
);

// Icons for Admin Menu
export const MoreVerticalIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
);
export const EditIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
);
export const TrashIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
);
export const ZapIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
);
export const ZapOffIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="12.41 6.75 13 2 10.57 4.92"/><polyline points="18.57 12.91 21 10 15.66 10"/><polyline points="8 8 3 14 12 14 11 22 16 16"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
);
export const UserPlusIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="10" cy="7" r="4"/><line x1="22" y1="11" x2="22" y2="17"/><line x1="19" y1="14" x2="25" y2="14"/></svg>
);
export const ShieldIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
);

export const SolanaIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor" {...props}>
        <title>Solana</title>
        <path d="M5.13 4.414a.25.25 0 0 0-.12.42l4.314 2.49c.1.056.222.056.32 0l4.314-2.49a.25.25 0 0 0-.12-.42H5.13zM4.75 8.125a.25.25 0 0 0-.25.25v7.25a.25.25 0 0 0 .25.25h14.5a.25.25 0 0 0 .25-.25V8.375a.25.25 0 0 0-.25-.25H4.75zM18.87 19.586a.25.25 0 0 0 .12-.42l-4.314-2.49c-.1-.056-.222-.056-.32 0l-4.314 2.49a.25.25 0 0 0 .12.42h8.688z"/>
    </svg>
);

export const TokenIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/></svg>
);

// Using USDC mint address on Solana Mainnet for demo purposes
export const IGI_TOKEN_MINT_ADDRESS = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';
export const IGI_TOKEN_DECIMALS = 6;

export const INITIAL_TREASURY_WALLETS: TreasuryWallets = {
  erc20: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
  trc20: 'TX7xWvJawKBbBUSo5S22yv3xJeZWb4wWpA',
  polygon: '0x7D1AfA7B718fb893dB30A3aBc0C458d9C7848fB8',
  solana: '9v81P2i9Z3b8qY2k4X5a7j6b3c9d1e2f3g4h5i6j7k',
};

export const INITIAL_INSTANT_BONUS_RATES = {
    investor: 0.04,
    referrer: 0.04,
    upline: 0.03,
};

export const INITIAL_TEAM_BUILDER_BONUS_RATES = [
    0.02,   // Level 1
    0.015,  // Level 2
    0.01,   // Level 3
    0.008,  // Level 4
    0.006,  // Level 5
    0.005,  // Level 6
    0.004,  // Level 7
    0.003,  // Level 8
    0.002   // Level 9
];


export const INITIAL_RANKS: Rank[] = [
  { level: 1, name: 'L1', minAccounts: 15, newlyQualified: 12, fixedBonus: 500, minTotalInvestment: 15000 },
  { level: 2, name: 'L2', minAccounts: 30, newlyQualified: 25, fixedBonus: 1000, minTotalInvestment: 50000 },
  { level: 3, name: 'L3', minAccounts: 50, newlyQualified: 40, fixedBonus: 2000, minTotalInvestment: 100000 },
  { level: 4, name: 'L4', minAccounts: 100, newlyQualified: 80, fixedBonus: 5000, minTotalInvestment: 250000 },
  { level: 5, name: 'L5', minAccounts: 250, newlyQualified: 200, fixedBonus: 10000, minTotalInvestment: 500000 },
  { level: 6, name: 'L6', minAccounts: 500, newlyQualified: 400, fixedBonus: 20000, minTotalInvestment: 1000000 },
  { level: 7, name: 'L7', minAccounts: 1000, newlyQualified: 800, fixedBonus: 40000, minTotalInvestment: 2500000 },
  { level: 8, name: 'L8', minAccounts: 2500, newlyQualified: 1000, fixedBonus: 60000, minTotalInvestment: 5000000 },
  { level: 9, name: 'L9', minAccounts: 10000, newlyQualified: 200, fixedBonus: 100000, minTotalInvestment: 20000000 },
];

// Mock users now include a default password 'password' for authentication simulation
export const MOCK_USERS: User[] = [
  { id: 'admin-0', name: 'Admin User', email: 'admin@igipartnership.com', password: 'password', wallet: '0x...admin', rank: 9, uplineId: null, referralCode: 'ADMIN001', totalInvestment: 0, totalDownline: 0, monthlyIncome: 0, kycStatus: 'Verified', avatar: 'https://picsum.photos/id/1/200/200', country: 'System', isFrozen: false, role: 'admin', achievements: [], joinDate: '2022-12-01' },
  { id: 'user-1', name: 'Alex Johnson', email: 'alex@example.com', password: 'password', wallet: '0x...a1b2', rank: 5, uplineId: null, referralCode: 'ALEX123', totalInvestment: 25000, totalDownline: 260, monthlyIncome: 12500, kycStatus: 'Verified', avatar: 'https://picsum.photos/id/1005/200/200', country: 'USA', isFrozen: false, role: 'user', achievements: [], joinDate: '2023-01-15' },
  { id: 'user-2', name: 'Maria Garcia', email: 'maria@example.com', password: 'password', wallet: '0x...c3d4', rank: 4, uplineId: 'user-1', referralCode: 'MARIA456', totalInvestment: 15000, totalDownline: 110, monthlyIncome: 7500, kycStatus: 'Verified', avatar: 'https://picsum.photos/id/1027/200/200', country: 'Spain', isFrozen: false, role: 'user', achievements: [], joinDate: '2023-02-20' },
  { id: 'user-3', name: 'Chen Wei', email: 'chen@example.com', password: 'password', wallet: '0x...e5f6', rank: 4, uplineId: 'user-1', referralCode: 'CHEN789', totalInvestment: 18000, totalDownline: 95, monthlyIncome: 6800, kycStatus: 'Pending', avatar: 'https://picsum.photos/id/1011/200/200', country: 'China', isFrozen: false, role: 'user', achievements: [], joinDate: '2023-03-10' },
  { id: 'user-4', name: 'Ben Carter', email: 'ben@example.com', password: 'password', wallet: '0x...g7h8', rank: 3, uplineId: 'user-2', referralCode: 'BEN101', totalInvestment: 8000, totalDownline: 40, monthlyIncome: 3200, kycStatus: 'Verified', avatar: 'https://picsum.photos/id/1012/200/200', country: 'UK', isFrozen: true, role: 'user', achievements: [], joinDate: '2023-04-01' },
  { id: 'user-5', name: 'Sophia Loren', email: 'sophia@example.com', password: 'password', wallet: '0x...i9j0', rank: 3, uplineId: 'user-2', referralCode: 'SOPHIA22', totalInvestment: 9500, totalDownline: 50, monthlyIncome: 4100, kycStatus: 'Verified', avatar: 'https://picsum.photos/id/1013/200/200', country: 'Italy', isFrozen: false, role: 'user', achievements: [], joinDate: '2023-05-18' },
  { id: 'user-6', name: 'Hiroshi Tanaka', email: 'hiroshi@example.com', password: 'password', wallet: '0x...k1l2', rank: 2, uplineId: 'user-3', referralCode: 'HIRO33', totalInvestment: 5000, totalDownline: 20, monthlyIncome: 1500, kycStatus: 'Rejected', avatar: 'https://picsum.photos/id/1015/200/200', country: 'Japan', isFrozen: false, role: 'user', achievements: [], joinDate: '2023-06-22' },
  { id: 'user-7', name: 'Fatima Al-Sayed', email: 'fatima@example.com', password: 'password', wallet: '0x...m3n4', rank: 1, uplineId: 'user-4', referralCode: 'FATIMA44', totalInvestment: 3000, totalDownline: 15, monthlyIncome: 600, kycStatus: 'Verified', avatar: 'https://picsum.photos/id/1016/200/200', country: 'Egypt', isFrozen: false, role: 'user', achievements: [], joinDate: '2023-08-11' },
  { id: 'user-8', name: 'Liam O\'Connell', email: 'liam@example.com', password: 'password', wallet: '0x...o5p6', rank: 1, uplineId: 'user-4', referralCode: 'LIAM55', totalInvestment: 3500, totalDownline: 12, monthlyIncome: 550, kycStatus: 'Not Submitted', avatar: 'https://picsum.photos/id/1018/200/200', country: 'Ireland', isFrozen: false, role: 'user', achievements: [], joinDate: '2023-09-05' },
];

export const MOCK_PROJECTS: Project[] = [
    {
        id: 'proj-1',
        assetType: 'Residential Real Estate',
        assetIdentifier: 'PID-12345',
        assetDescription: 'A 10-unit luxury apartment building in downtown Miami.',
        assetLocation: 'Miami, FL, USA',
        assetImageUrl: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=2070&auto=format&fit=crop',
        assetValuation: 12000000,
        valuationMethod: 'Professional Appraisal',
        valuationDate: '2023-10-15',
        performanceHistory: 'Consistent 95% occupancy over the last 5 years.',
        expectedYield: 8.5,
        proofOfOwnership: '#',
        legalStructure: 'Special Purpose Vehicle (SPV) LLC',
        legalWrapper: 'Token represents fractional ownership interest.',
        jurisdiction: 'Delaware, USA',
        regulatoryStatus: 'Security (Reg D)',
        investorRequirements: 'Accredited Investors Only, KYC/AML Required',
        tokenName: 'Miami Luxury Apartments Token',
        tokenTicker: 'MLAT',
        totalTokenSupply: 120000,
        tokenPrice: 100,
        minInvestment: 5000,
        blockchain: 'Ethereum',
        smartContractAddress: '0x123...abc',
        distribution: 'Private Placement',
        rightsConferred: 'Fractional Ownership, Pro-rata share of rental income.',
        assetCustodian: 'RealTrust Property Management',
        assetManager: 'IGI Asset Management',
        oracles: 'Chainlink for property valuation updates.',
    },
    {
        id: 'proj-2',
        assetType: 'Fine Art',
        assetIdentifier: 'ART-67890',
        assetDescription: 'Original "Sunset Over the Lake" painting by a renowned modern artist.',
        assetLocation: 'Geneva, Switzerland (Freeport)',
        assetImageUrl: 'https://images.unsplash.com/photo-1552590623-b53877962453?q=80&w=1974&auto=format&fit=crop',
        assetValuation: 3500000,
        valuationMethod: 'Auction House Appraisal (Sotheby\'s)',
        valuationDate: '2023-09-01',
        performanceHistory: 'Previous works by the artist have appreciated by an average of 12% annually.',
        expectedYield: 15.0,
        proofOfOwnership: '#',
        legalStructure: 'Trust',
        legalWrapper: 'Token represents beneficial interest in the trust holding the artwork.',
        jurisdiction: 'Switzerland',
        regulatoryStatus: 'Collectible',
        investorRequirements: 'KYC/AML Required',
        tokenName: 'Sunset Masterpiece Token',
        tokenTicker: 'SMT',
        totalTokenSupply: 35000,
        tokenPrice: 100,
        minInvestment: 1000,
        blockchain: 'Polygon',
        smartContractAddress: '0x456...def',
        distribution: 'Public Sale',
        rightsConferred: 'Fractional Ownership, Share of proceeds upon sale.',
        assetCustodian: 'Geneva Freeport',
        assetManager: 'Fine Art Investments LLC',
        oracles: 'Not Applicable',
    },
];

export const MOCK_INVESTMENT_POOLS: InvestmentPool[] = [
  { id: 'pool-1', name: 'Global Growth Fund', description: 'A diversified portfolio of global equities aiming for long-term capital growth.', apy: 12.5, minInvestment: 5000 },
  { id: 'pool-2', name: 'Stable Income Fund', description: 'Focuses on generating stable income through high-quality bonds and dividend stocks.', apy: 7.0, minInvestment: 10000 },
  { id: 'pool-3', name: 'Tech Innovators Fund', description: 'Invests in disruptive technology companies with high growth potential.', apy: 18.0, minInvestment: 7500 },
];

export const MOCK_INVESTMENTS: Investment[] = [
  { id: 'inv-1', userId: 'user-1', amount: 10000, date: '2023-10-15', status: 'Active', projectId: 'proj-1', projectName: 'Miami Luxury Apartments Token', totalProfitEarned: 0, source: 'profit_reinvestment' },
  { id: 'inv-2', userId: 'user-1', amount: 15000, date: '2023-11-20', status: 'Active', projectId: 'proj-1', projectName: 'Miami Luxury Apartments Token', totalProfitEarned: 0, source: 'profit_reinvestment' },
  { id: 'inv-3', userId: 'user-2', amount: 15000, date: '2023-10-25', status: 'Active', projectId: 'proj-2', projectName: 'Sunset Masterpiece Token', totalProfitEarned: 0, source: 'profit_reinvestment' },
  { id: 'inv-4', userId: 'user-3', amount: 18000, date: '2023-11-05', status: 'Active', projectId: 'proj-1', projectName: 'Miami Luxury Apartments Token', totalProfitEarned: 0, source: 'profit_reinvestment' },
  { id: 'inv-5', userId: 'user-4', amount: 8000, date: '2023-11-10', status: 'Active', projectId: 'proj-2', projectName: 'Sunset Masterpiece Token', totalProfitEarned: 0, source: 'profit_reinvestment' },
  { id: 'inv-6', userId: 'user-5', amount: 9500, date: '2023-11-12', status: 'Active', projectId: 'proj-1', projectName: 'Miami Luxury Apartments Token', totalProfitEarned: 0, source: 'profit_reinvestment' },
  { id: 'inv-7', userId: 'user-1', amount: 5000, date: '2023-11-15', status: 'Active', poolId: 'pool-1', poolName: 'Global Growth Fund', totalProfitEarned: 0, source: 'deposit' },
  { id: 'inv-8', userId: 'user-2', amount: 10000, date: '2023-11-18', status: 'Active', poolId: 'pool-2', poolName: 'Stable Income Fund', totalProfitEarned: 0, source: 'deposit' },
];

export const MOCK_TRANSACTIONS: Transaction[] = [
  { id: 'txn-1', userId: 'user-1', type: 'Deposit', amount: 30000, txHash: '0x...abc', date: '2023-10-14' },
  { id: 'txn-1a', userId: 'user-1', type: 'Investment', amount: 10000, txHash: '0x...123', date: '2023-10-15', investmentId: 'inv-1' },
  { id: 'txn-2', userId: 'user-1', type: 'Bonus', amount: 600, txHash: '0x...456', date: '2023-10-25' },
  { id: 'txn-3', userId: 'user-1', type: 'Withdrawal', amount: 2000, txHash: '0x...789', date: '2023-11-01' },
  { id: 'txn-4', userId: 'user-2', type: 'Deposit', amount: 15000, txHash: '0x...def', date: '2023-10-24' },
  { id: 'txn-5', userId: 'user-2', type: 'Investment', amount: 15000, txHash: '0x...ghi', date: '2023-10-25', investmentId: 'inv-3' },
];

export const MOCK_BONUSES: Bonus[] = [
  { id: 'bns-1', userId: 'user-1', type: 'Instant', sourceId: 'inv-3', amount: 600, date: '2023-10-25', read: true },
  { id: 'bns-2', userId: 'user-1', type: 'Leadership', sourceId: 'rank-5', amount: 10000, date: '2023-11-01', read: false },
  { id: 'bns-3', userId: 'user-2', type: 'Instant', sourceId: 'inv-3', amount: 600, date: '2023-10-25', read: true },
];

export const MOCK_NEWS: NewsPost[] = [
    { id: 'news-1', title: 'IGI Partnership Program Hits New Milestones!', content: 'We are thrilled to announce that our platform has surpassed 10,000 active investors. Thank you for your continued trust and support.', date: '2023-11-28', author: 'Admin User' },
    { id: 'news-2', title: 'Upcoming System Maintenance', content: 'Please be advised that we will have a scheduled system maintenance on December 5th from 2:00 AM to 4:00 AM UTC to improve our infrastructure.', date: '2023-11-25', author: 'Admin User' },
    { id: 'news-3', title: 'New Leadership Bonus Tier Unlocked', content: 'Congratulations to all our L7 partners! A new tier of leadership bonuses has been activated. Check your wallet for details.', date: '2023-11-20', author: 'Admin User' },
];

export const ACHIEVEMENTS_LIST: Achievement[] = [
    { id: 'kyc_verified', nameKey: 'achievements.kyc_verified.name', descriptionKey: 'achievements.kyc_verified.description', icon: CheckCircleIcon, criteria: (user) => user.kycStatus === 'Verified' },
    { id: 'first_investment', nameKey: 'achievements.first_investment.name', descriptionKey: 'achievements.first_investment.description', icon: DollarSignIcon, criteria: (user) => user.totalInvestment > 0 },
    { id: 'senior_investor', nameKey: 'achievements.senior_investor.name', descriptionKey: 'achievements.senior_investor.description', icon: DollarSignIcon, criteria: (user) => user.totalInvestment >= 20000 },
    { id: 'recruiter_10', nameKey: 'achievements.recruiter_10.name', descriptionKey: 'achievements.recruiter_10.description', icon: UsersIcon, criteria: (user, allUsers) => allUsers.filter(u => u.uplineId === user.id).length >= 10 },
    { id: 'network_pro', nameKey: 'achievements.network_pro.name', descriptionKey: 'achievements.network_pro.description', icon: UsersIcon, criteria: (user) => user.totalDownline >= 100 },
    { id: 'top_earner', nameKey: 'achievements.top_earner.name', descriptionKey: 'achievements.top_earner.description', icon: TrophyIcon, criteria: (user) => user.monthlyIncome >= 10000 },
    { id: 'rank_l5', nameKey: 'achievements.rank_l5.name', descriptionKey: 'achievements.rank_l5.description', icon: StarIcon, criteria: (user) => user.rank >= 5 },
    { id: 'rank_l9', nameKey: 'achievements.rank_l9.name', descriptionKey: 'achievements.rank_l9.description', icon: StarIcon, criteria: (user) => user.rank >= 9 },
];

export const MOCK_RESOURCES: MarketingResource[] = [
    {
        id: 'banner-1',
        type: 'banner',
        title: 'IGI Partnership Modern',
        description: 'A modern, sleek banner for social media stories or posts.',
        content: 'https://placehold.co/1080x1920/111827/7C3AED/png?text=Join+IGI\\nPartnership+Today!',
        thumbnailUrl: 'https://placehold.co/300x400/111827/7C3AED/png?text=IGI'
    },
    {
        id: 'banner-2',
        type: 'banner',
        title: 'IGI Partnership Corporate',
        description: 'A professional banner for LinkedIn or email campaigns.',
        content: 'https://placehold.co/1200x628/F3F4F6/111827/png?text=IGI+Partnership\\nYour+Future,+Secured.',
        thumbnailUrl: 'https://placehold.co/400x300/F3F4F6/111827/png?text=IGI'
    },
    {
        id: 'text-1',
        type: 'text',
        title: 'Short & Punchy',
        description: 'A quick message for SMS or social media comments.',
        content: 'Ready to revolutionize your finances? I just joined the IGI Partnership Program and the potential is massive. Check it out with my code: {referralCode}',
    },
    {
        id: 'text-2',
        type: 'text',
        title: 'Detailed Invitation',
        description: 'A more formal invitation for emails or direct messages.',
        content: 'Hi! I wanted to personally invite you to explore the IGI Partnership Program, a platform that\'s changing the game in asset growth. It offers a unique opportunity for both new and experienced investors. If you\'re interested in learning more, you can sign up using my personal referral code: {referralCode}. Let me know if you have any questions!',
    },
    {
        id: 'presentation-1',
        type: 'presentation',
        title: 'IGI Partnership Pitch Deck',
        description: 'The complete, official presentation slides for potential partners. Contains detailed information about our vision, technology, and compensation plan.',
        content: '#', // Placeholder for a real file link
    }
];
