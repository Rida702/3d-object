/**
 * @file faceMask.test.ts
 * @description Tests for face selections and mask updates.
 */
import { describe, expect, it } from 'vitest';
import { createFaceSelection, setFaces } from './faceMask';

/**
 * Builds a selection holding the given faces.
 * @param faces - Face indices
 * @returns A selection with exactly those faces
 */
function selectionOf(...faces: number[]) {
  const selection = createFaceSelection(faces.length);
  selection.faces.set(faces);
  selection.count = faces.length;
  return selection;
}

describe('createFaceSelection', () => {
  it('allocates the requested capacity with count 0', () => {
    const selection = createFaceSelection(5);
    expect(selection.faces).toHaveLength(5);
    expect(selection.count).toBe(0);
  });
});

describe('setFaces', () => {
  it('paints selected faces and reports all of them as changed', () => {
    const mask = new Uint8Array(4);
    const changed = createFaceSelection(4);

    setFaces(mask, selectionOf(1, 3), 1, changed);

    expect(Array.from(mask)).toEqual([0, 1, 0, 1]);
    expect(Array.from(changed.faces.subarray(0, changed.count))).toEqual([1, 3]);
  });

  it('reports only faces whose value actually flipped', () => {
    const mask = Uint8Array.from([0, 1, 0, 0]);
    const changed = createFaceSelection(4);

    setFaces(mask, selectionOf(0, 1, 2), 1, changed);

    expect(Array.from(changed.faces.subarray(0, changed.count))).toEqual([0, 2]);
  });

  it('erases with value 0', () => {
    const mask = Uint8Array.from([1, 1, 0]);
    const changed = createFaceSelection(3);

    setFaces(mask, selectionOf(0, 2), 0, changed);

    expect(Array.from(mask)).toEqual([0, 1, 0]);
    expect(Array.from(changed.faces.subarray(0, changed.count))).toEqual([0]);
  });

  it('overwrites the previous contents of the changed selection', () => {
    const mask = new Uint8Array(3);
    const changed = selectionOf(2, 2, 2);

    setFaces(mask, selectionOf(), 1, changed);

    expect(changed.count).toBe(0);
  });
});
