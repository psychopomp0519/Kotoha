import { useUIStore, type ScreenId } from '../../store/uiStore';
import styles from './Sidebar.module.css';

const NAV_ITEMS: { id: ScreenId; label: string }[] = [
  { id: 'guild', label: '길드' },
  { id: 'expedition', label: '원정' },
  { id: 'adventurers', label: '모험가' },
  { id: 'facilities', label: '시설' },
  { id: 'craft', label: '제작' },
  { id: 'codex', label: '도감' },
  { id: 'settings', label: '설정' },
];

export function Sidebar() {
  const currentScreen = useUIStore((s) => s.currentScreen);
  const setScreen = useUIStore((s) => s.setScreen);

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>言の葉</div>
      <nav className={styles.nav}>
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            className={`${styles.navItem} ${currentScreen === item.id ? styles.navItemActive : ''}`}
            onClick={() => setScreen(item.id)}
          >
            {item.label}
          </button>
        ))}
      </nav>
    </aside>
  );
}
