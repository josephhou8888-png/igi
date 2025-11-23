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
import { UserPlusIcon } from '../../constants';

const UserManagement: React.FC = () => {
    const { users, toggleFreezeUser, deleteUser, updateUserRole } = useAppContext();
    const { t } = useLocalization();
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [adjustingUser, setAdjustingUser] = useState<User | null>(null);
    const [reviewingKycUser, setReviewingKycUser] = useState<User | null>(null);
    const [adjustingRankUser, setAdjustingRankUser] = useState<User | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [addingInvestmentUser, setAddingInvestmentUser] = useState<User | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredUsers = useMemo(() => {
        if (!searchTerm) {
            return users.filter(u => u.role !== 'admin');
        }
        return users.filter(u =>
            u.role !== 'admin' &&
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
        const headers = ["ID", "Name", "Email", "Rank", "Upline ID", "Total Investment", "KYC Status", "Account Status", "Join Date"];
        const csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + users.map(u => [
                u.id,
                `"${u.name}"`,
                u.email,
                `L${u.rank}`,
                u.uplineId || "None",
                u.totalInvestment,
                u.kycStatus,
                u.isFrozen ? "Frozen" : "Active",
                u.joinDate
            ].join(",")).join("\n");
        
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
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-300">
                        <thead className="text-xs text-gray-400 uppercase bg-gray-700">
                            <tr>
                                <th scope="col" className="px-6 py-3">{t('admin.users.table.user')}</th>
                                <th scope="col" className="px-6 py-3">{t('admin.users.table.rank')}</th>
                                <th scope="col" className="px-6 py-3">{t('admin.users.table.investment')}</th>
                                <th scope="col" className="px-6 py-3">{t('admin.users.table.kycStatus')}</th>
                                <th scope="col" className="px-6 py-3">{t('admin.users.table.accountStatus')}</th>
                                <th scope="col" className="px-6 py-3 text-right">{t('admin.users.table.actions')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map((user: User) => (
                                <tr key={user.id} className={`border-b border-gray-700 hover:bg-gray-600 ${user.isFrozen ? 'opacity-60 bg-red-900/20' : 'bg-gray-800'}`}>
                                    <td className="px-6 py-4 font-medium text-white flex items-center space-x-3">
                                        <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full" />
                                        <div>
                                            <p>{user.name}</p>
                                            <p className="text-xs text-gray-400">{user.email}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">L{user.rank}</td>
                                    <td className="px-6 py-4">${user.totalInvestment.toLocaleString()}</td>
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
                                    <td className="px-6 py-4 text-right">
                                       <AdminUserMenu
                                            user={user}
                                            onAddInvestment={() => setAddingInvestmentUser(user)}
                                            onAdjustWallet={() => setAdjustingUser(user)}
                                            onAdjustRank={() => setAdjustingRankUser(user)}
                                            onToggleFreeze={() => toggleFreezeUser(user.id)}
                                            onEdit={() => setEditingUser(user)}
                                            onDelete={() => deleteUser(user.id)}
                                            onChangeRole={updateUserRole}
                                        />
                                    </td>
                                </tr>
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
        </>
    );
};

export default UserManagement;