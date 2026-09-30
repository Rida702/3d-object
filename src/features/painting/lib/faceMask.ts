/**
 * @file faceMask.ts
 * @description Pure helpers for the per-face painted mask and reusable face selections.
 *   Reporting only the faces that actually changed lets measurement update the painted area
 *   incrementally (Step 3) instead of re-summing every triangle.
 */
import type { FaceSelection } from '../types';

/**
 * Allocates an empty face selection able to hold `capacity` faces.
 * Call once per surface, never in a pointer handler.
 *
 * @param capacity - Maximum number of faces (normally the surface's face count)
 * @returns A selection with count 0
 */
export function createFaceSelection(capacity: number): FaceSelection {
  return { faces: new Uint32Array(capacity), count: 0 };
}

/**
 * Sets every selected face in the mask to `value` and records which faces changed.
 *
 * @param mask - Per-face painted mask (1 painted, 0 not), mutated in place
 * @param selection - Faces to set
 * @param value - 1 to paint, 0 to erase
 * @param changed - Output: overwritten with the faces whose mask value flipped
 */
export function setFaces(
  mask: Uint8Array,
  selection: FaceSelection,
  value: 0 | 1,
  changed: FaceSelection,
): void {
  changed.count = 0;
  for (let i = 0; i < selection.count; i++) {
    const face = selection.faces[i]!;
    if (mask[face] === value) continue;
    mask[face] = value;
    changed.faces[changed.count++] = face;
  }
}
