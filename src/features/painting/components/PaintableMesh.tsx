/**
 * @file PaintableMesh.tsx
 * @description Renders any geometry as a surface the user can paint by clicking or dragging.
 *   Owns the PaintSurface for its geometry, wires pointer events to the active tool and
 *   publishes the painted/total area to the store for the readout.
 *   Models (the cube, scanned .glb files) render this instead of a plain <mesh>.
 */
import { useRef } from 'react';
import type { BufferGeometry, Material, Mesh } from 'three';
import { useAreaSync } from '../hooks/useAreaSync';
import { usePaintModeShortcut } from '../hooks/usePaintModeShortcut';
import { usePaintPointer } from '../hooks/usePaintPointer';
import { usePaintSurface } from '../hooks/usePaintSurface';
import { BrushCursor } from './BrushCursor';

/** How the surface looks: a plain colour, or a ready-made material (e.g. a scan's texture). */
type PaintableAppearance =
  | {
      /** Plain material colour. Paint is multiplied with it, so keep it light. */
      materialColor: string;
      material?: never;
    }
  | {
      /** Material to render with. MUST have `vertexColors = true` (the paint layer). */
      material: Material;
      materialColor?: never;
    };

type PaintableMeshProps = PaintableAppearance & {
  /** Source geometry; converted to a non-indexed, vertex-coloured copy internally. */
  geometry: BufferGeometry;
  /** Metres per model unit — turns model-space area into real-world area. */
  unitScale: number;
};

/**
 * Renders a paintable mesh plus its brush cursor.
 *
 * @param props.geometry - Source geometry (not modified)
 * @param props.materialColor - Plain colour (when no material is given)
 * @param props.material - Ready-made material with vertex colours enabled
 * @param props.unitScale - Metres per model unit
 */
export function PaintableMesh({
  geometry,
  materialColor,
  material,
  unitScale,
}: PaintableMeshProps) {
  const surface = usePaintSurface(geometry);
  const meshRef = useRef<Mesh>(null);
  const cursorRef = useRef<Mesh>(null);
  const syncArea = useAreaSync({ surface, meshRef, unitScale });
  const handlers = usePaintPointer({ surface, meshRef, cursorRef, onPaint: syncArea });
  usePaintModeShortcut();

  return (
    <>
      <mesh ref={meshRef} geometry={surface.geometry} material={material} {...handlers}>
        {/* vertexColors: without it the per-vertex paint colours are ignored. */}
        {!material && <meshStandardMaterial color={materialColor} vertexColors />}
      </mesh>
      <BrushCursor ref={cursorRef} />
    </>
  );
}
