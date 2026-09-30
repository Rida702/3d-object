/**
 * @file usePaintModeShortcut.ts
 * @description Holding Shift temporarily turns on paint mode (orbiting pauses while held).
 *   Releasing Shift, or the window losing focus mid-press, turns it back off.
 */
import { useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';

/**
 * Subscribes to window key events for the Shift paint-mode shortcut while mounted.
 */
export function usePaintModeShortcut(): void {
  const setPaintModeHeld = useAppStore((state) => state.setPaintModeHeld);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Shift') setPaintModeHeld(event.type === 'keydown');
    };
    // Without this, alt-tabbing while holding Shift would leave paint mode stuck on.
    const handleBlur = () => setPaintModeHeld(false);

    window.addEventListener('keydown', handleKey);
    window.addEventListener('keyup', handleKey);
    window.addEventListener('blur', handleBlur);
    return () => {
      window.removeEventListener('keydown', handleKey);
      window.removeEventListener('keyup', handleKey);
      window.removeEventListener('blur', handleBlur);
    };
  }, [setPaintModeHeld]);
}
