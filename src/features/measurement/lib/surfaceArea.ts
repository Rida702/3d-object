/**
 * @file surfaceArea.ts
 * @description Sums precomputed triangle areas: a whole surface, a masked region, or a list
 *   of faces. A region's area is simply the sum of its triangles' areas.
 *   Takes plain arrays (no painting types) so measurement doesn't depend on painting.
 */

/**
 * Sums face areas, optionally only where `mask` is 1.
 * Full recompute — O(faces). Painting uses sumFaceAreas for cheap incremental updates;
 * this is the reference total (and what tests compare the running total against).
 *
 * @param faceAreas - Area per face
 * @param mask - Optional per-face flag (1 = include)
 * @returns Total area in the same units as faceAreas
 */
export function sumAreas(faceAreas: Float32Array, mask?: Uint8Array): number {
  let total = 0;
  for (let face = 0; face < faceAreas.length; face++) {
    if (mask && mask[face] !== 1) continue;
    total += faceAreas[face]!;
  }
  return total;
}

/**
 * Sums the areas of the listed faces — used to add or subtract only the faces that changed
 * during a paint step, instead of re-summing the whole surface.
 *
 * @param faceAreas - Area per face
 * @param faces - Face indices (only the first `count` are read)
 * @param count - Number of valid entries in `faces`
 * @returns Summed area
 */
export function sumFaceAreas(faceAreas: Float32Array, faces: Uint32Array, count: number): number {
  let total = 0;
  for (let i = 0; i < count; i++) {
    total += faceAreas[faces[i]!]!;
  }
  return total;
}
