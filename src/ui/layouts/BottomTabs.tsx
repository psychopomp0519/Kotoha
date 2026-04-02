import { useUIStore, type ScreenId } from '../../store/uiStore';
import styles from './BottomTabs.module.css';

const TAB_ITEMS: { id: ScreenId; label: string }[] = [
  { id: 'guild', label: '길드' },
  { id: 'expedition', label: '원정' },
  { id: 'adventurers', label: '모험가' },
  { id: 'facilities', label: '시설' },
  { id: 'craft', label: '제작' },
  { id: 'codex', label: '도감' },
  { id: 'settings', label: '설정' },
];

export function BottomTabs() {
  const currentScreen = useUIStore((s) => s.currentScreen);
  const setScreen = useUIStore((s) => s.setScreen);

  return (
    <nav className={styles.bottomTabs}>
      {TAB_ITEMS.map((item) => (
        <button
          key={item.id}
          className={`${styles.tab} ${currentScreen === item.id ? styles.tabActive : ''}`}
          onClick={() => setScreen(item.id)}
        >
          {item.label}
        </button>
      ))}
    </nav>
  );
}
