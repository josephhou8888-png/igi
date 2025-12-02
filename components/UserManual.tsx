
import React from 'react';
import { useAppContext } from '../hooks/useAppContext';

const ManualSection: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => (
    <section className="mb-12 bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-700">
        <h2 className="text-3xl font-bold text-brand-primary border-b border-gray-600 pb-4 mb-6">{title}</h2>
        <div className="space-y-6 text-gray-300">{children}</div>
    </section>
);

const ManualSubSection: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => (
    <div className="mb-8">
        <h3 className="text-xl font-bold text-white mb-3 flex items-center">
            <span className="w-2 h-2 bg-brand-secondary rounded-full mr-3"></span>
            {title}
        </h3>
        <div className="space-y-4 text-gray-400 pl-5 border-l-2 border-gray-700 ml-1">{children}</div>
    </div>
);

const UserManual: React.FC = () => {
    const { currentUser } = useAppContext();

    return (
        <div className="max-w-5xl mx-auto text-gray-200 pb-12">
            <div className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">IGI Partnership <span className="text-brand-primary">Manual</span></h1>
                <p className="text-lg text-gray-400 mt-4 max-w-2xl mx-auto">A comprehensive guide to navigating the platform, managing investments, and administering the system.</p>
            </div>

            <ManualSection title="Getting Started">
                <ManualSubSection title="Logging In">
                    <p>The login screen allows you to access the system. In <strong>Demo Mode</strong>, you can use pre-configured accounts or create a new one instantly. In <strong>Live Mode</strong>, authentication is handled securely via Supabase.</p>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                        <li><strong>Demo Admin:</strong> Log in with <code>admin@igipartnership.com</code> / <code>password</code>.</li>
                        <li><strong>Demo User:</strong> Create a new account to test the onboarding flow.</li>
                    </ul>
                </ManualSubSection>
            </ManualSection>

            <ManualSection title="User Guide (For Partners)">
                <ManualSubSection title="Dashboard Overview">
                    <p>Your central command center. Track your financial health with real-time updates.</p>
                    <ul className="list-disc list-inside space-y-2">
                        <li><strong>Income Cards:</strong> View 'Income Today' (Profit Share), 'Income This Month', and 'Lifetime Bonus' (Referral Earnings).</li>
                        <li><strong>Quick Actions:</strong> Use the "Make a New Investment" button to deploy capital immediately.</li>
                        <li><strong>Referral System:</strong> Copy your unique referral code or use the "Invite via Email" button to grow your team.</li>
                    </ul>
                </ManualSubSection>
                 <ManualSubSection title="Wallet Management">
                    <p>Manage your assets safely and efficiently.</p>
                    <ul className="list-disc list-inside space-y-2">
                        <li><strong>Deposit:</strong> Fund your account via Crypto (USDT on ERC20, TRC20, Polygon, or Solana).</li>
                        <li><strong>Withdraw:</strong> Request payouts to your external wallet. Ensure your address matches the selected network.</li>
                        <li><strong>Reinvest:</strong> Compound your earnings by investing directly from your 'Profit Balance' without withdrawing first.</li>
                        <li><strong>History:</strong> View a transparent log of every penny moving in or out of your account.</li>
                    </ul>
                </ManualSubSection>
                <ManualSubSection title="Profile & KYC">
                    <p>Keep your account secure and compliant.</p>
                    <ul className="list-disc list-inside space-y-2">
                        <li><strong>KYC Verification:</strong> You must submit ID documents to unlock full withdrawal capabilities. Statuses include: <em>Not Submitted</em>, <em>Pending</em>, <em>Verified</em>, or <em>Rejected</em>.</li>
                        <li><strong>Security:</strong> Update your password and wallet address from the profile settings.</li>
                    </ul>
                </ManualSubSection>
            </ManualSection>

            {currentUser?.role === 'admin' && (
              <>
                  <div className="my-12 flex items-center justify-center">
                      <div className="h-px bg-gray-700 w-full"></div>
                      <span className="px-4 text-gray-500 font-bold uppercase tracking-widest text-sm whitespace-nowrap">Administrator Controls</span>
                      <div className="h-px bg-gray-700 w-full"></div>
                  </div>

                  <ManualSection title="Admin: Core Operations">
                      <ManualSubSection title="Date Simulation System">
                          <p className="mb-2">The platform includes a powerful time-travel engine for testing financial logic.</p>
                          <ul className="list-disc list-inside space-y-2">
                              <li><strong>Advance Time:</strong> Use the buttons in the top header (+1, +7, +30 Days) to move the <em>Simulated Date</em> forward.</li>
                              <li><strong>Daily Triggers:</strong> Every day advanced triggers the calculation of <strong>Daily Profit Share</strong> for all active investments based on their APY.</li>
                              <li><strong>Monthly Triggers:</strong> Crossing a month boundary triggers <strong>Rank Evaluations</strong> (promoting users who meet criteria) and <strong>Leadership Bonus</strong> payouts.</li>
                          </ul>
                      </ManualSubSection>

                      <ManualSubSection title="User Management">
                          <p>Located in the <strong>Users</strong> tab. This is your CRM.</p>
                          <ul className="list-disc list-inside space-y-2">
                              <li><strong>Search:</strong> Quickly find users by Name or Email.</li>
                              <li><strong>Action Menu (Three Dots):</strong>
                                  <ul className="list-circle list-inside ml-6 mt-1 space-y-1 text-sm">
                                      <li><strong>Add Investment:</strong> Manually create an investment for a user (e.g., if they paid OTC).</li>
                                      <li><strong>Adjust Wallet:</strong> Add funds (Manual Bonus) or remove funds (Manual Deduction). A reason is required for auditing.</li>
                                      <li><strong>Freeze Account:</strong> Lock a user out of the platform for security reasons.</li>
                                      <li><strong>Edit User:</strong> Change email, upline, or manually override their Rank.</li>
                                  </ul>
                              </li>
                              <li><strong>KYC Review:</strong> Click the "Pending" badge on any user row to view their submitted documents and Approve/Reject them.</li>
                          </ul>
                      </ManualSubSection>
                  </ManualSection>

                  <ManualSection title="Admin: Financial Management">
                      <ManualSubSection title="Deposits & Withdrawals">
                          <p>Manage the flow of funds into and out of the platform.</p>
                          <ul className="list-disc list-inside space-y-2">
                              <li><strong>Pending Deposits:</strong> Review crypto deposit claims. Verify the TX Hash on the blockchain explorer before clicking <strong>Approve</strong>. You can optionally add a "Deposit Bonus" during approval.</li>
                              <li><strong>Pending Withdrawals:</strong> Review withdrawal requests. Once you have sent the funds externally, enter the TX Hash and click <strong>Approve</strong> to mark it as complete in the system.</li>
                          </ul>
                      </ManualSubSection>

                      <ManualSubSection title="Payout Monitoring">
                          <p>Located in the <strong>Payouts</strong> tab. Analyze where the money is going.</p>
                          <ul className="list-disc list-inside space-y-2">
                              <li><strong>Filters:</strong> Drill down by Bonus Type (Instant, Team Builder, etc.) or Date Range.</li>
                              <li><strong>Trend Analysis:</strong> The chart visualizes payout spikes, helping you correlate them with marketing campaigns or new user influxes.</li>
                          </ul>
                      </ManualSubSection>
                  </ManualSection>

                  <ManualSection title="Admin: Asset Management">
                      <ManualSubSection title="Projects (RWA)">
                          <p>Manage individual Real World Asset tokens.</p>
                          <ul className="list-disc list-inside space-y-2">
                              <li><strong>Create Project:</strong> Define tokenomics, valuation, yields, and legal structures.</li>
                              <li><strong>Custom Config:</strong> You can set specific Bonus Rates or Rank Requirements that apply <em>only</em> to investments in this specific project, overriding global settings.</li>
                          </ul>
                      </ManualSubSection>

                      <ManualSubSection title="Legacy Funds">
                          <p>Manage pooled investment vehicles.</p>
                          <ul className="list-disc list-inside space-y-2">
                              <li><strong>Pool Configuration:</strong> Set the APY (Annual Percentage Yield) and Minimum Investment amount.</li>
                              <li><strong>Project Linking:</strong> You can link a Fund to a specific RWA Project for reporting purposes.</li>
                          </ul>
                      </ManualSubSection>
                  </ManualSection>

                  <ManualSection title="Admin: System Settings">
                      <ManualSubSection title="Global Configuration">
                          <p>Control the math behind the platform in the <strong>Settings</strong> tab.</p>
                          <ul className="list-disc list-inside space-y-2">
                              <li><strong>Bonus Configuration:</strong> Set the global percentages for Instant Bonuses (Direct/Upline) and the 9-level Team Builder Bonus.</li>
                              <li><strong>Rank Requirements:</strong> Define the exact criteria (Min Investment, Team Size) required to hit Ranks 1-9, and the Fixed Bonus reward for achieving them.</li>
                              <li><strong>Treasury Wallets:</strong> Update the crypto addresses displayed to users during the deposit process.</li>
                              <li><strong>Withdrawal Limits:</strong> Set minimum and maximum withdrawal amounts to manage liquidity.</li>
                          </ul>
                      </ManualSubSection>
                  </ManualSection>
              </>
            )}
        </div>
    );
};

export default UserManual;
