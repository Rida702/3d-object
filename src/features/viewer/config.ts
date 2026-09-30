/**
 * @file config.ts
 * @description Tunables for the 3D viewer: camera, renderer and orbit-control settings.
 *   Components read these module-level constants so <Canvas> props stay referentially
 *   stable across renders (R3F pitfall: inline object props re-create the camera).
 */
import type { CanvasProps } from '@react-three/fiber';

/** Initial camera: slightly above and to the side so three faces of the cube are visible. */
export const CAMERA = {
  position: [2.5, 2, 3],
  fov: 45,
  near: 0.1,
  far: 100,
} as const satisfies CanvasProps['camera'];

/** Device-pixel-ratio range: sharp on retina, but capped at 2 to protect GPU fill rate. */
export const DPR: [number, number] = [1, 2];

/** Orbit-control behaviour. Distances are in model units (the cube is 1 unit wide). */
export const CONTROLS = {
  enableDamping: true,
  dampingFactor: 0.08,
  minDistance: 1.5,
  maxDistance: 10,
  autoRotate: true,
  autoRotateSpeed: 1.5,
} as const;

/**
 * Render-loop strategy.
 * Auto-rotation needs a frame every tick, so the canvas starts in "always" mode.
 * On the user's first interaction, auto-rotation stops and the loop switches to "demand":
 * frames render only when something calls invalidate() (orbit changes, painting). This keeps
 * the GPU idle when nothing moves (CLAUDE.md 6.1.5).
 */
export const INITIAL_FRAMELOOP: CanvasProps['frameloop'] = CONTROLS.autoRotate
  ? 'always'
  : 'demand';

/** Lighting: soft ambient fill + one directional "sun" so cube faces shade differently. */
export const LIGHTS = {
  ambientIntensity: 0.5,
  directionalIntensity: 1.5,
  directionalPosition: [5, 5, 5],
} as const;
