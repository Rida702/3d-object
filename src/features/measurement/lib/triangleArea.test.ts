/**
 * @file triangleArea.test.ts
 * @description Tests triangle and per-face area math against shapes with known areas.
 */
import { BoxGeometry, PlaneGeometry, Vector3 } from 'three';
import { describe, expect, it } from 'vitest';
import { sumAreas } from './surfaceArea';
import { computeFaceAreas, triangleArea } from './triangleArea';

/**
 * Computes per-face areas of any geometry after converting it to non-indexed.
 * @returns Area per face
 */
function faceAreasOf(geometry: BoxGeometry | PlaneGeometry): Float32Array {
  const positions = geometry.toNonIndexed().getAttribute('position');
  return computeFaceAreas(positions, positions.count / 3);
}

describe('triangleArea', () => {
  it('computes a 3-4-5 right triangle as 6', () => {
    const area = triangleArea(new Vector3(0, 0, 0), new Vector3(3, 0, 0), new Vector3(0, 4, 0));
    expect(area).toBe(6);
  });

  it('is independent of orientation and winding', () => {
    const area = triangleArea(new Vector3(0, 4, 0), new Vector3(0, 0, 0), new Vector3(0, 0, 3));
    expect(area).toBe(6);
  });

  it('is 0 for a degenerate (collinear) triangle', () => {
    const area = triangleArea(new Vector3(0, 0, 0), new Vector3(1, 1, 1), new Vector3(2, 2, 2));
    expect(area).toBe(0);
  });
});

describe('computeFaceAreas', () => {
  it('splits a unit square into two triangles of area 0.5', () => {
    expect(Array.from(faceAreasOf(new PlaneGeometry(1, 1)))).toEqual([0.5, 0.5]);
  });

  it('gives a unit cube a total surface area of 6', () => {
    expect(sumAreas(faceAreasOf(new BoxGeometry(1, 1, 1)))).toBeCloseTo(6, 6);
  });

  it('gives a subdivided unit cube the same total area of 6', () => {
    expect(sumAreas(faceAreasOf(new BoxGeometry(1, 1, 1, 24, 24, 24)))).toBeCloseTo(6, 4);
  });
});
