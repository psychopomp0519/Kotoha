import { useGameStore } from '../../store/gameStore';
import styles from './CombatLogScreen.module.css';

export function CombatLogScreen() {
  const expeditions = useGameStore((s) => s.expeditions);

  // Find the most recently completed expedition with a result
  const completedExpedition = expeditions
    .filter((e) => e.status === 'completed' && e.result)
    .sort((a, b) => b.estimatedEndTick - a.estimatedEndTick)[0];

  if (!completedExpedition || !completedExpedition.result) {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>전투 기록</h1>
        <p style={{ padding: '16px', opacity: 0.6 }}>아직 원정 결과가 없습니다</p>
      </div>
    );
  }

  const result = completedExpedition.result;
  const victory = result.wins > result.losses;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>전투 기록</h1>

      <div className={styles.logArea}>
        {result.log.length > 0 ? (
          result.log.map((entry, index) => (
            <div key={index} className={styles.logEntry}>
              <div className={styles.roundNumber}>제 {index + 1}라운드</div>
              <div className={styles.narrativeText}>
                {typeof entry === 'object' && entry !== null
                  ? JSON.stringify(entry)
                  : String(entry)}
              </div>
            </div>
          ))
        ) : (
          <div className={styles.logEntry}>
            <div className={styles.narrativeText}>
              전투 {result.totalCombats}회 중 {result.wins}승 {result.losses}패
            </div>
          </div>
        )}
      </div>

      <div className={styles.resultSummary}>
        <div
          className={`${styles.resultTitle} ${victory ? styles.resultVictory : styles.resultDefeat}`}
        >
          {victory ? '승리' : '패배'}
        </div>
        <div className={styles.resultDetails}>
          <div className={styles.resultItem}>
            <span className={styles.resultLabel}>경험치</span>
            <span className={styles.resultValue}>{result.expGained}</span>
          </div>
          <div className={styles.resultItem}>
            <span className={styles.resultLabel}>금화</span>
            <span className={styles.resultValue}>{result.goldGained}</span>
          </div>
          <div className={styles.resultItem}>
            <span className={styles.resultLabel}>드롭</span>
            <span className={styles.resultValue}>
              {result.itemsGained.length > 0
                ? result.itemsGained.map((d) => `${d.itemId} x${d.quantity}`).join(', ')
                : '없음'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
