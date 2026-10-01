/**
 * @file ModelError.tsx
 * @description Message shown inside the 3D view when a model fails to load (missing or broken
 *   file). Used as the ErrorBoundary fallback in ModelStage; the details go to the console.
 */
import { Html } from '@react-three/drei';
import styles from './ModelMessage.module.css';

/**
 * Renders a centred "couldn't load" message inside the canvas.
 */
export function ModelError() {
  return (
    <Html center>
      <p className={`${styles.message} ${styles.error}`} role="alert">
        Couldn’t load this model. Check the browser console for details, or pick another model.
      </p>
    </Html>
  );
}
