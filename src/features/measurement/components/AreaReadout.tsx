/**
 * @file AreaReadout.tsx
 * @description Shows painted area, total surface area and coverage in real-world units.
 *   Everything shown is derived during render from three store values (areas in model
 *   units² + metres per unit) — nothing derived is stored.
 */
import { useAppStore } from '@/store/useAppStore';
import { formatArea, formatPercent, toSquareMeters } from '../lib/units';
import styles from './AreaReadout.module.css';

/**
 * Renders the area readout. Re-renders only when an area value changes (throttled while
 * painting), never on pointer moves.
 */
export function AreaReadout() {
  const paintedArea = useAppStore((state) => state.paintedArea);
  const totalArea = useAppStore((state) => state.totalArea);
  const metersPerUnit = useAppStore((state) => state.metersPerUnit);

  return (
    <section className={styles.readout} aria-label="Measurements">
      <dl className={styles.list}>
        <dt>Painted area</dt>
        <dd className={styles.primary}>{formatArea(toSquareMeters(paintedArea, metersPerUnit))}</dd>
        <dt>Total surface</dt>
        <dd>{formatArea(toSquareMeters(totalArea, metersPerUnit))}</dd>
        <dt>Coverage</dt>
        <dd>{formatPercent(paintedArea, totalArea)}</dd>
      </dl>
      <p className={styles.note}>
        Counts whole triangles, so stroke edges are approximate. Finer meshes are more accurate.
      </p>
    </section>
  );
}
