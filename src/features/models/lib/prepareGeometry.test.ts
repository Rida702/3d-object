/**
 * @file prepareGeometry.test.ts
 * @description Tests turning a glTF-like scene into one paint-ready geometry + material.
 */
import {
  BoxGeometry,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PlaneGeometry,
} from 'three';
import { describe, expect, it } from 'vitest';
import { prepareModel } from './prepareGeometry';

/**
 * @param geometry - The mesh's geometry
 * @returns A mesh with a fresh standard material
 */
function meshOf(geometry: BoxGeometry | PlaneGeometry): Mesh {
  return new Mesh(geometry, new MeshStandardMaterial({ color: '#ff0000' }));
}

describe('prepareModel', () => {
  it('bakes a single mesh transform into the geometry', () => {
    const root = new Group();
    const mesh = meshOf(new BoxGeometry(1, 1, 1));
    mesh.position.set(10, 0, 0);
    mesh.scale.setScalar(2);
    root.add(mesh);

    const { geometry, meshCount } = prepareModel(root);
    geometry.computeBoundingBox();

    expect(meshCount).toBe(1);
    expect(geometry.boundingBox?.min.toArray()).toEqual([9, -1, -1]);
    expect(geometry.boundingBox?.max.toArray()).toEqual([11, 1, 1]);
  });

  it('ignores where the root itself is placed', () => {
    const root = new Group();
    root.position.set(100, 100, 100);
    root.add(meshOf(new BoxGeometry(1, 1, 1)));

    const { geometry } = prepareModel(root);
    geometry.computeBoundingBox();

    expect(geometry.boundingBox?.min.toArray()).toEqual([-0.5, -0.5, -0.5]);
  });

  it('merges several meshes into one geometry', () => {
    const root = new Group();
    root.add(meshOf(new PlaneGeometry(1, 1))); // 2 triangles
    const child = new Group();
    child.add(meshOf(new BoxGeometry(1, 1, 1))); // 12 triangles
    root.add(child);

    const { geometry, meshCount } = prepareModel(root);

    expect(meshCount).toBe(2);
    expect(geometry.getAttribute('position').count).toBe((2 + 12) * 3);
  });

  it('does not modify the source scene', () => {
    const root = new Group();
    const mesh = meshOf(new BoxGeometry(1, 1, 1));
    mesh.position.set(5, 0, 0);
    root.add(mesh);
    const before = Array.from(mesh.geometry.getAttribute('position').array);

    const prepared = prepareModel(root);

    expect(prepared.geometry).not.toBe(mesh.geometry);
    expect(Array.from(mesh.geometry.getAttribute('position').array)).toEqual(before);
    expect(prepared.material).not.toBe(mesh.material);
  });

  it('enables vertex colours on a clone of the first material', () => {
    const root = new Group();
    root.add(new Mesh(new BoxGeometry(), [new MeshBasicMaterial(), new MeshBasicMaterial()]));

    const { material } = prepareModel(root);

    expect(material).toBeInstanceOf(MeshBasicMaterial);
    expect(material.vertexColors).toBe(true);
  });

  it('throws a clear error for a file with no meshes', () => {
    expect(() => prepareModel(new Group())).toThrow('contains no meshes');
  });
});
