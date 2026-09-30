/**
 * @file useAppStore.ts
 * @description The single app store, combined from slices. Read it with a selector in
 *   components — useAppStore((s) => s.color) — and with useAppStore.getState() in event
 *   handlers or useFrame, which reads without subscribing (CLAUDE.md 4.5).
 */
import { create } from 'zustand';
import { createPaintSlice, type PaintSlice } from './paintSlice';

/** Full app state: the union of all slices. */
export type AppState = PaintSlice;

/** The app store hook. */
export const useAppStore = create<AppState>()((...args) => ({
  ...createPaintSlice(...args),
}));
