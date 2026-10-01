/**
 * @file types.ts
 * @description Describes the models the app can show. A model is either built in code
 *   (procedural, like the cube) or loaded from a .glb file (a photogrammetry scan).
 *   Types only — no runtime code.
 */

/** Fields every model has. */
interface ModelBase {
  /** Stable id, kebab-case. Stored in the app store as the selected model. */
  id: string;
  /** Name shown in the model picker. */
  label: string;
  /** Metres per model unit — turns model-space area into real-world area. */
  unitScale: number;
}

/** A model built in code. */
export interface ProceduralModel extends ModelBase {
  source: 'procedural';
}

/** A model loaded from a glTF binary file in public/models/. */
export interface GltfModel extends ModelBase {
  source: 'gltf';
  /** URL of the .glb file. */
  url: string;
}

/** Any model. Switch on `source` to tell them apart. */
export type ModelDefinition = ProceduralModel | GltfModel;
