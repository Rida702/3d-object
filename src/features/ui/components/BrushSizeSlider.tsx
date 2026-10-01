/**
 * @file BrushSizeSlider.tsx
 * @description Brush radius control in real-world centimetres, so a "1.0 cm" brush is the same
 *   size on the 10 cm cube and on a scan. Painting converts cm to each model's own units.
 */
import { BRUSH_RADIUS_CM } from '@/features/painting/config';
import { Slider } from '@/shared/components/Slider';
import { useAppStore } from '@/store/useAppStore';

/**
 * Formats a brush radius for display.
 * @param radiusCm - Radius in centimetres
 * @returns e.g. "1.0 cm"
 */
function formatRadius(radiusCm: number): string {
  return `${radiusCm.toFixed(1)} cm`;
}

/**
 * Renders the brush-size slider bound to the store.
 */
export function BrushSizeSlider() {
  const brushRadiusCm = useAppStore((state) => state.brushRadiusCm);
  const setBrushRadiusCm = useAppStore((state) => state.setBrushRadiusCm);

  return (
    <Slider
      label="Brush size (radius)"
      value={brushRadiusCm}
      min={BRUSH_RADIUS_CM.min}
      max={BRUSH_RADIUS_CM.max}
      step={BRUSH_RADIUS_CM.step}
      onChange={setBrushRadiusCm}
      formatValue={formatRadius}
    />
  );
}
