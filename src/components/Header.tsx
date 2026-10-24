import React from 'react';
import { CharacterState } from '../types/game';

interface HeaderProps {
  state: CharacterState;
  onTogglePacing: () => void;
  onReset: () => void;
}

export const Header: React.FC<HeaderProps> = ({ state, onTogglePacing, onReset }) => {
  const getCountry = () => {
    if (typeof (window as any).C === 'function') {
      return (window as any).C();
    }
    const countries = (window as any).COUNTRIES;
    return countries?.[state.country] || { name: 'Unknown', flag: '🌍', currency: state.currency || 'USD' };
  };

  const country = getCountry();

  const getStage = (age: number) => {
    if (age < 13) return 'Childhood';
    if (age < 18) return 'Youth';
    if (age < 30) return 'Young Adult';
    if (age < 60) return 'Adulthood';
    return 'Senior';
  };

  const getJobTitle = () => {
    if (state.career?.job?.title) return state.career.job.title;
    if (state.job?.title) return state.job.title;
    if (state.uni) return `Student at ${state.uni.name}`;
    if (state.school) return 'In School';
    if (state.age >= 18) return 'Independent';
    return 'Growing up';
  };

  const formatMoney = (n: number) => {
    if (typeof (window as any).money === 'function') {
      return (window as any).money(n);
    }
    return `${Math.round(n).toLocaleString()} ${country.currency}`;
  };

  const currentYear = 2001 + (state.age || 6);
  const isMonthly = state.pacing === 'monthly';
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const currentMonthName = monthNames[((state.month || 1) - 1) % 12];
  const initial = state.name?.trim() ? state.name.trim().charAt(0).toUpperCase() : (state.gender === 'f' ? '♀' : '♂');
  const stage = getStage(state.age);

  // Life warnings and summary if available from engine
  const lifeSummary = typeof (window as any).lifeSummaryHtml === 'function' ? (window as any).lifeSummaryHtml() : '';
  const lifeWarnings = typeof (window as any).lifeWarningsHtml === 'function' ? (window as any).lifeWarningsHtml() : '';

  return (
    <div className="hud-panel">
      <div className="hud-top">
        <div className="hud-profile">
          <div className="hud-avatar-ring">
            {initial}
            <span className="hud-avatar-gender">{state.gender === 'f' ? '♀' : '♂'}</span>
          </div>
          <div className="hud-identity">
            <div className="hud-name-row">
              <span className="hud-name">{state.name}</span>
              <span className="hud-stage-pill">{stage} · Age {state.age}</span>
            </div>
            <div className="hud-meta-row">
              <span>{country.flag} {country.name}</span>
              <span>·</span>
              <span className="muted">{getJobTitle()}</span>
            </div>
          </div>
        </div>

        <div className="hud-finances">
          <div className="hud-wealth-label">NET WORTH</div>
          <div className={`hud-wealth-amount mono ${state.wealth < 0 ? 'bad' : 'good'}`}>
            {formatMoney(state.wealth)}
          </div>
          <div className="hud-controls">
            <button
              className="hud-ctrl-btn"
              onClick={onTogglePacing}
              title="Toggle Progression Pacing (Yearly vs Monthly)"
            >
              {isMonthly ? `🗓 ${currentMonthName} ${currentYear}` : `📅 ${currentYear}`}
            </button>
            <button
              className="hud-ctrl-btn"
              onClick={onReset}
              title="Restart Story"
            >
              ↻
            </button>
          </div>
        </div>
      </div>

      <div className="hud-vitals">
        <VitalTile name="Health" value={state.health} cls="vital-health" icon="🫀" />
        <VitalTile name="Happiness" value={state.happiness} cls="vital-happy" icon="☀️" />
        <VitalTile name="Smarts" value={state.smarts} cls="vital-smarts" icon="💡" />
        <VitalTile name="Social" value={state.social} cls="vital-social" icon="💬" />
      </div>

      {lifeSummary && (
        <div className="hud-status-strip" dangerouslySetInnerHTML={{ __html: lifeSummary }} />
      )}
      {lifeWarnings && (
        <div dangerouslySetInnerHTML={{ __html: lifeWarnings }} />
      )}
    </div>
  );
};

interface VitalTileProps {
  name: string;
  value: number;
  cls: string;
  icon: string;
}

const VitalTile: React.FC<VitalTileProps> = ({ name, value, cls, icon }) => {
  const clamped = Math.max(0, Math.min(100, Math.round(Number(value) || 0)));
  return (
    <div className={`vital-tile ${cls}`}>
      <div className="vital-top">
        <span className="vital-name">{icon} {name}</span>
        <span className="vital-val small mono">{clamped}%</span>
      </div>
      <div className="vital-track">
        <div className="vital-fill" style={{ width: `${clamped}%` }} />
      </div>
    </div>
  );
};
