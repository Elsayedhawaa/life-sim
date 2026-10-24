import React, { useState, useEffect } from 'react';

interface StartScreenProps {
  onStartGame: (startConfig: {
    name: string;
    gender: 'm' | 'f';
    country: string;
    familyTier: string;
    parentType: string;
    pacing: 'yearly' | 'monthly';
  }) => void;
  onResumeGame?: () => void;
  hasSavedGame?: boolean;
}

export const StartScreen: React.FC<StartScreenProps> = ({
  onStartGame,
  onResumeGame,
  hasSavedGame = false,
}) => {
  const [name, setName] = useState('');
  const [gender, setGender] = useState<'m' | 'f'>('m');
  const [country, setCountry] = useState('egy');
  const [familyTier, setFamilyTier] = useState('middle');
  const [parentType, setParentType] = useState('balanced');
  const [pacing, setPacing] = useState<'yearly' | 'monthly'>('yearly');

  const countries = (typeof window !== 'undefined' && (window as any).COUNTRIES) || {
    egy: { id: 'egy', name: 'Egypt', flag: '🇪🇬', currency: 'EGP' },
    usa: { id: 'usa', name: 'United States', flag: '🇺🇸', currency: 'USD' },
    sau: { id: 'sau', name: 'Saudi Arabia', flag: '🇸🇦', currency: 'SAR' },
    uae: { id: 'uae', name: 'United Arab Emirates', flag: '🇦🇪', currency: 'AED' },
    gbr: { id: 'gbr', name: 'United Kingdom', flag: '🇬🇧', currency: 'GBP' },
    deu: { id: 'deu', name: 'Germany', flag: '🇩🇪', currency: 'EUR' },
    can: { id: 'can', name: 'Canada', flag: '🇨🇦', currency: 'CAD' },
    aus: { id: 'aus', name: 'Australia', flag: '🇦🇺', currency: 'AUD' },
    fra: { id: 'fra', name: 'France', flag: '🇫🇷', currency: 'EUR' },
    jpn: { id: 'jpn', name: 'Japan', flag: '🇯🇵', currency: 'JPY' },
    ita: { id: 'ita', name: 'Italy', flag: '🇮🇹', currency: 'EUR' },
    bra: { id: 'bra', name: 'Brazil', flag: '🇧🇷', currency: 'BRL' },
    ind: { id: 'ind', name: 'India', flag: '🇮🇳', currency: 'INR' },
  };

  const randomizeName = (cKey = country, gKey = gender) => {
    if (typeof (window as any).randomizeStartName === 'function') {
      const startObj = (window as any).START;
      if (startObj) {
        startObj.country = cKey;
        startObj.gender = gKey;
      }
      (window as any).randomizeStartName();
      if (startObj?.name) {
        setName(startObj.name);
        return;
      }
    }
    const sampleNames: Record<string, Record<string, string[]>> = {
      egy: { m: ['Ahmed', 'Omar', 'Youssef', 'Karim', 'Hassan'], f: ['Sarah', 'Layla', 'Mariam', 'Hana', 'Salma'] },
      usa: { m: ['Michael', 'David', 'James', 'Daniel', 'Ryan'], f: ['Emily', 'Sarah', 'Jessica', 'Olivia', 'Emma'] },
    };
    const pool = sampleNames[cKey]?.[gKey] || ['Alex', 'Sam', 'Jordan', 'Taylor', 'Morgan'];
    setName(pool[Math.floor(Math.random() * pool.length)]);
  };

  useEffect(() => {
    if (!name) {
      randomizeName(country, gender);
    }
  }, []);

  const handleGenderSelect = (g: 'm' | 'f') => {
    setGender(g);
    randomizeName(country, g);
  };

  const handleCountrySelect = (c: string) => {
    setCountry(c);
    randomizeName(c, gender);
  };

  const selectedC = countries[country] || countries.egy;

  return (
    <div className="start-container">
      <div className="start-hero">
        <div className="start-kicker">A Bespoke Life Simulation</div>
        <h1>World Life</h1>
        <p>
          Begin your story at age six. Forge a unique destiny shaped by economics,
          family heritage, careers, and the choices you make along the way.
        </p>
      </div>

      <div className="start-section">
        <div className="start-section-title">Character Identity</div>
        <div className="name-input-group">
          <input
            id="start-name"
            value={name}
            placeholder="Enter character name"
            onChange={(e) => setName(e.target.value)}
          />
          <button
            className="btn-dice"
            onClick={() => randomizeName(country, gender)}
            title="Generate Random Name"
          >
            🎲
          </button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 10 }}>
          <button
            className={`pill ${gender === 'm' ? 'on' : ''}`}
            onClick={() => handleGenderSelect('m')}
          >
            👨 Male
          </button>
          <button
            className={`pill ${gender === 'f' ? 'on' : ''}`}
            onClick={() => handleGenderSelect('f')}
          >
            👩 Female
          </button>
        </div>
      </div>

      <div className="start-section">
        <div className="start-section-title">Birthplace & Economy</div>
        <div className="country-grid">
          {Object.keys(countries).map((id) => {
            const c = countries[id];
            const isOn = country === id;
            return (
              <div
                key={id}
                className={`country-card ${isOn ? 'on' : ''}`}
                onClick={() => handleCountrySelect(id)}
              >
                <div className="country-card-flag">{c.flag}</div>
                <div className="country-card-name">{c.name}</div>
                <div className="country-card-curr">{c.currency}</div>
              </div>
            );
          })}
        </div>
      </div>

      <details className="life-details" style={{ marginBottom: 12 }}>
        <summary>Upbringing, Heritage & Time Pacing</summary>
        <div className="card" style={{ marginTop: 10, background: 'var(--bg-surface-raised)' }}>
          <div className="start-section-title">Family Wealth Background</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6, marginTop: 6 }}>
            {['poor', 'lower-mid', 'middle', 'upper-mid', 'wealthy', 'ultra'].map((tier) => (
              <button
                key={tier}
                className={`pill ${familyTier === tier ? 'on' : ''}`}
                onClick={() => setFamilyTier(tier)}
              >
                {tier === 'lower-mid' ? 'Lower-Mid' : tier === 'upper-mid' ? 'Upper-Mid' : tier === 'ultra' ? 'Ultra-Rich' : tier.charAt(0).toUpperCase() + tier.slice(1)}
              </button>
            ))}
          </div>

          <div className="start-section-title" style={{ marginTop: 14 }}>Parenting Approach</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6, marginTop: 6 }}>
            {['strict', 'balanced', 'warm'].map((type) => (
              <button
                key={type}
                className={`pill ${parentType === type ? 'on' : ''}`}
                onClick={() => setParentType(type)}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>

          <div className="start-section-title" style={{ marginTop: 14 }}>Time Progression Pacing</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 6 }}>
            <button
              className={`pill ${pacing === 'yearly' ? 'on' : ''}`}
              onClick={() => setPacing('yearly')}
            >
              📅 Yearly Pace
            </button>
            <button
              className={`pill ${pacing === 'monthly' ? 'on' : ''}`}
              onClick={() => setPacing('monthly')}
            >
              🗓 Monthly Pace
            </button>
          </div>
          <p className="muted small" style={{ marginTop: 8 }}>
            Yearly = 1 advance per year. Monthly = 12 seasonal months per year with monthly payroll and bills.
          </p>
        </div>
      </details>

      <button
        className="btn-begin-life"
        onClick={() => onStartGame({ name: name || 'You', gender, country, familyTier, parentType, pacing })}
      >
        Begin Life in {selectedC.name} →
      </button>

      {hasSavedGame && onResumeGame && (
        <button
          className="opt"
          onClick={onResumeGame}
          style={{ marginTop: 10, textAlign: 'center', justifyContent: 'center' }}
        >
          ↺ Resume Saved Life
        </button>
      )}
    </div>
  );
};
