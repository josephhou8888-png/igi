
import React, { useState, useRef, useEffect } from 'react';
import { User } from '../../types';
import { MoreVerticalIcon, DollarSignIcon, EditIcon, TrashIcon, ZapIcon, ZapOffIcon, ShieldIcon, AwardIcon, PlusCircleIcon, WalletIcon } from '../../constants';
import { useLocalization } from '../../hooks/useLocalization';

interface AdminUserMenuProps {
  user: User;
  onAdjustWallet: () => void;
  onToggleFreeze: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onChangeRole: (userId: string, role: 'user' | 'admin') => void;
  onAdjustRank: () => void;
  onAddInvestment: () => void;
  onInvestFromBalance: () => void;
}

const AdminUserMenu: React.FC<AdminUserMenuProps> = ({ user, onAdjustWallet, onToggleFreeze, onEdit, onDelete, onChangeRole, onAdjustRank, onAddInvestment, onInvestFromBalance }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { t } = useLocalization();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleActionClick = (action: () => void) => {
    action();
    setIsOpen(false);
  };

  const handleChangeRole = () => {
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    if(window.confirm(t('admin.userMenu.confirmChangeRole', { name: user.name, role: newRole }))) {
      onChangeRole(user.id, newRole);
    }
  }

  const MenuItem: React.FC<{
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
    className?: string;
  }> = ({ icon, label, onClick, className = 'text-gray-300' }) => (
    <li>
      <button
        onClick={() => handleActionClick(onClick)}
        className={`w-full text-left flex items-center px-4 py-2 text-sm hover:bg-gray-600 ${className}`}
      >
        {icon}
        <span className="ml-3">{label}</span>
      </button>
    </li>
  );

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-gray-400 rounded-full hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
      >
        <MoreVerticalIcon className="w-5 h-5" />
      </button>
      {isOpen && (
        <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-gray-700 ring-1 ring-black ring-opacity-5 z-10">
          <ul className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
            <MenuItem
              icon={<PlusCircleIcon className="w-5 h-5 text-teal-400" />}
              label={t('admin.userMenu.addInvestment')}
              onClick={onAddInvestment}
              className="text-teal-400"
            />
            <MenuItem
              icon={<WalletIcon className="w-5 h-5 text-blue-400" />}
              label={t('admin.userMenu.investFromWallet')}
              onClick={onInvestFromBalance}
              className="text-blue-400"
            />
            <MenuItem
              icon={<DollarSignIcon className="w-5 h-5 text-green-400" />}
              label={t('admin.userMenu.adjustWallet')}
              onClick={onAdjustWallet}
              className="text-green-400"
            />
            <MenuItem
              icon={<AwardIcon className="w-5 h-5 text-yellow-400" />}
              label={t('admin.userMenu.adjustRank')}
              onClick={onAdjustRank}
              className="text-yellow-400"
            />
            <MenuItem
              icon={<ShieldIcon className="w-5 h-5 text-purple-400" />}
              label={user.role === 'admin' ? t('admin.userMenu.demoteToUser') : t('admin.userMenu.promoteToAdmin')}
              onClick={handleChangeRole}
              className="text-purple-400"
            />
            <MenuItem
              icon={user.isFrozen ? <ZapOffIcon className="w-5 h-5 text-blue-400" /> : <ZapIcon className="w-5 h-5 text-orange-400" />}
              label={user.isFrozen ? t('admin.userMenu.unfreezeAccount') : t('admin.userMenu.freezeAccount')}
              onClick={onToggleFreeze}
              className={user.isFrozen ? 'text-blue-400' : 'text-orange-400'}
            />
            <MenuItem
              icon={<EditIcon className="w-5 h-5 text-cyan-400" />}
              label={t('admin.userMenu.editUser')}
              onClick={onEdit}
              className="text-cyan-400"
            />
             <MenuItem
              icon={<TrashIcon className="w-5 h-5 text-red-400" />}
              label={t('admin.userMenu.deleteUser')}
              onClick={onDelete}
              className="text-red-400"
            />
          </ul>
        </div>
      )}
    </div>
  );
};

export default AdminUserMenu;
