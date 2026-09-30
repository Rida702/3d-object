/**
 * @file Viewport.tsx
 * @description The WebGL canvas: creates the renderer, camera, lights and orbit controls,
 *   and renders whatever scene content app/ passes in as children (e.g. the model stage).
 *   Heavy (pulls in three + R3F + drei), so it is only ever loaded lazily via app/Scene.tsx.
 */
import { Stats } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import type { ReactNode } from 'react';
import { CAMERA, DPR, INITIAL_FRAMELOOP } from '../config';
import { CameraRig } from './CameraRig';
import { SceneLights } from './SceneLights';

type ViewportProps = {
  /** 3D content to render inside the scene (meshes, not DOM). */
  children: ReactNode;
};

/**
 * Renders the 3D canvas with camera, lights and controls around the given scene content.
 * Fills its parent element; R3F keeps the camera aspect in sync on resize.
 *
 * @param props.children - Scene content (R3F elements)
 */
export function Viewport({ children }: ViewportProps) {
  return (
    <Canvas camera={CAMERA} dpr={DPR} frameloop={INITIAL_FRAMELOOP}>
      <SceneLights />
      <CameraRig />
      {children}
      {import.meta.env.DEV && <Stats />}
    </Canvas>
  );
}
