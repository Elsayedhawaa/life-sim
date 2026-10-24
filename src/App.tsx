import React, { useState, useEffect, useCallback } from 'react';
import { CharacterState } from './types/game';
import { Header } from './components/Header';
import { EncounterCard } from './components/EncounterCard';
import { Subnav } from './components/Subnav';
import { ViewContainer } from './components/ViewContainer';
import { BottomDeck } from './components/BottomDeck';
import { HubDirectoryModal } from './components/HubDirectoryModal';
import { StartScreen } from './components/StartScreen';

const SAVE_KEY = 'world_life_v5';

export const App: React.FC = () => {
  const [gameState, setGameState] = useState<CharacterState | null>(null);
  const [activeTab, setActiveTab] = useState<string>('life');
  const [isHubOpen, setIsHubOpen] = useState<boolean>(false);
  const [hasSavedGame, setHasSavedGame] = useState<boolean>(false);
  const [isReady, setIsReady] = useState<boolean>(false);

  // Sync React state from engine globals
  const syncState = useCallback(() => {
    if (typeof window === 'undefined') return;
    const win = window as any;
    if (win.S) {
      setGameState({ ...win.S });
    } else {
      setGameState(null);
    }
    if (win.activeTab) {
      setActiveTab(win.activeTab);
    }
    try {
      setHasSavedGame(!!localStorage.getItem(SAVE_KEY));
    } catch (e) {
      // ignore
    }
  }, []);

  // Hook into the engine on mount
  useEffect(() => {
    const win = window as any;

    const setupEngineHooks = () => {
      // Intercept window.render so any engine action updates React
      const prevRender = win.render;
      win.render = () => {
        if (typeof prevRender === 'function') {
          try {
            prevRender();
          } catch (e) {
            console.warn('Legacy render execution notice:', e);
          }
        }
        syncState();
      };

      // Also listen to GameHooks 'render'
      if (win.GameHooks && typeof win.GameHooks.on === 'function') {
        win.GameHooks.on('render', () => {
          syncState();
        });
      }

      // Check if a saved game exists and can be loaded
      try {
        const raw = localStorage.getItem(SAVE_KEY);
        if (raw) {
          setHasSavedGame(true);
          if (typeof win.loadGame === 'function') {
            win.loadGame();
          }
        }
      } catch (e) {
        console.warn('Could not inspect saved state:', e);
      }

      syncState();
      setIsReady(true);
    };

    // If COUNTRIES and engine are already loaded
    if (win.COUNTRIES && win.GameHooks) {
      setupEngineHooks();
    } else {
      // Wait briefly for script tags if needed
      const timer = setTimeout(setupEngineHooks, 100);
      return () => clearTimeout(timer);
    }
  }, [syncState]);

  const handleStartGame = (startConfig: {
    name: string;
    gender: 'm' | 'f';
    country: string;
    familyTier: string;
    parentType: string;
    pacing: 'yearly' | 'monthly';
  }) => {
    const win = window as any;
    win.START = {
      name: startConfig.name,
      gender: startConfig.gender,
      country: startConfig.country,
      familyTier: startConfig.familyTier,
      parentType: startConfig.parentType,
      pacing: startConfig.pacing,
    };
    if (typeof win.startGame === 'function') {
      win.startGame();
    } else if (typeof win.newLife === 'function') {
      win.newLife();
    }
    syncState();
  };

  const handleResumeGame = () => {
    const win = window as any;
    if (typeof win.loadGame === 'function') {
      win.loadGame();
      syncState();
    }
  };

  const handleReset = () => {
    const win = window as any;
    if (typeof win.reset === 'function') {
      win.reset();
      syncState();
    }
  };

  const handleAgeUp = () => {
    const win = window as any;
    if (typeof win.ageUp === 'function') {
      win.ageUp();
      syncState();
    }
  };

  const handleFastForward = () => {
    const win = window as any;
    if (typeof win.fastForwardToYearEnd === 'function') {
      win.fastForwardToYearEnd();
      syncState();
    }
  };

  const handleTogglePacing = () => {
    const win = window as any;
    if (typeof win.togglePacing === 'function') {
      win.togglePacing();
      syncState();
    }
  };

  const handleSwitchTab = (tabId: string) => {
    const win = window as any;
    if (typeof win.switchTab === 'function') {
      win.switchTab(tabId);
    } else {
      win.activeTab = tabId;
      win.render?.();
    }
    setActiveTab(tabId);
    syncState();
  };

  const handleChooseEvent = (choiceIndex: number) => {
    const win = window as any;
    if (typeof win.chooseEvent === 'function') {
      win.chooseEvent(choiceIndex);
      syncState();
    }
  };

  if (!isReady) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', color: '#94a3b8' }}>
        <span>Loading simulation...</span>
      </div>
    );
  }

  if (!gameState) {
    return (
      <StartScreen
        onStartGame={handleStartGame}
        onResumeGame={handleResumeGame}
        hasSavedGame={hasSavedGame}
      />
    );
  }

  return (
    <>
      <Header
        state={gameState}
        onTogglePacing={handleTogglePacing}
        onReset={handleReset}
      />

      <EncounterCard
        pending={gameState.pending}
        age={gameState.age}
        onChoose={handleChooseEvent}
        state={gameState}
      />

      <Subnav
        activeTab={activeTab}
        onSwitchTab={handleSwitchTab}
      />

      <ViewContainer
        activeTab={activeTab}
        state={gameState}
        onRefresh={syncState}
      />

      <BottomDeck
        state={gameState}
        activeTab={activeTab}
        onAgeUp={handleAgeUp}
        onFastForward={handleFastForward}
        onReset={handleReset}
        onSwitchTab={handleSwitchTab}
        onOpenHub={() => setIsHubOpen(true)}
      />

      <HubDirectoryModal
        isOpen={isHubOpen}
        onClose={() => setIsHubOpen(false)}
        activeTab={activeTab}
        onSelectTab={handleSwitchTab}
      />
    </>
  );
};

export default App;
