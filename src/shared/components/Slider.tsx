/**
 * @file Slider.tsx
 * @description Generic labelled range slider that shows its current value.
 */
import { useId } from 'react';
import styles from './Slider.module.css';

type SliderProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  /** Formats the displayed value, e.g. (v) => `${v} cm`. Defaults to the raw number. */
  formatValue?: (value: number) => string;
};

/**
 * Renders a label, the formatted value and a range input.
 *
 * @param props.label - Visible label (also the input's accessible name)
 * @param props.value - Current value
 * @param props.min - Minimum value
 * @param props.max - Maximum value
 * @param props.step - Step size
 * @param props.onChange - Called with the new numeric value
 * @param props.formatValue - Optional display formatter
 */
export function Slider({ label, value, min, max, step, onChange, formatValue }: SliderProps) {
  const id = useId();

  return (
    <div className={styles.slider}>
      <div className={styles.header}>
        <label htmlFor={id}>{label}</label>
        <output htmlFor={id}>{formatValue ? formatValue(value) : value}</output>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(event.target.valueAsNumber)}
      />
    </div>
  );
}
