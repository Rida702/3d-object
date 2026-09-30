/**
 * @file paintSurface.ts
 * @description Builds a PaintSurface from any geometry and writes paint colours into it.
 *   Painting is per triangle, so the geometry is made NON-indexed: in indexed geometry
 *   neighbouring triangles share vertices, and colouring one would bleed into the others.
 */
import { BufferAttribute, DynamicDrawUsage } from 'three';
import type { BufferGeometry, Color, InterleavedBufferAttribute } from 'three';
import type { FaceSelection, PaintSurface } from '../types';
import { createFaceSelection } from './faceMask';

/** Each face has 3 vertices × 3 components (x,y,z or r,g,b) = 9 floats. */
const FLOATS_PER_FACE = 9;

/**
 * Prepares a geometry for painting: non-indexed copy, per-vertex colour attribute filled with
 * the base colour, face centroids, an empty painted mask and preallocated scratch selections.
 * The source geometry is not modified.
 *
 * @param source - Any triangle geometry (indexed or not)
 * @param baseColor - Colour of unpainted faces (linear colour space)
 * @returns A new PaintSurface; the caller owns (and must dispose) `surface.geometry`
 */
export function createPaintSurface(source: BufferGeometry, baseColor: Color): PaintSurface {
  const geometry = source.index ? source.toNonIndexed() : source.clone();
  const positions = geometry.getAttribute('position');
  const faceCount = Math.floor(positions.count / 3);

  const colorAttribute = createColorAttribute(positions.count, baseColor);
  geometry.setAttribute('color', colorAttribute);

  return {
    geometry,
    colorAttribute,
    faceCount,
    faceCentroids: computeFaceCentroids(positions, faceCount),
    paintedMask: new Uint8Array(faceCount),
    baseColor: baseColor.clone(),
    selected: createFaceSelection(faceCount),
    changed: createFaceSelection(faceCount),
  };
}

/**
 * Writes one colour into all three vertices of each selected face and flags only the touched
 * range of the colour buffer for GPU upload (not the whole buffer).
 *
 * @param surface - Surface to recolour
 * @param faces - Faces to recolour
 * @param color - Colour in linear colour space
 */
export function recolorFaces(surface: PaintSurface, faces: FaceSelection, color: Color): void {
  const colors = surface.colorAttribute.array;
  let minFace = Infinity;
  let maxFace = -1;

  for (let i = 0; i < faces.count; i++) {
    const face = faces.faces[i]!;
    const start = face * FLOATS_PER_FACE;
    for (let offset = 0; offset < FLOATS_PER_FACE; offset += 3) {
      colors[start + offset] = color.r;
      colors[start + offset + 1] = color.g;
      colors[start + offset + 2] = color.b;
    }
    if (face < minFace) minFace = face;
    if (face > maxFace) maxFace = face;
  }

  if (maxFace < 0) return;
  const attribute = surface.colorAttribute;
  attribute.addUpdateRange(minFace * FLOATS_PER_FACE, (maxFace - minFace + 1) * FLOATS_PER_FACE);
  attribute.needsUpdate = true;
}

/**
 * Creates a per-vertex RGB attribute filled with one colour, flagged as frequently updated.
 *
 * @param vertexCount - Number of vertices
 * @param color - Fill colour (linear colour space)
 * @returns The colour attribute
 */
function createColorAttribute(vertexCount: number, color: Color): BufferAttribute {
  const colors = new Float32Array(vertexCount * 3);
  for (let i = 0; i < colors.length; i += 3) {
    colors[i] = color.r;
    colors[i + 1] = color.g;
    colors[i + 2] = color.b;
  }
  return new BufferAttribute(colors, 3).setUsage(DynamicDrawUsage);
}

/**
 * Computes the centroid (average of the 3 corners) of every triangle.
 * Uses attribute accessors so interleaved buffers (common in glTF) also work.
 *
 * @param positions - Non-indexed position attribute
 * @param faceCount - Number of triangles
 * @returns xyz per face
 */
function computeFaceCentroids(
  positions: BufferAttribute | InterleavedBufferAttribute,
  faceCount: number,
): Float32Array {
  const centroids = new Float32Array(faceCount * 3);
  for (let face = 0; face < faceCount; face++) {
    const v = face * 3;
    const c = face * 3;
    centroids[c] = (positions.getX(v) + positions.getX(v + 1) + positions.getX(v + 2)) / 3;
    centroids[c + 1] = (positions.getY(v) + positions.getY(v + 1) + positions.getY(v + 2)) / 3;
    centroids[c + 2] = (positions.getZ(v) + positions.getZ(v + 1) + positions.getZ(v + 2)) / 3;
  }
  return centroids;
}
