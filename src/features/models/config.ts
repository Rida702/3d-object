/**
 * @file config.ts
 * @description Tunables for the built-in procedural models (currently just the cube).
 */

/**
 * The starter cube: 1 model unit on each side, light grey so both lighting and paint read
 * clearly. `segments` subdivides each face into segments × segments squares (2 triangles
 * each): 24 → 6 × 24 × 24 × 2 = 6,912 triangles, fine enough for a round brush.
 * `unitScale` 0.1 m per unit makes it a 10 cm cube: 6 faces × 100 cm² = 600 cm² total.
 */
export const CUBE = {
  size: 1,
  unitScale: 0.1,
  segments: 24,
  color: '#eeeeee',
} as const;
