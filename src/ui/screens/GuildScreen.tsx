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

function getMoraleLabel(morale: number) {
  if (morale >= 80) return '고양';
  if (morale >= 50) return '보통';
  if (morale >= 20) return '침체';
  return '번아웃';
}

function getMoraleClass(morale: number) {
  if (morale >= 70) return styles.moraleHigh;
  if (morale >= 40) return styles.moraleMid;
  return styles.moraleLow;
}

export function GuildScreen() {
  const guild = useGameStore((s) => s.guild);
  const adventurers = useGameStore((s) => s.adventurers);
  const expeditions = useGameStore((s) => s.expeditions);
  const currentTick = useGameStore((s) => s.currentTick);
  const setScreen = useUIStore((s) => s.setScreen);
  const openModal = useUIStore((s) => s.openModal);

  const activeExpeditions = expeditions.filter((e) => e.status === 'active');
  const completedExpeditions = expeditions.filter((e) => e.status === 'completed');

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.guildName}>길드 아시하라(芦原)</h1>
      </div>

      <div className={styles.resourceBar}>
        <span className={styles.goldLabel}>금화</span>
        <span className={styles.goldValue}>{guild.gold.toLocaleString()}</span>
      </div>

      {/* Active expeditions */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>진행 중인 원정</h2>
        {activeExpeditions.length === 0 && completedExpeditions.length === 0 ? (
          <p className={styles.emptyState}>진행 중인 원정 없음</p>
        ) : (
          <>
            {activeExpeditions.map((exp) => {
              const elapsed = currentTick - exp.startTick;
              const total = exp.estimatedEndTick - exp.startTick;
              const percent = Math.min(100, Math.round((elapsed / total) * 100));
              const remainSec = Math.max(0, exp.estimatedEndTick - currentTick);
              const remainMin = Math.ceil(remainSec / 60);
              return (
                <div key={exp.id} className={styles.expeditionCard}>
                  <div className={styles.expeditionInfo}>
                    <span>{REGION_LABELS[exp.region] ?? exp.region} · 깊이 {exp.depth}</span>
                    <span className={styles.expeditionTime}>잔여 {remainMin}분</span>
                  </div>
                  <div className={styles.progressBar}>
                    <div className={styles.progressFill} style={{ width: `${percent}%` }} />
                  </div>
                </div>
              );
            })}
            {completedExpeditions.map((exp) => (
              <div key={exp.id} className={styles.expeditionCardDone}>
                <span>{REGION_LABELS[exp.region] ?? exp.region} · 깊이 {exp.depth}</span>
                <span className={styles.expeditionComplete}>
                  완료! +{exp.result?.goldGained ?? 0}금 +{exp.result?.expGained ?? 0}xp
                </span>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Adventurers */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>모험가</h2>
        <div className={styles.adventurerList}>
          {adventurers.map((adv) => {
            const statsForDerived = {
              STR: adv.stats.str, SPD: adv.stats.spd, INT: adv.stats.int,
              SPI: adv.stats.spi, END: adv.stats.end,
            };
            const derived = calcDerivedStats(statsForDerived, adv.level);

            return (
              <div
                key={adv.id}
                className={styles.adventurerRow}
                onClick={() => openModal('adventurerDetail', { adventurerId: adv.id })}
              >
                <div className={styles.adventurerMain}>
                  <span className={styles.adventurerName}>
                    {adv.name.family} {adv.name.given}
                  </span>
                  <span className={styles.adventurerClass}>
                    {CLASS_LABELS[adv.currentClass] ?? adv.currentClass}
                  </span>
                  <span className={styles.adventurerLevel}>Lv.{adv.level}</span>
                </div>
                <div className={styles.adventurerStatus}>
                  <span className={styles.hpText}>HP {derived.maxHp}</span>
                  <span className={`${styles.moraleIndicator} ${getMoraleClass(adv.morale)}`}>
                    {getMoraleLabel(adv.morale)}
                  </span>
                  {adv.state !== 'idle' && (
                    <span className={styles.stateTag}>{adv.state === 'expedition' ? '원정 중' : adv.state}</span>
                  )}
                </div>
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
