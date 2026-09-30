/**
 * @file usePaintPointer.ts
 * @description Turns R3F pointer events on a mesh into paint strokes and moves the brush cursor.
 *   R3F raycasts for us: each event carries the hit point and the triangle index (faceIndex).
 *   Hot path rules (CLAUDE.md 6.3): no React state, no allocations — settings are read with
 *   getState(), scratch objects are reused, and drag painting runs at most once per frame.
 */
import { useThree, type ThreeEvent } from '@react-three/fiber';
import { useEffect, useRef, type RefObject } from 'react';
import { Color, Vector3, type Mesh, type Object3D } from 'three';
import { selectIsPainting } from '@/store/paintSlice';
import { useAppStore } from '@/store/useAppStore';
import { CURSOR } from '../config';
import { getPaintTool } from '../tools/registry';
import type { PaintHit, PaintSettings, PaintSurface } from '../types';

type PaintEvent = ThreeEvent<PointerEvent>;

type PaintPointerOptions = {
  surface: PaintSurface;
  meshRef: RefObject<Mesh | null>;
  cursorRef: RefObject<Object3D | null>;
};

/** Pointer handlers to spread onto the paintable <mesh>. */
export type PaintPointerHandlers = {
  onPointerDown: (event: PaintEvent) => void;
  onPointerMove: (event: PaintEvent) => void;
  onPointerLeave: () => void;
};

// Module-level scratch objects, reused on every event (painting is synchronous).
const settings: PaintSettings = { color: new Color(), radius: 0 };
const worldNormal = new Vector3();
const lookTarget = new Vector3();

/**
 * Reads the current paint settings from the store into the shared settings object.
 * @returns The refreshed settings
 */
function readSettings(): PaintSettings {
  const state = useAppStore.getState();
  settings.color.set(state.color); // Color.set converts the sRGB hex to linear
  settings.radius = state.brushRadius;
  return settings;
}

/** @returns True if pointer input should paint right now. */
function isPaintingNow(): boolean {
  return selectIsPainting(useAppStore.getState());
}

/**
 * Copies an event's hit into `hit`, converting the point to the mesh's local space
 * (face centroids are local, so the brush must be too).
 * @returns False if the event has no face (nothing to paint)
 */
function copyHit(event: PaintEvent, mesh: Mesh, hit: PaintHit): boolean {
  if (event.faceIndex == null) return false;
  hit.faceIndex = event.faceIndex;
  mesh.worldToLocal(hit.point.copy(event.point));
  return true;
}

/** Places the cursor ring on the surface at the hit point, facing along the surface normal. */
function placeCursor(cursor: Object3D, event: PaintEvent): void {
  if (!event.face) return;
  worldNormal.copy(event.face.normal).transformDirection(event.object.matrixWorld);
  cursor.position.copy(event.point).addScaledVector(worldNormal, CURSOR.surfaceOffset);
  cursor.lookAt(lookTarget.copy(cursor.position).add(worldNormal));
  cursor.visible = true;
}

/**
 * Creates pointer handlers that paint `surface` with the active tool.
 *
 * @param options.surface - Surface to paint
 * @param options.meshRef - The rendered mesh (for world → local conversion)
 * @param options.cursorRef - Brush cursor object to move with the pointer
 * @returns Handlers for the mesh
 */
export function usePaintPointer({
  surface,
  meshRef,
  cursorRef,
}: PaintPointerOptions): PaintPointerHandlers {
  const invalidate = useThree((state) => state.invalidate);
  const hitRef = useRef<PaintHit>({ point: new Vector3(), faceIndex: -1 });
  const frameRef = useRef(0);

  useEffect(() => () => cancelAnimationFrame(frameRef.current), []);

  const paint = () => {
    frameRef.current = 0;
    const tool = getPaintTool(useAppStore.getState().activeToolId);
    tool.apply(surface, hitRef.current, readSettings());
    invalidate(); // frameloop is on-demand: request one frame to show the new colours
  };

  const captureHit = (event: PaintEvent) =>
    meshRef.current ? copyHit(event, meshRef.current, hitRef.current) : false;

  const onPointerDown = (event: PaintEvent) => {
    if (event.button !== 0 || !isPaintingNow() || !captureHit(event)) return;
    event.stopPropagation(); // only the front-most surface paints
    paint();
  };

  const onPointerMove = (event: PaintEvent) => {
    if (!isPaintingNow()) return;
    event.stopPropagation();
    if (cursorRef.current) placeCursor(cursorRef.current, event);
    invalidate();
    // Paint while the primary button is held; coalesce moves into one paint per frame.
    const isPrimaryDown = (event.buttons & 1) === 1;
    if (!isPrimaryDown || !captureHit(event) || frameRef.current) return;
    frameRef.current = requestAnimationFrame(paint);
  };

  const onPointerLeave = () => {
    if (cursorRef.current) cursorRef.current.visible = false;
    invalidate();
  };

  return { onPointerDown, onPointerMove, onPointerLeave };
}
