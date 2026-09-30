/**
 * @file config.ts
 * @description Tunables for the built-in procedural models (currently just the cube).
 */

/**
 * The starter cube: 1 model unit on each side, light grey so both lighting and paint read
 * clearly. `segments` subdivides each face into segments × segments squares (2 triangles
 * each): 24 → 6 × 24 × 24 × 2 = 6,912 triangles, fine enough for a round brush.
 */
export const CUBE = {
  size: 1,
  segments: 24,
  color: '#eeeeee',
} as const;
