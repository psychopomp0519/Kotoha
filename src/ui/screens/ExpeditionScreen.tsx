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
  { id: 'asagiri', label: '아사기리(朝霧)', index: 0 },
];

const DEPTHS = [1, 2] as const;
const DEPTH_LABELS: Record<number, string> = {
  1: '외곽(外縁) — 5~15분',
  2: '중간(中間) — 30분~1시간',
};

export function ExpeditionScreen() {
  const adventurers = useGameStore((s) => s.adventurers);
  const world = useGameStore((s) => s.world);
  const setScreen = useUIStore((s) => s.setScreen);

  const idleAdventurers = adventurers.filter((a) => a.state === 'idle');

  const [selectedRegionIndex, setSelectedRegionIndex] = useState<number>(0);
  const [selectedDepth, setSelectedDepth] = useState<number>(1);
  const [partySlots, setPartySlots] = useState<(string | null)[]>([null, null, null, null]);
  const [pickingSlot, setPickingSlot] = useState<number | null>(null);

  const availableRegions = REGION_LABELS.filter((r) =>
    world.unlockedRegions.includes(r.index),
  );

  const assignedIds = partySlots.filter(Boolean) as string[];
  const assignedCount = assignedIds.length;
  const estimatedMinutes = selectedDepth * 5;

  // Adventurers available for picking (idle and not already in a slot)
  const pickableAdventurers = idleAdventurers.filter(
    (a) => !assignedIds.includes(a.id),
  );

  function handleSlotClick(index: number) {
    if (partySlots[index]) {
      // Remove from slot
      setPartySlots((prev) => {
        const next = [...prev];
        next[index] = null;
        return next;
      });
      setPickingSlot(null);
      return;
    }
    // Open picker for this slot
    setPickingSlot(index);
  }

  function handlePickAdventurer(adventurerId: string) {
    if (pickingSlot === null) return;
    setPartySlots((prev) => {
      const next = [...prev];
      next[pickingSlot] = adventurerId;
      return next;
    });
    setPickingSlot(null);
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

      {/* Region */}
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

      {/* Depth */}
      <div className={styles.section}>
        <div className={styles.label}>깊이 선택</div>
        <div className={styles.selector}>
          {DEPTHS.map((depth) => (
            <button
              key={depth}
              className={`${styles.selectorButton} ${selectedDepth === depth ? styles.selectorButtonActive : ''}`}
              onClick={() => setSelectedDepth(depth)}
            >
              {DEPTH_LABELS[depth]}
            </button>
          ))}
        </div>
      </div>

      {/* Party slots */}
      <div className={styles.section}>
        <div className={styles.label}>파티 편성 (슬롯을 눌러 모험가 배치)</div>
        <div className={styles.partySlots}>
          {partySlots.map((slotId, index) => {
            const adv = getSlotAdventurer(slotId);
            const isPickTarget = pickingSlot === index;
            return (
              <div
                key={index}
                className={`${styles.partySlot} ${adv ? styles.partySlotFilled : ''} ${isPickTarget ? styles.partySlotPicking : ''}`}
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
                    <div className={styles.slotHint}>눌러서 해제</div>
                  </div>
                ) : (
                  <span className={styles.partySlotEmpty}>
                    {isPickTarget ? '아래에서 선택 ↓' : '빈 슬롯'}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Adventurer picker */}
      {pickingSlot !== null && (
        <div className={styles.section}>
          <div className={styles.label}>모험가 선택 — 슬롯 {pickingSlot + 1}</div>
          {pickableAdventurers.length === 0 ? (
            <div className={styles.emptyMessage}>배치 가능한 모험가가 없습니다</div>
          ) : (
            <div className={styles.adventurerList}>
              {pickableAdventurers.map((adv) => (
                <button
                  key={adv.id}
                  className={styles.adventurerCard}
                  onClick={() => handlePickAdventurer(adv.id)}
                >
                  <div className={styles.cardName}>
                    {adv.name.family} {adv.name.given}
                  </div>
                  <div className={styles.cardInfo}>
                    {CLASS_LABELS[adv.currentClass] ?? adv.currentClass} · Lv.{adv.level}
                  </div>
                </button>
              ))}
            </div>
          )}
          <button
            className={styles.cancelButton}
            onClick={() => setPickingSlot(null)}
          >
            취소
          </button>
        </div>
      )}

      {/* Footer */}
      <div className={styles.estimatedTime}>
        편성 인원: {assignedCount}/4 · 예상 소요: 약 {estimatedMinutes}분
      </div>

      <div className={styles.buttonRow}>
        <button
          className={styles.primaryButton}
          disabled={assignedCount === 0}
          onClick={handleDepart}
        >
          출발
        </button>
        <button
          className={styles.secondaryButton}
          onClick={() => setScreen('guild')}
        >
          돌아가기
        </button>
      </div>
    </div>
  );
}
