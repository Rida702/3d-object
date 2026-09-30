/**
 * @file ProceduralCube.tsx
 * @description The starter model: a cube built in code (no file to load).
 *   A mesh = geometry (the shape: vertices + triangles; a box has 6 faces × 2 = 12 triangles)
 *   + material (how the surface reacts to light). Step 2 subdivides it so it can be painted.
 */
import { CUBE } from '../config';

/**
 * Renders a lit, solid-colour cube centred at the origin.
 */
export function ProceduralCube() {
  return (
    <mesh>
      <boxGeometry args={[CUBE.size, CUBE.size, CUBE.size]} />
      <meshStandardMaterial color={CUBE.color} />
    </mesh>
  );
}
