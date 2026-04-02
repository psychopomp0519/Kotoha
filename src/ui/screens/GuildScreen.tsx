import { useGameStore } from '../../store/gameStore';
import { useUIStore } from '../../store/uiStore';
import { calcDerivedStats } from '../../engine/adventurer/StatCalc';
import styles from './GuildScreen.module.css';

const CLASS_LABELS: Record<string, string> = {
  kenshi: '검사',
  miko: '무녀',
  shinobi: '시노비',
  yamabushi: '야마부시',
  shokunin: '쇼쿠닌',
  kemono: '케모노',
};

const REGION_LABELS: Record<string, string> = {
  asagiri: '아사기리',
  kurayamidani: '쿠라야미다니',
  uminari: '우미나리',
  hanakage: '하나카게',
  yukishiro: '유키시로',
  kagatsuchi: '카가츠치',
  tsuchigumo: '츠치구모',
  amanoiwato: '아마노이와토',
  tokoyo: '토코요',
  yomiji: '요미지',
};

function getMoraleClass(morale: number) {
  if (morale >= 70) return styles.moraleHigh;
  if (morale >= 40) return styles.moraleMid;
  return styles.moraleLow;
}

function getMoraleLabel(morale: number) {
  if (morale >= 70) return '좋음';
  if (morale >= 40) return '보통';
  return '낮음';
}

export function GuildScreen() {
  const guild = useGameStore((s) => s.guild);
  const adventurers = useGameStore((s) => s.adventurers);
  const expeditions = useGameStore((s) => s.expeditions);
  const setScreen = useUIStore((s) => s.setScreen);
  const openModal = useUIStore((s) => s.openModal);

  const activeExpeditions = expeditions.filter((e) => e.status === 'active');

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.guildName}>{guild.name}</h1>
      </div>

      <div className={styles.resourceBar}>
        <span className={styles.goldLabel}>금화</span>
        <span className={styles.goldValue}>{guild.gold.toLocaleString()}</span>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>진행 중인 원정</h2>
        {activeExpeditions.length === 0 ? (
          <p className={styles.emptyState}>진행 중인 원정 없음</p>
        ) : (
          activeExpeditions.map((exp) => (
            <div key={exp.id}>
              {REGION_LABELS[exp.region] ?? exp.region} - 깊이 {exp.depth}
            </div>
          ))
        )}
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>모험가</h2>
        <div className={styles.adventurerList}>
          {adventurers.map((adv) => {
            const statsForDerived = {
              STR: adv.stats.str,
              SPD: adv.stats.spd,
              INT: adv.stats.int,
              SPI: adv.stats.spi,
              END: adv.stats.end,
            };
            const derived = calcDerivedStats(statsForDerived, adv.level);
            const hpPercent = Math.round((derived.maxHp / derived.maxHp) * 100);
            // Currently adventurers always have full HP (no currentHp tracked in store yet)
            // Show 100% for idle, or use maxHp as placeholder

            return (
              <div
                key={adv.id}
                className={styles.adventurerRow}
                onClick={() => openModal('adventurerDetail', { adventurerId: adv.id })}
                style={{ cursor: 'pointer' }}
              >
                <span className={styles.adventurerName}>
                  {adv.name.family} {adv.name.given}
                </span>
                <span className={styles.adventurerClass}>
                  {CLASS_LABELS[adv.currentClass] ?? adv.currentClass}
                </span>
                <span className={styles.adventurerLevel}>Lv.{adv.level}</span>
                <div className={styles.hpBarContainer}>
                  <div
                    className={styles.hpBarFill}
                    style={{ width: `${hpPercent}%` }}
                  />
                </div>
                <span className={`${styles.moraleIndicator} ${getMoraleClass(adv.morale)}`}>
                  {getMoraleLabel(adv.morale)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <button className={styles.primaryButton} onClick={() => setScreen('expedition')}>
        새 원정 출발
      </button>
    </div>
  );
}
