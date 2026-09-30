/**
 * @file ModelStage.tsx
 * @description Decides WHICH model is shown in the scene. Today that is always the procedural
 *   cube; Step 5 switches on the selected model id (cube vs. scanned GLB) from the store.
 */
import { ProceduralCube } from './ProceduralCube';

/**
 * Renders the currently selected model.
 */
export function ModelStage() {
  return <ProceduralCube />;
}
