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
import { disposeMaterial } from '@/shared/lib/disposeObject';
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

  // Free GPU memory when this model is switched away from. The geometry and material are our
  // copies. The texture is shared with the cached scene, but disposing only frees its GPU copy;
  // the image stays cached, so switching back simply uploads it again.
  useEffect(
    () => () => {
      prepared.geometry.dispose();
      disposeMaterial(prepared.material);
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
