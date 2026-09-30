/**
 * @file units.ts
 * @description Converts model-space areas to real-world units and formats them for display.
 *   three.js is unitless: each model declares how many metres one model unit is. Area scales
 *   with the SQUARE of that factor (a 2× bigger object has 4× the surface).
 */

const SQUARE_CM_PER_SQUARE_M = 10_000;

// Fixed locale so output is identical in every browser and in tests.
const areaFormat = new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 });
const squareMetreFormat = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/**
 * Converts an area in model units² to square metres.
 *
 * @param modelArea - Area in model units squared
 * @param metersPerUnit - Metres per model unit (model unit scale × mesh world scale)
 * @returns Area in m²
 */
export function toSquareMeters(modelArea: number, metersPerUnit: number): number {
  return modelArea * metersPerUnit * metersPerUnit;
}

/**
 * Formats an area for humans: cm² for object-sized areas, m² from 1 m² upward.
 *
 * @param squareMeters - Area in m²
 * @returns e.g. "12.4 cm²" or "1.25 m²"
 */
export function formatArea(squareMeters: number): string {
  if (squareMeters >= 1) return `${squareMetreFormat.format(squareMeters)} m²`;
  return `${areaFormat.format(squareMeters * SQUARE_CM_PER_SQUARE_M)} cm²`;
}

/**
 * Formats `part` as a percentage of `total`.
 *
 * @param part - Portion (e.g. painted area)
 * @param total - Whole (e.g. total surface area); 0 yields "0%"
 * @returns e.g. "16.7%"
 */
export function formatPercent(part: number, total: number): string {
  const percent = total > 0 ? (part / total) * 100 : 0;
  return `${areaFormat.format(percent)}%`;
}
