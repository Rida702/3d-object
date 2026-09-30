/**
 * @file BrushCursor.tsx
 * @description A flat ring drawn on the surface under the pointer, sized to the brush radius,
 *   so the user sees exactly what will be painted. Its position is set imperatively by
 *   usePaintPointer (no React render per mouse move); size and visibility come from the store.
 */
import type { Ref } from 'react';
import type { Mesh } from 'three';
import { selectIsPainting } from '@/store/paintSlice';
import { useAppStore } from '@/store/useAppStore';
import { CURSOR } from '../config';

type BrushCursorProps = {
  /** Receives the ring mesh so the pointer hook can move it. */
  ref: Ref<Mesh>;
};

/** Raycast no-op: the cursor must never block rays aimed at the surface underneath it. */
const ignoreRaycast = () => {};

/**
 * Renders the brush cursor ring. The outer group shows it only in paint mode; the inner mesh
 * is shown/hidden by the pointer hook as the pointer enters/leaves the surface.
 *
 * @param props.ref - Ref to the ring mesh
 */
export function BrushCursor({ ref }: BrushCursorProps) {
  const isPainting = useAppStore(selectIsPainting);
  const brushRadius = useAppStore((state) => state.brushRadius);

  return (
    <group visible={isPainting}>
      {/* Ring geometry has outer radius 1, so scaling by the brush radius sizes it exactly. */}
      <mesh ref={ref} visible={false} scale={brushRadius} raycast={ignoreRaycast}>
        <ringGeometry args={[CURSOR.innerRatio, 1, CURSOR.segments]} />
        <meshBasicMaterial color={CURSOR.color} transparent opacity={0.9} depthWrite={false} />
      </mesh>
    </group>
  );
}
