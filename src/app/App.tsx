/**
 * @file App.tsx
 * @description Top-level app shell: a full-screen viewport area plus a side panel.
 *   Composition only — no business logic. The 3D viewport (Step 1) and tool/info panels
 *   (Steps 2–3) plug into the two slots below. UI panels stay DOM siblings of the viewport,
 *   never children of the <Canvas>, so UI state changes don't re-render the 3D scene.
 */
import styles from './App.module.css';

/**
 * Renders the application layout.
 *
 * @returns The root layout with a viewport slot and a side panel slot
 */
export function App() {
  return (
    <div className={styles.layout}>
      <main className={styles.viewport} aria-label="3D viewport">
        <p className={styles.placeholder}>3D viewport — arrives in Step 1</p>
      </main>

      <aside className={styles.panel} aria-label="Tools and measurements">
        <h1 className={styles.title}>3D Object Painter</h1>
        <p className={styles.hint}>Paint tools arrive in Step 2, area readout in Step 3.</p>
      </aside>
    </div>
  );
}
