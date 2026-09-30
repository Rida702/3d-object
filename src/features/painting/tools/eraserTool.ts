/**
 * @file eraserTool.ts
 * @description The eraser: un-paints faces under the brush, restores their base colour and
 *   subtracts their area from the surface's running painted-area total.
 */
import { sumFaceAreas } from '@/features/measurement/lib/surfaceArea';
import { selectFacesInRadius } from '../lib/brushSelect';
import { setFaces } from '../lib/faceMask';
import { recolorFaces } from '../lib/paintSurface';
import type { PaintTool } from '../types';

/** Clears paint from every face within the brush radius. */
export const eraserTool: PaintTool = {
  id: 'eraser',

  /**
   * Selects faces under the brush, marks them unpainted and restores the base colour.
   * Only faces that were painted are recoloured and subtracted — erasing bare surface does
   * nothing.
   */
  apply(surface, hit, settings) {
    selectFacesInRadius(surface, hit, settings.radius, surface.selected);
    setFaces(surface.paintedMask, surface.selected, 0, surface.changed);
    recolorFaces(surface, surface.changed, surface.baseColor);
    const { faces, count } = surface.changed;
    const erasedArea = sumFaceAreas(surface.faceAreas, faces, count);
    // Clamp: float rounding must never show a tiny negative area after erasing everything.
    surface.paintedArea = Math.max(0, surface.paintedArea - erasedArea);
    return surface.changed;
  },
};
