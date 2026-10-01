/**
 * @file paintSurface.test.ts
 * @description Tests for building paint surfaces (incl. the BVH) and recolouring faces.
 */
import {
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  Color,
  Mesh,
  Raycaster,
  SphereGeometry,
  Vector3,
} from 'three';
import { acceleratedRaycast } from 'three-mesh-bvh';
import { describe, expect, it } from 'vitest';
import { createFaceSelection } from './faceMask';
import { createPaintSurface, recolorFaces } from './paintSurface';

const WHITE = new Color(1, 1, 1);
const RED = new Color(1, 0, 0);

/**
 * Builds a non-indexed geometry from raw triangle corner coordinates.
 * @param positions - x,y,z for each vertex, 9 numbers per triangle
 * @returns The geometry
 */
function trianglesGeometry(positions: number[]): BufferGeometry {
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new BufferAttribute(new Float32Array(positions), 3));
  return geometry;
}

describe('createPaintSurface', () => {
  it('converts indexed geometry to non-indexed, one face per triangle', () => {
    const box = new BoxGeometry(1, 1, 1);
    expect(box.index).not.toBeNull();

    const surface = createPaintSurface(box, WHITE);

    expect(surface.geometry.index).toBeNull();
    expect(surface.faceCount).toBe(12); // 6 sides × 2 triangles
    expect(surface.paintedMask).toHaveLength(12);
    expect(box.getAttribute('color')).toBeUndefined(); // source untouched
  });

  it('fills the colour attribute with the base colour', () => {
    const surface = createPaintSurface(new BoxGeometry(1, 1, 1), new Color(0.5, 0.25, 1));

    expect(surface.colorAttribute.count).toBe(36);
    expect(Array.from(surface.colorAttribute.array.slice(0, 6))).toEqual([
      0.5, 0.25, 1, 0.5, 0.25, 1,
    ]);
  });

  it('precomputes face areas and the total, with nothing painted yet', () => {
    const surface = createPaintSurface(new BoxGeometry(1, 1, 1), WHITE);

    expect(surface.faceAreas).toHaveLength(12);
    expect(surface.faceAreas[0]).toBeCloseTo(0.5, 6);
    expect(surface.totalArea).toBeCloseTo(6, 6);
    expect(surface.paintedArea).toBe(0);
  });

  it('computes the centroid of each triangle', () => {
    const geometry = trianglesGeometry([0, 0, 0, 3, 0, 0, 0, 3, 0, 0, 0, 3, 0, 0, 6, 3, 0, 6]);

    const surface = createPaintSurface(geometry, WHITE);

    expect(Array.from(surface.faceCentroids)).toEqual([1, 1, 0, 1, 0, 5]);
  });
});

describe('recolorFaces', () => {
  it('colours all three vertices of the chosen faces and nothing else', () => {
    const surface = createPaintSurface(new BoxGeometry(1, 1, 1), WHITE);
    const faces = createFaceSelection(1);
    faces.faces[0] = 1;
    faces.count = 1;

    recolorFaces(surface, faces, RED);

    const colors = Array.from(surface.colorAttribute.array);
    expect(colors.slice(0, 9)).toEqual([1, 1, 1, 1, 1, 1, 1, 1, 1]); // face 0 untouched
    expect(colors.slice(9, 18)).toEqual([1, 0, 0, 1, 0, 0, 1, 0, 0]); // face 1 red
    expect(colors.slice(18, 27)).toEqual([1, 1, 1, 1, 1, 1, 1, 1, 1]); // face 2 untouched
  });

  it('flags only the changed range for GPU upload', () => {
    const surface = createPaintSurface(new BoxGeometry(1, 1, 1), WHITE);
    const faces = createFaceSelection(2);
    faces.faces.set([4, 2]);
    faces.count = 2;

    recolorFaces(surface, faces, RED);

    expect(surface.colorAttribute.updateRanges).toEqual([{ start: 18, count: 27 }]);
    expect(surface.colorAttribute.version).toBeGreaterThan(0);
  });

  it('does nothing for an empty selection', () => {
    const surface = createPaintSurface(new BoxGeometry(1, 1, 1), WHITE);

    recolorFaces(surface, createFaceSelection(0), RED);

    expect(surface.colorAttribute.updateRanges).toEqual([]);
    expect(surface.colorAttribute.version).toBe(0);
  });
});

describe('BVH', () => {
  it('builds a BVH without adding or reordering an index (face f = vertices 3f..3f+2)', () => {
    const surface = createPaintSurface(new SphereGeometry(1, 16, 16), WHITE);

    expect(surface.geometry.boundsTree).toBe(surface.bvh);
    expect(surface.geometry.index).toBeNull();
  });

  it('accelerated raycasts report the same face numbers as plain three.js raycasts', () => {
    const surface = createPaintSurface(new SphereGeometry(1, 32, 32), WHITE);
    const plainMesh = new Mesh(surface.geometry);
    const fastMesh = new Mesh(surface.geometry);
    fastMesh.raycast = acceleratedRaycast;
    const raycaster = new Raycaster();

    for (let i = 0; i < 20; i++) {
      // Rays from points around the sphere, aimed at the centre.
      const origin = new Vector3(Math.cos(i), Math.sin(i * 1.3), Math.sin(i)).setLength(5);
      raycaster.set(origin, origin.clone().negate().normalize());

      const plainHit = raycaster.intersectObject(plainMesh)[0];
      const fastHit = raycaster.intersectObject(fastMesh)[0];

      expect(fastHit?.faceIndex).toBe(plainHit?.faceIndex);
    }
  });
});
