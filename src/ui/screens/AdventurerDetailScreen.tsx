import { useGameStore } from '../../store/gameStore';
import { useUIStore } from '../../store/uiStore';
import { calcDerivedStats } from '../../engine/adventurer/StatCalc';
import styles from './AdventurerDetailScreen.module.css';

const CLASS_LABELS: Record<string, string> = {
  kenshi: '검사',
  miko: '무녀',
  shinobi: '시노비',
  yamabushi: '야마부시',
  shokunin: '쇼쿠닌',
  kemono: '케모노',
};

const STAT_MAX = 30; // Display cap for stat bars
const STAT_LABELS: Record<string, string> = {
  str: 'STR',
  spd: 'SPD',
  int: 'INT',
  spi: 'SPI',
  end: 'END',
};

const EQUIP_SLOT_LABELS: Record<string, string> = {
  weapon: '무기',
  head: '머리',
  body: '몸통',
  hands: '손',
  feet: '발',
  accessory: '장신구',
};

function getMoraleClass(morale: number) {
  if (morale >= 70) return styles.moraleHigh;
  if (morale >= 40) return styles.moraleMid;
  return styles.moraleLow;
}

export function AdventurerDetailScreen() {
  const activeModal = useUIStore((s) => s.activeModal);
  const adventurers = useGameStore((s) => s.adventurers);
  const closeModal = useUIStore((s) => s.closeModal);

  // Get adventurer ID from modal data, or fall back to the first adventurer
  const modalData = activeModal?.data as { adventurerId?: string } | undefined;
  const adventurerId = modalData?.adventurerId;

  const adv = adventurerId
    ? adventurers.find((a) => a.id === adventurerId)
    : adventurers[0];

  if (!adv) {
    return (
      <div className={styles.container}>
        <p>모험가를 찾을 수 없습니다.</p>
      </div>
    );
  }

  const fullNameKo = `${adv.name.family} ${adv.name.given}`;
  const fullNameJp = `${adv.name.familyJp} ${adv.name.givenJp}`;

  // Compute derived stats
  const statsForDerived = {
    STR: adv.stats.str,
    SPD: adv.stats.spd,
    INT: adv.stats.int,
    SPI: adv.stats.spi,
    END: adv.stats.end,
  };
  const derived = calcDerivedStats(statsForDerived, adv.level);

  // Equipment slots for display
  const equipSlots: Record<string, string | undefined> = {
    weapon: adv.equipment.weapon,
    head: adv.equipment.head,
    body: adv.equipment.body,
    hands: adv.equipment.hands,
    feet: adv.equipment.feet,
    accessory: adv.equipment.accessory,
  };

  return (
    <div className={styles.container}>
      <div className={styles.nameSection}>
        <div className={styles.nameKorean}>{fullNameKo}</div>
        <div className={styles.nameJapanese}>{fullNameJp}</div>
      </div>

      <div className={styles.classLevel}>
        <span className={styles.classLabel}>
          {CLASS_LABELS[adv.currentClass] ?? adv.currentClass}
        </span>
        <span className={styles.levelLabel}>Lv.{adv.level}</span>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>능력치</h2>
        <div className={styles.statList}>
          {Object.entries(adv.stats).map(([key, value]) => (
            <div key={key} className={styles.statRow}>
              <span className={styles.statLabel}>{STAT_LABELS[key]}</span>
              <div className={styles.statBarContainer}>
                <div
                  className={styles.statBarFill}
                  style={{ width: `${Math.min((value / STAT_MAX) * 100, 100)}%` }}
                />
              </div>
              <span className={styles.statValue}>{value}</span>
            </div>
          ))}
        </div>

        <div className={styles.statList} style={{ marginTop: '8px', fontSize: '0.85em', opacity: 0.8 }}>
          <div>HP: {derived.maxHp} | 물리공: {derived.physAtk} | 마법공: {derived.magAtk}</div>
          <div>물리방: {derived.physDef} | 마법방: {derived.magDef} | 회피: {derived.evasion}%</div>
          <div>기력: {derived.kiMax} | 기력회복: {derived.kiRegen}/턴 | 치명: {derived.critRate}%</div>
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>장비</h2>
        <div className={styles.equipmentGrid}>
          {Object.entries(equipSlots).map(([slot, item]) => (
            <div key={slot} className={styles.equipSlot}>
              <div className={styles.equipSlotLabel}>{EQUIP_SLOT_LABELS[slot]}</div>
              <div className={styles.equipSlotEmpty}>{item ?? '비어 있음'}</div>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>기술</h2>
        <div className={styles.skillList}>
          {adv.skills.length > 0 ? (
            adv.skills.map((skill) => (
              <span key={skill} className={styles.skillTag}>{skill}</span>
            ))
          ) : (
            <span style={{ opacity: 0.5 }}>습득한 기술 없음</span>
          )}
        </div>
      </div>

      <div className={styles.moraleSection}>
        <h2 className={styles.sectionTitle}>사기</h2>
        <div className={styles.moraleBarContainer}>
          <div
            className={`${styles.moraleBarFill} ${getMoraleClass(adv.morale)}`}
            style={{ width: `${adv.morale}%` }}
          />
        </div>
        <div className={styles.moraleValue}>{adv.morale} / 100</div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>특성</h2>
        <div className={styles.traitList}>
          {adv.traits.length > 0 ? (
            adv.traits.map((trait) => (
              <span key={trait} className={styles.traitTag}>{trait}</span>
            ))
          ) : (
            <span style={{ opacity: 0.5 }}>특성 없음</span>
          )}
        </div>
      </div>

      {activeModal?.type === 'adventurerDetail' && (
        <button
          className={styles.classLabel}
          onClick={closeModal}
          style={{ marginTop: '16px', cursor: 'pointer', padding: '8px 16px' }}
        >
          닫기
        </button>
      )}
    </div>
  );
}
