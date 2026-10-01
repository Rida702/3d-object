/**
 * @file ModelStage.tsx
 * @description Decides WHICH model is shown, centres it at the origin and moves the camera
 *   so the whole model fits the view. Scanned models come off the phone at arbitrary
 *   positions and sizes; centring and framing only move things on screen — they never
 *   rescale the mesh, so areas stay correct.
 */
import { Bounds, Center, useGLTF } from '@react-three/drei';
import { Suspense } from 'react';
import { ErrorBoundary } from '@/shared/components/ErrorBoundary';
import { useAppStore } from '@/store/useAppStore';
import { CUBE_MODEL, FRAMING_MARGIN, MODELS } from '../config';
import type { ModelDefinition } from '../types';
import { ModelError } from './ModelError';
import { ModelLoading } from './ModelLoading';
import { ProceduralCube } from './ProceduralCube';
import { ScannedModel } from './ScannedModel';

// Start downloading scan files as soon as the 3D code loads, not when the user picks one,
// so switching models doesn't wait on a fresh download (CLAUDE.md 6.1.1).
for (const model of MODELS) {
  if (model.source === 'gltf') useGLTF.preload(model.url);
}

type ModelContentProps = {
  model: ModelDefinition;
};

/**
 * Renders the content for one model definition.
 *
 * @param props.model - Model to render
 */
function ModelContent({ model }: ModelContentProps) {
  return model.source === 'gltf' ? (
    <ScannedModel url={model.url} unitScale={model.unitScale} />
  ) : (
    <ProceduralCube />
  );
}

/**
 * Renders the currently selected model, centred and framed by the camera.
 * `key={model.id}` remounts everything per model: the camera re-frames on every switch, and a
 * model that failed to load doesn't keep showing its error after picking another one.
 */
export function ModelStage() {
  const selectedModelId = useAppStore((state) => state.selectedModelId);
  const model = MODELS.find((candidate) => candidate.id === selectedModelId) ?? CUBE_MODEL;

  return (
    <ErrorBoundary key={model.id} fallback={<ModelError />}>
      <Suspense fallback={<ModelLoading />}>
        <Bounds fit clip observe margin={FRAMING_MARGIN}>
          <Center>
            <ModelContent model={model} />
          </Center>
        </Bounds>
      </Suspense>
    </ErrorBoundary>
  );
}
