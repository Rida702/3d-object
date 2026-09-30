/**
 * @file surfaceArea.test.ts
 * @description Tests summing face areas: whole surface, masked region and face lists.
 */
import { describe, expect, it } from 'vitest';
import { sumAreas, sumFaceAreas } from './surfaceArea';

// A uniform grid of 8 faces, each 0.125 units² (total 1).
const uniformAreas = new Float32Array(8).fill(0.125);

describe('sumAreas', () => {
  it('sums every face without a mask', () => {
    expect(sumAreas(Float32Array.from([1, 2, 3.5]))).toBe(6.5);
  });

  it('sums only masked faces', () => {
    expect(sumAreas(Float32Array.from([1, 2, 3.5]), Uint8Array.from([1, 0, 1]))).toBe(4.5);
  });

  it('gives half the area for half the faces of a uniform grid', () => {
    const halfMask = Uint8Array.from([1, 0, 1, 0, 1, 0, 1, 0]);
    expect(sumAreas(uniformAreas, halfMask)).toBe(sumAreas(uniformAreas) / 2);
  });

  it('is 0 for an empty surface', () => {
    expect(sumAreas(new Float32Array(0))).toBe(0);
  });
});

describe('sumFaceAreas', () => {
  it('sums only the first `count` listed faces', () => {
    const areas = Float32Array.from([1, 2, 4, 8]);
    expect(sumFaceAreas(areas, Uint32Array.from([3, 1, 0]), 2)).toBe(10);
  });

  it('is 0 when count is 0', () => {
    expect(sumFaceAreas(uniformAreas, Uint32Array.from([0, 1]), 0)).toBe(0);
  });
});
