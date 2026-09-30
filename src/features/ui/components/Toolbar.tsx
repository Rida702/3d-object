/**
 * @file Toolbar.tsx
 * @description Paint controls in the side panel: paint-mode toggle, tool choice, colour and
 *   brush size. Each control subscribes to only the store fields it shows, so changing one
 *   doesn't re-render the others — and none of them re-render the 3D canvas.
 */
import { PAINT_TOOL_OPTIONS } from '@/features/painting/config';
import { Button } from '@/shared/components/Button';
import { useAppStore } from '@/store/useAppStore';
import { BrushSizeSlider } from './BrushSizeSlider';
import { ColorPicker } from './ColorPicker';
import styles from './Toolbar.module.css';

/**
 * Renders the paint toolbar.
 */
export function Toolbar() {
  const isPaintMode = useAppStore((state) => state.isPaintMode);
  const togglePaintMode = useAppStore((state) => state.togglePaintMode);
  const activeToolId = useAppStore((state) => state.activeToolId);
  const setActiveTool = useAppStore((state) => state.setActiveTool);

  return (
    <section className={styles.toolbar} aria-label="Paint tools">
      <Button isPressed={isPaintMode} onClick={togglePaintMode} title="Or hold Shift">
        Paint mode
      </Button>

      <div className={styles.group} role="group" aria-label="Tool">
        {PAINT_TOOL_OPTIONS.map((tool) => (
          <Button
            key={tool.id}
            isPressed={tool.id === activeToolId}
            onClick={() => setActiveTool(tool.id)}
          >
            {tool.label}
          </Button>
        ))}
      </div>

      <ColorPicker />
      <BrushSizeSlider />
    </section>
  );
}
