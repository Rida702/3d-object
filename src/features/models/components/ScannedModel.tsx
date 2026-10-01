/**
 * @file ScannedModel.tsx
 * @description Loads a scanned model from a .glb file and renders it as a paintable surface
 *   that keeps the scan's own photo texture under the paint.
 *   useGLTF caches by URL, so switching back to a model doesn't download it again; the cached
 *   scene is never modified — prepareModel works on copies.
 */
import { useGLTF } from '@react-three/drei';
import { useEffect, useMemo } from 'react';
import { PaintableMesh } from '@/features/painting/components/PaintableMesh';
import { prepareModel } from '../lib/prepareGeometry';

type ScannedModelProps = {
  /** URL of the .glb file. */
  url: string;
  /** Metres per model unit (from the model list). */
  unitScale: number;
};

/**
 * Renders a scanned model as a paintable mesh. Suspends while the file loads.
 *
 * @param props.url - Model URL
 * @param props.unitScale - Metres per model unit
 */
export function ScannedModel({ url, unitScale }: ScannedModelProps) {
  const { scene } = useGLTF(url);
  const prepared = useMemo(() => prepareModel(scene), [scene]);

  // The merged geometry and material are copies we created, so we free them ourselves.
  // (The texture is shared with the cached scene and is left alone.)
  useEffect(
    () => () => {
      prepared.geometry.dispose();
      prepared.material.dispose();
    },
    [prepared],
  );

  return (
    <PaintableMesh
      geometry={prepared.geometry}
      material={prepared.material}
      unitScale={unitScale}
    />
  );
}
