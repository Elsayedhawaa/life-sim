import React from 'react';
import { CharacterState } from '../types/game';

interface BottomDeckProps {
  state: CharacterState;
  activeTab: string;
  onAgeUp: () => void;
  onFastForward: () => void;
  onReset: () => void;
  onSwitchTab: (tabId: string) => void;
  onOpenHub: () => void;
}

export const BottomDeck: React.FC<BottomDeckProps> = ({
  state,
  activeTab,
  onAgeUp,
  onFastForward,
  onReset,
  onSwitchTab,
  onOpenHub,
}) => {
  const isMonthly = state.pacing === 'monthly';
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const currentYear = 2001 + (state.age || 6);
  const nextMonth = ((state.month || 1) % 12) + 1;
  const nextMonthName = monthNames[nextMonth - 1];
  const yearRolloverLabel = nextMonth === 1 ? ` (Age ${state.age + 1})` : '';
  const canFastForward = (state.month || 1) !== 1;

  const isLife = activeTab === 'life';
  const isCareer = activeTab === 'career' || activeTab === 'school';
  const isWealth = ['bank', 'realestate', 'cars', 'assets', 'shopping'].includes(activeTab);
  const isPeople = ['family', 'marriage', 'children', 'friends'].includes(activeTab);
  const isWorld = ['medical', 'lifestyle', 'vacations', 'immigration'].includes(activeTab);

  const renderActionButton = () => {
    if (state.pending) {
      return (
        <button disabled style={{ opacity: 0.7, cursor: 'not-allowed' }}>
          ⏳ Pending Decision — Choose an option above
        </button>
      );
    }

    if (state.age >= 100) {
      return (
        <button onClick={onReset} style={{ background: '#6366f1' }}>
          🕊 Life Complete — Begin Anew
        </button>
      );
    }

    if (isMonthly) {
      return (
        <div className="action-deck-row" style={{ display: 'flex', gap: 8 }}>
          <button onClick={onAgeUp} style={{ flex: 1 }}>
            Advance Month → {nextMonthName} {currentYear}{yearRolloverLabel}
          </button>
          <button
            className="btn-fastforward"
            onClick={onFastForward}
            disabled={!canFastForward}
            title="Fast-forward to Year End"
          >
            ⏩
          </button>
        </div>
      );
    }

    return (
      <button onClick={onAgeUp}>
        Advance Year → Age {state.age + 1} ({currentYear + 1})
      </button>
    );
  };

  return (
    <>
      <div id="bottom">{renderActionButton()}</div>

      <div id="tabs">
        <button
          className={isLife ? 'on' : ''}
          onClick={() => onSwitchTab('life')}
        >
          <span className="icon">📖</span>
          <span>Life</span>
        </button>
        <button
          className={isCareer ? 'on' : ''}
          onClick={() => onSwitchTab(state.age < 18 ? 'school' : 'career')}
        >
          <span className="icon">💼</span>
          <span>Career</span>
        </button>
        <button
          className={isWealth ? 'on' : ''}
          onClick={() => onSwitchTab('bank')}
        >
          <span className="icon">🏦</span>
          <span>Finance</span>
        </button>
        <button
          className={isPeople ? 'on' : ''}
          onClick={() => onSwitchTab('family')}
        >
          <span className="icon">👥</span>
          <span>People</span>
        </button>
        <button
          className={isWorld ? 'on' : ''}
          onClick={onOpenHub}
        >
          <span className="icon">🧭</span>
          <span>Hub</span>
        </button>
      </div>
    </>
  );
};
