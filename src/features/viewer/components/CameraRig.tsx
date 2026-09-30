/**
 * @file CameraRig.tsx
 * @description Orbit controls for the camera: left-drag rotates, wheel zooms (within limits),
 *   right-drag pans. The camera auto-rotates until the user first interacts; at that point
 *   auto-rotation stops for good and the render loop drops to on-demand (see config.ts).
 */
import { OrbitControls } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { useState } from 'react';
import { CONTROLS } from '../config';

/**
 * Renders drei's OrbitControls as the default controls for the scene.
 * `makeDefault` exposes them via useThree(s => s.controls) so later features (e.g. paint
 * mode in Step 2) can disable orbiting without prop drilling.
 */
export function CameraRig() {
  const setFrameloop = useThree((state) => state.setFrameloop);
  const [isAutoRotating, setIsAutoRotating] = useState<boolean>(CONTROLS.autoRotate);

  /**
   * Fires when the user starts dragging/zooming. Runs once per gesture (not per frame),
   * so setting state here is safe. Only the first gesture changes anything.
   */
  const handleStart = () => {
    if (!isAutoRotating) return;
    setIsAutoRotating(false);
    // Nothing animates on its own any more; OrbitControls invalidates on change (incl. damping).
    setFrameloop('demand');
  };

  return (
    <OrbitControls
      makeDefault
      enableDamping={CONTROLS.enableDamping}
      dampingFactor={CONTROLS.dampingFactor}
      minDistance={CONTROLS.minDistance}
      maxDistance={CONTROLS.maxDistance}
      autoRotate={isAutoRotating}
      autoRotateSpeed={CONTROLS.autoRotateSpeed}
      onStart={handleStart}
    />
  );
}
