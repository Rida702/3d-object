/**
 * @file brushTool.ts
 * @description The round paint brush: marks faces under the brush as painted and colours them.
 */
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
   * paint with a different colour updates it; only newly painted faces count as "changed".
   */
  apply(surface, hit, settings) {
    selectFacesInRadius(surface, hit, settings.radius, surface.selected);
    setFaces(surface.paintedMask, surface.selected, 1, surface.changed);
    recolorFaces(surface, surface.selected, settings.color);
    return surface.changed;
  },
};
