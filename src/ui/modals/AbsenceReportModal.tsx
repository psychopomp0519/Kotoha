import { useUIStore } from '../../store/uiStore';
import styles from './AbsenceReportModal.module.css';

export interface AbsenceReportData {
  elapsedTicks: number;
  xpEarned: number;
  goldEarned: number;
  materialsFound: number;
}

function formatElapsed(ticks: number): string {
  const totalMinutes = Math.floor(ticks / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours > 0) {
    return `${hours}시간 ${minutes}분 동안 부재`;
  }
  return `${minutes}분 동안 부재`;
}

export function AbsenceReportModal() {
  const activeModal = useUIStore((s) => s.activeModal);
  const closeModal = useUIStore((s) => s.closeModal);

  if (!activeModal || activeModal.type !== 'absenceReport') return null;

  const data = activeModal.data as AbsenceReportData | undefined;
  if (!data) return null;

  return (
    <div className={styles.overlay} onClick={closeModal}>
      <div className={styles.card} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>부재 보고서</h2>
          <p className={styles.elapsed}>{formatElapsed(data.elapsedTicks)}</p>
        </div>

        <div className={styles.summary}>
          <div className={styles.summaryRow}>
            <span className={styles.summaryLabel}>획득 경험치</span>
            <span className={styles.summaryValue}>{data.xpEarned.toLocaleString()}</span>
          </div>
          <div className={styles.summaryRow}>
            <span className={styles.summaryLabel}>획득 금화</span>
            <span className={styles.summaryValue}>{data.goldEarned.toLocaleString()}</span>
          </div>
          <div className={styles.summaryRow}>
            <span className={styles.summaryLabel}>획득 소재</span>
            <span className={styles.summaryValue}>{data.materialsFound}종</span>
          </div>
        </div>

        <p className={styles.narrative}>
          길드원들이 묵묵히 임무를 수행했습니다.
        </p>

        <button className={styles.confirmButton} onClick={closeModal}>
          확인
        </button>
      </div>
    </div>
  );
}
