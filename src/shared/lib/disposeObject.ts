/**
 * @file disposeObject.ts
 * @description Frees GPU memory held by three.js materials. material.dispose() alone does NOT
 *   free its textures (map, normalMap, …); those stay in GPU memory until disposed too.
 *   Disposing only frees GPU copies — the image data stays in memory, so a disposed texture is
 *   simply uploaded again if it's used later (e.g. switching back to a cached model).
 */
import { Texture } from 'three';
import type { Material } from 'three';

/**
 * Disposes a material and every texture it references.
 *
 * @param material - Material to free (no longer rendered anywhere)
 */
export function disposeMaterial(material: Material): void {
  // Textures live under many property names (map, normalMap, roughnessMap, …): find them all.
  for (const value of Object.values(material)) {
    if (value instanceof Texture) value.dispose();
  }
  material.dispose();
}
