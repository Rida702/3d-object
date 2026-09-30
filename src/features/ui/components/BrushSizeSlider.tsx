/**
 * @file BrushSizeSlider.tsx
 * @description Brush radius control. Shown in model units for now (the cube is 1 unit wide);
 *   Step 5 converts to centimetres using each model's unit scale.
 */
import { BRUSH_RADIUS } from '@/features/painting/config';
import { Slider } from '@/shared/components/Slider';
import { useAppStore } from '@/store/useAppStore';

/**
 * Formats a radius in model units for display.
 * @param radius - Radius in model units
 * @returns e.g. "0.10 units"
 */
function formatRadius(radius: number): string {
  return `${radius.toFixed(2)} units`;
}

/**
 * Renders the brush-size slider bound to the store.
 */
export function BrushSizeSlider() {
  const brushRadius = useAppStore((state) => state.brushRadius);
  const setBrushRadius = useAppStore((state) => state.setBrushRadius);

  return (
    <Slider
      label="Brush size"
      value={brushRadius}
      min={BRUSH_RADIUS.min}
      max={BRUSH_RADIUS.max}
      step={BRUSH_RADIUS.step}
      onChange={setBrushRadius}
      formatValue={formatRadius}
    />
  );
}
