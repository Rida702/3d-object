/**
 * @file brushTool.test.ts
 * @description Tests for the brush and eraser tools working together on a surface.
 */
import { Color, PlaneGeometry, Vector3 } from 'three';
import { describe, expect, it } from 'vitest';
import { createPaintSurface } from '../lib/paintSurface';
import type { PaintSettings } from '../types';
import { brushTool } from './brushTool';
import { eraserTool } from './eraserTool';

const WHITE = new Color(1, 1, 1);
const hit = { point: new Vector3(0, 0, 0), faceIndex: 0 };

/**
 * @param color - Paint colour
 * @returns Settings with a brush covering the whole 1×1 plane
 */
function settingsWith(color: Color): PaintSettings {
  return { color, radius: 2 };
}

/** @returns A fresh 2×2-cell plane (8 triangles) */
function planeSurface() {
  return createPaintSurface(new PlaneGeometry(1, 1, 2, 2), WHITE);
}

describe('brushTool', () => {
  it('paints faces, colours them and reports them as changed', () => {
    const surface = planeSurface();

    const changed = brushTool.apply(surface, hit, settingsWith(new Color(1, 0, 0)));

    expect(changed.count).toBe(8);
    expect(Array.from(surface.paintedMask)).toEqual([1, 1, 1, 1, 1, 1, 1, 1]);
    expect(Array.from(surface.colorAttribute.array.slice(0, 3))).toEqual([1, 0, 0]);
  });

  it('recolours already-painted faces but does not report them as changed', () => {
    const surface = planeSurface();
    brushTool.apply(surface, hit, settingsWith(new Color(1, 0, 0)));

    const changed = brushTool.apply(surface, hit, settingsWith(new Color(0, 0, 1)));

    expect(changed.count).toBe(0);
    expect(Array.from(surface.colorAttribute.array.slice(0, 3))).toEqual([0, 0, 1]);
  });
});

describe('eraserTool', () => {
  it('clears paint and restores the base colour', () => {
    const surface = planeSurface();
    brushTool.apply(surface, hit, settingsWith(new Color(1, 0, 0)));

    const changed = eraserTool.apply(surface, hit, settingsWith(new Color(1, 0, 0)));

    expect(changed.count).toBe(8);
    expect(Array.from(surface.paintedMask)).toEqual([0, 0, 0, 0, 0, 0, 0, 0]);
    expect(Array.from(surface.colorAttribute.array.slice(0, 3))).toEqual([1, 1, 1]);
  });

  it('reports nothing when erasing unpainted faces', () => {
    const surface = planeSurface();
    expect(eraserTool.apply(surface, hit, settingsWith(WHITE)).count).toBe(0);
  });
});
