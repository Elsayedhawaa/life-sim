import React from 'react';

interface SubnavProps {
  activeTab: string;
  onSwitchTab: (tabId: string) => void;
}

export const Subnav: React.FC<SubnavProps> = ({ activeTab, onSwitchTab }) => {
  const groups: Record<string, Array<{ id: string; label: string }>> = {
    career: [
      { id: 'career', label: '💼 Career' },
      { id: 'school', label: '🎓 Education' },
    ],
    wealth: [
      { id: 'bank', label: '🏦 Banking' },
      { id: 'realestate', label: '🏠 Real Estate' },
      { id: 'cars', label: '🚗 Vehicles' },
      { id: 'assets', label: '💎 Assets' },
      { id: 'shopping', label: '🛍 Shopping' },
    ],
    people: [
      { id: 'family', label: '❤️ Family' },
      { id: 'marriage', label: '💍 Marriage' },
      { id: 'children', label: '👶 Children' },
      { id: 'friends', label: '👥 Friends' },
    ],
    world: [
      { id: 'medical', label: '🏥 Healthcare' },
      { id: 'lifestyle', label: '🌴 Daily Life' },
      { id: 'vacations', label: '✈️ Travel' },
      { id: 'immigration', label: '🌍 Immigration' },
    ],
  };

  let activeGroup: Array<{ id: string; label: string }> | null = null;
  for (const key in groups) {
    if (groups[key].some(item => item.id === activeTab)) {
      activeGroup = groups[key];
      break;
    }
  }

  if (!activeGroup) return null;

  return (
    <div className="subnav-container">
      <div className="subnav-strip">
        {activeGroup.map((item) => (
          <button
            key={item.id}
            className={`subnav-btn ${activeTab === item.id ? 'on' : ''}`}
            onClick={() => onSwitchTab(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
};
