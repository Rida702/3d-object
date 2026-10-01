/**
 * @file config.ts
 * @description The list of available models plus tunables for procedural ones.
 *   Kept free of three.js imports: the model picker (main bundle) and the store read it.
 *   To add a scanned model: put the optimized .glb in public/models/ and add an entry to
 *   MODELS (unitScale comes from `npm run optimize-model`).
 */
import type { GltfModel, ModelDefinition, ProceduralModel } from './types';

/**
 * The starter cube: 1 model unit on each side, light grey so both lighting and paint read
 * clearly. `segments` subdivides each face into segments × segments squares (2 triangles
 * each): 24 → 6 × 24 × 24 × 2 = 6,912 triangles, fine enough for a round brush.
 * `unitScale` 0.1 m per unit makes it a 10 cm cube: 6 faces × 100 cm² = 600 cm² total.
 */
export const CUBE = {
  size: 1,
  unitScale: 0.1,
  segments: 24,
  color: '#eeeeee',
} as const;

/** The cube as a selectable model. Also the fallback for unknown ids. */
export const CUBE_MODEL: ProceduralModel = {
  id: 'cube',
  label: 'Cube (10 cm)',
  source: 'procedural',
  unitScale: CUBE.unitScale,
};

/**
 * Crochet flower scanned with KIRI Engine (Step 4). Height 4.3 in = 10.92 cm along y.
 * The scan includes the cloth it stood on, so total surface includes the cloth.
 */
const CROCHET_FLOWER_MODEL: GltfModel = {
  id: 'crochet-flower',
  label: 'Crochet flower (scan)',
  source: 'gltf',
  url: `${import.meta.env.BASE_URL}models/crochet-flower.glb`,
  unitScale: 0.164279,
};

/** Every model, in picker order. */
export const MODELS: readonly ModelDefinition[] = [CUBE_MODEL, CROCHET_FLOWER_MODEL];

/** Empty space around a model when the camera frames it (1.2 = 20% margin). */
export const FRAMING_MARGIN = 1.2;
