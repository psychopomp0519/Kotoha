/**
 * Linear interpolation utilities.
 * Used primarily for the XP table but available for any piecewise-linear curve.
 */

/** Standard linear interpolation: returns a when t=0, b when t=1. */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/** Entry in a piecewise-linear lookup table. */
export interface TableEntry {
  level: number;
  value: number;
}

/**
 * Piecewise-linear interpolation over a sorted table of keypoints.
 *
 * - If targetLevel exactly matches a keypoint, its value is returned.
 * - If targetLevel falls between two keypoints, the value is linearly interpolated.
 * - If targetLevel is below the first keypoint, the first value is returned.
 * - If targetLevel is above the last keypoint, the last value is returned.
 */
export function tableLerp(table: TableEntry[], targetLevel: number): number {
  if (table.length === 0) {
    throw new Error('tableLerp: table must not be empty');
  }

  // Clamp to table bounds
  if (targetLevel <= table[0].level) return table[0].value;
  if (targetLevel >= table[table.length - 1].level) return table[table.length - 1].value;

  // Find the surrounding keypoints
  for (let i = 0; i < table.length - 1; i++) {
    const lo = table[i];
    const hi = table[i + 1];
    if (targetLevel >= lo.level && targetLevel <= hi.level) {
      const t = (targetLevel - lo.level) / (hi.level - lo.level);
      return lerp(lo.value, hi.value, t);
    }
  }

  // Fallback (should never reach here with a sorted table)
  return table[table.length - 1].value;
}
