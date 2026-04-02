// ============================================================================
// Kotoha — Name Pool Data
// Source: docs/data/04-name-pool.md
// ============================================================================

import type { BaseClass } from '../core/types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface NameEntry {
  ko: string;    // Korean reading
  jp: string;    // Japanese kana
  kanji: string; // Kanji
  meaning: string;
}

export interface TutorialAdventurer {
  givenName: string;   // Korean
  givenNameJp: string; // Japanese kana
  givenKanji: string;  // Kanji
  baseClass: BaseClass;
}

// ---------------------------------------------------------------------------
// Family Names (50)
// ---------------------------------------------------------------------------

export const FAMILY_NAMES: NameEntry[] = [
  { ko: '사쿠라', jp: 'さくら', kanji: '桜', meaning: '벚꽃' },
  { ko: '아오야마', jp: 'あおやま', kanji: '青山', meaning: '푸른 산' },
  { ko: '쿠로카와', jp: 'くろかわ', kanji: '黒川', meaning: '검은 강' },
  { ko: '시라카와', jp: 'しらかわ', kanji: '白川', meaning: '흰 강' },
  { ko: '아카츠키', jp: 'あかつき', kanji: '暁', meaning: '새벽' },
  { ko: '미야자키', jp: 'みやざき', kanji: '宮崎', meaning: '신사 곶' },
  { ko: '타카하시', jp: 'たかはし', kanji: '高橋', meaning: '높은 다리' },
  { ko: '모리', jp: 'もり', kanji: '森', meaning: '숲' },
  { ko: '하야시', jp: 'はやし', kanji: '林', meaning: '수풀' },
  { ko: '야마구치', jp: 'やまぐち', kanji: '山口', meaning: '산 입구' },
  { ko: '이시카와', jp: 'いしかわ', kanji: '石川', meaning: '돌 강' },
  { ko: '후지와라', jp: 'ふじわら', kanji: '藤原', meaning: '등나무 벌판' },
  { ko: '나카무라', jp: 'なかむら', kanji: '中村', meaning: '가운데 마을' },
  { ko: '오오노', jp: 'おおの', kanji: '大野', meaning: '큰 들판' },
  { ko: '코바야시', jp: 'こばやし', kanji: '小林', meaning: '작은 숲' },
  { ko: '미즈키', jp: 'みずき', kanji: '水木', meaning: '물 나무' },
  { ko: '카제야마', jp: 'かぜやま', kanji: '風山', meaning: '바람 산' },
  { ko: '호시노', jp: 'ほしの', kanji: '星野', meaning: '별 들판' },
  { ko: '츠키시마', jp: 'つきしま', kanji: '月島', meaning: '달 섬' },
  { ko: '아마노', jp: 'あまの', kanji: '天野', meaning: '하늘 들판' },
  { ko: '쿠모이', jp: 'くもい', kanji: '雲居', meaning: '구름 위' },
  { ko: '유키무라', jp: 'ゆきむら', kanji: '雪村', meaning: '눈 마을' },
  { ko: '하나오카', jp: 'はなおか', kanji: '花岡', meaning: '꽃 언덕' },
  { ko: '아사히', jp: 'あさひ', kanji: '朝日', meaning: '아침 해' },
  { ko: '니시키', jp: 'にしき', kanji: '錦', meaning: '비단' },
  { ko: '카구라', jp: 'かぐら', kanji: '神楽', meaning: '신악' },
  { ko: '스즈키', jp: 'すずき', kanji: '鈴木', meaning: '방울 나무' },
  { ko: '타니', jp: 'たに', kanji: '谷', meaning: '계곡' },
  { ko: '이와사키', jp: 'いわさき', kanji: '岩崎', meaning: '바위 곶' },
  { ko: '키리시마', jp: 'きりしま', kanji: '霧島', meaning: '안개 섬' },
  { ko: '마츠모토', jp: 'まつもと', kanji: '松本', meaning: '소나무 뿌리' },
  { ko: '카와카미', jp: 'かわかみ', kanji: '川上', meaning: '강 상류' },
  { ko: '타케다', jp: 'たけだ', kanji: '竹田', meaning: '대나무 밭' },
  { ko: '우메하라', jp: 'うめはら', kanji: '梅原', meaning: '매화 벌판' },
  { ko: '노구치', jp: 'のぐち', kanji: '野口', meaning: '들 입구' },
  { ko: '이나바', jp: 'いなば', kanji: '稲葉', meaning: '벼 잎' },
  { ko: '시미즈', jp: 'しみず', kanji: '清水', meaning: '맑은 물' },
  { ko: '코이즈미', jp: 'こいずみ', kanji: '小泉', meaning: '작은 샘' },
  { ko: '오가타', jp: 'おがた', kanji: '緒方', meaning: '실마리 쪽' },
  { ko: '미나미', jp: 'みなみ', kanji: '南', meaning: '남쪽' },
  { ko: '키타무라', jp: 'きたむら', kanji: '北村', meaning: '북쪽 마을' },
  { ko: '아라이', jp: 'あらい', kanji: '新井', meaning: '새 우물' },
  { ko: '쿠사카', jp: 'くさか', kanji: '草加', meaning: '풀밭' },
  { ko: '카미야', jp: 'かみや', kanji: '神谷', meaning: '신의 계곡' },
  { ko: '오니즈카', jp: 'おにづか', kanji: '鬼塚', meaning: '오니 무덤' },
  { ko: '키츠네야', jp: 'きつねや', kanji: '狐谷', meaning: '여우 골짜기' },
  { ko: '와타나베', jp: 'わたなべ', kanji: '渡辺', meaning: '나루터' },
  { ko: '사이토', jp: 'さいとう', kanji: '斎藤', meaning: '재계 등나무' },
  { ko: '토키와', jp: 'ときわ', kanji: '常磐', meaning: '영원한 바위' },
  { ko: '카자마', jp: 'かざま', kanji: '風間', meaning: '바람 사이' },
];

// ---------------------------------------------------------------------------
// Given Names (80)
// ---------------------------------------------------------------------------

export const GIVEN_NAMES: NameEntry[] = [
  { ko: '하루', jp: 'はる', kanji: '春', meaning: '봄' },
  { ko: '유키', jp: 'ゆき', kanji: '雪', meaning: '눈' },
  { ko: '카에데', jp: 'かえで', kanji: '楓', meaning: '단풍' },
  { ko: '렌', jp: 'れん', kanji: '蓮', meaning: '연꽃' },
  { ko: '야요이', jp: 'やよい', kanji: '弥生', meaning: '3월' },
  { ko: '하루카', jp: 'はるか', kanji: '遥', meaning: '아득함' },
  { ko: '아카네', jp: 'あかね', kanji: '茜', meaning: '꼭두서니' },
  { ko: '소라', jp: 'そら', kanji: '空', meaning: '하늘' },
  { ko: '히나타', jp: 'ひなた', kanji: '陽向', meaning: '양지' },
  { ko: '미나토', jp: 'みなと', kanji: '湊', meaning: '항구' },
  { ko: '시온', jp: 'しおん', kanji: '紫苑', meaning: '자완(꽃)' },
  { ko: '나기', jp: 'なぎ', kanji: '凪', meaning: '바다 잔잔함' },
  { ko: '츠무기', jp: 'つむぎ', kanji: '紬', meaning: '명주' },
  { ko: '아오이', jp: 'あおい', kanji: '葵', meaning: '접시꽃' },
  { ko: '이로하', jp: 'いろは', kanji: '彩', meaning: '색채' },
  { ko: '코하루', jp: 'こはる', kanji: '小春', meaning: '작은 봄' },
  { ko: '나츠키', jp: 'なつき', kanji: '夏希', meaning: '여름 희망' },
  { ko: '아키라', jp: 'あきら', kanji: '明', meaning: '밝음' },
  { ko: '후유', jp: 'ふゆ', kanji: '冬', meaning: '겨울' },
  { ko: '히카리', jp: 'ひかり', kanji: '光', meaning: '빛' },
  { ko: '카구야', jp: 'かぐや', kanji: '輝夜', meaning: '빛나는 밤' },
  { ko: '미코토', jp: 'みこと', kanji: '命', meaning: '생명/존귀' },
  { ko: '사쿠야', jp: 'さくや', kanji: '咲夜', meaning: '피는 밤' },
  { ko: '키요', jp: 'きよ', kanji: '清', meaning: '맑음' },
  { ko: '겐', jp: 'げん', kanji: '玄', meaning: '검을/현묘' },
  { ko: '료', jp: 'りょう', kanji: '涼', meaning: '서늘함' },
  { ko: '신', jp: 'しん', kanji: '真', meaning: '진실' },
  { ko: '타이가', jp: 'たいが', kanji: '大河', meaning: '큰 강' },
  { ko: '하야테', jp: 'はやて', kanji: '疾風', meaning: '질풍' },
  { ko: '코가네', jp: 'こがね', kanji: '黄金', meaning: '황금' },
  { ko: '긴', jp: 'ぎん', kanji: '銀', meaning: '은' },
  { ko: '스이렌', jp: 'すいれん', kanji: '睡蓮', meaning: '수련' },
  { ko: '우타', jp: 'うた', kanji: '歌', meaning: '노래' },
  { ko: '마이', jp: 'まい', kanji: '舞', meaning: '춤' },
  { ko: '쿠레나이', jp: 'くれない', kanji: '紅', meaning: '진홍' },
  { ko: '시즈카', jp: 'しずか', kanji: '静', meaning: '고요함' },
  { ko: '이부키', jp: 'いぶき', kanji: '息吹', meaning: '숨결' },
  { ko: '미야비', jp: 'みやび', kanji: '雅', meaning: '우아함' },
  { ko: '치하야', jp: 'ちはや', kanji: '千早', meaning: '천 빠름' },
  { ko: '토우야', jp: 'とうや', kanji: '冬夜', meaning: '겨울 밤' },
  { ko: '아사기', jp: 'あさぎ', kanji: '浅葱', meaning: '연한 파' },
  { ko: '쿠레하', jp: 'くれは', kanji: '紅葉', meaning: '단풍잎' },
  { ko: '코토하', jp: 'ことは', kanji: '言葉', meaning: '말/언어' },
  { ko: '유즈키', jp: 'ゆづき', kanji: '柚月', meaning: '유자 달' },
  { ko: '마사키', jp: 'まさき', kanji: '正樹', meaning: '올곧은 나무' },
  { ko: '타쿠마', jp: 'たくま', kanji: '拓真', meaning: '개척 진실' },
  { ko: '히로', jp: 'ひろ', kanji: '寛', meaning: '넓음/관대' },
  { ko: '유우', jp: 'ゆう', kanji: '悠', meaning: '유유함' },
  { ko: '카이', jp: 'かい', kanji: '海', meaning: '바다' },
  { ko: '리쿠', jp: 'りく', kanji: '陸', meaning: '육지' },
  { ko: '미츠키', jp: 'みつき', kanji: '満月', meaning: '보름달' },
  { ko: '하즈키', jp: 'はづき', kanji: '葉月', meaning: '잎 달(8월)' },
  { ko: '키사라기', jp: 'きさらぎ', kanji: '如月', meaning: '2월' },
  { ko: '칸나', jp: 'かんな', kanji: '神無', meaning: '신 없는(10월)' },
  { ko: '시모츠키', jp: 'しもつき', kanji: '霜月', meaning: '서리 달(11월)' },
  { ko: '무츠키', jp: 'むつき', kanji: '睦月', meaning: '1월' },
  { ko: '사츠키', jp: 'さつき', kanji: '皐月', meaning: '5월' },
  { ko: '후미', jp: 'ふみ', kanji: '文', meaning: '글/편지' },
  { ko: '히비키', jp: 'ひびき', kanji: '響', meaning: '울림' },
  { ko: '스바루', jp: 'すばる', kanji: '昴', meaning: '묘성(별)' },
  { ko: '호타루', jp: 'ほたる', kanji: '蛍', meaning: '반딧불' },
  { ko: '코마치', jp: 'こまち', kanji: '小町', meaning: '미인/거리' },
  { ko: '타마키', jp: 'たまき', kanji: '環', meaning: '고리' },
  { ko: '이오리', jp: 'いおり', kanji: '庵', meaning: '암자' },
  { ko: '안즈', jp: 'あんず', kanji: '杏', meaning: '살구' },
  { ko: '모모', jp: 'もも', kanji: '桃', meaning: '복숭아' },
  { ko: '쿠루미', jp: 'くるみ', kanji: '胡桃', meaning: '호두' },
  { ko: '나나', jp: 'なな', kanji: '七', meaning: '일곱' },
  { ko: '미카', jp: 'みか', kanji: '美香', meaning: '아름다운 향' },
  { ko: '유리', jp: 'ゆり', kanji: '百合', meaning: '백합' },
  { ko: '란', jp: 'らん', kanji: '蘭', meaning: '난초' },
  { ko: '아야메', jp: 'あやめ', kanji: '菖蒲', meaning: '창포' },
  { ko: '츠바키', jp: 'つばき', kanji: '椿', meaning: '동백' },
  { ko: '와카바', jp: 'わかば', kanji: '若葉', meaning: '새잎' },
  { ko: '마나츠', jp: 'まなつ', kanji: '真夏', meaning: '한여름' },
  { ko: '코우', jp: 'こう', kanji: '晃', meaning: '빛남' },
  { ko: '젠', jp: 'ぜん', kanji: '禅', meaning: '선(禅)' },
  { ko: '무사시', jp: 'むさし', kanji: '武蔵', meaning: '무장' },
  { ko: '켄고', jp: 'けんご', kanji: '剣悟', meaning: '검의 깨달음' },
  { ko: '류우', jp: 'りゅう', kanji: '龍', meaning: '용' },
];

// ---------------------------------------------------------------------------
// Tutorial Fixed Starters (3)
// Doc note: 야요이(검사), 카에데(무녀), 렌(시노비)
// ---------------------------------------------------------------------------

export const TUTORIAL_ADVENTURERS: TutorialAdventurer[] = [
  {
    givenName: '야요이',
    givenNameJp: 'やよい',
    givenKanji: '弥生',
    baseClass: 'kenshi',
  },
  {
    givenName: '카에데',
    givenNameJp: 'かえで',
    givenKanji: '楓',
    baseClass: 'yamabushi',
  },
  {
    givenName: '렌',
    givenNameJp: 'れん',
    givenKanji: '蓮',
    baseClass: 'shinobi',
  },
];
