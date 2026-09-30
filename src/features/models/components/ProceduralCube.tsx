/**
 * @file ProceduralCube.tsx
 * @description The starter model: a cube built in code (no file to load), rendered as a
 *   paintable surface. Each face is subdivided into a grid of small triangles — a plain box
 *   has only 12 triangles, far too coarse for a round brush.
 */
import { useMemo } from 'react';
import { BoxGeometry } from 'three';
import { PaintableMesh } from '@/features/painting/components/PaintableMesh';
import { CUBE } from '../config';

/**
 * Renders the subdivided, paintable cube centred at the origin.
 */
export function ProceduralCube() {
  // Source geometry only: PaintableMesh renders (and disposes) a non-indexed copy of it,
  // so this one is never uploaded to the GPU and needs no dispose.
  const geometry = useMemo(
    () =>
      new BoxGeometry(CUBE.size, CUBE.size, CUBE.size, CUBE.segments, CUBE.segments, CUBE.segments),
    [],
  );

  return <PaintableMesh geometry={geometry} materialColor={CUBE.color} />;
}
