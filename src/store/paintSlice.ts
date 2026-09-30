/**
 * @file paintSlice.ts
 * @description Paint settings chosen in the UI: active tool, colour, brush size and whether
 *   paint mode is on. Holds only small serializable values — the paint data itself (mask,
 *   colour buffer) lives in the PaintSurface ref, never in the store (CLAUDE.md 4.5).
 */
import type { StateCreator } from 'zustand';
import { PAINT_DEFAULTS } from '@/features/painting/config';
import type { PaintToolId } from '@/features/painting/types';
import type { AppState } from './useAppStore';

/** Paint state and its actions. */
export interface PaintSlice {
  activeToolId: PaintToolId;
  /** Paint colour as an sRGB hex string, e.g. "#e4572e". */
  color: string;
  /** Brush radius in model units. */
  brushRadius: number;
  /** Paint mode toggled on from the toolbar. */
  isPaintMode: boolean;
  /** Paint mode held on temporarily (Shift key). */
  isPaintModeHeld: boolean;
  setActiveTool: (id: PaintToolId) => void;
  setColor: (color: string) => void;
  setBrushRadius: (radius: number) => void;
  togglePaintMode: () => void;
  setPaintModeHeld: (isHeld: boolean) => void;
}

/**
 * Creates the paint slice for the app store.
 *
 * @param set - zustand setter
 * @returns Initial paint state and actions
 */
export const createPaintSlice: StateCreator<AppState, [], [], PaintSlice> = (set) => ({
  activeToolId: PAINT_DEFAULTS.toolId,
  color: PAINT_DEFAULTS.color,
  brushRadius: PAINT_DEFAULTS.brushRadius,
  isPaintMode: false,
  isPaintModeHeld: false,
  setActiveTool: (activeToolId) => set({ activeToolId }),
  setColor: (color) => set({ color }),
  setBrushRadius: (brushRadius) => set({ brushRadius }),
  togglePaintMode: () => set((state) => ({ isPaintMode: !state.isPaintMode })),
  setPaintModeHeld: (isPaintModeHeld) => set({ isPaintModeHeld }),
});

/**
 * Whether pointer input should paint (and orbiting be disabled) right now.
 * Derived, not stored: toolbar toggle OR Shift held.
 *
 * @param state - Paint slice state
 * @returns True while painting is active
 */
export function selectIsPainting(state: PaintSlice): boolean {
  return state.isPaintMode || state.isPaintModeHeld;
}
