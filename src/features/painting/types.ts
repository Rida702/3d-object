/**
 * @file types.ts
 * @description Core painting contracts. Every tool, hook and measurement works against
 *   PaintSurface, so a procedural cube and a 200k-triangle scan are painted the same way
 *   (CLAUDE.md 4.2). Types only — no runtime code.
 */
import type { BufferAttribute, BufferGeometry, Color, Vector3 } from 'three';

/** Identifiers of the available paint tools. Add a member here when adding a tool. */
export type PaintToolId = 'brush' | 'eraser';

/**
 * A reusable list of face (triangle) indices. Only the first `count` entries of `faces` are
 * valid. Preallocated once per surface so pointer-move handlers never allocate (6.1.7).
 */
export interface FaceSelection {
  faces: Uint32Array;
  count: number;
}

/** A mesh prepared for painting: non-indexed geometry plus per-face paint state. */
export interface PaintSurface {
  /** Non-indexed copy of the source geometry: face `f` owns vertices 3f, 3f+1, 3f+2. */
  geometry: BufferGeometry;
  /** Per-vertex RGB (linear colour space) multiplied with the material colour/texture. */
  colorAttribute: BufferAttribute;
  faceCount: number;
  /** xyz per face, in the geometry's local space. Used by brush selection. */
  faceCentroids: Float32Array;
  /** 1 = painted, 0 = not painted, one entry per face. */
  paintedMask: Uint8Array;
  /** Colour of unpainted faces (white = no tint over the material). */
  baseColor: Color;
  /** Scratch: faces under the brush for the current stroke step. */
  selected: FaceSelection;
  /** Scratch: faces whose painted state actually flipped during the current stroke step. */
  changed: FaceSelection;
}

/** Where the pointer hit the surface. */
export interface PaintHit {
  /** Hit point in the mesh's LOCAL space (same space as faceCentroids). */
  point: Vector3;
  /** Index of the triangle that was hit. */
  faceIndex: number;
}

/** Tool parameters for one application, read from the store at pointer time. */
export interface PaintSettings {
  /** Paint colour in linear colour space (three's Color handles sRGB → linear on set). */
  color: Color;
  /** Brush radius in model units. */
  radius: number;
}

/** Contract every paint tool implements (CLAUDE.md 4.4). */
export interface PaintTool {
  id: PaintToolId;
  /**
   * Applies the tool at a hit point, mutating the surface's mask and colours.
   * @returns The faces whose painted state changed (the surface's scratch selection —
   *   valid only until the next call).
   */
  apply(surface: PaintSurface, hit: PaintHit, settings: PaintSettings): FaceSelection;
}
