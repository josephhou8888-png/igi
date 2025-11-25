
import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const { t } = useLocalization();

  // Calculate position and open menu
  const toggleMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOpen) {
        setIsOpen(false);
        return;
    }

    if (buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        const menuHeight = 360; // Approx height of menu
        
        // Determine if menu should open up or down based on space
        // Using absolute positioning relative to document body
        let top = rect.bottom + window.scrollY;
        if (rect.bottom + menuHeight > windowHeight) {
            top = rect.top + window.scrollY - menuHeight;
        }

        // Align to the left of the button (menu width approx 224px / w-56)
        const left = rect.right + window.scrollX - 224; 

        setMenuPosition({ top, left });
        setIsOpen(true);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
        if (isOpen) setIsOpen(false);
    };
    const handleClickOutside = (event: MouseEvent) => {
      // Check if click is outside the button AND outside the menu
      if (
          buttonRef.current && 
          !buttonRef.current.contains(event.target as Node) &&
          menuRef.current &&
          !menuRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    let scrollTimer: any;

    if (isOpen) {
        // Add a small delay to attaching the scroll listener to prevent immediate closure
        // if the click triggers a focus scroll
        scrollTimer = setTimeout(() => {
            window.addEventListener('scroll', handleScroll, true);
        }, 50);
        document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      clearTimeout(scrollTimer);
      window.removeEventListener('scroll', handleScroll, true);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleActionClick = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    setIsOpen(false);
    action();
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
        onClick={(e) => handleActionClick(e, onClick)}
        className={`w-full text-left flex items-center px-4 py-2 text-sm hover:bg-gray-600 ${className}`}
      >
        {icon}
        <span className="ml-3">{label}</span>
      </button>
    </li>
  );

  return (
    <>
      <button
        ref={buttonRef}
        onClick={toggleMenu}
        className="p-2 text-gray-400 rounded-full hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
      >
        <MoreVerticalIcon className="w-5 h-5" />
      </button>
      
      {isOpen && createPortal(
        <div 
            ref={menuRef}
            className="absolute z-[9999] w-56 rounded-md shadow-lg bg-gray-700 ring-1 ring-black ring-opacity-5"
            style={{ top: menuPosition.top, left: menuPosition.left }}
            onClick={(e) => e.stopPropagation()}
        >
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
        </div>,
        document.body
      )}
    </>
  );
};

export default AdminUserMenu;
