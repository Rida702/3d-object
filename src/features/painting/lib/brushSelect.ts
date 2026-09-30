/**
 * @file brushSelect.ts
 * @description Finds the faces under a round brush. Brute force over all face centroids,
 *   which is fast enough for the subdivided cube (a few thousand faces). Step 5 adds a
 *   BVH-accelerated version for 100k-triangle scans.
 */
import type { FaceSelection, PaintHit, PaintSurface } from '../types';

/**
 * Selects every face whose centroid lies within `radius` of the hit point.
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
  const { x, y, z } = hit.point;
  // Compare squared distances: same result as comparing distances, without a sqrt per face.
  const radiusSq = radius * radius;
  let hasHitFace = false;
  out.count = 0;

  for (let face = 0; face < surface.faceCount; face++) {
    const c = face * 3;
    const dx = centroids[c]! - x;
    const dy = centroids[c + 1]! - y;
    const dz = centroids[c + 2]! - z;
    if (dx * dx + dy * dy + dz * dz > radiusSq) continue;
    out.faces[out.count++] = face;
    if (face === hit.faceIndex) hasHitFace = true;
  }

  const isValidHitFace = hit.faceIndex >= 0 && hit.faceIndex < surface.faceCount;
  if (!hasHitFace && isValidHitFace) out.faces[out.count++] = hit.faceIndex;
}
