import React, { useEffect } from 'react';
import { CharacterState } from '../types/game';

interface EncounterCardProps {
  pending: CharacterState['pending'];
  age: number;
  onChoose: (index: number) => void;
  state: CharacterState;
}

export const EncounterCard: React.FC<EncounterCardProps> = ({ pending, age, onChoose, state }) => {
  if (!pending) return null;

  const title = typeof pending.title === 'function' ? pending.title(state) : pending.title;
  const text = typeof pending.text === 'function' ? pending.text(state) : pending.text;
  const keys = ['A', 'B', 'C', 'D', 'E', 'F'];

  const availableChoices = pending.choices.map((choice, index) => {
    const isAvailable = typeof choice.available === 'function' ? choice.available(state) : true;
    const label = typeof choice.label === 'function' ? choice.label(state) : choice.label;
    return {
      index,
      key: keys[index] || String(index + 1),
      label,
      isAvailable,
    };
  }).filter(c => c.isAvailable);

  // Keyboard support: pressing A, B, C, D selects the option!
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;
      const keyUpper = e.key.toUpperCase();
      const match = availableChoices.find(c => c.key === keyUpper);
      if (match) {
        onChoose(match.index);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [availableChoices, onChoose]);

  return (
    <div className="encounter-card animate-fade-in" style={{ marginBottom: 14 }}>
      <div className="encounter-badge">✦ CRITICAL DECISION · AGE {age}</div>
      <div className="encounter-title">{title}</div>
      <div className="encounter-text">{text}</div>
      <div className="encounter-choices">
        {availableChoices.map((choice) => (
          <button
            key={choice.index}
            className="encounter-opt"
            onClick={() => onChoose(choice.index)}
          >
            <span className="choice-key">{choice.key}</span>
            <span>{choice.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
