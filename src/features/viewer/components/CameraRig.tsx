/**
 * @file CameraRig.tsx
 * @description Orbit controls for the camera: left-drag rotates, wheel zooms (within limits),
 *   right-drag pans. Orbiting is disabled while painting so a drag paints instead.
 *   The camera auto-rotates until the user first interacts (orbits or enters paint mode);
 *   then auto-rotation stops for good and the render loop drops to on-demand (see config.ts).
 */
import { OrbitControls } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { useEffect, useState } from 'react';
import { selectIsPainting } from '@/store/paintSlice';
import { useAppStore } from '@/store/useAppStore';
import { CONTROLS } from '../config';

/**
 * Renders drei's OrbitControls as the default controls for the scene.
 */
export function CameraRig() {
  const setFrameloop = useThree((state) => state.setFrameloop);
  const isPainting = useAppStore(selectIsPainting);
  const [isAutoRotating, setIsAutoRotating] = useState<boolean>(CONTROLS.autoRotate);

  // Entering paint mode counts as interacting. Adjusting state during render (instead of in
  // an effect) is React's recommended pattern for state derived from a changed value.
  if (isPainting && isAutoRotating) setIsAutoRotating(false);

  // Sync the external R3F render loop: every frame while spinning, on demand afterwards
  // (OrbitControls invalidates on change, including damping).
  useEffect(() => {
    setFrameloop(isAutoRotating ? 'always' : 'demand');
  }, [isAutoRotating, setFrameloop]);

  /** Fires at the start of each orbit/zoom gesture; only the first one changes anything. */
  const handleStart = () => setIsAutoRotating(false);

  return (
    <OrbitControls
      makeDefault
      enabled={!isPainting}
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
