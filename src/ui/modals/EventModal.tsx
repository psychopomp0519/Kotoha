import { useUIStore } from '../../store/uiStore';
import { useGameStore } from '../../store/gameStore';
import styles from './EventModal.module.css';

interface EventChoice {
  id: string;
  text: string;
  effects?: { type: string; value: number | string }[];
}

interface EventModalData {
  eventId?: string;
  narrative: string;
  choices: EventChoice[];
}

export function EventModal() {
  const activeModal = useUIStore((s) => s.activeModal);
  const closeModal = useUIStore((s) => s.closeModal);

  if (!activeModal || activeModal.type !== 'event') return null;

  const data = activeModal.data as EventModalData | undefined;
  if (!data) return null;

  function handleChoice(choice: EventChoice) {
    // Apply effects
    if (choice.effects) {
      for (const effect of choice.effects) {
        if (effect.type === 'gold' && typeof effect.value === 'number') {
          useGameStore.getState().addGold(effect.value);
        } else if (effect.type === 'item' && typeof effect.value === 'string') {
          useGameStore.getState().addItem(effect.value, 1);
        }
      }
    }

    // Set event flag if eventId exists
    if (data?.eventId) {
      const state = useGameStore.getState();
      if (state.events?.flags instanceof Set) {
        state.events.flags.add(`${data.eventId}_${choice.id}`);
      }
    }

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
              onClick={() => handleChoice(choice)}
            >
              {choice.text}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
