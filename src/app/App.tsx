/**
 * @file App.tsx
 * @description Top-level app shell: a full-screen 3D viewport plus a side panel.
 *   Composition only — no business logic. The 3D scene is lazy-loaded so the shell paints
 *   immediately while three.js downloads. UI panels stay DOM siblings of the viewport,
 *   never children of the <Canvas>, so UI state changes don't re-render the 3D scene.
 */
import { lazy, Suspense } from 'react';
import { AreaReadout } from '@/features/measurement/components/AreaReadout';
import { Toolbar } from '@/features/ui/components/Toolbar';
import { LoadingOverlay } from '@/shared/components/LoadingOverlay';
import styles from './App.module.css';

// Named export mapped to `default` because React.lazy expects a default export.
const Scene = lazy(() => import('./Scene').then((module) => ({ default: module.Scene })));

/**
 * Renders the application layout.
 *
 * @returns The root layout with the 3D viewport and the side panel
 */
export function App() {
  return (
    <div className={styles.layout}>
      <main className={styles.viewport} aria-label="3D viewport">
        <Suspense fallback={<LoadingOverlay label="Loading 3D viewport…" />}>
          <Scene />
        </Suspense>
      </main>

      <aside className={styles.panel} aria-label="Tools and measurements">
        <h1 className={styles.title}>3D Object Painter</h1>
        <p className={styles.hint}>
          Turn on Paint mode (or hold Shift), then click or drag on the cube. With paint mode off:
          drag to rotate, scroll to zoom, right-drag to pan.
        </p>
        <Toolbar />
        <AreaReadout />
      </aside>
    </div>
  );
}
