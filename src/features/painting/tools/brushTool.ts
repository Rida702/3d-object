/**
 * @file brushTool.ts
 * @description The round paint brush: marks faces under the brush as painted, colours them,
 *   and adds the newly painted faces' area to the surface's running painted-area total.
 */
import { sumFaceAreas } from '@/features/measurement/lib/surfaceArea';
import { selectFacesInRadius } from '../lib/brushSelect';
import { setFaces } from '../lib/faceMask';
import { recolorFaces } from '../lib/paintSurface';
import type { PaintTool } from '../types';

/** Paints every face within the brush radius with the current colour. */
export const brushTool: PaintTool = {
  id: 'brush',

  /**
   * Selects faces under the brush, marks them painted and colours them.
   * All selected faces are recoloured (not only newly painted ones) so painting over existing
   * paint with a different colour updates it; only newly painted faces count as "changed"
   * and only they add area — so re-painting a spot never double-counts it.
   */
  apply(surface, hit, settings) {
    selectFacesInRadius(surface, hit, settings.radius, surface.selected);
    setFaces(surface.paintedMask, surface.selected, 1, surface.changed);
    recolorFaces(surface, surface.selected, settings.color);
    const { faces, count } = surface.changed;
    surface.paintedArea += sumFaceAreas(surface.faceAreas, faces, count);
    return surface.changed;
  },
};
