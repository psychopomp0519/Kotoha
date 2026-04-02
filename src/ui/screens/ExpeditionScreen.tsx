import { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { useUIStore } from '../../store/uiStore';
import styles from './ExpeditionScreen.module.css';

const CLASS_LABELS: Record<string, string> = {
  kenshi: '검사',
  miko: '무녀',
  shinobi: '시노비',
  yamabushi: '야마부시',
  shokunin: '쇼쿠닌',
  kemono: '케모노',
};

const REGION_LABELS: { id: string; label: string; index: number }[] = [
  { id: 'asagiri', label: '아사기리', index: 0 },
];

const DEPTHS = [1, 2] as const;

export function ExpeditionScreen() {
  const adventurers = useGameStore((s) => s.adventurers);
  const world = useGameStore((s) => s.world);
  const setScreen = useUIStore((s) => s.setScreen);

  // Only show idle adventurers (not on expedition, training, etc.)
  const idleAdventurers = adventurers.filter((a) => a.state === 'idle');

  const [selectedRegionIndex, setSelectedRegionIndex] = useState<number>(0);
  const [selectedDepth, setSelectedDepth] = useState<number>(1);
  const [partySlots, setPartySlots] = useState<(string | null)[]>([null, null, null, null]);

  // Filter available regions to only unlocked ones
  const availableRegions = REGION_LABELS.filter((r) =>
    world.unlockedRegions.includes(r.index),
  );

  const assignedCount = partySlots.filter(Boolean).length;
  const estimatedMinutes = selectedDepth * 5 * (assignedCount || 1);

  function handleSlotClick(index: number) {
    if (partySlots[index]) {
      // Remove adventurer from slot
      setPartySlots((prev) => {
        const next = [...prev];
        next[index] = null;
        return next;
      });
      return;
    }

    // Find first idle adventurer not already assigned to a slot
    const available = idleAdventurers.find(
      (a) => !partySlots.includes(a.id),
    );
    if (available) {
      setPartySlots((prev) => {
        const next = [...prev];
        next[index] = available.id;
        return next;
      });
    }
  }

  function getSlotAdventurer(slotId: string | null) {
    if (!slotId) return null;
    return adventurers.find((a) => a.id === slotId) ?? null;
  }

  function handleDepart() {
    const selectedIds = partySlots.filter((id): id is string => id !== null);
    if (selectedIds.length === 0) return;

    useGameStore.getState().startExpedition(selectedIds, selectedRegionIndex, selectedDepth);
    setScreen('guild');
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>원정 준비</h1>

      <div className={styles.section}>
        <div className={styles.label}>지역 선택</div>
        <div className={styles.selector}>
          {availableRegions.map((region) => (
            <button
              key={region.id}
              className={`${styles.selectorButton} ${selectedRegionIndex === region.index ? styles.selectorButtonActive : ''}`}
              onClick={() => setSelectedRegionIndex(region.index)}
            >
              {region.label}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.label}>깊이 선택</div>
        <div className={styles.selector}>
          {DEPTHS.map((depth) => (
            <button
              key={depth}
              className={`${styles.selectorButton} ${selectedDepth === depth ? styles.selectorButtonActive : ''}`}
              onClick={() => setSelectedDepth(depth)}
            >
              깊이 {depth}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.label}>파티 편성 (클릭하여 배치)</div>
        <div className={styles.partySlots}>
          {partySlots.map((slotId, index) => {
            const adv = getSlotAdventurer(slotId);
            return (
              <div
                key={index}
                className={`${styles.partySlot} ${adv ? styles.partySlotFilled : ''}`}
                onClick={() => handleSlotClick(index)}
              >
                {adv ? (
                  <div>
                    <div className={styles.slotName}>
                      {adv.name.family} {adv.name.given}
                    </div>
                    <div className={styles.slotClass}>
                      {CLASS_LABELS[adv.currentClass] ?? adv.currentClass}
                    </div>
                    <div className={styles.slotLevel}>Lv.{adv.level}</div>
                  </div>
                ) : (
                  <span className={styles.partySlotEmpty}>빈 슬롯</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className={styles.estimatedTime}>
        예상 소요 시간: 약 {estimatedMinutes}분
      </div>

      <button
        className={styles.primaryButton}
        disabled={assignedCount === 0}
        onClick={handleDepart}
      >
        출발
      </button>

      <button
        className={styles.primaryButton}
        onClick={() => setScreen('guild')}
        style={{ marginTop: '8px', opacity: 0.7 }}
      >
        돌아가기
      </button>
    </div>
  );
}
