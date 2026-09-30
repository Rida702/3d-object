# Scanning guide: phone photos → browser-ready 3D model

This covers Step 4 of the build plan. You end up with an optimised, correctly scaled
`public/models/<name>.glb` and a `unitScale` value for Step 5.

**Route:** use **KIRI Engine** (a phone app that reconstructs the model in the cloud). Meshroom
needs an NVIDIA GPU (CUDA) for good results; on a laptop with only Intel graphics it can only
produce a low-quality draft mesh. It's kept below as a fallback.

---

## 1. Pick the object

Good objects have **matte, textured** surfaces that stay still:

| Good                                  | Bad (reconstruction fails or has holes) |
| ------------------------------------- | --------------------------------------- |
| A mug with a printed pattern          | A plain white or glossy mug             |
| A sneaker (fabric, stitching, logos)  | Patent leather, chrome, glass           |
| An orange, a potato, a textured stone | Anything transparent or mirror-like     |

A **mug with a pattern** is the best first choice. Its body is close to a cylinder, so in Step 5
you can check the painted area against a formula (2πrh).

## 2. Measure it — before you photograph

Photos contain no scale, so the model will come out at an arbitrary size. One real measurement
fixes that.

- Measure **the height** (top to bottom, standing the way you'll photograph it) with a ruler, in cm.
  Height works best because 3D models are "Y-up", so height is the y axis.
- Also measure a second dimension (e.g. diameter) to cross-check later.
- Write both down, e.g. `height 9.5 cm, diameter 8.2 cm`.

## 3. Set up

- Put the object on a **textured surface** (newspaper, patterned cloth). The software uses the
  background to work out where the camera was.
- Use **soft, even light**: daylight near a window with no direct sun, or a cloudy day outside.
  No flash and no hard shadows.
- **Never move the object** during the shoot. You move around it.

## 4. Shoot (30–40 photos)

Walk in a full circle around the object, taking one photo about every **10°** (roughly 36 per
circle). Do this at **two or three heights**:

1. **Low ring:** camera about level with the middle of the object (~20 photos).
2. **High ring:** camera looking down at about 45° (~15 photos).
3. **Top:** 3–5 photos from almost directly above. Skipping these leaves a hole in the top.

Rules for every photo:

- The object fills **most of the frame**, and is sharp (tap to focus, hold still).
- Each photo **overlaps the previous one by 60–80%**. Small steps, not big jumps.
- Keep the same zoom level. Don't use portrait/bokeh mode or filters.

The bottom can't be captured while the object stands on it. That's fine: you'll paint the sides
and top.

## 5. Reconstruct with KIRI Engine

1. Install **KIRI Engine** on your phone and create a free account.
2. Start a new **Photo Scan** and either shoot inside the app (it guides you) or upload the photos
   from section 4.
3. Wait for the cloud processing (usually several minutes to an hour).
4. Open the result and check it: the object should be complete, with no big holes. Some of the
   table around it is normal.
5. **Export as GLB** (glTF binary). If GLB isn't offered, export **OBJ** (keep the `.mtl` and
   texture images together in one folder).
6. Copy the export to the laptop into `assets-src/scans/<name>/`, for example
   `assets-src/scans/coffee-mug/scan.glb`. This folder is git-ignored because raw scans are large.

If the result has holes or smeared areas, reshoot with more overlap and more top-down photos.

### Fallback: Meshroom (only with an NVIDIA GPU)

Drag the photos into Meshroom → **Start** → when finished, right-click the **Texturing** node →
open its folder and copy the `.obj`, `.mtl` and textures into `assets-src/scans/<name>/`.

## 6. Clean up (optional, Blender)

Skip this unless the scan includes a lot of table or floating blobs. In Blender: **File → Import**
the scan, select and delete the ground plane and loose pieces in Edit Mode, then
**File → Export → glTF 2.0 (.glb)**.

## 7. Optimise and get the scale

From the project root, pass your raw file, a kebab-case name and your height measurement:

```bash
npm run optimize-model -- assets-src/scans/coffee-mug/scan.glb coffee-mug --real-size-cm 9.5
```

The script:

- simplifies the mesh to about **100,000 triangles** (change with `--max-triangles`)
- converts textures to **2048 px WebP**
- writes **`public/models/coffee-mug.glb`**
- prints the model's size and **`unitScale`** (metres per model unit)

Example output:

```
Wrote public\models\coffee-mug.glb (3.10 MB)
Triangles: 812,344 → 99,998
Size (model units): x 1.7263, y 2, z 1.7301
unitScale = 0.0475 m per model unit
Real size: x 8.2 cm, y 9.5 cm, z 8.2 cm
```

**Check the "Real size" line** against your second measurement (the diameter here). It should
match within about 2%. If the numbers look swapped, the scan is lying on its side: rerun with
`--axis x` or `--axis z`, using whichever axis your height measurement runs along.

## 8. Verify

1. Drag `public/models/<name>.glb` into <https://gltf-viewer.donmccurdy.com>. It should look like
   your object and be textured.
2. Confirm the Step 4 targets: **< 10 MB**, **< 150k triangles**, real size within ~2%.
3. Note the name and `unitScale`. Step 5 adds them to `src/features/models/registry.ts`.

## Troubleshooting

| Problem                          | Fix                                                                              |
| -------------------------------- | -------------------------------------------------------------------------------- |
| Holes in the model               | More photos with more overlap; add top-down shots                                |
| Model is a blob or smeared       | Object moved, or photos blurry; use steadier light and hands                     |
| Shiny parts missing              | Choose a matte object, or dust it with dry shampoo/talc (washes off)             |
| Output file too big              | `--max-triangles 60000`                                                          |
| Real sizes don't match the ruler | Wrong `--axis`, or the scan is tilted: straighten it in Blender and export again |
