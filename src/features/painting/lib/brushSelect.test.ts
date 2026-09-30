/**
 * @file brushSelect.test.ts
 * @description Tests for selecting faces under a round brush.
 */
import { Color, PlaneGeometry, Vector3 } from 'three';
import { describe, expect, it } from 'vitest';
import type { PaintHit } from '../types';
import { selectFacesInRadius } from './brushSelect';
import { createFaceSelection } from './faceMask';
import { createPaintSurface } from './paintSurface';

/**
 * A 1×1 plane split into a 4×4 grid (32 triangles, 0.25-unit cells), centred at the origin.
 * @returns A paint surface for the plane
 */
function gridSurface() {
  return createPaintSurface(new PlaneGeometry(1, 1, 4, 4), new Color(1, 1, 1));
}

/**
 * @param x - Hit x
 * @param y - Hit y
 * @param faceIndex - Face under the pointer
 * @returns A hit on the z = 0 plane
 */
function hitAt(x: number, y: number, faceIndex: number): PaintHit {
  return { point: new Vector3(x, y, 0), faceIndex };
}

/**
 * Selects faces and returns them as a sorted plain array for easy assertions.
 * @returns Sorted selected face indices
 */
function select(surface: ReturnType<typeof gridSurface>, hit: PaintHit, radius: number) {
  const out = createFaceSelection(surface.faceCount);
  selectFacesInRadius(surface, hit, radius, out);
  return Array.from(out.faces.subarray(0, out.count)).sort((a, b) => a - b);
}

describe('selectFacesInRadius', () => {
  it('selects every face when the radius covers the whole plane', () => {
    const surface = gridSurface();
    expect(select(surface, hitAt(0, 0, 0), 2)).toHaveLength(32);
  });

  it('selects only faces whose centroid is within the radius', () => {
    const surface = gridSurface();
    // faceIndex -1: no forced hit face, so only the radius decides.
    const hit = hitAt(0, 0, -1);
    const selected = select(surface, hit, 0.2);

    expect(selected.length).toBeGreaterThan(0);
    expect(selected.length).toBeLessThan(32);
    for (const face of selected) {
      const c = face * 3;
      const dx = surface.faceCentroids[c]! - hit.point.x;
      const dy = surface.faceCentroids[c + 1]! - hit.point.y;
      expect(Math.hypot(dx, dy)).toBeLessThanOrEqual(0.2);
    }
  });

  it('always includes the hit face, even when the brush is smaller than a triangle', () => {
    const surface = gridSurface();
    expect(select(surface, hitAt(0.49, 0.49, 7), 0.001)).toEqual([7]);
  });

  it('ignores an out-of-range hit face', () => {
    const surface = gridSurface();
    expect(select(surface, hitAt(5, 5, -1), 0.1)).toEqual([]);
  });
});
