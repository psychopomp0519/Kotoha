# 06 — Event Templates (이벤트 풀)

> 시드 기반 이벤트 시스템의 실제 이벤트 데이터.

---

## Phase 1~2 이벤트 (튜토리얼 + 제1국)

### 튜토리얼 이벤트 (3개, 강제 발생)

#### TUT-001: 첫 만남

```json
{
  "id": "tut_first_meeting",
  "type": "GUILD",
  "rarity": "unique",
  "trigger": { "gameDay": { "max": 0 } },
  "baseWeight": 100,
  "title": "세 사람이 기다리고 있다",
  "titleJp": "三人が待っている",
  "narrative": "허름한 오두막 안에 세 명의 모험가가 앉아 있다. 검을 닦는 여인, 기도하는 소녀, 그리고 벽에 기댄 채 잠든 척하는 청년.\n\n그들이 당신을 올려다본다.",
  "choices": [
    {
      "id": "greet",
      "text": "인사한다",
      "results": [{
        "weight": 100,
        "narrative": "야요이가 검을 집어넣으며 고개를 숙였다. \"기다리고 있었습니다, 길드 마스터.\"",
        "effects": [{ "type": "morale", "value": 10, "target": "all_guild" }],
        "setFlags": ["tutorial_started"]
      }]
    }
  ],
  "oneTime": true
}
```

#### TUT-002: 첫 원정 출발

```json
{
  "id": "tut_first_expedition",
  "type": "GUILD",
  "rarity": "unique",
  "trigger": { "hasFlag": ["tutorial_started"], "eventNotSeen": ["tut_first_expedition"] },
  "baseWeight": 100,
  "title": "바깥이 시끄럽다",
  "titleJp": "外が騒がしい",
  "narrative": "마을 사람이 뛰어왔다. 논밭 근처에서 타누키 떼가 난동을 부리고 있다고.\n\n야요이가 벌써 검을 뽑아 들었다.",
  "choices": [
    {
      "id": "send",
      "text": "출발시킨다",
      "results": [{
        "weight": 100,
        "narrative": "세 사람이 고개를 끄덕이고 문을 나섰다. 코토하야의 첫 원정이 시작된다.",
        "effects": [],
        "setFlags": ["tutorial_first_expedition"]
      }]
    }
  ],
  "oneTime": true
}
```

#### TUT-003: 하얀 여우 (튜토리얼 이벤트)

```json
{
  "id": "tut_white_fox",
  "type": "GUILD",
  "rarity": "unique",
  "trigger": { "hasFlag": ["tutorial_first_expedition"], "gameDay": { "min": 0 } },
  "baseWeight": 100,
  "title": "하얀 여우",
  "titleJp": "白い狐",
  "narrative": "비가 그친 뒤, 길드 문 앞에 하얀 여우 한 마리가 앉아 있었다.\n꼬리가 셋이었다. 젖은 털에서 벚꽃 향이 났다.",
  "choices": [
    {
      "id": "follow",
      "text": "여우를 따라간다",
      "results": [
        { "weight": 70, "narrative": "여우를 따라가자, 숲 깊은 곳에 오래된 신사가 있었다. 신사 앞에 보물상자가 놓여 있다.", "effects": [{ "type": "item", "value": "wpn_katana_1" }, { "type": "exp", "value": 300, "target": "all_guild" }], "setFlags": ["white_fox_followed"] },
        { "weight": 30, "narrative": "여우를 따라갔지만, 안개 속에서 길을 잃었다. 한참을 헤맨 끝에 원래 길로 돌아왔다.", "effects": [{ "type": "morale", "value": -5, "target": "all_guild" }], "setFlags": ["white_fox_lost"] }
      ]
    },
    {
      "id": "food",
      "text": "음식을 건넨다",
      "results": [{
        "weight": 100,
        "narrative": "여우가 음식을 받아 먹고, 꼬리를 한 번 흔들었다. 그리고 입에서 작은 구슬 하나를 내려놓았다.",
        "effects": [{ "type": "item", "value": "mat_fox_bead" }, { "type": "morale", "value": 10, "target": "all_guild" }],
        "setFlags": ["white_fox_befriended"],
        "chainNext": "chain_fox_return"
      }]
    },
    {
      "id": "ignore",
      "text": "모른 척 지나간다",
      "results": [{
        "weight": 100,
        "narrative": "여우는 한참 파티를 바라보다가, 조용히 숲 속으로 사라졌다.",
        "effects": [],
        "setFlags": ["white_fox_ignored"]
      }]
    }
  ],
  "chainId": "white_fox_saga",
  "chainOrder": 1,
  "tags": ["fox", "shrine", "mystery"],
  "oneTime": false
}
```

---

### 제1국 원정 이벤트 (10개)

#### ENC-A01: 약초밭 발견

```json
{
  "id": "enc_herb_field",
  "type": "ENCOUNTER",
  "rarity": "common",
  "trigger": { "region": ["asagiri"] },
  "baseWeight": 50,
  "title": "약초밭",
  "titleJp": "薬草畑",
  "narrative": "숲 속 빈터에 약초가 무성하다. 누군가 심은 것처럼 정돈되어 있다.",
  "choices": [
    { "id": "gather", "text": "채집한다", "results": [{ "weight": 100, "narrative": "한 아름 채집했다. 상태가 좋다.", "effects": [{ "type": "item", "value": "mat_herb", "target": "party" }] }] },
    { "id": "investigate", "text": "주변을 살핀다", "results": [
      { "weight": 60, "narrative": "나무 아래에 작은 지장보살상이 있었다. 누군가의 약초밭이었던 모양이다. 상 앞에 오래된 약초 레시피가 있었다.", "effects": [{ "type": "unlock_recipe", "value": "pot_heal_m" }] },
      { "weight": 40, "narrative": "아무것도 발견하지 못했지만, 약초는 충분히 채집했다.", "effects": [{ "type": "item", "value": "mat_herb", "target": "party" }] }
    ]}
  ],
  "tags": ["herb", "discovery"],
  "oneTime": false
}
```

#### ENC-A02: 카파의 오이

```json
{
  "id": "enc_kappa_cucumber",
  "type": "ENCOUNTER",
  "rarity": "uncommon",
  "trigger": { "region": ["asagiri"], "depth": { "min": 2 } },
  "baseWeight": 30,
  "title": "개울가의 접시",
  "titleJp": "小川の皿",
  "narrative": "개울가에 카파가 앉아 있다. 접시가 마르기 시작한 것 같다. 기운 없이 이쪽을 올려다본다.",
  "choices": [
    { "id": "give_cucumber", "text": "오이를 건넨다", "condition": { "hasItem": "mat_cucumber" }, "results": [{ "weight": 100, "narrative": "카파가 오이를 받아들고는 눈을 빛냈다. 물속으로 들어가더니 반짝이는 조개를 가져왔다.", "effects": [{ "type": "item", "value": "mat_pearl" }, { "type": "morale", "value": 5, "target": "party" }], "setFlags": ["kappa_friend_1"] }] },
    { "id": "attack", "text": "경계한다", "results": [{ "weight": 100, "narrative": "카파가 놀라서 물속으로 도망쳤다. 접시에 물이 남아 있었다.", "effects": [{ "type": "item", "value": "mat_kappa_shell" }] }] },
    { "id": "ignore", "text": "지나친다", "results": [{ "weight": 100, "narrative": "카파는 쓸쓸한 눈으로 파티가 떠나는 것을 바라보았다.", "effects": [] }] }
  ],
  "tags": ["kappa", "kindness"],
  "oneTime": false
}
```

#### ENC-A03 ~ ENC-A10 (템플릿)

| ID | 제목 | 유형 | 희귀도 | 조건 | 핵심 선택지 |
|----|------|------|--------|------|------------|
| enc_tanuki_merchant | 타누키 행상 | ENCOUNTER | common | 제1국 | 거래/무시 → 할인 아이템 or 금화 |
| enc_old_shrine | 오래된 신사 | ENCOUNTER | uncommon | 제1국 깊이2+ | 기도/탐색 → SPI버프 or 아이템 |
| enc_injured_adventurer | 부상당한 모험가 | ENCOUNTER | uncommon | 제1국 | 치료/무시 → 사기+, 정보 or 아무것도 |
| enc_firefly_field | 반딧불 들판 | ENCOUNTER | rare | 제1국, 밤 | 관찰/채집 → 도감 or 희귀약초 |
| enc_rain_shelter | 비를 피하며 | ENCOUNTER | common | 제1국 | 쉬기/계속 → 야영효과 or 시간절약 |
| enc_kodama_dance | 코다마의 춤 | ENCOUNTER | rare | 제1국 깊이3+ | 함께춤/관찰 → 사기+20 or 도감정보 |
| enc_oni_patrol | 오니 순찰대 | ENCOUNTER | uncommon | 제1국 깊이3+ | 전투/숨기 → 추가전투+경험치 or 회피 |
| enc_mushroom_circle | 버섯 원 | ENCOUNTER | uncommon | 제1국 | 먹기/무시 → HP회복 or 독(랜덤) |

---

### 길드 이벤트 (5개)

| ID | 제목 | 유형 | 조건 | 핵심 내용 |
|----|------|------|------|----------|
| guild_new_recruit | 문을 두드리는 소리 | GUILD | 모집소 후보 존재 시 | 모집 힌트 이벤트 |
| guild_facility_hint | 대장장이의 투덜거림 | GUILD | 대장간 Lv1, 소재 보유 | 제작 시스템 소개 |
| guild_tea_time | 다실의 향기 | GUILD | 다실 해금 후 | 다실 사용 유도 |
| guild_moonlit_night | 달빛 아래 | GUILD | 밤, 모험가 3+명 | 유대 포인트 보너스 |
| guild_rainy_day | 비 오는 날 | GUILD | — | 분위기 이벤트 (사기 변동만) |

---

### 연쇄 이벤트: 하얀 여우 이야기 (5단계)

```
1. 하얀 여우 (TUT-003) → [음식] → 여우 구슬 획득
2. 여우의 은혜 (3일 후) → 희귀약초 + 여우 부적
3. 여우의 위기 (7일 후, 원정 중) → [도움] 여우 합류 / [외면] 구슬 강화
4. 숲의 비밀 (14일 후, 도움 선택 시) → 숨겨진 신사 발견
5. 여우의 선물 (21일 후) → 펫 "아기여우(★)" 획득 or 여우 구슬 진화
```

---

## 이벤트 플래그 목록 (Phase 1~2)

| 플래그 | 설정 조건 | 사용처 |
|--------|----------|--------|
| tutorial_started | TUT-001 완료 | TUT-002 트리거 |
| tutorial_first_expedition | TUT-002 완료 | TUT-003 트리거 |
| white_fox_followed | 여우 따라감 | 신사 관련 후속 |
| white_fox_lost | 여우 따라갔지만 실패 | 재도전 가능 |
| white_fox_befriended | 여우에게 음식 | 연쇄 이벤트 시작 |
| white_fox_ignored | 여우 무시 | 다른 변주 재등장 |
| fox_debt_1 | 여우의 은혜 수령 | 3단계 트리거 |
| fox_helped | 여우 위기 시 도움 | 4단계 트리거 |
| fox_abandoned | 여우 위기 시 외면 | 구슬 강화 루트 |
| kappa_friend_1 | 카파에게 오이 | 카파 후속 이벤트 |
| boss_asagiri_seen | 제1국 보스 조우 | 보스 관련 이벤트 |
| boss_asagiri_clear | 제1국 보스 격파 | 제2국 해금, 연쇄 |

---

## 이벤트 작성 체크리스트

1. [ ] 서술 100~300자
2. [ ] 감각 묘사 1개 이상 (시각/청각/후각/촉각)
3. [ ] 3인칭 관찰자 시점
4. [ ] 선택지 결과 예측 불가 (정답 보이면 안 됨)
5. [ ] 모든 선택지에 보상 (나쁜 선택 없음)
6. [ ] 일본어 병기 (첫 등장 명사)
7. [ ] 애니메이션 코미디 톤 절대 금지
