/**
 * @file config.ts
 * @description Painting tunables and UI-facing tool metadata. Kept free of three.js imports
 *   so the UI toolbar (in the main bundle) can read it without pulling 3D code in.
 */
import type { PaintToolId } from './types';

/**
 * Initial store values for painting. The brush radius is in real-world CENTIMETRES, so it means
 * the same size on every model; it is converted to model units (via the model's metres per
 * unit) only when painting.
 */
export const PAINT_DEFAULTS: { toolId: PaintToolId; color: string; brushRadiusCm: number } = {
  toolId: 'brush',
  color: '#e4572e',
  brushRadiusCm: 1,
};

/** Brush-size slider range, in centimetres (radius). */
export const BRUSH_RADIUS_CM = { min: 0.2, max: 5, step: 0.1 } as const;

/** Vertex colour of unpainted faces. White means "no tint" over the material or texture. */
export const PAINT_BASE_COLOR = '#ffffff';

/** Quick-pick colours shown next to the colour input. */
export const PAINT_COLOR_PRESETS = [
  '#e4572e',
  '#f3a712',
  '#29bf12',
  '#3b6cf6',
  '#8e44ad',
  '#1b1d21',
] as const;

/** Tools shown in the toolbar. Implementations live in tools/registry.ts, keyed by id. */
export const PAINT_TOOL_OPTIONS: ReadonlyArray<{ id: PaintToolId; label: string }> = [
  { id: 'brush', label: 'Brush' },
  { id: 'eraser', label: 'Eraser' },
];

/**
 * How often (ms) the painted area is pushed to the store while dragging. 10×/s reads as live
 * but re-renders the readout far less than once per pointer event.
 */
export const AREA_SYNC_INTERVAL_MS = 100;

/** Brush cursor ring drawn on the surface under the pointer. */
export const CURSOR = {
  color: '#00d1ff',
  /** Inner radius as a fraction of the outer radius (outer = brush radius). */
  innerRatio: 0.85,
  segments: 48,
  /** Lift off the surface along the normal (model units) to avoid z-fighting. */
  surfaceOffset: 0.002,
} as const;
