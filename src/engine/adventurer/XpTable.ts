/**
 * XP requirement table — the authoritative source for levelling costs.
 *
 * Design-doc keypoints are interpolated linearly between neighbours.
 * The approximate formula floor(18 * Lv^1.6) is intentionally NOT used;
 * only the table values matter.
 */
import { XP_TABLE_KEYPOINTS } from '../../data/constants';
import { tableLerp } from '../../utils/lerp';

/**
 * XP required to advance from `level` to `level + 1`.
 *
 * Returns the exact design-doc value at keypoint levels:
 *   Lv1=150, Lv5=251, Lv10=716, Lv15=1330, Lv25=3380,
 *   Lv45=9370, Lv65=17900, Lv85=28440, Lv99=37800
 *
 * Between keypoints the value is linearly interpolated and floored.
 */
export function xpRequired(level: number): number {
  if (level < 1) return 0;
  if (level > 99) return 0; // Lv 99 is max; no further levelling
  return Math.floor(tableLerp(XP_TABLE_KEYPOINTS, level));
}

/**
 * Total (cumulative) XP needed to reach the given level from Lv 1.
 *
 * cumulativeXp(1) = 0       (you start at Lv 1)
 * cumulativeXp(2) = 150     (need 150 to go 1→2)
 * cumulativeXp(n) = sum of xpRequired(1) .. xpRequired(n-1)
 *
 * Design-doc checkpoints:
 *   cumulativeXp(16) ≈ 9,200
 *   cumulativeXp(51) ≈ 155,000
 *   cumulativeXp(101) ≈ 1,100,000
 */
export function cumulativeXp(level: number): number {
  if (level <= 1) return 0;
  let total = 0;
  for (let lv = 1; lv < level; lv++) {
    total += xpRequired(lv);
  }
  return total;
}
