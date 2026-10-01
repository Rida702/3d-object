/**
 * @file prepareGeometry.ts
 * @description Turns a loaded glTF scene into ONE geometry + ONE material that the painting
 *   code can use. A glTF file may hold several meshes, each with its own position/rotation/
 *   scale; those transforms are baked into the vertex positions so the result needs no
 *   transform, and areas are measured in the file's own units.
 *   Never mutates the input: useGLTF caches the scene and shares it between mounts.
 */
import { Mesh } from 'three';
import type { BufferGeometry, Material, Object3D } from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

/** A scan ready for painting. The caller owns (and must dispose) both objects. */
export interface PreparedModel {
  /** All meshes merged, with node transforms baked in. */
  geometry: BufferGeometry;
  /** Clone of the first mesh's material with vertex colours (the paint layer) enabled. */
  material: Material;
  /** How many meshes were merged (more than 1 → only the first material is used). */
  meshCount: number;
}

/**
 * Collects every mesh under `root`, bakes its world transform (relative to `root`) into a
 * copy of its geometry, and merges the copies.
 *
 * @param root - The loaded glTF scene
 * @returns Merged geometry and a paint-ready material clone
 * @throws If the scene contains no meshes, or meshes whose attributes can't be merged
 */
export function prepareModel(root: Object3D): PreparedModel {
  const meshes = collectMeshes(root);
  const first = meshes[0];
  if (!first) throw new Error('This model file contains no meshes.');

  // Transform relative to the root = inverse(root world) × mesh world. This ignores wherever
  // the root itself happens to be placed, so the result only depends on the file's contents.
  root.updateWorldMatrix(true, true);
  const rootInverse = root.matrixWorld.clone().invert();
  const geometries = meshes.map((mesh) => {
    const relative = mesh.matrixWorld.clone().premultiply(rootInverse);
    return mesh.geometry.clone().applyMatrix4(relative);
  });

  return {
    geometry: mergeAll(geometries),
    material: paintableMaterial(first.material),
    meshCount: meshes.length,
  };
}

/**
 * @param root - Object tree to search
 * @returns Every Mesh in the tree, in traversal order
 */
function collectMeshes(root: Object3D): Mesh[] {
  const meshes: Mesh[] = [];
  root.traverse((object) => {
    if (object instanceof Mesh) meshes.push(object);
  });
  return meshes;
}

/**
 * Merges geometries into one. A single geometry is returned unchanged. Several are made
 * non-indexed first, because mergeGeometries needs them all indexed or all not.
 *
 * @param geometries - Geometries with transforms already applied (owned by this function)
 * @returns One geometry
 */
function mergeAll(geometries: BufferGeometry[]): BufferGeometry {
  if (geometries.length === 1 && geometries[0]) return geometries[0];
  const merged = mergeGeometries(geometries.map((geometry) => geometry.toNonIndexed()));
  geometries.forEach((geometry) => geometry.dispose());
  if (!merged)
    throw new Error('The meshes in this model have different attributes and cannot be merged.');
  return merged;
}

/**
 * Clones a mesh material and turns on vertex colours, so per-vertex paint colours multiply
 * with the photo texture (white = unchanged texture).
 *
 * @param material - A mesh's material (multi-material meshes use their first material)
 * @returns A new material the caller owns
 */
function paintableMaterial(material: Material | Material[]): Material {
  const source = Array.isArray(material) ? material[0] : material;
  if (!source) throw new Error('The first mesh in this model has no material.');
  const clone = source.clone();
  clone.vertexColors = true;
  return clone;
}
