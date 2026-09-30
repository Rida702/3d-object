/**
 * @file eraserTool.ts
 * @description The eraser: un-paints faces under the brush and restores their base colour.
 */
import { selectFacesInRadius } from '../lib/brushSelect';
import { setFaces } from '../lib/faceMask';
import { recolorFaces } from '../lib/paintSurface';
import type { PaintTool } from '../types';

/** Clears paint from every face within the brush radius. */
export const eraserTool: PaintTool = {
  id: 'eraser',

  /**
   * Selects faces under the brush, marks them unpainted and restores the base colour.
   * Only faces that were painted are recoloured — erasing bare surface does nothing.
   */
  apply(surface, hit, settings) {
    selectFacesInRadius(surface, hit, settings.radius, surface.selected);
    setFaces(surface.paintedMask, surface.selected, 0, surface.changed);
    recolorFaces(surface, surface.changed, surface.baseColor);
    return surface.changed;
  },
};
