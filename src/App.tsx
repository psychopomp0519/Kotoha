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

    async function init() {
      try {
        const saved = await loadGame();
        if (saved && saved.seed != null) {
          // Calculate offline time before restoring state
          const savedTick = saved.currentTick ?? 0;
          const now = Math.floor(Date.now() / 1000);
          const lastSaveTime = savedTick; // ticks approximate seconds

          // Restore saved state (merge into store, preserving actions)
          useGameStore.setState(saved);

          // Show absence report if offline time elapsed
          // Estimate offline ticks from real-time difference
          // (savedTick is game ticks; we use wall clock diff as proxy)
          if (savedTick > 0) {
            // A simple heuristic: if the save has a meaningful tick count,
            // check if any expeditions were running. If so, show absence report.
            const state = useGameStore.getState();
            const completedExpeditions = state.expeditions.filter(
              (e) => e.status === 'completed',
            );
            if (completedExpeditions.length > 0) {
              // Estimate gains from completed expeditions
              let totalXp = 0;
              let totalGold = 0;
              const materialSet = new Set<string>();

              // Basic estimate: show a report for any offline progress
              const elapsedTicks = Math.max(0, now - lastSaveTime);
              if (elapsedTicks > 60) {
                useUIStore.getState().openModal('absenceReport', {
                  elapsedTicks,
                  xpEarned: totalXp,
                  goldEarned: totalGold,
                  materialsFound: materialSet.size,
                });
              }
            }
          }
        } else {
          useGameStore.getState().newGame();
        }
      } catch {
        // If load fails, start fresh
        useGameStore.getState().newGame();
      }

      if (mounted) {
        startGameLoop(useGameStore);
        setReady(true);
      }
    }

    init();

    return () => {
      mounted = false;
      stopGameLoop();
      // Save on unmount
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
