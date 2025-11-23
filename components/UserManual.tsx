
import React from 'react';
import { useAppContext } from '../hooks/useAppContext';

const ManualSection: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => (
    <section className="mb-12">
        <h2 className="text-3xl font-bold text-brand-primary border-b-2 border-brand-secondary pb-2 mb-6">{title}</h2>
        <div className="space-y-6 text-gray-300">{children}</div>
    </section>
);

const ManualSubSection: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => (
    <div className="mb-6">
        <h3 className="text-2xl font-semibold text-white mb-3">{title}</h3>
        <div className="space-y-4 text-gray-400 pl-4 border-l-2 border-gray-700">{children}</div>
    </div>
);

const UserManual: React.FC = () => {
    const { currentUser } = useAppContext();

    return (
        <div className="max-w-4xl mx-auto text-gray-200">
            <div className="text-center mb-12">
                <h1 className="text-5xl font-extrabold text-white">IGI Partnership User Manual</h1>
                <p className="text-lg text-gray-400 mt-2">Your complete guide to navigating and utilizing the platform.</p>
            </div>

            <ManualSection title="Getting Started">
                <ManualSubSection title="Logging In">
                    <p>The login screen serves as a simulator for this demo application. Simply select a user profile from the dropdown menu and click "Sign In" to access their dashboard. You can switch between a regular user and an admin to see the different views.</p>
                </ManualSubSection>
            </ManualSection>

            <ManualSection title="User Guide (For All Partners)">
                <ManualSubSection title="Dashboard">
                    <p>The Dashboard is your main hub for a quick overview of your account.</p>
                    <ul className="list-disc list-inside space-y-2">
                        <li><strong>Key Metrics:</strong> At the top, you'll find cards displaying your earnings (today, this month, lifetime), total profits, total investment, current rank, and the size of your downline.</li>
                        <li><strong>Make an Investment:</strong> Use the prominent "Make a New Investment" button to open a modal where you can invest in available pools.</li>
                        <li><strong>Referral Code:</strong> Your unique referral code is displayed for easy copying and sharing via the Web Share API.</li>
                        <li><strong>Charts & Graphs:</strong> Visualize your income over time and track your team's performance (new joins and investments).</li>
                        <li><strong>My Investments:</strong> A summary of all your active investments, showing the amount, profit earned, and start date.</li>
                        <li><strong>Network Hierarchy:</strong> A visual, expandable tree of your entire downline.</li>
                    </ul>
                </ManualSubSection>
                 <ManualSubSection title="Wallet">
                    <p>The Wallet page manages all your funds.</p>
                    <ul className="list-disc list-inside space-y-2">
                        <li><strong>Balances:</strong> Clearly see your "Available Balance" for withdrawals/reinvestments and your "Total Active Investment".</li>
                        <li><strong>Actions:</strong> Use the buttons to Deposit funds, Withdraw earnings to your registered wallet, or Reinvest from your available balance without needing an external deposit.</li>
                        <li><strong>Transaction History:</strong> A detailed log of every financial event on your account, including deposits, withdrawals, investments, and all types of bonuses.</li>
                    </ul>
                </ManualSubSection>
                <ManualSubSection title="Profile">
                    <p>Manage your personal information and track your progress.</p>
                    <ul className="list-disc list-inside space-y-2">
                        <li><strong>Edit Profile:</strong> Click the "Edit Profile" button to update your name, wallet address, and profile picture.</li>
                        <li><strong>KYC Verification:</strong> View your current KYC status. If it's "Not Submitted" or "Rejected", a form will appear allowing you to upload (mock) documents for verification.</li>
                        <li><strong>Achievements:</strong> See all the badges you've earned for reaching milestones on the platform.</li>
                    </ul>
                </ManualSubSection>
                <ManualSubSection title="Leaderboard & Resources">
                     <ul className="list-disc list-inside space-y-2">
                        <li><strong>Leaderboard:</strong> See how you stack up against other partners! You can filter the rankings by Top Earners (monthly income), Top Recruiters (total downline), and Top Investors.</li>
                        <li><strong>Resources:</strong> Access marketing materials to help you grow your network. Download promotional banners, copy pre-written text messages (which automatically include your referral code), and get the official company presentation.</li>
                    </ul>
                </ManualSubSection>
            </ManualSection>

            {currentUser?.role === 'admin' && (
              <ManualSection title="Administrator Guide">
                  <p className="mb-4">The Admin Panel provides a comprehensive suite of tools to manage the entire platform, its users, and its financial health. Access it via the "Admin View" button in the sidebar. The panel is organized into several tabs for clear navigation.</p>
                  
                   <ManualSubSection title="Overview & Date Simulation">
                      <p>The admin overview provides a real-time, high-level look at the platform's health and allows you to control the flow of time for demonstration purposes.</p>
                      <ul className="list-disc list-inside space-y-3">
                          <li>
                              <strong>Platform Stats:</strong> Monitor key performance indicators at a glance. "Total Invested" shows the total capital deployed across all users. "Total Users" and "Active Accounts" (users with an investment > 0) track growth and engagement. "Pending KYC" highlights the number of users awaiting identity verification, a crucial step for platform compliance.
                          </li>
                          <li>
                              <strong>Date Simulation (Core Demo Feature):</strong> This is a unique and powerful tool for demonstrating the platform's financial logic over time.
                              <ul className="list-disc list-inside ml-4 mt-2 space-y-2">
                                  <li><strong>Advancing Days:</strong> Clicking "Advance 1/7/30 Day(s)" simulates the passage of time. For each day advanced, the system performs a critical background task: calculating and distributing the daily 'Profit Share' for <em>every active investment</em> on the platform. This profit is calculated based on the investment amount and the Annual Percentage Yield (APY) of its associated pool, divided by 365. This action adds a 'Profit Share' transaction to each investor's wallet.</li>
                                  <li><strong>Crossing a Month's Boundary:</strong> The true power of the simulation is revealed when your clicks cause the date to cross into a new month (e.g., advancing from Nov 28th to Dec 5th). When this happens, the system automatically triggers the complete <strong>end-of-month calculation cycle</strong> for the month that just ended. This includes:
                                      <ol className="list-decimal list-inside ml-6 mt-1 space-y-1">
                                          <li><strong>Rank Calculation:</strong> The system evaluates every single user against the rank requirements defined in the 'Settings' tab. It checks their total active downline and the number of newly qualified members they recruited that month to determine if they qualify for a promotion.</li>
                                          <li><strong>Leadership Bonus Payout:</strong> For every user who is promoted to a new rank, the system immediately pays out the corresponding one-time 'Leadership Bonus' (fixed bonus amount) into their wallet.</li>
                                          <li><strong>Asset Growth Bonus Calculation:</strong> The system calculates the 'Asset Growth' bonus for every user based on the total investment value of their entire downline, paying out a percentage of that total asset value.</li>
                                      </ol>
                                  </li>
                              </ul>
                          </li>
                          <li>
                              <strong>Platform Charts:</strong> Visualize key financial trends. The "Inflow vs. Outflow" chart is critical for monitoring the platform's cash flow health (Deposits vs. Withdrawals). "Daily New Investments" tracks growth momentum and user confidence. "Payouts by Rank" reveals how bonus distributions are spread across different leadership levels, helping to analyze the compensation plan's balance.
                          </li>
                      </ul>
                  </ManualSubSection>

                  <ManualSubSection title="User Management">
                      <p>This is your primary control center for all user-related activities. The powerful search bar allows you to quickly find any user by name or email. All key actions are accessible via the three-dot menu on the right of each user row.</p>
                      <ul className="list-disc list-inside space-y-3">
                          <li><strong>Create User:</strong> Manually add a new user to the platform. You will need to provide their name, email, role, and optionally assign them an upline. A wallet address and referral code are generated automatically but can be customized.</li>
                          <li><strong>Edit User:</strong> Modify a user's core details, such as their name, rank, and total investment. <strong>Important:</strong> Changing a user's upline will affect all future bonus calculations for both the old and new upline. This should be done with caution.</li>
                          <li><strong>Adjust Wallet & Rank:</strong>
                              <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                                  <li><em>Adjust Wallet:</em> Manually add (bonus) or deduct funds from a user's wallet. A reason is mandatory for this action to ensure a clear audit trail in the transaction logs. This is useful for prize distribution, fee corrections, or other manual adjustments.</li>
                                   <li><em>Adjust Rank:</em> Manually set a user's rank to any level from 1 to 9. This is a direct override and does not require the user to meet the standard criteria. A reason is required for logging purposes.</li>
                              </ul>
                          </li>
                          <li><strong>Freeze/Unfreeze Account:</strong> Temporarily disable a user's account. A frozen user cannot log in, perform any actions (like investing or withdrawing), and will not receive any further bonuses until their account is unfrozen. This is a useful tool for compliance reviews or temporary suspensions.</li>
                          <li><strong>Review KYC:</strong> When a user's KYC status is "Pending," you can click the status badge to open the review modal. Here you can view their (mock) submitted documents and choose to either "Approve" or "Reject" their application, which updates their status and notifies the user.</li>
                      </ul>
                  </ManualSubSection>

                  <ManualSubSection title="Financial & Platform Management (Tabs)">
                      <p>The remaining tabs provide granular control over the financial and content aspects of the platform.</p>
                       <ul className="list-disc list-inside space-y-3">
                          <li><strong>Investments Tab:</strong> View and manage every single investment made on the platform. You can edit an investment's amount or date to correct errors, or manually create a new investment for a specific user. This is useful for data migration or correcting a failed transaction.</li>
                          <li><strong>Payouts Tab:</strong> A detailed log of all bonus payouts. Use the powerful filters to drill down by bonus type (Instant, Team Builder, etc.) and a specific date range to analyze where money is being distributed and the effectiveness of the compensation plan.</li>
                          <li><strong>Pools Tab:</strong> Create, edit, or delete the investment pools available to users. You can define their names, descriptive text, minimum investment requirements, and their Annual Percentage Yield (APY), which directly impacts the daily profit share calculations. Note: You cannot delete a pool that has active investments associated with it.</li>
                          <li><strong>Transactions Log Tab:</strong> A comprehensive, searchable, and immutable log of every single financial event across the entire system. This is the ultimate audit trail for all deposits, withdrawals, investments, bonuses, and manual adjustments.</li>
                          <li><strong>Financial Reports Tab:</strong> Generate a high-level financial summary for a specific date range. This report shows total deposits, total withdrawals, the resulting net cash flow, and a breakdown of all bonus payouts by type, providing a clear snapshot of platform profitability.</li>
                          <li><strong>News Tab:</strong> Create and publish announcements that will appear on the user dashboard. This is the primary way to communicate platform updates, promotions, or maintenance schedules to all users.</li>
                          <li><strong>Settings Tab:</strong> This is the engine room of the platform's financial model. Here you can:
                              <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                                  <li><strong>Adjust Bonus Rates:</strong> Fine-tune the percentages for both the "Instant Bonus" (paid on new investments) and the multi-level "Team Builder Bonus." Changes made here will apply to all <em>future</em> investments.</li>
                                  <li><strong>Configure Ranks:</strong> Define the promotion requirements for each of the 9 ranks, including the minimum number of active accounts, the required number of newly qualified members per month, and the fixed bonus amount awarded upon promotion.</li>
                                  <li><strong>Run Manual Monthly Cycle:</strong> This button allows you to trigger the entire end-of-month calculation cycle on demand, independent of the date simulation. This is useful for testing setting changes or running the cycle if the simulation date is not at a month's end.</li>
                              </ul>
                          </li>
                      </ul>
                  </ManualSubSection>
              </ManualSection>
            )}
        </div>
    );
};

export default UserManual;
