/**
 * @file LoadingOverlay.tsx
 * @description Generic centred loading message that covers its positioned parent.
 *   Used as a Suspense fallback while lazy code or 3D models download.
 */
import styles from './LoadingOverlay.module.css';

type LoadingOverlayProps = {
  /** Text shown to the user, e.g. "Loading 3D viewport…". */
  label: string;
};

/**
 * Renders a centred, screen-reader-announced loading message.
 *
 * @param props.label - Message to display
 */
export function LoadingOverlay({ label }: LoadingOverlayProps) {
  return (
    <div className={styles.overlay} role="status" aria-live="polite">
      {label}
    </div>
  );
}
