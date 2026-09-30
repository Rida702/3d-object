/**
 * @file triangleArea.ts
 * @description Pure math for the area of triangles in a geometry.
 *   Area of triangle ABC = |AB × AC| / 2: the cross product's length is the area of the
 *   parallelogram spanned by the two edges, and the triangle is exactly half of it.
 *   No React, no scene side effects — unit-tested in triangleArea.test.ts.
 */
import { Vector3 } from 'three';
import type { BufferAttribute, InterleavedBufferAttribute } from 'three';

// Scratch vectors reused across calls (no allocation per triangle).
const a = new Vector3();
const b = new Vector3();
const c = new Vector3();
const edgeAB = new Vector3();
const edgeAC = new Vector3();

/**
 * Computes the area of one triangle given its three corners.
 *
 * @param p0 - First corner
 * @param p1 - Second corner
 * @param p2 - Third corner (all three in the same space)
 * @returns Area in the input units squared
 */
export function triangleArea(p0: Vector3, p1: Vector3, p2: Vector3): number {
  edgeAB.subVectors(p1, p0);
  edgeAC.subVectors(p2, p0);
  return edgeAB.cross(edgeAC).length() / 2;
}

/**
 * Computes the area of every triangle of a NON-indexed position attribute
 * (face f uses vertices 3f, 3f+1, 3f+2).
 *
 * @param positions - Non-indexed position attribute (plain or interleaved)
 * @param faceCount - Number of triangles
 * @returns Area per face, in model units squared
 */
export function computeFaceAreas(
  positions: BufferAttribute | InterleavedBufferAttribute,
  faceCount: number,
): Float32Array {
  const areas = new Float32Array(faceCount);
  for (let face = 0; face < faceCount; face++) {
    const v = face * 3;
    a.fromBufferAttribute(positions, v);
    b.fromBufferAttribute(positions, v + 1);
    c.fromBufferAttribute(positions, v + 2);
    areas[face] = triangleArea(a, b, c);
  }
  return areas;
}
