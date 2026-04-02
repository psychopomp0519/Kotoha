# PLAN-001: Kotoha Phase 1 — Core Prototype

> 상태: 승인됨 (2026-04-02)
> 작성일: 2026-04-02
> 범위: 로드맵 Phase 1 (프로토타입)

---

## 결정 사항 요약

### 기술 스택

| 항목 | 결정 | 근거 |
|------|------|------|
| 프레임워크 | Vite 6 + React 19 | 복잡한 UI 상태(13화면+8모달), 생태계 |
| 언어 | TypeScript (strict) | 문서에 TS 인터페이스 다수 정의 |
| 상태관리 | Zustand | 게임 상태 = 단일 store, 보일러플레이트 최소 |
| 스타일 | CSS Modules + CSS Variables | 계절 CSS 변수 전환 요구사항 대응 |
| 테스트 | Vitest | 문서에 이미 시뮬레이션 코드 존재 |
| 저장소 | IndexedDB (idb-keyval) + localStorage 백업 | 문서 명시 |
| PRNG | seedrandom | 결정론적 랜덤, 문서 명시 |
| 배포 | Vercel (정적) | 무료, PWA 지원 |
| 폰트 | Noto Serif KR/JP | 문서 명시 |

### 밸런스/정합성 수정 완료 목록

| # | 이슈 | 수정 내용 | 파일 |
|---|------|----------|------|
| C1 | XP 공식 ≠ 테이블 | 테이블을 권위값으로 명시, 보간 사용 지시 | 00-master, 03-adventurer, 11-economy |
| C2 | 요도 미정의 | 요도 5종 + 제작 레시피 3종 추가 | 10-equipment-catalog, 03-materials |
| C3 | 레시피 소재 미등록 | 이슬/독버섯/영목 껍질 추가 | 03-materials |
| C4 | hasItem 트리거 미정의 | EventTrigger에 hasItem 추가 | 10-event-system |
| H1 | 보스 HP 배율 오류 | "15~25" → "×20 (고정)" | 11-economy |
| H2 | 회복 공식 마스터 누락 | 회복 공식 추가 | 00-master |
| H3 | 소재 ID 스페이싱 | 통일 (공백 포함) | 03-materials |
| H4 | 소재 품질 미정의 | 등급별 품질 보정값 추가 | 07-crafting |
| H5 | 유대 스케일 불일치 | 모험가=BP(0~1000), 펫=BP(0~300) — 별개 스케일 유지 (의도된 설계) | — |
| H6 | 원정 시간 범위 | 범위 표기는 SPD 변동 체감치, 기준 틱 고정 명시 | 06-exploration |
| H7 | 삼종신기 조건 모호 | "환생 3회+ 퀘스트"로 통일 | 08-equipment |
| H8 | 침식 단계 미정의 | 5단계(0~4) 효과 테이블 추가 | 00-master |
| H9 | 사기 감소 조건 | 이미 정의됨 확인 (03-adventurer, 00-master 일치) | — |
| M1 | 최종 보스 밸런스 | 보스전 데미지 상한 = 파티 총HP 70% 캡 추가 | 05-combat |
| M2 | 환생 보너스 무한 | 10회 상한 추가 (+50% 스탯, +150% XP) | 00-master |
| M3 | 극의 스킬 문서화 | 정확한 공식 (현재기/최대기 × 5.0) 명시 | 05-combat |
| M5 | 강화 상한 미명시 | +10 하드 캡 명시 | 00-master |
| M6 | rare_random 미정의 | 예약어 테이블 추가 | 10-event-system |
| M7 | 회피+은신 중첩 | 독립 승산 판정 명시 | 05-combat |
| M8 | 봉황 새끼 위치 | "제6국(카구츠치산) 이벤트"로 통일 | 08-equipment |

---

## 아키텍처

### 디렉토리 구조

```
src/
├── main.tsx                    # React 진입점
├── App.tsx                     # 라우팅/레이아웃
│
├── engine/                     # 게임 엔진 (React 비의존)
│   ├── GameLoop.ts             # 틱 루프 (requestAnimationFrame 기반)
│   ├── combat/
│   │   ├── CombatEngine.ts     # 전투 시뮬레이션
│   │   ├── DamageCalc.ts       # 데미지/회복 공식
│   │   └── StatusEffect.ts     # 상태이상 처리
│   ├── expedition/
│   │   ├── ExpeditionEngine.ts # 원정 진행
│   │   └── EncounterGen.ts     # 조우 시퀀스 생성 (시드 기반)
│   ├── adventurer/
│   │   ├── StatCalc.ts         # 스탯 계산 공식
│   │   ├── XpTable.ts          # XP 보간 테이블
│   │   └── Recruitment.ts      # 모집 시스템
│   ├── facility/
│   │   └── FacilityEngine.ts   # 시설 생산/업그레이드
│   ├── crafting/
│   │   └── CraftingEngine.ts   # 제작 품질 판정
│   └── event/
│       └── EventEngine.ts      # 이벤트 트리거/가중치
│
├── data/                       # 정적 게임 데이터 (JSON/TS)
│   ├── enemies.ts              # 적 스탯 (01-enemy-stats 기반)
│   ├── skills.ts               # 스킬 데이터 (02-class-skills 기반)
│   ├── classes.ts              # 클래스 트리 (04-class-system 기반)
│   ├── materials.ts            # 소재 (03-materials 기반)
│   ├── recipes.ts              # 레시피 (03-materials 기반)
│   ├── equipment.ts            # 장비 카탈로그 (10-equipment-catalog 기반)
│   ├── events.ts               # 이벤트 템플릿 (06-event-templates 기반)
│   ├── names.ts                # 이름 풀 (04-name-pool 기반)
│   ├── traits.ts               # 특성 매트릭스 (05-trait-matrix 기반)
│   ├── pets.ts                 # 펫 (08-pet-details 기반)
│   ├── quests.ts               # 퀘스트 (07-quest-pool 기반)
│   └── constants.ts            # 마스터 상수 (00-master-formulas 기반)
│
├── store/                      # Zustand 상태
│   ├── gameStore.ts            # 메인 게임 상태 (09-save-schema 기반)
│   ├── uiStore.ts              # UI 전용 상태 (현재 화면, 모달 등)
│   └── persistence.ts          # IndexedDB 저장/로드
│
├── ui/                         # React 컴포넌트
│   ├── layouts/
│   │   ├── Sidebar.tsx         # 사이드바 (데스크톱)
│   │   └── BottomTabs.tsx      # 하단 탭 (모바일)
│   ├── screens/
│   │   ├── GuildScreen.tsx     # 길드 홈
│   │   ├── ExpeditionScreen.tsx
│   │   ├── CombatLogScreen.tsx
│   │   ├── AdventurerListScreen.tsx
│   │   ├── AdventurerDetailScreen.tsx
│   │   ├── FacilityListScreen.tsx
│   │   ├── FacilityDetailScreen.tsx
│   │   ├── CraftScreen.tsx
│   │   ├── CodexScreen.tsx
│   │   └── SettingsScreen.tsx
│   ├── modals/
│   │   ├── EventModal.tsx
│   │   ├── LevelUpModal.tsx
│   │   ├── RecruitModal.tsx
│   │   ├── ConfirmModal.tsx
│   │   └── AbsenceReportModal.tsx
│   └── components/
│       ├── StatBar.tsx
│       ├── PartySlot.tsx
│       └── NarrativeText.tsx   # 서사 텍스트 스타일
│
├── styles/
│   ├── variables.css           # CSS 변수 (색상, 폰트, 계절)
│   ├── global.css              # 전역 스타일 (와시 텍스처)
│   └── typography.css          # 타이포그래피
│
└── utils/
    ├── rng.ts                  # seedrandom 래퍼
    ├── lerp.ts                 # 보간 유틸
    └── format.ts               # 숫자/시간 포맷
```

### 데이터 흐름

```
[정적 데이터 (data/)] ──→ [게임 엔진 (engine/)] ──→ [Zustand Store (store/)]
                                                          │
                                                          ↓
                                                    [React UI (ui/)]
                                                          │
                                                          ↓
                                                    [IndexedDB 저장]
```

### 핵심 설계 원칙

1. **엔진은 React 비의존**: engine/ 디렉토리는 순수 TypeScript. Vitest로 독립 테스트.
2. **데이터 분리**: 모든 수치는 data/에서 관리. 밸런스 패치 = data 파일만 수정.
3. **단일 진실 원천**: gameStore가 전체 게임 상태. 09-save-schema.md의 SaveGame 인터페이스 직접 사용.
4. **결정론적**: 동일 시드 + 동일 입력 = 동일 결과. seedrandom 필수.

---

## Phase 1 목표 (로드맵 Phase 1: 프로토타입)

| 항목 | 수량 | 상세 |
|------|------|------|
| 지역 | 1 | 아사기리(제1국) |
| 적 | 5+1 | 일반 5종 + 고다이가에루 보스 |
| 클래스 | 6 | T0 6개 (검사/무녀/시노비/야마부시/쇼쿠닌/케모노) |
| 무기 | 6+ | 기본 무기 (철 카타나 등) |
| 레시피 | 5 | 대장간 기본 |
| 이벤트 | 3 | 튜토리얼 3개 |
| 시설 | 3 | 대장간, 모집소, 숙소 |
| 원정 | 깊이 1~2 | 외곽/중간 |
| UI | 핵심 4화면 | 길드/원정/전투로그/모험가 |

---

## 태스크 분해

### Phase 0: 프로젝트 부트스트랩
- [ ] Task 0.1: Vite + React 19 + TypeScript 프로젝트 초기화 — Target: `/`
  - Acceptance Criteria: `npm run dev` 정상 실행, TS strict 활성화
  - Dependencies: none
  - Estimated effort: 10분

- [ ] Task 0.2: 핵심 의존성 설치 — Target: `package.json`
  - Acceptance Criteria: zustand, idb-keyval, seedrandom, vitest 설치 완료
  - Dependencies: 0.1
  - Estimated effort: 5분

- [ ] Task 0.3: 디렉토리 구조 + CSS 기반 — Target: `src/`
  - Acceptance Criteria: 위 아키텍처 디렉토리 존재, variables.css에 와시 팔레트 정의, 폰트 로드
  - Dependencies: 0.1
  - Estimated effort: 10분

- [ ] Task 0.4: SaveGame 타입 정의 — Target: `src/store/gameStore.ts`
  - Acceptance Criteria: 09-save-schema.md의 전체 인터페이스 TypeScript로 구현
  - Dependencies: 0.1
  - Estimated effort: 15분

- [ ] Task 0.5: 마스터 상수 + XP 보간 테이블 — Target: `src/data/constants.ts`, `src/engine/adventurer/XpTable.ts`
  - Acceptance Criteria: 00-master-formulas.md의 모든 상수 정의, XP 보간 함수 + Vitest 테스트 통과
  - Dependencies: 0.1
  - Estimated effort: 15분

**Phase 0 체크포인트**: `npm run dev` + `npm test` 정상, 빈 화면에 와시 배경 표시

---

### Phase 1: 게임 엔진 코어
- [ ] Task 1.1: RNG + 유틸리티 — Target: `src/utils/rng.ts`, `src/utils/lerp.ts`
  - Acceptance Criteria: seedrandom 래퍼, lerp 함수, Vitest 테스트 통과
  - Dependencies: 0.2
  - Estimated effort: 10분

- [ ] Task 1.2: 스탯 계산 엔진 — Target: `src/engine/adventurer/StatCalc.ts`
  - Acceptance Criteria: 기준값+성장률 공식, 파생 스탯(HP/공격/방어/회피/크리) 계산, 6클래스 Lv1~100 참조표와 일치 검증
  - Dependencies: 0.5, 1.1
  - Estimated effort: 15분

- [ ] Task 1.3: 전투 엔진 (데미지/회복) — Target: `src/engine/combat/DamageCalc.ts`, `CombatEngine.ts`
  - Acceptance Criteria: 물리/술법/회복 공식, 원소 상성, 크리티컬, 최소 데미지 1, 30라운드 제한, AI 스킬 선택
  - Dependencies: 1.2
  - Estimated effort: 15분

- [ ] Task 1.4: 조우 시퀀스 생성 — Target: `src/engine/expedition/EncounterGen.ts`
  - Acceptance Criteria: 시드 기반 결정론적 생성, 깊이별 조우 수/유형 가중치, 연속 전투 3회 제한, 방치 안전 루트
  - Dependencies: 1.1
  - Estimated effort: 15분

- [ ] Task 1.5: 원정 엔진 — Target: `src/engine/expedition/ExpeditionEngine.ts`
  - Acceptance Criteria: 조우 순회 → 전투 실행 → 결과 수집, 오프라인 반복 로직, HP<30% 자동 귀환
  - Dependencies: 1.3, 1.4
  - Estimated effort: 15분

- [ ] Task 1.6: Phase 1 정적 데이터 — Target: `src/data/`
  - Acceptance Criteria: 아사기리 적 8종+보스, T0 6클래스 스킬 24개, 기본 무기 13종, 기본 방어구 6종, 소재 10종, 레시피 5종
  - Dependencies: 0.5
  - Estimated effort: 15분

**Phase 1 체크포인트**: `CombatEngine.simulate(party, enemy)` → 전투 결과 반환, Vitest 전투 시뮬레이션 통과

---

### Phase 2: 게임 상태 + 틱 루프
- [ ] Task 2.1: Zustand 게임 스토어 — Target: `src/store/gameStore.ts`
  - Acceptance Criteria: SaveGame 상태, 초기 상태 생성(야요이/카에데/렌 3인), 액션(dispatch expedition, add item, level up)
  - Dependencies: 0.4, 1.5
  - Estimated effort: 15분

- [ ] Task 2.2: 게임 틱 루프 — Target: `src/engine/GameLoop.ts`
  - Acceptance Criteria: requestAnimationFrame 기반, 1초=1틱, 원정 진행/시설 생산/사기 변동 틱 처리, 일시정지/배속(x1,x2,x5)
  - Dependencies: 2.1
  - Estimated effort: 15분

- [ ] Task 2.3: 모집 시스템 — Target: `src/engine/adventurer/Recruitment.ts`
  - Acceptance Criteria: 시드 기반 후보 생성, 14400틱 갱신, 후보 3명, 이름풀(04-name-pool)에서 생성, 성격 특성 2~3개
  - Dependencies: 2.1, 1.1
  - Estimated effort: 15분

- [ ] Task 2.4: IndexedDB 저장/로드 — Target: `src/store/persistence.ts`
  - Acceptance Criteria: 자동 저장(300틱마다), 수동 JSON 내보내기/가져오기, 버전 필드 포함
  - Dependencies: 2.1
  - Estimated effort: 10분

- [ ] Task 2.5: 부재 보고 (오프라인 보상) — Target: `src/engine/GameLoop.ts`
  - Acceptance Criteria: 접속 시 경과 틱 계산, 24시간 상한, 안전 루트 보상 시뮬레이션, 결과 요약
  - Dependencies: 2.2, 1.5
  - Estimated effort: 15분

**Phase 2 체크포인트**: 게임 틱 자동 진행, 원정 출발→귀환 사이클, 저장/로드 정상

---

### Phase 3: 핵심 UI
- [ ] Task 3.1: 레이아웃 셸 — Target: `src/App.tsx`, `src/ui/layouts/`
  - Acceptance Criteria: 사이드바(데스크톱)/하단탭(모바일) 전환, 8개 탭, 반응형(1024px 기준)
  - Dependencies: 0.3
  - Estimated effort: 15분

- [ ] Task 3.2: 길드 홈 화면 — Target: `src/ui/screens/GuildScreen.tsx`
  - Acceptance Criteria: 진행 중 원정 표시, 모험가 목록 요약, 사기/HP 바, 이벤트 알림 영역
  - Dependencies: 3.1, 2.1
  - Estimated effort: 15분

- [ ] Task 3.3: 원정 화면 — Target: `src/ui/screens/ExpeditionScreen.tsx`
  - Acceptance Criteria: 지역/깊이 선택, 파티 편성(4인 드래그), 소모품 장착, 예상 시간 표시, 출발 버튼
  - Dependencies: 3.1, 2.1
  - Estimated effort: 15분

- [ ] Task 3.4: 전투 로그 화면 — Target: `src/ui/screens/CombatLogScreen.tsx`
  - Acceptance Criteria: 서사 스타일 로그("야요이가 오니 졸병을 베었다 — 158 데미지"), 라운드 구분, 드롭 요약, 자동 스크롤
  - Dependencies: 3.1, 1.3
  - Estimated effort: 15분

- [ ] Task 3.5: 모험가 상세 화면 — Target: `src/ui/screens/AdventurerDetailScreen.tsx`
  - Acceptance Criteria: 스탯 바, 장비 슬롯 6개, 스킬 목록, 유대 관계, 사기 표시
  - Dependencies: 3.1, 2.1
  - Estimated effort: 15분

- [ ] Task 3.6: 이벤트 모달 — Target: `src/ui/modals/EventModal.tsx`
  - Acceptance Criteria: 전체화면 서사 텍스트, 2~3 선택지 버튼, 잉크 워시 페이드 애니메이션(CSS)
  - Dependencies: 3.1
  - Estimated effort: 10분

- [ ] Task 3.7: 튜토리얼 이벤트 연결 — Target: `src/engine/event/EventEngine.ts`
  - Acceptance Criteria: TUT-001(첫 만남), TUT-002(첫 원정), TUT-003(하얀 여우) 3개 이벤트 트리거 + 선택지 + 결과
  - Dependencies: 3.6, 2.1
  - Estimated effort: 15분

- [ ] Task 3.8: 시설 기본 (대장간/모집소) — Target: `src/ui/screens/FacilityListScreen.tsx`
  - Acceptance Criteria: 시설 목록, 대장간 제작 대기열, 모집소 후보 목록, 업그레이드 버튼 + 비용 표시
  - Dependencies: 3.1, 2.3
  - Estimated effort: 15분

**Phase 3 체크포인트**: 브라우저에서 완전한 게임 플레이 가능 — 모집→편성→원정→전투→귀환→제작 루프

---

### Phase 4: 통합 + 폴리시
- [ ] Task 4.1: 밸런스 시뮬레이션 테스트 — Target: `src/__tests__/balance.test.ts`
  - Acceptance Criteria: 11-economy-balance.md의 Vitest 시나리오 4개 구현 + 통과
  - Dependencies: Phase 1, Phase 2
  - Estimated effort: 15분

- [ ] Task 4.2: 레벨업/전직 모달 — Target: `src/ui/modals/LevelUpModal.tsx`
  - Acceptance Criteria: 레벨업 알림, 스탯 증가 표시, T0→T1 전직 안내 (Phase 1에서는 T0만이므로 예고만)
  - Dependencies: 3.5
  - Estimated effort: 10분

- [ ] Task 4.3: 설정 + 내보내기/가져오기 — Target: `src/ui/screens/SettingsScreen.tsx`
  - Acceptance Criteria: 배속 설정, JSON 내보내기/가져오기 버튼, 버전 정보 표시
  - Dependencies: 2.4, 3.1
  - Estimated effort: 10분

- [ ] Task 4.4: 부재 보고 모달 — Target: `src/ui/modals/AbsenceReportModal.tsx`
  - Acceptance Criteria: 접속 시 경과 시간/획득 보상 표시, 서사 스타일 요약, 닫기 버튼
  - Dependencies: 2.5, 3.1
  - Estimated effort: 10분

- [ ] Task 4.5: E2E 플레이 테스트 — Target: 수동 검증
  - Acceptance Criteria: 새 게임 → 첫 원정 완료 → 장비 제작 → 모집 → 2차 원정 → 이벤트 발생, 저장/로드 후 상태 유지
  - Dependencies: all above
  - Estimated effort: 15분

**Phase 4 체크포인트**: Phase 1 프로토타입 완성. 단일 지역에서 핵심 루프 동작. 밸런스 테스트 통과.

---

## 리스크 분석

| # | 리스크 | 심각도 | 확률 | 완화 전략 |
|---|--------|--------|------|-----------|
| R1 | 전투 엔진 복잡도 (AI 로직 + 원소 + 상태이상) | 높음 | 중간 | Phase 1에서는 기본 AI만 구현 (HP 기반 우선순위). 고급 AI는 Phase 2+에서 |
| R2 | 정적 데이터 입력량 (적 8종, 스킬 24개 등) | 중간 | 높음 | 문서에서 직접 TS 코드로 변환. 형식 통일 후 복붙 최소화 |
| R3 | CSS 와시 텍스처/서사 스타일 구현 | 낮음 | 낮음 | 텍스처는 CSS gradient + subtle pattern. 서사 폰트만 Noto Serif |
| R4 | IndexedDB 호환성 | 낮음 | 낮음 | idb-keyval이 폴리필 처리. localStorage 백업 존재 |
| R5 | XP 보간 테이블 정확도 | 중간 | 낮음 | 키포인트 간 선형 보간. 밸런스 테스트에서 검증 |

---

## Phase 전환 기준

| 전환 | 조건 |
|------|------|
| Phase 0 → 1 | `npm run dev` + `npm test` 정상 |
| Phase 1 → 2 | 전투 시뮬레이션 Vitest 통과, 고다이가에루 15~20라운드 내 클리어 검증 |
| Phase 2 → 3 | 틱 루프 자동 진행, 원정→귀환 사이클 동작, 저장/로드 정상 |
| Phase 3 → 4 | 브라우저에서 핵심 루프 플레이 가능 |
| Phase 4 → 완료 | 밸런스 테스트 4개 통과, E2E 수동 테스트 통과 |
