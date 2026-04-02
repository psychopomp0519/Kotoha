import { useUIStore } from '../../store/uiStore';
import styles from './EventModal.module.css';

interface EventChoice {
  id: string;
  text: string;
}

interface EventModalData {
  narrative: string;
  choices: EventChoice[];
}

// Default mock data if none provided
const DEFAULT_EVENT: EventModalData = {
  narrative: '안개 속에서 희미한 목소리가 들려온다. 갈림길 앞에 서서, 모험가들은 선택을 해야 한다.',
  choices: [
    { id: 'left', text: '왼쪽 길을 택한다 — 안개가 더 짙다' },
    { id: 'right', text: '오른쪽 길을 택한다 — 희미한 빛이 보인다' },
    { id: 'wait', text: '잠시 기다리며 주위를 살핀다' },
  ],
};

export function EventModal() {
  const activeModal = useUIStore((s) => s.activeModal);
  const closeModal = useUIStore((s) => s.closeModal);

  if (!activeModal || activeModal.type !== 'event') return null;

  const data = (activeModal.data as EventModalData | undefined) ?? DEFAULT_EVENT;

  function handleChoice(_choiceId: string) {
    // In the future this will dispatch to gameStore
    closeModal();
  }

  return (
    <div className={styles.overlay} onClick={closeModal}>
      <div className={styles.card} onClick={(e) => e.stopPropagation()}>
        <div className={styles.narrativeText}>{data.narrative}</div>
        <div className={styles.choices}>
          {data.choices.map((choice) => (
            <button
              key={choice.id}
              className={styles.choiceButton}
              onClick={() => handleChoice(choice.id)}
            >
              {choice.text}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
