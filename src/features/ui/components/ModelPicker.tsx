/**
 * @file ModelPicker.tsx
 * @description Side-panel buttons for choosing which model the 3D view shows.
 *   Reads the model list from models/config.ts (no 3D code), so it stays in the main bundle.
 */
import { MODELS } from '@/features/models/config';
import { Button } from '@/shared/components/Button';
import { useAppStore } from '@/store/useAppStore';
import styles from './Toolbar.module.css';

/**
 * Renders one toggle button per available model.
 */
export function ModelPicker() {
  const selectedModelId = useAppStore((state) => state.selectedModelId);
  const setSelectedModel = useAppStore((state) => state.setSelectedModel);

  return (
    <div className={styles.group} role="group" aria-label="Model">
      {MODELS.map((model) => (
        <Button
          key={model.id}
          isPressed={model.id === selectedModelId}
          onClick={() => setSelectedModel(model.id)}
        >
          {model.label}
        </Button>
      ))}
    </div>
  );
}
