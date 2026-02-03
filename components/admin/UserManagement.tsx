
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
import { UserPlusIcon, SearchIcon } from '../../constants';

const ITEMS_PER_PAGE = 10;

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
        <tr className={`border-b border-gray-700 hover:bg-gray-700/50 transition-colors ${user.isFrozen ? 'opacity-60 bg-red-900/10' : 'bg-gray-800'}`}>
            <td className="px-6 py-4 font-medium text-white flex items-center space-x-3">
                <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full border border-gray-600 shadow-sm" />
                <div>
                    <p className="flex items-center gap-2">
                        <span className="font-bold">{user.name}</span>
                        {user.role === 'admin' && (
                            <span className="bg-brand-primary text-white text-[10px] px-1.5 py-0.5 rounded font-black tracking-tighter">ADMIN</span>
                        )}
                    </p>
                    <p className="text-xs text-gray-500 font-mono">{user.email}</p>
                </div>
            </td>
            <td className="px-6 py-4"><span className="bg-gray-700 px-2 py-1 rounded font-bold text-xs">L{user.rank}</span></td>
            <td className="px-6 py-4">
                <div className="text-sm font-semibold text-white">${user.totalInvestment.toLocaleString()}</div>
                <div className="text-[10px] text-gray-500 font-bold uppercase">Active Portfolio</div>
            </td>
            <td className="px-6 py-4">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center text-xs">
                        <span className="w-8 text-gray-500 font-bold">DEP</span>
                        <span className="font-bold text-white">${balances.depositBalance.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                    </div>
                    <div className="flex items-center text-xs">
                        <span className="w-8 text-gray-500 font-bold">PROF</span>
                        <span className="font-bold text-green-400">${balances.profitBalance.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                    </div>
                </div>
            </td>
            <td className="px-6 py-4">
                <button 
                    onClick={() => user.kycStatus === 'Pending' && setReviewingKycUser(user)}
                    className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tight ${user.kycStatus === 'Verified' ? 'bg-green-900/30 text-green-400 border border-green-800' : user.kycStatus === 'Pending' ? 'bg-yellow-900/30 text-yellow-400 border border-yellow-800 cursor-pointer hover:bg-yellow-900/50' : user.kycStatus === 'Rejected' ? 'bg-red-900/30 text-red-400 border border-red-800' : 'bg-gray-700 text-gray-400'}`}
                    disabled={user.kycStatus !== 'Pending'}
                >
                    {kycStatusMap[user.kycStatus]}
                </button>
            </td>
            <td className="px-6 py-4">
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${user.isFrozen ? 'text-red-400 bg-red-900/20' : 'text-blue-400 bg-blue-900/20'}`}>
                    {user.isFrozen ? t('admin.users.frozen') : t('admin.users.active')}
                </span>
            </td>
            <td className="px-6 py-4 text-right">
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
    const [currentPage, setCurrentPage] = useState(1);

    const filteredUsers = useMemo(() => {
        let filtered = users;
        if (searchTerm) {
            const lowSearch = searchTerm.toLowerCase();
            filtered = users.filter(u =>
                (u.name.toLowerCase().includes(lowSearch) ||
                 u.email.toLowerCase().includes(lowSearch) ||
                 u.id.toLowerCase().includes(lowSearch))
            );
        }
        return filtered;
    }, [users, searchTerm]);

    const paginatedUsers = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredUsers.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredUsers, currentPage]);

    const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
    
    const kycStatusMap: { [key in User['kycStatus']]: string } = {
        'Verified': t('kyc.verified'),
        'Pending': t('kyc.pending'),
        'Rejected': t('kyc.rejected'),
        'Not Submitted': t('kyc.notSubmitted'),
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1); // Crucial: Reset to page 1 on filter
    };

    return (
        <div className="space-y-4">
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                    <div className="relative w-full md:w-96">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <SearchIcon className="h-5 w-5 text-gray-500" />
                        </div>
                        <input
                            type="text"
                            placeholder={t('admin.users.searchPlaceholder')}
                            value={searchTerm}
                            onChange={handleSearchChange}
                            className="bg-gray-700/50 border border-gray-600 text-white rounded-lg pl-10 pr-4 py-2 w-full focus:ring-2 focus:ring-brand-primary outline-none transition-all"
                        />
                    </div>
                    <div className="flex items-center space-x-3 w-full md:w-auto">
                         <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="flex-1 md:flex-none flex items-center justify-center bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-6 rounded-lg text-sm transition-colors shadow-lg"
                        >
                            <UserPlusIcon className="w-5 h-5 mr-2" />
                            {t('admin.users.createUser')}
                        </button>
                        <button
                            onClick={() => alert("Export functionality ready.")}
                            className="flex-1 md:flex-none bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-lg text-sm transition-colors border border-gray-600"
                        >
                            {t('admin.users.exportCsv')}
                        </button>
                    </div>
                </div>
                
                <div className="overflow-x-auto rounded-lg border border-gray-700">
                    <table className="w-full text-sm text-left text-gray-300">
                        <thead className="text-xs text-gray-400 uppercase bg-gray-700/80 backdrop-blur-sm">
                            <tr>
                                <th scope="col" className="px-6 py-4">{t('admin.users.table.user')}</th>
                                <th scope="col" className="px-6 py-4">{t('admin.users.table.rank')}</th>
                                <th scope="col" className="px-6 py-4">{t('admin.users.table.investment')}</th>
                                <th scope="col" className="px-6 py-4">Ledger</th>
                                <th scope="col" className="px-6 py-4">{t('admin.users.table.kycStatus')}</th>
                                <th scope="col" className="px-6 py-4">{t('admin.users.table.accountStatus')}</th>
                                <th scope="col" className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedUsers.map((user: User) => (
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
                    {filteredUsers.length === 0 && (
                        <div className="text-center py-20 bg-gray-800">
                            <p className="text-gray-500 italic">No users found matching your criteria.</p>
                        </div>
                    )}
                </div>
                
                {totalPages > 1 && (
                    <div className="flex flex-col sm:flex-row justify-between items-center mt-6 pt-4 border-t border-gray-700 gap-4">
                        <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                            Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, filteredUsers.length)} of {filteredUsers.length}
                        </div>
                        <div className="flex space-x-2">
                            <button 
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-xs font-bold"
                            >
                                Previous
                            </button>
                            {Array.from({ length: totalPages }).map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setCurrentPage(i + 1)}
                                    className={`w-8 h-8 rounded-md text-xs font-bold transition-all ${currentPage === i + 1 ? 'bg-brand-primary text-white shadow-lg' : 'bg-gray-700 text-gray-400 hover:text-white'}`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                            <button 
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-xs font-bold"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
            {isCreateModalOpen && <CreateUserModal onClose={() => setIsCreateModalOpen(false)} />}
            {editingUser && <EditUserModal user={editingUser} onClose={() => setEditingUser(null)} />}
            {adjustingUser && <FinancialAdjustmentModal user={adjustingUser} onClose={() => setAdjustingUser(null)} />}
            {reviewingKycUser && <KycReviewModal user={reviewingKycUser} onClose={() => setReviewingKycUser(null)} />}
            {adjustingRankUser && <AdjustRankModal user={adjustingRankUser} onClose={() => setAdjustingRankUser(null)} />}
            {addingInvestmentUser && <AddInvestmentModal user={addingInvestmentUser} onClose={() => setAddingInvestmentUser(null)} />}
            {investingBalanceUser && <InvestFromBalanceModal user={investingBalanceUser} onClose={() => setInvestingBalanceUser(null)} />}
        </div>
    );
};

export default UserManagement;
