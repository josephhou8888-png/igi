
import React, { useState } from 'react';
import { User } from '../types';

interface UserNodeProps {
  user: User;
  allUsers: User[];
  level: number;
}

const UserNode: React.FC<UserNodeProps> = ({ user, allUsers, level }) => {
  const [isExpanded, setIsExpanded] = useState(level < 2); // Auto-expand first 2 levels
  const children = allUsers.filter(u => u.uplineId === user.id);

  const handleToggle = () => {
    if (children.length > 0) {
      setIsExpanded(!isExpanded);
    }
  };

  const rankColor = `hsl(${(user.rank / 9) * 120}, 60%, 50%)`; // Green to Yellow

  return (
    <div className="ml-4">
      <div 
        className="flex items-center my-2 p-2 rounded-lg bg-gray-700 cursor-pointer hover:bg-gray-600 transition-colors"
        onClick={handleToggle}
      >
        <div className="flex-shrink-0">
          {children.length > 0 && (
            <span className={`transition-transform transform ${isExpanded ? 'rotate-90' : 'rotate-0'}`}>▼</span>
          )}
        </div>
        <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full ml-2" />
        <div className="ml-3 flex-grow">
          <p className="font-semibold text-white">{user.name}</p>
          <p className="text-xs text-gray-400">{user.email}</p>
        </div>
        <div className="flex items-center space-x-4 text-xs mx-4">
          <div><span className="font-semibold">Downline:</span> {children.length}</div>
          <div><span className="font-semibold">Total Invested:</span> ${user.totalInvestment.toLocaleString()}</div>
        </div>
        <div className="flex items-center">
            <span className="font-bold text-sm px-2 py-1 rounded" style={{ backgroundColor: rankColor, color: '#000' }}>
            L{user.rank}
            </span>
        </div>
      </div>
      {isExpanded && children.length > 0 && (
        <div className="pl-6 border-l-2 border-gray-600">
          {children.map(child => (
            <UserNode key={child.id} user={child} allUsers={allUsers} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

interface NetworkTreeProps {
  rootUserId: string;
  allUsers: User[];
}

const NetworkTree: React.FC<NetworkTreeProps> = ({ rootUserId, allUsers }) => {
  const rootUser = allUsers.find(u => u.id === rootUserId);

  if (!rootUser) {
    return <div>Root user not found.</div>;
  }

  return (
    <div>
      <UserNode user={rootUser} allUsers={allUsers} level={0} />
    </div>
  );
};

export default NetworkTree;
