# CLAUDE.md — 3D Object Painter

This file is the single source of truth for **how this project is built**. Read it fully before
writing any code. Every rule here is binding unless the user explicitly overrides it.

- Part 1 — Project summary
- Part 2 — Tech stack and why
- Part 3 — Scaffolding and folder structure (decided **before** any step is built)
- Part 4 — Architecture and system design
- Part 5 — Coding rules (line limits, comments, naming, imports)
- Part 6 — Best practices (React / Vercel, Three.js, React Three Fiber, TypeScript, state)
- Part 7 — The build plan (Step 0 → Step 5, each thoroughly described)
- Part 8 — Definition of Done checklist, commands, and future extensions

---

## Part 1 — Project summary

A browser app that shows a 3D object, lets the user **paint regions on its surface by clicking or
dragging**, and **calculates the real-world surface area of the painted region**.

It starts with a procedural cube (Steps 1–3, browser only) and ends with a **real object scanned
with a phone camera via photogrammetry** (Steps 4–5). This is a miniature of a client prototype, so
the architecture must make it easy to grow (more tools, more models, more measurements).

Core ideas learned along the way:

| Concept                                                                       | Where it appears |
| ----------------------------------------------------------------------------- | ---------------- |
| How Three.js renders 3D (scene, camera, renderer, mesh = geometry + material) | Step 1           |
| Orbit controls (rotate / zoom / pan)                                          | Step 1           |
| Raycasting (pointer → 3D ray → hit triangle)                                  | Step 2           |
| Triangles, vertices, indexed vs non-indexed geometry, vertex colors           | Step 2           |
| Triangle area via cross product; summing areas; world scale                   | Step 3           |
| Photogrammetry (photos → point cloud → mesh → textured model)                 | Step 4           |
| Loading, normalizing and optimizing real meshes (glTF/GLB)                    | Step 5           |

---

## Part 2 — Tech stack

| Concern                          | Choice                                                           | Why                                                                                                   |
| -------------------------------- | ---------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Runtime                          | Node.js 22 LTS (already installed: v22.14.0)                     | Required for Vite and tooling                                                                         |
| Build tool / dev server          | **Vite**                                                         | Instant dev server, native ESM, first-class TS, small config                                          |
| UI framework                     | **React 19**                                                     | Component model, huge ecosystem                                                                       |
| Language                         | **TypeScript (strict)**                                          | Geometry code is full of indices and buffers; types prevent silent bugs                               |
| 3D engine                        | **three.js**                                                     | The standard WebGL library                                                                            |
| React ↔ Three bridge             | **@react-three/fiber (R3F)**                                     | Declarative scene graph, render loop hooks, pointer events with raycasting built in                   |
| 3D helpers                       | **@react-three/drei**                                            | `OrbitControls`, `useGLTF`, `Center`, `Bounds`, `Html`, `Stats`                                       |
| Fast raycasting                  | **three-mesh-bvh**                                               | BVH acceleration: scanned meshes have 100k+ triangles; naive raycasting is too slow for drag-painting |
| State                            | **zustand**                                                      | Tiny, selector-based subscriptions (minimal re-renders), usable outside React (in `useFrame`)         |
| Styling                          | **CSS Modules** + one global `tokens.css`                        | Scoped styles, zero runtime, no extra dependency                                                      |
| Testing                          | **Vitest** (+ `@testing-library/react` for UI)                   | Same config as Vite; pure geometry math is unit-tested                                                |
| Lint / format                    | **ESLint (flat config)** + **Prettier**                          | Enforces line limits, import boundaries, hooks rules                                                  |
| Asset optimization               | **@gltf-transform/cli**                                          | Decimate, weld, compress (Draco/Meshopt) scanned models                                               |
| Photogrammetry (offline)         | **Meshroom** (Windows, free) or **KIRI Engine** (Android, cloud) | Photos → textured mesh                                                                                |
| Mesh cleanup (optional, offline) | **Blender**                                                      | Crop the floor, fill holes, decimate, set scale                                                       |

> No Next.js: this is a pure client-side 3D app with no server rendering or data fetching needs.
> Vercel's React rules still apply wherever relevant (bundle size, re-renders, rendering, JS perf).

---

## Part 3 — Scaffolding and folder structure

**Rule: no file lives outside the structure below.** No loose scripts, notes, images or experiments
in the root or in `src/`. If a new kind of file doesn't fit anywhere, update this section first.

### 3.1 Final tree

```
3d-objects/
├── CLAUDE.md                     # This file: rules + plan (for the AI and humans)
├── README.md                     # Short: project idea + tech stack only
├── package.json
├── tsconfig.json                 # Strict TS, path alias "@/*" -> "src/*"
├── tsconfig.node.json            # TS config for vite.config.ts
├── vite.config.ts                # Vite + React plugin + Vitest config + alias
├── eslint.config.js              # Flat config: max-lines, boundaries, hooks rules
├── package-lock.json
├── .prettierrc
├── .prettierignore
├── .gitignore
├── index.html                    # Vite entry HTML (must stay in root — Vite requirement)
│
├── docs/                         # All non-code documentation
│   ├── idea.md                   # The original idea (moved from idea.txt in Step 0)
│   ├── architecture.md           # Diagrams / decisions that outgrow this file (optional)
│   └── scanning-guide.md         # Step 4: how to photograph + reconstruct an object
│
├── assets-src/                   # RAW, un-optimized source assets (scans/ is git-ignored)
│   └── scans/<object-name>/      # Meshroom/KIRI exports before optimization
│
├── scripts/                      # Node/CLI scripts only (e.g. optimize-model.mjs)
│
├── public/
│   └── models/                   # OPTIMIZED .glb files served to the browser
│
└── src/
    ├── main.tsx                  # React root mount. Nothing else.
    ├── app/                      # App shell: composition only, no business logic
    │   ├── App.tsx               # Layout: <Viewport/> + <Toolbar/> + <InfoPanel/>
    │   └── App.module.css
    │
    ├── features/                 # One folder per feature (vertical slices)
    │   ├── viewer/               # Canvas, camera, lights, controls, environment
    │   │   ├── components/       # Viewport.tsx, SceneLights.tsx, CameraRig.tsx
    │   │   └── config.ts         # Camera FOV, damping, zoom limits, etc.
    │   │
    │   ├── models/               # WHAT is displayed: cube or scanned model
    │   │   ├── components/       # ModelStage.tsx, ProceduralCube.tsx, ScannedModel.tsx
    │   │   ├── lib/              # prepareGeometry.ts, normalizeModel.ts
    │   │   ├── registry.ts       # List of available models (id, label, source, unit scale)
    │   │   └── types.ts          # ModelDefinition, ModelSource
    │   │
    │   ├── painting/             # HOW the surface is painted
    │   │   ├── components/       # PaintableMesh.tsx, BrushCursor.tsx
    │   │   ├── hooks/            # usePaintPointer.ts, usePaintSurface.ts
    │   │   ├── lib/              # paintSurface.ts, faceMask.ts, brushSelect.ts
    │   │   ├── tools/            # brushTool.ts, eraserTool.ts, index of tools (registry.ts)
    │   │   └── types.ts          # PaintTool, PaintHit, PaintSurface
    │   │
    │   ├── measurement/          # WHAT we compute from the paint
    │   │   ├── components/       # AreaReadout.tsx
    │   │   ├── lib/              # triangleArea.ts, surfaceArea.ts, units.ts
    │   │   └── types.ts
    │   │
    │   └── ui/                   # App-level controls (toolbar, panels)
    │       └── components/       # Toolbar.tsx, ColorPicker.tsx, BrushSizeSlider.tsx, InfoPanel.tsx
    │
    ├── store/                    # Global app state (zustand), split into slices
    │   ├── useAppStore.ts        # Combines slices; the ONLY store
    │   ├── paintSlice.ts         # active tool, color, brush radius, paint version
    │   ├── modelSlice.ts         # selected model id, loading status
    │   └── measurementSlice.ts   # painted area, total area, unit
    │
    ├── shared/                   # Reusable, feature-agnostic code
    │   ├── components/           # Generic UI: Button.tsx, Slider.tsx, Panel.tsx
    │   ├── lib/                  # Generic helpers: math.ts, disposeObject.ts, throttle.ts
    │   ├── hooks/                # Generic hooks: useThrottledCallback.ts
    │   └── types/                # Global types shared by 2+ features
    │
    ├── styles/
    │   ├── tokens.css            # CSS variables: colors, spacing, fonts
    │   └── global.css            # Resets + body/root sizing
    │
    └── test/
        └── setup.ts              # Vitest global setup only
```

Folders are created when their step first needs them (no empty placeholder folders or
`.gitkeep` files). After Step 0, only `src/app`, `src/styles`, `src/test` and `docs/` exist.

### 3.2 Placement rules

| File kind                                       | Goes in                                  | Never in                                         |
| ----------------------------------------------- | ---------------------------------------- | ------------------------------------------------ |
| React component used by one feature             | `features/<f>/components/`               | `shared/`                                        |
| React component used by 2+ features             | `shared/components/`                     | a feature folder                                 |
| Pure function (no React, no scene side-effects) | `features/<f>/lib/` or `shared/lib/`     | a component file                                 |
| Custom hook                                     | `features/<f>/hooks/` or `shared/hooks/` | a component file (unless < 10 lines and private) |
| Types used by one feature                       | `features/<f>/types.ts`                  | `shared/types/`                                  |
| Constants / tunables                            | `features/<f>/config.ts`                 | inline magic numbers                             |
| Unit tests                                      | Next to the file: `triangleArea.test.ts` | a separate `__tests__` tree                      |
| CSS for a component                             | `Component.module.css` next to it        | `global.css`                                     |
| 3D models for the app                           | `public/models/*.glb` (optimized)        | `src/`                                           |
| Raw scans                                       | `assets-src/scans/<name>/`               | `public/`                                        |
| Docs / notes                                    | `docs/`                                  | root (except README.md, CLAUDE.md)               |

### 3.3 Naming conventions

- Components: `PascalCase.tsx` (`PaintableMesh.tsx`). One exported component per file.
- Hooks: `useCamelCase.ts` (`usePaintPointer.ts`).
- Everything else: `camelCase.ts` (`triangleArea.ts`).
- Folders: `kebab-case` or single lowercase words.
- Types/interfaces: `PascalCase`, no `I` prefix. Prefer `type` for unions, `interface` for objects that may be extended.
- Booleans: `isX`, `hasX`, `canX`. Handlers: `handleX` inside components, `onX` as props.
- **No barrel files** (`index.ts` that re-exports). Import from the actual file path (see Part 6.1).

---

## Part 4 — Architecture and system design

### 4.1 Layers and dependency direction

```
            app/  (composition only)
              │
    ┌─────────┼───────────────┬───────────────┐
    ▼         ▼               ▼               ▼
 viewer    models ──────▶ painting ───────▶ measurement      ← features/
    │         │               │               │
    └─────────┴──────┬────────┴───────────────┘
                     ▼
              store/  +  shared/
```

Rules (enforced by ESLint `no-restricted-imports` zones in `eslint.config.js`):

1. `shared/` imports **nothing** from `features/`, `store/` or `app/`.
2. `store/` imports only from `shared/` and feature `types.ts` files.
3. A feature may import from `shared/`, `store/`, and another feature's **`types.ts` or `lib/`** only.
   Feature components never import another feature's components — `app/` composes them.
   (Exception: `models` renders `painting/components/PaintableMesh`, because a model _is_ the
   painted surface. This is the only allowed cross-feature component import.)
4. `lib/` files are **pure**: no React, no zustand, no DOM. They may use three.js math types
   (`Vector3`, `BufferGeometry`). This makes all geometry logic unit-testable.

### 4.2 The core abstraction: `PaintSurface`

All painting and measurement work against one interface, regardless of whether the mesh is a cube
or a 200k-triangle scan:

```ts
/** A mesh prepared for painting: non-indexed geometry + per-face state. */
interface PaintSurface {
  geometry: BufferGeometry; // non-indexed, has 'color' attribute
  faceCount: number;
  faceAreas: Float32Array; // precomputed area per triangle (model units²)
  faceCentroids: Float32Array; // xyz per face, for brush selection
  paintedMask: Uint8Array; // 1 = painted, 0 = not
  paintedArea: number; // running total, updated incrementally
}
```

- Created **once** per model by `createPaintSurface(geometry)` in `painting/lib/paintSurface.ts`.
- Lives in a `useRef` / `useMemo` — **not** in React state or zustand (it's large, mutable, and
  changes 60×/s while dragging).
- Only **summaries** (painted area, a `paintVersion` counter) go into the zustand store, so the UI
  re-renders only when the numbers change.

### 4.3 Data flow of one paint stroke

```
pointer event (R3F onPointerDown/Move)
   → usePaintPointer: gets hit.faceIndex + hit.point (BVH-accelerated raycast)
   → activeTool.apply(surface, hit, settings)          (tools/brushTool.ts)
        → brushSelect: faces whose centroid is within radius
        → faceMask.setFaces(): flips mask bits, returns changed faces
        → paintSurface.recolorFaces(): writes colors into the color buffer
        → updates surface.paintedArea incrementally (+/− face areas)
   → mark color attribute needsUpdate (only changed range)
   → invalidate() (frameloop="demand" → renders one frame)
   → store.setPaintedArea(surface.paintedArea)  (throttled)
   → <AreaReadout/> re-renders via selector
```

### 4.4 Extension points (how to grow the project)

| Want to add…                                             | Do this                                                                                     | Touch nothing else                 |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------------- | ---------------------------------- |
| A new paint tool (fill-region, eraser, lasso)            | New file in `painting/tools/` implementing `PaintTool`; add to `painting/tools/registry.ts` | Toolbar reads from registry        |
| A new model                                              | Drop `.glb` in `public/models/`, add an entry in `models/registry.ts`                       | Everything else is generic         |
| A new measurement (perimeter, % coverage, cost estimate) | New pure function in `measurement/lib/`, new readout component                              | Painting untouched                 |
| Multiple paint colors/layers                             | Change `paintedMask` from `Uint8Array` of 0/1 to layer ids                                  | Tools + measurement read by layer  |
| Undo/redo                                                | Tools return a `PaintChange` (face ids + before/after); push to a history slice             | Tools already return changed faces |
| Export painted region                                    | Pure function in `painting/lib/` that reads `paintedMask`                                   | —                                  |

```ts
/** Contract every paint tool implements. */
interface PaintTool {
  id: string;
  label: string;
  /** Apply the tool at a hit point; returns the face indices that changed. */
  apply(surface: PaintSurface, hit: PaintHit, settings: PaintSettings): Uint32Array;
}
```

### 4.5 State design (zustand)

- **One store**, `store/useAppStore.ts`, built from slices (`paintSlice`, `modelSlice`,
  `measurementSlice`). Each slice file < 200 lines.
- Components **always** read with a selector: `useAppStore(s => s.brushRadius)` — never
  `useAppStore()` (that re-renders on every change).
- Inside `useFrame` or event handlers, read with `useAppStore.getState()` — no subscription.
- Store holds only **serializable, small** values. Buffers/meshes live in refs.

---

## Part 5 — Coding rules

### 5.1 Size limits (enforced by ESLint)

- **Every file ≤ 200 lines** (`max-lines: 200`, blank lines and comments included). This applies to
  components, hooks, lib files, slices, and tests.
- **Every function/component ≤ 60 lines** (`max-lines-per-function: 60`) — keeps components split.
- When a file approaches ~150 lines, split it **before** it hits the limit: extract a hook, a
  sub-component, or a pure `lib/` function.
- Max 4 parameters per function; pass an options object beyond that.

### 5.2 Comments (mandatory)

**Every file starts with a header comment** describing what it does and why it exists:

```ts
/**
 * @file triangleArea.ts
 * @description Pure math for computing the area of triangles in a BufferGeometry.
 *   Used by the measurement feature to total the painted surface area.
 *   No React, no scene side effects — fully unit-tested in triangleArea.test.ts.
 */
```

**Every function, hook and component has a JSDoc block directly above it:**

```ts
/**
 * Computes the area of one triangle given its three corners.
 * Uses half the magnitude of the cross product of two edges: |AB × AC| / 2.
 *
 * @param a - First vertex (world or model space, all three must match)
 * @param b - Second vertex
 * @param c - Third vertex
 * @returns Area in the same units² as the input coordinates
 */
export function triangleArea(a: Vector3, b: Vector3, c: Vector3): number { … }
```

```tsx
/**
 * Renders a mesh that the user can paint by clicking or dragging.
 * Owns the PaintSurface for its geometry and forwards pointer hits to the active tool.
 *
 * @param props.geometry - Source geometry (indexed or not; converted internally)
 * @param props.unitScale - Meters per model unit, used for real-world area
 */
export function PaintableMesh({ geometry, unitScale }: PaintableMeshProps) { … }
```

- Types/interfaces and their non-obvious fields get `/** … */` comments too.
- Inline comments explain **why**, not what. Math and GPU-buffer code must explain the math.
- No commented-out code. No `TODO` without a short reason.

### 5.3 TypeScript

- `strict: true`, `noUncheckedIndexedAccess: true`, `noImplicitOverride: true`.
- No `any`. Use `unknown` + narrowing. No non-null `!` except on R3F refs inside effects, with a comment.
- Explicit return types on exported functions in `.ts` files (lint-enforced). Components in
  `.tsx` may infer their JSX return type.
- Props typed with a named `type XProps = {…}` above the component.

### 5.4 Imports

- Use the `@/` alias for anything outside the current feature: `import { useAppStore } from '@/store/useAppStore'`.
- Relative imports only within the same feature folder.
- Import order (by convention, not lint-enforced): external packages → `@/` → relative → styles.
- Import three.js **by name** from `three` (`import { Vector3 } from 'three'`), never `import * as THREE`.

---

## Part 6 — Best practices

### 6.1 React (from Vercel's _React Best Practices_, adapted to a client-only 3D app)

Vercel orders its 40+ rules into 8 categories by impact. What applies here:

1. **Eliminate waterfalls (CRITICAL).** Start loading the model as soon as it's selected, not after
   the canvas mounts. Use `useGLTF.preload(url)` from the model registry. Never chain effects where
   effect B waits for state that effect A sets — compute it directly.
2. **Bundle size (CRITICAL).**
   - The 3D viewport is heavy (three + R3F + drei ≈ several hundred KB). Load it with
     `React.lazy(() => import('@/features/viewer/components/Viewport'))` + `<Suspense>` so the UI
     shell paints first.
   - **No barrel files**; import from the exact module path so tree-shaking and dev startup stay fast.
   - Import drei helpers individually; don't pull in unused ones.
   - Load `three-mesh-bvh` and model-optimization code only where needed.
   - Check with `npx vite-bundle-visualizer` at the end of each step.
3. **Server-side performance / client data fetching.** Not applicable (no server). Model files
   are static assets, cached by the browser; use `Suspense` for loading states.
4. **Re-render optimization (HIGH for us).**
   - zustand selectors on every read; split components so a slider change doesn't re-render the Canvas.
   - Keep the `<Canvas>` subtree isolated from UI state — UI panels are **siblings** of the Canvas, not children.
   - Don't store derived state; compute it (e.g. percent painted = painted / total, computed in render).
   - Lazy state init: `useState(() => expensive())`.
   - Don't define components inside components.
   - Stable callbacks (`useCallback`) only when passed to memoized children or used as effect deps.
   - Avoid cascading `useEffect`s; prefer event handlers and derived values.
5. **Rendering performance.** `frameloop="demand"` + `invalidate()` — no 60fps render when idle.
   Cap `dpr={[1, 2]}`.
6. **Advanced patterns.** Use refs for values that change often but don't need a re-render
   (hover point, pointer-down flag). `useEffectEvent`-style patterns for handlers read in effects.
7. **JavaScript performance.** Typed arrays for per-face data; single-pass loops (combine
   iterations); no array allocations inside pointer-move handlers; `Set`/typed-array lookups
   instead of `Array.includes` in hot paths.

### 6.2 Three.js

- **Reuse, don't recreate:** geometries, materials and `Vector3` temporaries are created once
  (module-level scratch vectors in `lib/` files, or `useMemo`), never inside loops or per frame.
- **Dispose** geometries, materials and textures when a model is swapped
  (`shared/lib/disposeObject.ts`). R3F auto-disposes JSX-created objects; manually created ones are
  our responsibility.
- **Partial buffer updates:** after painting, update only the changed range of the color attribute
  (`attribute.addUpdateRange(start, count)` + `needsUpdate = true`) instead of re-uploading the whole buffer.
- **Non-indexed geometry for painting:** indexed geometry shares vertices between triangles, so
  coloring one triangle bleeds into neighbors. Convert with `geometry.toNonIndexed()` once.
- **Vertex colors** (`vertexColors: true` on the material) multiply with the texture, letting paint
  sit on top of a scanned texture. Use `MeshStandardMaterial`.
- **Units:** three.js is unitless. Every model declares `unitScale` (meters per unit) in the
  registry; area in m² = model area × unitScale². Always account for the mesh's world scale.
- **Color space:** set `renderer.outputColorSpace = SRGBColorSpace` (R3F default) and convert paint
  colors with `Color.convertSRGBToLinear()` when writing to vertex colors.
- **Raycasting:** use `three-mesh-bvh` (`computeBoundsTree`, `acceleratedRaycast`) for any mesh
  over a few thousand triangles; compute the BVH once after geometry prep.
- **Normalize models:** center at origin and fit to a known size on load (`models/lib/normalizeModel.ts`),
  but keep track of the scale applied so area stays correct.

### 6.3 React Three Fiber (from the R3F "Performance pitfalls" docs)

- **Never `setState` inside `useFrame`** or pointer-move. Mutate refs; call `invalidate()`.
- **Never create objects in `useFrame`.** Reuse scratch vectors.
- Use `useLoader`/`useGLTF` — they cache; loading the same URL twice is free.
- Use `onPointerDown/Move/Up` on the mesh; call `e.stopPropagation()` so only the front-most hit paints.
- Disable `OrbitControls` while painting (hold a modifier key or use a "paint mode" toggle) so a
  drag doesn't rotate the model.
- Keep `<Canvas>` props stable (no inline object literals that change every render).
- Wrap loaders in `<Suspense fallback={…}>` and add an error boundary for failed model loads.

### 6.4 Testing

- Every `lib/` file has a colocated `*.test.ts`. Geometry math is tested with known shapes
  (unit square → area 1, unit cube → surface 6, right triangle 3-4 → 6).
- Components get light tests only where logic lives (e.g. `AreaReadout` formatting).
- `npm test` must pass before a step is considered done.

---

## Part 7 — The build plan

Each step has: **Goal · Concepts · Files · Implementation · Acceptance criteria · Pitfalls**.
Do not start a step until the previous one meets its acceptance criteria. At the end of each step:
run `npm run lint`, `npm run typecheck`, `npm test`, and commit.

---

### Step 0 — Scaffolding and tooling

**Goal.** An empty, fully configured project that matches Part 3 exactly, with linting that
enforces the rules in Part 5. No 3D yet.

**Concepts.** Vite project layout, TS path aliases, ESLint flat config, why tooling enforces rules
instead of relying on memory.

**Files.**
`package.json`, `vite.config.ts`, `tsconfig.json`, `tsconfig.node.json`, `eslint.config.js`,
`.prettierrc`, `.gitignore`, `index.html`, `src/main.tsx`, `src/app/App.tsx`,
`src/app/App.module.css`, `src/styles/tokens.css`, `src/styles/global.css`, `src/test/setup.ts`,
`docs/idea.md`.

**Implementation.**

1. `git init`; create `.gitignore` (node_modules, dist, coverage, `assets-src/scans/` large files).
2. Write the Vite files by hand (no `npm create vite` — it would add demo files to delete) in the
   Part 3 tree.
3. Install runtime deps: `three @react-three/fiber @react-three/drei three-mesh-bvh zustand`.
4. Install dev deps: `vite @vitejs/plugin-react typescript @types/react @types/react-dom
@types/three @types/node vitest jsdom @testing-library/react @testing-library/dom
@testing-library/jest-dom eslint @eslint/js typescript-eslint globals eslint-plugin-react-hooks
eslint-plugin-react-refresh eslint-config-prettier prettier`.
5. `tsconfig.json`: strict flags from 5.3, `"types": ["vite/client"]` (CSS module typings, so no
   `vite-env.d.ts` file), `"paths": { "@/*": ["./src/*"] }`. Mirror the alias in `vite.config.ts`.
6. `eslint.config.js`:
   - `max-lines: ["error", { max: 200 }]`
   - `max-lines-per-function: ["error", { max: 60 }]` (off in `*.test.*` — describe blocks)
   - `max-params: ["error", 4]`
   - `react-hooks` recommended, `react-refresh` (Vite preset)
   - `no-restricted-imports` zones implementing Part 4.1 — one block per zone, each listing its
     **full** pattern set (ESLint replaces, not merges, a rule across blocks). Also bans `../../`.
   - `no-restricted-syntax`: forbid `import * as THREE from 'three'` and barrel re-exports
     (`export * from`, `export { x } from`)
   - `@typescript-eslint/no-explicit-any: error`,
     `@typescript-eslint/explicit-module-boundary-types` on `.ts` files
7. `package.json` scripts: `dev`, `build`, `preview`, `lint`, `typecheck` (`tsc --noEmit`),
   `test`, `test:watch`, `format`.
8. `vite.config.ts` → `test: { environment: 'jsdom', setupFiles: 'src/test/setup.ts' }`.
9. `App.tsx` renders a full-screen layout with an empty viewport area and a placeholder side panel.
10. Move `idea.txt` → `docs/idea.md`. Root now contains only config files, README.md, CLAUDE.md.

**Acceptance criteria.**

- `npm run dev` shows the empty layout.
- `npm run lint`, `npm run typecheck`, `npm test` (App smoke test) all pass.
- A deliberately 201-line file makes lint fail, and so do boundary violations (shared → feature,
  lib → react, feature → foreign component, `../../`) — verify, then delete them.
- Root and `src/` match the Part 3 tree; no leftover Vite demo files.

**Pitfalls.** Vite's template ships `App.css`, `index.css` and an `assets/` folder — remove them.
Keep `index.html` in root (Vite requires it).

---

### Step 1 — A spinning cube with rotate / zoom

**Goal.** A lit cube in the browser that the user can rotate, zoom and pan. It spins gently until
the user interacts.

**Concepts.**

- **Scene graph:** scene → objects; a **mesh** = **geometry** (shape: vertices + triangles) +
  **material** (how the surface reacts to light).
- **Camera:** `PerspectiveCamera` (fov, aspect, near, far) — what "looking at" 3D means.
- **Renderer / render loop:** R3F's `<Canvas>` creates the WebGL renderer and runs the loop;
  `useFrame` runs code every frame.
- **Lights:** ambient (flat fill) + directional (shading so faces look different).
- **OrbitControls:** turns mouse drag / wheel into camera orbit / zoom.

**Files.**

- `features/viewer/components/Viewport.tsx` — `<Canvas>` with camera, `dpr`, frameloop; lazy-loaded from `App`.
- `features/viewer/components/SceneLights.tsx` — ambient + directional lights.
- `features/viewer/components/CameraRig.tsx` — `OrbitControls` with damping and zoom limits.
- `features/viewer/config.ts` — camera position, fov, min/max distance, auto-rotate speed.
- `features/models/components/ProceduralCube.tsx` — `boxGeometry` + `meshStandardMaterial`.
- `features/models/components/ModelStage.tsx` — decides which model to render (only the cube for now).

**Implementation.**

1. `App.tsx`: `const Viewport = lazy(() => import('@/features/viewer/components/Viewport'))`,
   wrapped in `<Suspense fallback={<LoadingOverlay/>}>` (bundle-size rule 6.1.2).
2. `Viewport`: `<Canvas camera={CAMERA} dpr={[1, 2]} frameloop="demand">` where `CAMERA` is a
   module-level constant from `config.ts` (stable props rule 6.3).
3. `CameraRig`: drei `<OrbitControls enableDamping autoRotate autoRotateSpeed={…} minDistance maxDistance makeDefault />`.
   Auto-rotate stops on first interaction (`onStart` → set a ref, disable autoRotate).
   With `frameloop="demand"`, damping and auto-rotate need frames: OrbitControls in drei calls
   `invalidate` on change; for auto-rotate, keep `frameloop="always"` until interaction **or** use
   `frameloop="demand"` and drive `invalidate()` from a small `useFrame`-free interval — document
   whichever is chosen in `config.ts`.
4. `SceneLights`: `ambientLight intensity≈0.5`, `directionalLight position=[5,5,5]`.
5. `ProceduralCube`: `<mesh><boxGeometry args={[1,1,1]} /><meshStandardMaterial color="#ddd" /></mesh>`.
6. Add drei `<Stats />` behind a dev-only flag (`import.meta.env.DEV`).

**Acceptance criteria.**

- Cube visible, shaded (faces differ in brightness), spins slowly.
- Drag rotates, wheel zooms (within limits), right-drag pans.
- Resizing the window keeps the cube proportioned (R3F handles aspect).
- Initial JS bundle for the shell is separate from the 3D chunk (check `npm run build` output).

**Pitfalls.** Forgetting lights with `MeshStandardMaterial` → black cube. Inline `camera={{…}}`
object recreated every render. Putting UI panels _inside_ `<Canvas>` (they must be DOM siblings).

---

### Step 2 — Click the cube to paint it

**Goal.** Clicking or dragging on the cube paints the triangles under the cursor with the selected
color and brush size. Painted regions stay painted. A toolbar selects color, brush size and
paint/erase. Orbit is disabled while painting.

**Concepts.**

- **Triangles:** every mesh is triangles. A `BufferGeometry` stores `position` (xyz per vertex),
  optional `index` (which 3 vertices form each triangle), `normal`, `uv`, and optional `color`.
  A box = 6 faces × 2 triangles = 12 triangles.
- **Indexed vs non-indexed:** indexed geometry shares vertices; coloring a vertex colors every
  triangle using it. For per-triangle paint, convert to **non-indexed** (each triangle owns its
  3 vertices). Face `i` then uses vertices `3i, 3i+1, 3i+2`.
- **Raycasting:** pointer (pixels) → normalized device coords → a ray from the camera → first
  triangle it intersects. R3F does this for us and gives `event.faceIndex`, `event.point`.
- **Vertex colors:** a `color` attribute (rgb per vertex) + `vertexColors: true` on the material.
- **Brush:** a single triangle is too coarse on the cube and too tiny on a scan; paint all faces
  whose centroid is within `radius` of the hit point. On the 12-triangle cube, subdivide the box
  (`boxGeometry args={[1,1,1,20,20,20]}`) so the brush has resolution.

**Files.**

- `painting/types.ts` — `PaintSurface`, `PaintHit`, `PaintSettings`, `PaintTool`.
- `painting/lib/paintSurface.ts` — `createPaintSurface(geometry)`, `recolorFaces(surface, faces, color)`.
- `painting/lib/faceMask.ts` — `setFaces(mask, faces, value)` → returns faces that actually changed.
- `painting/lib/brushSelect.ts` — `selectFacesInRadius(surface, point, radius)`.
- `painting/tools/brushTool.ts`, `painting/tools/eraserTool.ts`, `painting/tools/registry.ts`.
- `painting/hooks/usePaintSurface.ts` — builds the `PaintSurface` once per geometry (`useMemo`), disposes on change.
- `painting/hooks/usePaintPointer.ts` — pointer down/move/up handlers; dragging flag in a ref; throttled.
- `painting/components/PaintableMesh.tsx` — renders the mesh with the surface geometry and handlers.
- `painting/components/BrushCursor.tsx` — a small ring at the hover point showing brush size.
- `store/paintSlice.ts` — `activeToolId`, `color`, `brushRadius`, `isPaintMode`.
- `ui/components/Toolbar.tsx`, `ColorPicker.tsx`, `BrushSizeSlider.tsx`; `shared/components/Button.tsx`, `Slider.tsx`.
- Tests: `faceMask.test.ts`, `brushSelect.test.ts`, `paintSurface.test.ts`.

**Implementation.**

1. `createPaintSurface(geometry)`:
   - `const g = geometry.index ? geometry.toNonIndexed() : geometry.clone()`.
   - Add a `color` attribute filled with the base color (white = no tint over a texture).
   - `faceCount = position.count / 3`; allocate `paintedMask = new Uint8Array(faceCount)`.
   - Precompute `faceCentroids` (Float32Array, 3 per face) in one loop. (Areas are added in Step 3
     in the **same** loop — single-pass rule.)
2. `selectFacesInRadius`: loop all centroids, compare squared distance to `radius²` (no `sqrt`),
   push into a pre-allocated `Uint32Array` scratch buffer. (Step 5 upgrades this to a BVH query.)
3. `brushTool.apply`: select faces → `setFaces(mask, faces, 1)` → `recolorFaces(changed, color)`.
   `eraserTool` sets 0 and restores base color.
4. `recolorFaces`: for each face `f`, write rgb to vertices `3f..3f+2`; track min/max changed
   index; call `colorAttr.addUpdateRange(min*3, (max-min+1)*3)`; `needsUpdate = true`.
5. `usePaintPointer`:
   - `onPointerDown`: if paint mode, `e.stopPropagation()`, set `isDragging` ref, apply tool.
   - `onPointerMove`: if dragging, apply tool (throttled to ~every animation frame).
   - `onPointerUp` / `onPointerLeave`: clear ref.
   - After applying: `invalidate()`.
   - Read `color`, `brushRadius`, tool via `useAppStore.getState()` (no re-render on pointer move).
6. Paint mode: a toolbar toggle (and holding `Shift` as a shortcut). When on, `OrbitControls`
   `enabled={false}`.
7. `BrushCursor`: position a ring mesh from a ref on hover; orient to the hit face normal.

**Acceptance criteria.**

- Click paints a round-ish patch; drag paints a continuous stroke; eraser removes paint.
- Painting never bleeds to triangles outside the brush.
- Orbit doesn't move while painting; works normally when paint mode is off.
- Changing color only affects new strokes.
- React DevTools Profiler: pointer-move does **not** re-render React components.
- All `painting/lib` tests pass.

**Pitfalls.** Forgetting `toNonIndexed()` → colors bleed. Forgetting `vertexColors` on the
material → nothing shows. Painting on both front and back faces → `stopPropagation`. Allocating
arrays per pointer-move → GC stutter.

---

### Step 3 — Calculate the painted area

**Goal.** A panel shows the painted area, the total surface area, and percent coverage, in real
units (cm² / m²), updating live while painting.

**Concepts.**

- **Triangle area:** for corners A, B, C: `area = |(B − A) × (C − A)| / 2` (cross product magnitude
  = parallelogram area; half is the triangle).
- **Surface area** of a region = sum of its triangles' areas.
- **Scale:** geometry is in model units. If the mesh is scaled by `s`, area scales by `s²`. Real
  units need `unitScale` (meters per unit) → `m² = units² × unitScale²`.
- **Incremental totals:** don't re-sum every triangle on each stroke; add/subtract only the areas
  of faces whose mask changed.

**Files.**

- `measurement/lib/triangleArea.ts` — `triangleArea(a, b, c)` and `computeFaceAreas(geometry)` → `Float32Array`.
- `measurement/lib/surfaceArea.ts` — `sumAreas(faceAreas, mask?)` (full recompute, used for verification/tests).
- `measurement/lib/units.ts` — `toSquareMeters(area, unitScale, meshScale)`, `formatArea(m2)` → "12.4 cm²".
- `measurement/components/AreaReadout.tsx` — reads from store via selectors.
- `store/measurementSlice.ts` — `paintedArea`, `totalArea` (model units²), `unitScale`.
- `ui/components/InfoPanel.tsx` — hosts `AreaReadout`.
- Tests: `triangleArea.test.ts`, `surfaceArea.test.ts`, `units.test.ts`.

**Implementation.**

1. Extend `createPaintSurface` to compute `faceAreas` via `computeFaceAreas` in the same loop as
   centroids; store `totalArea`.
2. `faceMask.setFaces` already returns changed faces; tools now add/subtract
   `faceAreas[f]` to `surface.paintedArea` for each changed face.
3. After each stroke step, push `paintedArea` to the store — **throttled** (e.g. 10×/s) so the
   readout updates smoothly without re-rendering every pointer event.
4. `AreaReadout` computes percent and formatted strings **during render** (derived, not stored).
5. Use the mesh's world scale (`mesh.getWorldScale`) once at surface creation, not per stroke.
6. Guard against floating-point drift: on pointer-up, optionally re-sum with `sumAreas` and replace
   the running total (cheap for small meshes; configurable).

**Acceptance criteria.**

- Unit cube (`unitScale = 0.1` → 10 cm cube): total area reads **600 cm²**.
- Painting one entire face reads ≈ **100 cm²** (±1 triangle depending on brush).
- Tests: right triangle (0,0,0),(3,0,0),(0,4,0) → 6; unit square as 2 triangles → 1; subdivided
  unit cube → 6; mask of half the faces of a uniform grid → half the area.
- Readout doesn't cause the Canvas to re-render (verify in Profiler).

**Pitfalls.** Mixing local and world coordinates. Forgetting scale is squared for area. Brush
granularity: area counts **whole triangles**, so edges are jagged — expected; finer meshes → more
accurate. Document this in the UI tooltip.

---

### Step 4 — Scan a real object (photogrammetry)

**Goal.** Produce an optimized, correctly scaled `.glb` of a real small object (shoe, mug, fruit)
in `public/models/`, and document the process in `docs/scanning-guide.md`.

This step is mostly **offline work** — no app code except one optimization script.

**Concepts.**

- **Photogrammetry:** software finds matching features across overlapping photos, solves camera
  positions (Structure from Motion), builds a dense point cloud, meshes it, and projects the photos
  as a texture.
- **Why real scale is lost:** photos alone don't know size. We fix it with a reference measurement.
- **Why optimization:** raw scans are 500k–2M triangles and 50–200 MB; the browser wants
  ~50–150k triangles and < 10 MB.

**Files.**

- `docs/scanning-guide.md` — the shooting + reconstruction checklist below.
- `assets-src/scans/<object>/` — raw export (OBJ/GLB + textures).
- `scripts/optimize-model.mjs` — runs gltf-transform on a raw file → `public/models/<object>.glb`.
- `package.json` script: `"optimize-model": "node scripts/optimize-model.mjs"`.

**Implementation.**

1. **Shoot** (any phone camera):
   - Matte, textured object (avoid shiny/transparent; a mug with a pattern is better than a plain white one).
   - Place it on a textured surface (newspaper) with soft, even light; no hard shadows; no flash.
   - Walk around it: 30–40 photos, ~10° apart, at 2–3 heights (low, eye-level, top-down).
   - 60–80% overlap between consecutive photos; object fills most of the frame; don't move the object.
   - **Measure one real dimension** (e.g. mug height in cm) and write it down.
2. **Reconstruct:**
   - _Meshroom (Windows, needs an NVIDIA GPU for CUDA depth maps):_ drag photos in → Start →
     wait → export from the `Texturing` node (OBJ + textures).
   - _KIRI Engine (Android, cloud):_ photo scan mode → upload → download as GLB/OBJ.
3. **Clean (optional, Blender):** delete the ground plane and floating bits, fill holes, apply
   transforms, scale so the measured dimension is correct in meters (e.g. 0.095 for a 9.5 cm mug),
   export GLB.
4. **Optimize** with `scripts/optimize-model.mjs` (wrapping `@gltf-transform`):
   `weld` → `simplify` (target ~100k triangles) → `resize` textures to 2048 → `webp` → `meshopt` or
   `draco` → write to `public/models/`.
5. Record the object's `unitScale` (1 if scaled to meters in Blender; otherwise measured-cm ÷
   model-units) — used in Step 5.

**Acceptance criteria.**

- `public/models/<object>.glb` < 10 MB, < 150k triangles, textured, one mesh (or documented if several).
- Opens correctly in https://gltf-viewer.donmccurdy.com.
- The known real dimension, multiplied by `unitScale`, is correct within ~2%.
- `docs/scanning-guide.md` lets someone else repeat the process.

**Pitfalls.** Reflective/transparent/featureless objects fail to reconstruct. Moving the object
between photos. Too few top-down shots → hole on top. Meshroom without an NVIDIA GPU falls back to
a much lower-quality draft mesh — use KIRI Engine instead. Draco-compressed files need the Draco
decoder (drei `useGLTF` handles it; Meshopt is lighter).

---

### Step 5 — Swap the cube for the scanned object

**Goal.** Choose between the cube and scanned model(s) from the UI. Painting and area measurement
work on the scan exactly as on the cube — with real-world area in cm².

**Concepts.**

- **glTF/GLB:** the "JPEG of 3D"; one binary file with meshes, materials and textures.
- **Normalization:** scans come off-center and at arbitrary scale; center and fit to view without
  losing the unit scale.
- **BVH:** a bounding-volume tree makes raycasting and brush queries O(log n) instead of O(n) — needed
  at 100k triangles.
- **Paint over texture:** vertex colors multiply with the texture; unpainted vertices are white (no tint).

**Files.**

- `models/types.ts` — `ModelDefinition { id, label, source: 'procedural' | 'gltf', url?, unitScale }`.
- `models/registry.ts` — array of definitions (cube + each scan); calls `useGLTF.preload` for each.
- `models/components/ScannedModel.tsx` — `useGLTF(url)`, extracts the mesh geometry + material, renders `PaintableMesh`.
- `models/lib/prepareGeometry.ts` — merges multiple meshes if needed, bakes transforms, computes BVH.
- `models/lib/normalizeModel.ts` — returns center offset + fit scale; the fit scale is folded into `meshScale` for area.
- `store/modelSlice.ts` — `selectedModelId`.
- `ui/components/ModelPicker.tsx`.
- `shared/lib/disposeObject.ts` — disposes geometry/material/textures when a model is swapped.
- `shared/components/ErrorBoundary.tsx` — shows a message if a model fails to load.
- Update `painting/lib/brushSelect.ts` → BVH `shapecast` with a sphere.

**Implementation.**

1. Register `three-mesh-bvh` once (patch `BufferGeometry.prototype.computeBoundsTree` and
   `Mesh.prototype.raycast = acceleratedRaycast`) in `shared/lib/setupBvh.ts`, imported by `Viewport`.
2. `prepareGeometry`: take the GLTF scene, collect meshes, apply world matrices, merge with
   `mergeGeometries` if > 1 mesh, then `createPaintSurface` (non-indexed + colors + areas + centroids)
   and `computeBoundsTree()` on the **final** non-indexed geometry.
3. Material: clone the scan's material, set `vertexColors = true`; base color attribute = white.
4. `ModelStage` renders `ProceduralCube` or `ScannedModel` based on `selectedModelId`, inside
   `<Suspense>` + `<ErrorBoundary>`. Changing model resets `paintedArea` and disposes the old surface.
5. Brush selection via BVH: `bvh.shapecast({ intersectsBounds: box ↔ sphere, intersectsTriangle:
centroid-in-sphere → collect faceIndex })`. Keep the brute-force version for the cube/tests.
6. Brush radius in the UI is shown in cm and converted to model units via `unitScale`.
7. Camera: use drei `<Bounds fit clip observe>` so any model is framed on load.

**Acceptance criteria.**

- Model picker switches between cube and scan; each loads framed and centered.
- Painting on the scan is smooth (no visible lag) while dragging at 100k triangles.
- Painting a known region gives a plausible area (e.g. painting the whole side of a mug of
  measured radius r and height h ≈ 2πrh within ~5%).
- Switching models doesn't leak GPU memory (check `renderer.info.memory` in `<Stats>` / console).
- Lint, typecheck, tests all pass; no file > 200 lines.

**Pitfalls.** Computing BVH before `toNonIndexed()` (faceIndex mismatch). Scaling the mesh for
display and forgetting to include that scale in area. Multi-material scans (several meshes) — merge
or paint each. Textures appearing washed out → color space.

---

## Part 8 — Checklists and reference

### 8.1 Definition of Done (every step, every PR)

- [ ] Every new file has a `@file` header comment.
- [ ] Every function / hook / component has a JSDoc block.
- [ ] No file > 200 lines; no function > 60 lines.
- [ ] File placed according to Part 3.2; no stray files.
- [ ] No `any`, no `import * as THREE`, no barrel files.
- [ ] Zustand reads use selectors; no `setState` in `useFrame`/pointer-move.
- [ ] New three.js objects are reused or disposed.
- [ ] `lib/` changes have tests.
- [ ] `npm run lint && npm run typecheck && npm test && npm run build` pass.

### 8.2 Commands

| Command                                | Purpose                                             |
| -------------------------------------- | --------------------------------------------------- |
| `npm run dev`                          | Start dev server                                    |
| `npm run build`                        | Production build                                    |
| `npm run preview`                      | Serve the build                                     |
| `npm run lint`                         | ESLint (includes line limits and import boundaries) |
| `npm run typecheck`                    | `tsc --noEmit`                                      |
| `npm test`                             | Vitest once                                         |
| `npm run format`                       | Prettier write                                      |
| `npm run optimize-model -- <in> <out>` | Optimize a raw scan into `public/models/`           |

### 8.3 Future extensions (designed for, not built)

- Fill tool (flood-fill connected faces by normal angle), lasso tool.
- Multiple named regions/colors with per-region area.
- Undo/redo (history slice of `PaintChange`s).
- Save/load painted regions (JSON of face indices per model id).
- Sub-triangle precision (split triangles on the brush edge) for more accurate area.
- Mobile touch painting (pinch-to-zoom vs one-finger paint).

### 8.4 References

- Vercel — Introducing React Best Practices: https://vercel.com/blog/introducing-react-best-practices
- React Three Fiber — Performance pitfalls: https://r3f.docs.pmnd.rs/advanced/pitfalls
- three.js manual — https://threejs.org/manual/ (Fundamentals, Picking, Cleanup)
- three.js — BufferGeometry: https://threejs.org/docs/#api/en/core/BufferGeometry
- three-mesh-bvh: https://github.com/gkjohnson/three-mesh-bvh
- drei: https://drei.docs.pmnd.rs
- zustand: https://zustand.docs.pmnd.rs
- glTF Transform: https://gltf-transform.dev
- Meshroom: https://alicevision.org/#meshroom · KIRI Engine: https://www.kiriengine.app
