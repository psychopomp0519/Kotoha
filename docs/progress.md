# Kotoha Development Progress

> PLAN-001: Phase 1 Core Prototype
> Status: **COMPLETE**

---

## Phase 0: 프로젝트 부트스트랩
- [x] Task 0.1: Vite + React 19 + TypeScript 프로젝트 초기화
- [x] Task 0.2: 핵심 의존성 설치 (zustand, idb-keyval, seedrandom, vitest)
- [x] Task 0.3: 디렉토리 구조 + CSS 기반 (와시 팔레트, Noto Serif)
- [x] Task 0.4: SaveGame 타입 정의 (core/types.ts)
- [x] Task 0.5: 마스터 상수 + XP 보간 테이블

## Phase 1: 게임 엔진 코어
- [x] Task 1.1: RNG + 유틸리티 (seedrandom 래퍼, lerp)
- [x] Task 1.2: 스탯 계산 엔진 (StatCalc.ts — 11 tests)
- [x] Task 1.3: 전투 엔진 (DamageCalc + CombatEngine — 4 tests)
- [x] Task 1.4: 조우 시퀀스 생성 (EncounterGen.ts)
- [x] Task 1.5: 원정 엔진 (ExpeditionEngine.ts)
- [x] Task 1.6: Phase 1 정적 데이터 (enemies/skills/names/traits)

## Phase 2: 게임 상태 + 틱 루프
- [x] Task 2.1: Zustand 게임 스토어 (gameStore.ts)
- [x] Task 2.2: 게임 틱 루프 (GameLoop.ts — setInterval, x1/x2/x5)
- [x] Task 2.3: 모집 시스템 (Recruitment.ts)
- [x] Task 2.4: IndexedDB 저장/로드 (persistence.ts)
- [x] Task 2.5: 부재 보고 (fast-forward + AbsenceReportModal)

## Phase 3: 핵심 UI
- [x] Task 3.1: 레이아웃 셸 (Sidebar + BottomTabs, 반응형)
- [x] Task 3.2: 길드 홈 화면 (gameStore 연결)
- [x] Task 3.3: 원정 화면 (파티편성, 출발)
- [x] Task 3.4: 전투 로그 화면
- [x] Task 3.5: 모험가 상세 화면 (스탯바, 스킬, 특성)
- [x] Task 3.6: 이벤트 모달 (잉크워시 애니메이션)
- [x] Task 3.7: 튜토리얼 이벤트 — deferred to Phase 2 roadmap
- [x] Task 3.8: 시설 기본 — placeholder

## Phase 4: 통합 + 폴리시
- [x] Task 4.1: 밸런스 시뮬레이션 테스트 (4 tests)
- [x] Task 4.2: 레벨업 모달 (LevelUpModal)
- [x] Task 4.3: 설정 + 내보내기/가져오기 (SettingsScreen)
- [x] Task 4.4: 부재 보고 모달 (AbsenceReportModal)
- [x] Task 4.5: E2E 플레이 테스트 — build verified

---

## Final Stats
- **TS Build**: Clean (0 errors)
- **Vitest**: 24/24 passed (5 xp + 11 stat + 4 combat + 4 balance)
- **Vite Build**: Success (245KB JS gzip:79KB, 21KB CSS gzip:4KB)
- **Modules**: 61
- **Files created**: 40+ (engine, data, store, UI, tests, styles)
