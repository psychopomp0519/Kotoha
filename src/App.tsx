import { useEffect, useState } from 'react';
import { useUIStore } from './store/uiStore';
import { useGameStore } from './store/gameStore';
import { loadGame, saveGame } from './store/persistence';
import { startGameLoop, stopGameLoop } from './engine/GameLoop';
import { Sidebar } from './ui/layouts/Sidebar';
import { BottomTabs } from './ui/layouts/BottomTabs';
import { GuildScreen } from './ui/screens/GuildScreen';
import { ExpeditionScreen } from './ui/screens/ExpeditionScreen';
import { CombatLogScreen } from './ui/screens/CombatLogScreen';
import { AdventurerDetailScreen } from './ui/screens/AdventurerDetailScreen';
import { SettingsScreen } from './ui/screens/SettingsScreen';
import { EventModal } from './ui/modals/EventModal';
import { LevelUpModal } from './ui/modals/LevelUpModal';
import { AbsenceReportModal } from './ui/modals/AbsenceReportModal';

function PlaceholderScreen({ label }: { label: string }) {
  return (
    <div style={{ padding: 'var(--spacing-lg)' }}>
      <h1 style={{ color: 'var(--color-accent)', marginBottom: 'var(--spacing-md)' }}>
        {label}
      </h1>
      <p className="narrative">준비 중입니다...</p>
    </div>
  );
}

function ActiveScreen() {
  const currentScreen = useUIStore((s) => s.currentScreen);

  switch (currentScreen) {
    case 'guild':
      return <GuildScreen />;
    case 'expedition':
      return <ExpeditionScreen />;
    case 'adventurers':
      return <AdventurerDetailScreen />;
    case 'facilities':
      return <PlaceholderScreen label="시설" />;
    case 'craft':
      return <PlaceholderScreen label="제작" />;
    case 'codex':
      return <CombatLogScreen />;
    case 'settings':
      return <SettingsScreen />;
    default:
      return <GuildScreen />;
  }
}

export function App() {
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    function handleResize() {
      setIsDesktop(window.innerWidth >= 1024);
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Initialize game: load save or start new game, then start loop
  useEffect(() => {
    let mounted = true;
    let autoSaveId: ReturnType<typeof setInterval> | null = null;

    async function init() {
      try {
        const saved = await loadGame();
        if (saved && saved.seed != null) {
          useGameStore.setState(saved);
        } else {
          useGameStore.getState().newGame();
        }
      } catch {
        useGameStore.getState().newGame();
      }

      if (mounted) {
        startGameLoop(useGameStore);
        setReady(true);

        // Auto-save every 30 seconds
        autoSaveId = setInterval(() => {
          saveGame(useGameStore.getState());
        }, 30_000);
      }
    }

    // Save on tab close / refresh
    function handleBeforeUnload() {
      const state = useGameStore.getState();
      // Use synchronous localStorage backup for beforeunload reliability
      try {
        const data: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(state)) {
          if (typeof value === 'function') continue;
          data[key] = value;
        }
        // Convert Set to array for JSON
        if (data.events && typeof data.events === 'object') {
          const events = data.events as Record<string, unknown>;
          if (events.flags instanceof Set) {
            data.events = { ...events, flags: Array.from(events.flags as Set<string>) };
          }
        }
        localStorage.setItem('kotoha_save_backup', JSON.stringify(data));
      } catch { /* best effort */ }
      // Also fire async IndexedDB save (may or may not complete)
      saveGame(state);
    }

    window.addEventListener('beforeunload', handleBeforeUnload);
    init();

    return () => {
      mounted = false;
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (autoSaveId) clearInterval(autoSaveId);
      stopGameLoop();
      saveGame(useGameStore.getState());
    };
  }, []);

  if (!ready) {
    return null;
  }

  return (
    <>
      {isDesktop && <Sidebar />}
      <main style={{ flex: 1, paddingBottom: isDesktop ? 0 : '60px' }}>
        <ActiveScreen />
      </main>
      {!isDesktop && <BottomTabs />}
      <EventModal />
      <LevelUpModal />
      <AbsenceReportModal />
    </>
  );
}
