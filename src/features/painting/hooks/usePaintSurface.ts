/**
 * @file usePaintSurface.ts
 * @description Builds a PaintSurface once per source geometry and disposes its GPU buffers
 *   when the geometry changes or the component unmounts. The surface is large and mutated
 *   60×/s while dragging, so it lives in memoised component scope, never in state or the store.
 */
import { useEffect, useMemo } from 'react';
import { Color, type BufferGeometry } from 'three';
import { PAINT_BASE_COLOR } from '../config';
import { createPaintSurface } from '../lib/paintSurface';
import type { PaintSurface } from '../types';

/** Base colour converted once (sRGB hex → linear) and shared by all surfaces. */
const BASE_COLOR = new Color(PAINT_BASE_COLOR);

/**
 * Returns a paintable version of `geometry`, recreated only when `geometry` changes.
 *
 * @param geometry - Source geometry (not modified)
 * @returns The paint surface for this geometry
 */
export function usePaintSurface(geometry: BufferGeometry): PaintSurface {
  const surface = useMemo(() => createPaintSurface(geometry, BASE_COLOR), [geometry]);

  // The surface owns a geometry copy created outside JSX, so R3F won't dispose it for us.
  useEffect(() => () => surface.geometry.dispose(), [surface]);

  return surface;
}
