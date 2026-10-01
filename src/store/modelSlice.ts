/**
 * @file modelSlice.ts
 * @description Which model is shown. Holds only the id; the model's details come from
 *   MODELS in features/models/config.ts.
 */
import type { StateCreator } from 'zustand';
import { CUBE_MODEL } from '@/features/models/config';
import type { AppState } from './useAppStore';

/** Model-selection state and its actions. */
export interface ModelSlice {
  /** Id of the model shown in the viewport. */
  selectedModelId: string;
  setSelectedModel: (id: string) => void;
}

/**
 * Creates the model slice for the app store. Starts on the cube.
 *
 * @param set - zustand setter
 * @returns Initial model state and actions
 */
export const createModelSlice: StateCreator<AppState, [], [], ModelSlice> = (set) => ({
  selectedModelId: CUBE_MODEL.id,
  setSelectedModel: (selectedModelId) => set({ selectedModelId }),
});
