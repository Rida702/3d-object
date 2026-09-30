/**
 * @file SceneLights.tsx
 * @description Scene lighting. MeshStandardMaterial is physically based and renders black
 *   without light, so every scene needs this: an ambient fill so shadowed sides aren't pure
 *   black, plus a directional light so each face gets a different brightness (reads as 3D).
 */
import { LIGHTS } from '../config';

/**
 * Adds an ambient light and one directional light to the scene.
 */
export function SceneLights() {
  return (
    <>
      <ambientLight intensity={LIGHTS.ambientIntensity} />
      <directionalLight
        position={LIGHTS.directionalPosition}
        intensity={LIGHTS.directionalIntensity}
      />
    </>
  );
}
