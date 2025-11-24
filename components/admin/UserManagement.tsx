
import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { useLocalization } from '../../hooks/useLocalization';
import { User } from '../../types';
import EditUserModal from './EditUserModal';
import FinancialAdjustmentModal from './FinancialAdjustmentModal';
import KycReviewModal from './KycReviewModal';
import AdminUserMenu from './AdminUserMenu';
import CreateUserModal from './CreateUserModal';
import AdjustRankModal from './AdjustRankModal';
import AddInvestmentModal from './AddInvestmentModal';
import InvestFromBalanceModal from './InvestFromBalanceModal';
import { UserPlusIcon } from '../../constants';

const UserRow: React.FC<{
    user: User; 
    toggleFreezeUser: (id: string) => void;
    deleteUser: (id: string) => void;
    updateUserRole: (id: string, role: 'user' | 'admin') => void;
    setEditingUser: (u: User) => void;
    setAddingInvestmentUser: (u: User) => void;
    setInvestingBalanceUser: (u: User) => void;
    setAdjustingUser: (u: User) => void;
    setAdjustingRankUser: (u: User) => void;
    setReviewingKycUser: (u: User) => void;
    kycStatusMap: any;
    t: any;
    getUserBalances: (id: string) => { depositBalance: number, profitBalance: number };
}> = ({ user, toggleFreezeUser, deleteUser, updateUserRole, setEditingUser, setAddingInvestmentUser, setInvestingBalanceUser, setAdjustingUser, setAdjustingRankUser, setReviewingKycUser, kycStatusMap, t, getUserBalances }) => {
    
    const balances = useMemo(() => getUserBalances(user.id), [user.id, getUserBalances]);

    return (
        <tr className={`border-b border-gray-700 hover:bg-gray-600 ${user.isFrozen ? 'opacity-60 bg-red-900/20' : 'bg-gray-800'}`}>
            <td className="px-6 py-4 font-medium text-white flex items-center space-x-3">
                <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full" />
                <div>
                    <p className="flex items-center gap-2">
                        {user.name}
                        {user.role === 'admin' && (
                            <span className="bg-brand-primary text-white text-[10px] px-1.5 py-0.5 rounded font-bold">ADMIN</span>
                        )}
                    </p>
                    <p className="text-xs text-gray-400">{user.email}</p>
                </div>
            </td>
            <td className="px-6 py-4">L{user.rank}</td>
            <td className="px-6 py-4">
                <div className="text-xs text-gray-400">Active: <span className="text-white text-sm">${user.totalInvestment.toLocaleString()}</span></div>
            </td>
            <td className="px-6 py-4">
                <div className="flex flex-col text-xs">
                    <span className="text-gray-300">Dep: <span className="font-semibold text-white">${balances.depositBalance.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span></span>
                    <span className="text-gray-300">Prof: <span className="font-semibold text-green-400">${balances.profitBalance.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span></span>
                </div>
            </td>
            <td className="px-6 py-4">
                <button 
                    onClick={() => user.kycStatus === 'Pending' && setReviewingKycUser(user)}
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${user.kycStatus === 'Verified' ? 'bg-green-900 text-green-300' : user.kycStatus === 'Pending' ? 'bg-yellow-900 text-yellow-300 cursor-pointer hover:bg-yellow-800' : user.kycStatus === 'Rejected' ? 'bg-red-900 text-red-300' : 'bg-gray-600 text-gray-300'}`}
                    disabled={user.kycStatus !== 'Pending'}
                >
                    {kycStatusMap[user.kycStatus]}
                </button>
            </td>
            <td className="px-6 py-4">
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${user.isFrozen ? 'bg-red-900 text-red-300' : 'bg-blue-900 text-blue-300'}`}>
                    {user.isFrozen ? t('admin.users.frozen') : t('admin.users.active')}
                </span>
            </td>
            <td className="px-6 py-4 text-right relative">
                <AdminUserMenu
                    user={user}
                    onAddInvestment={() => setAddingInvestmentUser(user)}
                    onInvestFromBalance={() => setInvestingBalanceUser(user)}
                    onAdjustWallet={() => setAdjustingUser(user)}
                    onAdjustRank={() => setAdjustingRankUser(user)}
                    onToggleFreeze={() => toggleFreezeUser(user.id)}
                    onEdit={() => setEditingUser(user)}
                    onDelete={() => deleteUser(user.id)}
                    onChangeRole={updateUserRole}
                />
            </td>
        </tr>
    );
};

const UserManagement: React.FC = () => {
    const { users, toggleFreezeUser, deleteUser, updateUserRole, getUserBalances } = useAppContext();
    const { t } = useLocalization();
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [adjustingUser, setAdjustingUser] = useState<User | null>(null);
    const [reviewingKycUser, setReviewingKycUser] = useState<User | null>(null);
    const [adjustingRankUser, setAdjustingRankUser] = useState<User | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [addingInvestmentUser, setAddingInvestmentUser] = useState<User | null>(null);
    const [investingBalanceUser, setInvestingBalanceUser] = useState<User | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredUsers = useMemo(() => {
        if (!searchTerm) {
            return users;
        }
        return users.filter(u =>
            (u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
             u.email.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [users, searchTerm]);
    
    const kycStatusMap: { [key in User['kycStatus']]: string } = {
        'Verified': t('kyc.verified'),
        'Pending': t('kyc.pending'),
        'Rejected': t('kyc.rejected'),
        'Not Submitted': t('kyc.notSubmitted'),
    };

    const handleExport = () => {
        const headers = ["ID", "Name", "Role", "Email", "Rank", "Upline ID", "Total Investment", "Deposit Bal", "Profit Bal", "KYC Status", "Account Status", "Join Date"];
        const csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + users.map(u => {
                const bal = getUserBalances(u.id);
                return [
                    u.id,
                    `"${u.name}"`,
                    u.role,
                    u.email,
                    `L${u.rank}`,
                    u.uplineId || "None",
                    u.totalInvestment,
                    bal.depositBalance,
                    bal.profitBalance,
                    u.kycStatus,
                    u.isFrozen ? "Frozen" : "Active",
                    u.joinDate
                ].join(",");
            }).join("\n");
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "users_export.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <>
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
                    <h3 className="text-lg font-semibold text-white">{t('admin.users.title')}</h3>
                    <input
                        type="text"
                        placeholder={t('admin.users.searchPlaceholder')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-gray-700 text-white rounded-md px-4 py-2 text-sm w-full sm:w-64"
                    />
                    <div className="flex items-center space-x-4">
                         <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="flex items-center bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-4 rounded-lg text-sm"
                        >
                            <UserPlusIcon className="w-5 h-5 mr-2" />
                            {t('admin.users.createUser')}
                        </button>
                        <button
                            onClick={handleExport}
                            className="bg-brand-primary hover:bg-brand-primary/90 text-white font-bold py-2 px-4 rounded-lg text-sm"
                        >
                            {t('admin.users.exportCsv')}
                        </button>
                    </div>
                </div>
                <div className="overflow-x-auto min-h-[400px]">
                    <table className="w-full text-sm text-left text-gray-300">
                        <thead className="text-xs text-gray-400 uppercase bg-gray-700">
                            <tr>
                                <th scope="col" className="px-6 py-3">{t('admin.users.table.user')}</th>
                                <th scope="col" className="px-6 py-3">{t('admin.users.table.rank')}</th>
                                <th scope="col" className="px-6 py-3">{t('admin.users.table.investment')}</th>
                                <th scope="col" className="px-6 py-3">Wallet</th>
                                <th scope="col" className="px-6 py-3">{t('admin.users.table.kycStatus')}</th>
                                <th scope="col" className="px-6 py-3">{t('admin.users.table.accountStatus')}</th>
                                <th scope="col" className="px-6 py-3 text-right">{t('admin.users.table.actions')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map((user: User) => (
                                <UserRow 
                                    key={user.id}
                                    user={user}
                                    toggleFreezeUser={toggleFreezeUser}
                                    deleteUser={deleteUser}
                                    updateUserRole={updateUserRole}
                                    setEditingUser={setEditingUser}
                                    setAddingInvestmentUser={setAddingInvestmentUser}
                                    setInvestingBalanceUser={setInvestingBalanceUser}
                                    setAdjustingUser={setAdjustingUser}
                                    setAdjustingRankUser={setAdjustingRankUser}
                                    setReviewingKycUser={setReviewingKycUser}
                                    kycStatusMap={kycStatusMap}
                                    t={t}
                                    getUserBalances={getUserBalances}
                                />
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            {isCreateModalOpen && <CreateUserModal onClose={() => setIsCreateModalOpen(false)} />}
            {editingUser && <EditUserModal user={editingUser} onClose={() => setEditingUser(null)} />}
            {adjustingUser && <FinancialAdjustmentModal user={adjustingUser} onClose={() => setAdjustingUser(null)} />}
            {reviewingKycUser && <KycReviewModal user={reviewingKycUser} onClose={() => setReviewingKycUser(null)} />}
            {adjustingRankUser && <AdjustRankModal user={adjustingRankUser} onClose={() => setAdjustingRankUser(null)} />}
            {addingInvestmentUser && <AddInvestmentModal user={addingInvestmentUser} onClose={() => setAddingInvestmentUser(null)} />}
            {investingBalanceUser && <InvestFromBalanceModal user={investingBalanceUser} onClose={() => setInvestingBalanceUser(null)} />}
        </>
    );
};

export default UserManagement;
