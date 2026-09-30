/**
 * @file PaintableMesh.tsx
 * @description Renders any geometry as a surface the user can paint by clicking or dragging.
 *   Owns the PaintSurface for its geometry and wires pointer events to the active tool.
 *   Models (cube now, scans in Step 5) render this instead of a plain <mesh>.
 */
import { useRef } from 'react';
import type { BufferGeometry, Mesh } from 'three';
import { usePaintModeShortcut } from '../hooks/usePaintModeShortcut';
import { usePaintPointer } from '../hooks/usePaintPointer';
import { usePaintSurface } from '../hooks/usePaintSurface';
import { BrushCursor } from './BrushCursor';

type PaintableMeshProps = {
  /** Source geometry; converted to a non-indexed, vertex-coloured copy internally. */
  geometry: BufferGeometry;
  /** Material colour. Paint (vertex colour) is multiplied with it, so keep it light. */
  materialColor: string;
};

/**
 * Renders a paintable mesh plus its brush cursor.
 *
 * @param props.geometry - Source geometry (not modified)
 * @param props.materialColor - Base material colour
 */
export function PaintableMesh({ geometry, materialColor }: PaintableMeshProps) {
  const surface = usePaintSurface(geometry);
  const meshRef = useRef<Mesh>(null);
  const cursorRef = useRef<Mesh>(null);
  const handlers = usePaintPointer({ surface, meshRef, cursorRef });
  usePaintModeShortcut();

  return (
    <>
      <mesh ref={meshRef} geometry={surface.geometry} {...handlers}>
        {/* vertexColors: without it the per-vertex paint colours are ignored. */}
        <meshStandardMaterial color={materialColor} vertexColors />
      </mesh>
      <BrushCursor ref={cursorRef} />
    </>
  );
}
