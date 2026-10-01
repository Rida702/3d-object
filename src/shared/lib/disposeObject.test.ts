/**
 * @file disposeObject.test.ts
 * @description Tests that disposing a material also disposes all of its textures.
 */
import { MeshStandardMaterial, Texture } from 'three';
import { describe, expect, it, vi } from 'vitest';
import { disposeMaterial } from './disposeObject';

describe('disposeMaterial', () => {
  it('disposes every texture the material uses, then the material', () => {
    const map = new Texture();
    const normalMap = new Texture();
    const material = new MeshStandardMaterial({ map, normalMap });
    const onMap = vi.fn();
    const onNormalMap = vi.fn();
    const onMaterial = vi.fn();
    map.addEventListener('dispose', onMap);
    normalMap.addEventListener('dispose', onNormalMap);
    material.addEventListener('dispose', onMaterial);

    disposeMaterial(material);

    expect(onMap).toHaveBeenCalledOnce();
    expect(onNormalMap).toHaveBeenCalledOnce();
    expect(onMaterial).toHaveBeenCalledOnce();
  });

  it('works for a material without textures', () => {
    const material = new MeshStandardMaterial();
    const onMaterial = vi.fn();
    material.addEventListener('dispose', onMaterial);

    disposeMaterial(material);

    expect(onMaterial).toHaveBeenCalledOnce();
  });
});
