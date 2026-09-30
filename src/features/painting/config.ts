/**
 * @file config.ts
 * @description Painting tunables and UI-facing tool metadata. Kept free of three.js imports
 *   so the UI toolbar (in the main bundle) can read it without pulling 3D code in.
 */
import type { PaintToolId } from './types';

/** Initial store values for painting. Brush radius is in model units (the cube is 1 wide). */
export const PAINT_DEFAULTS: { toolId: PaintToolId; color: string; brushRadius: number } = {
  toolId: 'brush',
  color: '#e4572e',
  brushRadius: 0.1,
};

/** Brush-size slider range, in model units. */
export const BRUSH_RADIUS = { min: 0.02, max: 0.4, step: 0.01 } as const;

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

/** Brush cursor ring drawn on the surface under the pointer. */
export const CURSOR = {
  color: '#00d1ff',
  /** Inner radius as a fraction of the outer radius (outer = brush radius). */
  innerRatio: 0.85,
  segments: 48,
  /** Lift off the surface along the normal (model units) to avoid z-fighting. */
  surfaceOffset: 0.002,
} as const;
