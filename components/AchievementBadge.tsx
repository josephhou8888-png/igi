import React from 'react';
import { AwardIcon, ACHIEVEMENTS_LIST } from '../constants';
import { useLocalization } from '../hooks/useLocalization';

interface AchievementBadgeProps {
  achievementId: string;
}

const AchievementBadge: React.FC<AchievementBadgeProps> = ({ achievementId }) => {
  const { t } = useLocalization();
  const achievementDetails = ACHIEVEMENTS_LIST.find(a => a.id === achievementId);
  
  if (!achievementDetails) {
    return null;
  }

  const name = t(achievementDetails.nameKey);
  const description = t(achievementDetails.descriptionKey);
  const Icon = achievementDetails.icon || AwardIcon;
  
  return (
    <div 
        className="flex items-center bg-gray-700 border border-brand-secondary rounded-full px-4 py-2"
        title={description}
    >
      <Icon className="w-5 h-5 text-yellow-400 mr-2 flex-shrink-0" />
      <span className="font-semibold text-sm text-gray-200">{name}</span>
    </div>
  );
};

export default AchievementBadge;