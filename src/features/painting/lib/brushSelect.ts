/**
 * @file brushSelect.ts
 * @description Finds the faces under a round brush: every face whose centroid lies within the
 *   brush radius. Uses the surface's BVH so only nearby boxes of triangles are visited —
 *   a few hundred checks instead of 213k on a scan. A brute-force version is kept as the
 *   reference implementation the tests compare against.
 */
import { Sphere } from 'three';
import type { FaceSelection, PaintHit, PaintSurface } from '../types';

// Reused for every query (no allocation per paint step).
const brushSphere = new Sphere();

/**
 * Selects every face whose centroid lies within `radius` of the hit point, using the BVH.
 * The hit face itself is always included, so a brush smaller than the triangles still
 * paints the triangle under the cursor.
 *
 * @param surface - Surface to search
 * @param hit - Brush centre (local space) and the face under the pointer
 * @param radius - Brush radius in model units
 * @param out - Output: overwritten with the selected faces
 */
export function selectFacesInRadius(
  surface: PaintSurface,
  hit: PaintHit,
  radius: number,
  out: FaceSelection,
): void {
  const centroids = surface.faceCentroids;
  const brush = brushOf(hit, radius);
  let hasHitFace = false;
  out.count = 0;
  brushSphere.center.copy(hit.point);
  brushSphere.radius = radius;

  surface.bvh.shapecast({
    // Skip whole boxes of triangles that the brush sphere doesn't touch.
    intersectsBounds: (box) => box.intersectsSphere(brushSphere),
    // Indirect BVH: `face` is our original face number. Returning false = keep searching.
    intersectsTriangle: (_triangle, face) => {
      if (!isWithin(centroids, face, brush)) return false;
      out.faces[out.count++] = face;
      if (face === hit.faceIndex) hasHitFace = true;
      return false;
    },
  });

  addHitFace(surface, hit, hasHitFace, out);
}

/**
 * Reference implementation: same result as selectFacesInRadius, checking every face.
 * O(faces) — used by tests to verify the BVH version.
 *
 * @param surface - Surface to search
 * @param hit - Brush centre (local space) and the face under the pointer
 * @param radius - Brush radius in model units
 * @param out - Output: overwritten with the selected faces
 */
export function selectFacesInRadiusBruteForce(
  surface: PaintSurface,
  hit: PaintHit,
  radius: number,
  out: FaceSelection,
): void {
  const brush = brushOf(hit, radius);
  let hasHitFace = false;
  out.count = 0;

  for (let face = 0; face < surface.faceCount; face++) {
    if (!isWithin(surface.faceCentroids, face, brush)) continue;
    out.faces[out.count++] = face;
    if (face === hit.faceIndex) hasHitFace = true;
  }

  addHitFace(surface, hit, hasHitFace, out);
}

/** Brush centre and SQUARED radius, built once per query (not per face). */
type Brush = { x: number; y: number; z: number; radiusSq: number };

/**
 * @param hit - Brush centre
 * @param radius - Brush radius
 * @returns The brush for one query
 */
function brushOf(hit: PaintHit, radius: number): Brush {
  return { x: hit.point.x, y: hit.point.y, z: hit.point.z, radiusSq: radius * radius };
}

/**
 * Whether a face's centroid is within the brush. Compares squared distances: same result as
 * comparing distances, without a square root per face.
 *
 * @param centroids - xyz per face
 * @param face - Face index
 * @param brush - Brush centre and squared radius
 * @returns True if inside (or on) the brush
 */
function isWithin(centroids: Float32Array, face: number, brush: Brush): boolean {
  const c = face * 3;
  const dx = centroids[c]! - brush.x;
  const dy = centroids[c + 1]! - brush.y;
  const dz = centroids[c + 2]! - brush.z;
  return dx * dx + dy * dy + dz * dz <= brush.radiusSq;
}

/**
 * Appends the hit face if the radius search didn't already include it.
 *
 * @param surface - Surface (for the face count)
 * @param hit - The hit
 * @param hasHitFace - Whether the search already selected it
 * @param out - Selection to append to
 */
function addHitFace(
  surface: PaintSurface,
  hit: PaintHit,
  hasHitFace: boolean,
  out: FaceSelection,
): void {
  const isValidHitFace = hit.faceIndex >= 0 && hit.faceIndex < surface.faceCount;
  if (!hasHitFace && isValidHitFace) out.faces[out.count++] = hit.faceIndex;
}
