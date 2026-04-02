import { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
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
  const adventurers = useGameStore((s) => s.adventurers);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectedAdv = selectedId
    ? adventurers.find((a) => a.id === selectedId)
    : null;

  // List view
  if (!selectedAdv) {
    return (
      <div className={styles.container}>
        <h1 className={styles.pageTitle}>모험가</h1>
        <div className={styles.adventurerList}>
          {adventurers.map((adv) => (
            <button
              key={adv.id}
              className={styles.adventurerCard}
              onClick={() => setSelectedId(adv.id)}
            >
              <div className={styles.cardMain}>
                <span className={styles.cardName}>{adv.name.family} {adv.name.given}</span>
                <span className={styles.cardClass}>{CLASS_LABELS[adv.currentClass] ?? adv.currentClass}</span>
              </div>
              <div className={styles.cardRight}>
                <span className={styles.cardLevel}>Lv.{adv.level}</span>
                <span className={`${styles.cardMorale} ${getMoraleClass(adv.morale)}`}>
                  사기 {adv.morale}
                </span>
                {adv.state !== 'idle' && (
                  <span className={styles.cardState}>{adv.state === 'expedition' ? '원정 중' : adv.state}</span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Detail view
  const adv = selectedAdv;
  const fullNameKo = `${adv.name.family} ${adv.name.given}`;
  const fullNameJp = `${adv.name.familyJp ?? ''} ${adv.name.givenJp ?? ''}`.trim();

  const statsForDerived = {
    STR: adv.stats.str, SPD: adv.stats.spd, INT: adv.stats.int,
    SPI: adv.stats.spi, END: adv.stats.end,
  };
  const derived = calcDerivedStats(statsForDerived, adv.level);

  const statMax = Math.max(adv.stats.str, adv.stats.spd, adv.stats.int, adv.stats.spi, adv.stats.end, 20);

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
      <button className={styles.backButton} onClick={() => setSelectedId(null)}>
        ← 목록으로
      </button>

      <div className={styles.nameSection}>
        <div className={styles.nameKorean}>{fullNameKo}</div>
        {fullNameJp && <div className={styles.nameJapanese}>{fullNameJp}</div>}
      </div>

      <div className={styles.classLevel}>
        <span className={styles.classLabel}>
          {CLASS_LABELS[adv.currentClass] ?? adv.currentClass}
        </span>
        <span className={styles.levelLabel}>Lv.{adv.level}</span>
        <span className={styles.xpLabel}>XP: {adv.exp}</span>
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
                  style={{ width: `${Math.min((value / statMax) * 100, 100)}%` }}
                />
              </div>
              <span className={styles.statValue}>{value}</span>
            </div>
          ))}
        </div>

        <div className={styles.derivedStats}>
          <span>HP {derived.maxHp}</span>
          <span>물리공 {derived.physAtk}</span>
          <span>마법공 {derived.magAtk}</span>
          <span>물리방 {derived.physDef}</span>
          <span>마법방 {derived.magDef}</span>
          <span>회피 {derived.evasion}%</span>
          <span>기력 {derived.kiMax}</span>
          <span>치명 {derived.critRate}%</span>
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>장비</h2>
        <div className={styles.equipmentGrid}>
          {Object.entries(equipSlots).map(([slot, item]) => (
            <div key={slot} className={styles.equipSlot}>
              <div className={styles.equipSlotLabel}>{EQUIP_SLOT_LABELS[slot]}</div>
              <div className={styles.equipSlotEmpty}>{item ?? '—'}</div>
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
    </div>
  );
}
