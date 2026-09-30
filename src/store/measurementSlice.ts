/**
 * @file measurementSlice.ts
 * @description Area summaries for the UI readout. Areas are stored in model units² exactly as
 *   the PaintSurface tracks them; conversion to cm²/m² happens at display time, so there is no
 *   derived state to keep in sync (CLAUDE.md 6.1.4).
 */
import type { StateCreator } from 'zustand';
import type { AppState } from './useAppStore';

/** Values published when a surface mounts. */
export interface SurfaceAreas {
  /** Whole surface area, model units². */
  totalArea: number;
  /** Painted area, model units². */
  paintedArea: number;
  /** Metres per model unit, already including the mesh's world scale. */
  metersPerUnit: number;
}

/** Measurement state and its actions. */
export interface MeasurementSlice extends SurfaceAreas {
  /** Publishes a newly mounted surface's areas and scale. */
  setSurfaceAreas: (areas: SurfaceAreas) => void;
  /** Updates only the painted area (throttled from the paint loop). */
  setPaintedArea: (paintedArea: number) => void;
  /** Clears everything when the surface unmounts. */
  resetAreas: () => void;
}

const EMPTY_AREAS: SurfaceAreas = { totalArea: 0, paintedArea: 0, metersPerUnit: 1 };

/**
 * Creates the measurement slice for the app store.
 *
 * @param set - zustand setter
 * @returns Initial measurement state and actions
 */
export const createMeasurementSlice: StateCreator<AppState, [], [], MeasurementSlice> = (set) => ({
  ...EMPTY_AREAS,
  setSurfaceAreas: (areas) => set(areas),
  setPaintedArea: (paintedArea) => set({ paintedArea }),
  resetAreas: () => set(EMPTY_AREAS),
});
