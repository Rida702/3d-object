/**
 * @file useAreaSync.ts
 * @description Publishes a PaintSurface's areas to the store for the readout. On mount it
 *   sends the total area, painted area and real-world scale; while painting it pushes the
 *   running painted area, throttled, so the UI re-renders ~10×/s instead of per pointer event.
 */
import { useEffect, useMemo, type RefObject } from 'react';
import { Vector3, type Mesh } from 'three';
import { throttle } from '@/shared/lib/throttle';
import { useAppStore } from '@/store/useAppStore';
import { AREA_SYNC_INTERVAL_MS } from '../config';
import type { PaintSurface } from '../types';

const worldScale = new Vector3();

type AreaSyncOptions = {
  surface: PaintSurface;
  meshRef: RefObject<Mesh | null>;
  /** Metres per model unit, as declared by the model. */
  unitScale: number;
};

/**
 * Keeps the store's measurement slice in sync with `surface`.
 *
 * @param options.surface - Surface whose areas to publish
 * @param options.meshRef - Rendered mesh; its world scale is folded into the unit scale
 * @param options.unitScale - Metres per model unit
 * @returns A function to call after each paint step (cheap; throttled internally)
 */
export function useAreaSync({ surface, meshRef, unitScale }: AreaSyncOptions): () => void {
  const setSurfaceAreas = useAppStore((state) => state.setSurfaceAreas);
  const resetAreas = useAppStore((state) => state.resetAreas);

  // Reads surface.paintedArea when it RUNS, so the trailing call publishes the final value.
  const syncPaintedArea = useMemo(
    () =>
      throttle(
        () => useAppStore.getState().setPaintedArea(surface.paintedArea),
        AREA_SYNC_INTERVAL_MS,
      ),
    [surface],
  );

  useEffect(() => () => syncPaintedArea.cancel(), [syncPaintedArea]);

  useEffect(() => {
    // Areas are in local space; a scaled mesh scales area by scale². Assumes uniform scale.
    const meshScale = meshRef.current ? meshRef.current.getWorldScale(worldScale).x : 1;
    setSurfaceAreas({
      totalArea: surface.totalArea,
      paintedArea: surface.paintedArea,
      metersPerUnit: unitScale * meshScale,
    });
    return resetAreas;
  }, [surface, meshRef, unitScale, setSurfaceAreas, resetAreas]);

  return syncPaintedArea.call;
}
