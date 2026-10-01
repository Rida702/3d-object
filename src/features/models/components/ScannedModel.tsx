/**
 * @file ScannedModel.tsx
 * @description Loads a scanned model from a .glb file and shows it as-is (shape + photo
 *   texture). Step 5b swaps the plain display for a PaintableMesh so the scan can be painted.
 *   useGLTF caches by URL, so switching back to a model doesn't download it again.
 */
import { useGLTF } from '@react-three/drei';

type ScannedModelProps = {
  /** URL of the .glb file. */
  url: string;
};

/**
 * Renders the scene contained in a .glb file. Suspends while the file loads.
 *
 * @param props.url - Model URL
 */
export function ScannedModel({ url }: ScannedModelProps) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} />;
}
