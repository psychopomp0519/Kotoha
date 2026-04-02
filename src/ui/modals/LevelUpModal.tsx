import { useUIStore } from '../../store/uiStore';
import styles from './LevelUpModal.module.css';

interface StatChange {
  name: string;
  before: number;
  after: number;
}

interface LevelUpModalData {
  adventurerName: string;
  previousLevel: number;
  newLevel: number;
  statChanges: StatChange[];
}

export function LevelUpModal() {
  const activeModal = useUIStore((s) => s.activeModal);
  const closeModal = useUIStore((s) => s.closeModal);

  if (!activeModal || activeModal.type !== 'levelUp') return null;

  const data = activeModal.data as LevelUpModalData | undefined;
  if (!data) return null;

  return (
    <div className={styles.overlay} onClick={closeModal}>
      <div className={styles.card} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <p className={styles.adventurerName}>{data.adventurerName}</p>
          <p className={styles.levelUpLabel}>
            레벨 업! Lv {data.previousLevel} → Lv {data.newLevel}
          </p>
        </div>

        <table className={styles.statsTable}>
          <thead>
            <tr>
              <th>스탯</th>
              <th style={{ textAlign: 'right' }}>이전</th>
              <th></th>
              <th style={{ textAlign: 'right' }}>이후</th>
            </tr>
          </thead>
          <tbody>
            {data.statChanges.map((stat) => (
              <tr key={stat.name}>
                <td className={styles.statName}>{stat.name}</td>
                <td className={styles.statBefore}>{stat.before}</td>
                <td className={styles.statArrow}>→</td>
                <td className={styles.statAfter}>{stat.after}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <button className={styles.confirmButton} onClick={closeModal}>
          확인
        </button>
      </div>
    </div>
  );
}
