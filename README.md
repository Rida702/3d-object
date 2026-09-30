# 3D Object Painter

Scan a small real object (a shoe, a mug, a fruit) with any phone camera, view it in the browser,
paint regions on its surface by clicking, and get the **real-world area of the painted region**.

It's a small version of a client prototype, built in stages:

1. A spinning cube in the browser, with rotate and zoom
2. Click to paint the cube (raycasting, triangles)
3. Calculate the painted area (sum of triangle areas)
4. Scan a real object with photogrammetry (30–40 photos → 3D model)
5. Replace the cube with the scanned object

## Tech stack

- **React 19** + **TypeScript**, built with **Vite**
- **three.js** with **React Three Fiber** and **drei**
- **three-mesh-bvh** for fast raycasting on large meshes
- **zustand** for state
- **Vitest** for tests, **ESLint** + **Prettier** for code quality
- **Meshroom** (Windows) or **KIRI Engine** (Android) for photogrammetry
- **glTF Transform** (and optionally **Blender**) to optimize scanned models

See [CLAUDE.md](CLAUDE.md) for the architecture, coding rules and the step-by-step build plan.
