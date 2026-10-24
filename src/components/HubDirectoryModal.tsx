import React from 'react';

interface HubDirectoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
  onSelectTab: (tabId: string) => void;
}

export const HubDirectoryModal: React.FC<HubDirectoryModalProps> = ({
  isOpen,
  onClose,
  activeTab,
  onSelectTab,
}) => {
  if (!isOpen) return null;

  const categories = [
    {
      title: 'Wealth & Possessions',
      items: [
        { id: 'bank', icon: '🏦', name: 'Banking', desc: 'Accounts, loans, deposits' },
        { id: 'realestate', icon: '🏠', name: 'Real Estate', desc: 'Rentals, buying, mortgages' },
        { id: 'cars', icon: '🚗', name: 'Vehicles', desc: 'Buy, sell, customize cars' },
        { id: 'assets', icon: '💎', name: 'Assets & Gold', desc: 'Holdings, gold hedges' },
        { id: 'shopping', icon: '🛍', name: 'Shopping', desc: 'Electronics, luxury, goods' },
      ],
    },
    {
      title: 'Relationships & Connections',
      items: [
        { id: 'family', icon: '❤️', name: 'Family', desc: 'Parents, siblings, relatives' },
        { id: 'marriage', icon: '💍', name: 'Romance & Marriage', desc: 'Partners, proposals, dates' },
        { id: 'children', icon: '👶', name: 'Children', desc: 'Parenting, school fees' },
        { id: 'friends', icon: '👥', name: 'Friends', desc: 'Social circle, gatherings' },
      ],
    },
    {
      title: 'Career & Development',
      items: [
        { id: 'career', icon: '💼', name: 'Work & Career', desc: 'Jobs, promotions, freelance' },
        { id: 'school', icon: '🎓', name: 'Education', desc: 'Schools, universities, degrees' },
      ],
    },
    {
      title: 'Wellbeing, Leisure & World',
      items: [
        { id: 'medical', icon: '🏥', name: 'Healthcare', desc: 'Doctor visits, conditions, vitality' },
        { id: 'lifestyle', icon: '🌴', name: 'Daily Lifestyle', desc: 'Gym, dining, routines' },
        { id: 'vacations', icon: '✈️', name: 'Travel & Vacations', desc: 'Trips, getaways, retreats' },
        { id: 'immigration', icon: '🌍', name: 'Living Abroad', desc: 'Visas, relocation, residency' },
      ],
    },
  ];

  return (
    <div id="more-menu" className="active" style={{ display: 'block' }}>
      <div className="hub-header">
        <h2>Life Directory & Hubs</h2>
        <p>Explore every aspect of your career, wealth, family, and journey.</p>
      </div>

      <div id="more-grid-content">
        {categories.map((cat) => (
          <div key={cat.title} className="hub-section">
            <div className="hub-section-title">{cat.title}</div>
            <div className="hub-grid">
              {cat.items.map((it) => {
                const isOn = activeTab === it.id;
                return (
                  <button
                    key={it.id}
                    className={`hub-card-btn ${isOn ? 'on' : ''}`}
                    onClick={() => {
                      onSelectTab(it.id);
                      onClose();
                    }}
                  >
                    <div className="hub-card-icon">{it.icon}</div>
                    <div className="hub-card-info">
                      <div className="hub-card-name">{it.name}</div>
                      <div className="hub-card-desc">{it.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <button id="more-close-btn" onClick={onClose}>
        ✕ Close Directory
      </button>
    </div>
  );
};
