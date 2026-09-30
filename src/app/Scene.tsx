/**
 * @file Scene.tsx
 * @description Composes the 3D scene: the viewer's canvas with the model stage inside it.
 *   Lives in app/ because features never render each other's components (CLAUDE.md 4.1).
 *   App.tsx lazy-loads this module, so three.js/R3F/drei land in a separate chunk and the
 *   UI shell paints before the 3D code has downloaded (CLAUDE.md 6.1.2).
 */
import { ModelStage } from '@/features/models/components/ModelStage';
import { Viewport } from '@/features/viewer/components/Viewport';

/**
 * Renders the full 3D scene.
 */
export function Scene() {
  return (
    <Viewport>
      <ModelStage />
    </Viewport>
  );
}
