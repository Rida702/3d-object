/**
 * @file ColorPicker.tsx
 * @description Paint colour chooser: preset swatches plus a native colour input for any colour.
 *   A new colour applies to the next strokes; already-painted faces keep their colour.
 */
import { PAINT_COLOR_PRESETS } from '@/features/painting/config';
import { useAppStore } from '@/store/useAppStore';
import styles from './Toolbar.module.css';

/**
 * Renders colour swatches and a custom colour input bound to the store.
 */
export function ColorPicker() {
  const color = useAppStore((state) => state.color);
  const setColor = useAppStore((state) => state.setColor);

  return (
    <div className={styles.group} role="group" aria-label="Paint colour">
      {PAINT_COLOR_PRESETS.map((preset) => (
        <button
          key={preset}
          type="button"
          className={styles.swatch}
          style={{ background: preset }}
          aria-label={`Colour ${preset}`}
          aria-pressed={preset === color}
          onClick={() => setColor(preset)}
        />
      ))}
      <input
        type="color"
        className={styles.colorInput}
        aria-label="Custom colour"
        value={color}
        onChange={(event) => setColor(event.target.value)}
      />
    </div>
  );
}
