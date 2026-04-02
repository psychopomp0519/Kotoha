import { useRef, useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { saveGame, exportGameJson, importGameJson } from '../../store/persistence';
import { setSpeed, getSpeed } from '../../engine/GameLoop';
import styles from './SettingsScreen.module.css';

type SpeedOption = 1 | 2 | 5;

export function SettingsScreen() {
  const [currentSpeed, setCurrentSpeed] = useState<SpeedOption>(() => getSpeed() as SpeedOption);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleSpeedChange(speed: SpeedOption) {
    setSpeed(speed);
    setCurrentSpeed(speed);
  }

  function handleSave() {
    const state = useGameStore.getState();
    saveGame(state);
  }

  function handleExport() {
    const state = useGameStore.getState();
    const json = exportGameJson(state);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kotoha-save-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function handleImportClick() {
    fileInputRef.current?.click();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = event.target?.result as string;
        const imported = importGameJson(json);
        useGameStore.setState(imported);
      } catch (err) {
        alert(err instanceof Error ? err.message : '가져오기 실패');
      }
    };
    reader.readAsText(file);

    // Reset file input so the same file can be re-selected
    e.target.value = '';
  }

  function handleReset() {
    useGameStore.getState().newGame();
    setShowResetConfirm(false);
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>설정</h1>
      </div>

      {/* Game Speed */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>게임 속도</h2>
        <div className={styles.speedButtons}>
          {([1, 2, 5] as SpeedOption[]).map((speed) => (
            <button
              key={speed}
              className={`${styles.speedButton} ${currentSpeed === speed ? styles.speedButtonActive : ''}`}
              onClick={() => handleSpeedChange(speed)}
            >
              x{speed}
            </button>
          ))}
        </div>
      </div>

      {/* Save / Load */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>저장 / 불러오기</h2>
        <div className={styles.saveButtons}>
          <button className={styles.actionButton} onClick={handleSave}>
            저장
          </button>
          <button className={styles.actionButton} onClick={handleExport}>
            내보내기
          </button>
          <button className={styles.actionButton} onClick={handleImportClick}>
            가져오기
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            className={styles.hiddenInput}
            onChange={handleFileChange}
          />
        </div>
      </div>

      {/* Game Info */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>게임 정보</h2>
        <p className={styles.versionInfo}>0.1.0 (Phase 1 Prototype)</p>
      </div>

      {/* Reset */}
      <div className={styles.dangerSection}>
        <h2 className={styles.sectionTitle}>위험 영역</h2>
        <button
          className={styles.dangerButton}
          onClick={() => setShowResetConfirm(true)}
        >
          게임 리셋
        </button>
      </div>

      {/* Reset Confirmation Dialog */}
      {showResetConfirm && (
        <div className={styles.confirmOverlay} onClick={() => setShowResetConfirm(false)}>
          <div className={styles.confirmCard} onClick={(e) => e.stopPropagation()}>
            <p className={styles.confirmText}>
              정말로 게임을 리셋하시겠습니까?<br />
              모든 진행 상황이 초기화됩니다.
            </p>
            <div className={styles.confirmActions}>
              <button
                className={styles.confirmCancel}
                onClick={() => setShowResetConfirm(false)}
              >
                취소
              </button>
              <button className={styles.confirmDanger} onClick={handleReset}>
                리셋
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
