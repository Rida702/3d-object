/**
 * @file ModelLoading.tsx
 * @description "Loading model…" message shown inside the 3D view while a model file loads.
 *   drei's <Html> places normal page content over the canvas, centred on the scene origin.
 */
import { Html } from '@react-three/drei';
import styles from './ModelMessage.module.css';

/**
 * Renders a centred loading message inside the canvas (use as a Suspense fallback there).
 */
export function ModelLoading() {
  return (
    <Html center>
      <p className={styles.message} role="status">
        Loading model…
      </p>
    </Html>
  );
}
