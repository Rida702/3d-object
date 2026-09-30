/**
 * @file optimize-model.mjs
 * @description Turns a raw photogrammetry export into a browser-ready model (CLAUDE.md Step 4):
 *   reads a .glb/.gltf/.obj, welds and simplifies the mesh to a triangle budget, resizes and
 *   re-encodes textures as WebP, removes unused data, writes public/models/<name>.glb and
 *   prints the model's size plus the `unitScale` to put in the model registry.
 *
 *   Positions are NOT quantized/compressed: the paint + area code reads raw float positions.
 *
 * Usage:
 *   npm run optimize-model -- <input> <name> [--real-size-cm 9.5] [--axis y] [--max-triangles 100000]
 */
import { mkdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { parseArgs } from 'node:util';
import { getBounds, NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { dedup, prune, simplify, textureCompress, weld } from '@gltf-transform/functions';
import { MeshoptDecoder, MeshoptSimplifier } from 'meshoptimizer';
import obj2gltf from 'obj2gltf';
import sharp from 'sharp';

const OUTPUT_DIR = 'public/models';
const DEFAULT_MAX_TRIANGLES = 100_000;
const TEXTURE_SIZE = 2048;
/** Max simplification error, relative to mesh size (1%): lets simplify reach the budget. */
const SIMPLIFY_ERROR = 0.01;
const AXES = { x: 0, y: 1, z: 2 };
const USAGE =
  'Usage: npm run optimize-model -- <input.glb|.gltf|.obj> <name> ' +
  '[--real-size-cm <n>] [--axis x|y|z] [--max-triangles <n>]';

/**
 * Parses and validates command-line arguments.
 * @returns {{ input: string, name: string, realSizeCm?: number, axis: 'x'|'y'|'z', maxTriangles: number }}
 */
function parseCli() {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      'real-size-cm': { type: 'string' },
      axis: { type: 'string', default: 'y' },
      'max-triangles': { type: 'string', default: String(DEFAULT_MAX_TRIANGLES) },
    },
  });
  const [input, name] = positionals;
  if (!input || !name) throw new Error(USAGE);
  if (!/^[a-z0-9-]+$/.test(name)) throw new Error('Name must be kebab-case, e.g. "coffee-mug".');
  if (!(values.axis in AXES)) throw new Error('--axis must be x, y or z.');

  const realSizeCm = values['real-size-cm'] ? Number(values['real-size-cm']) : undefined;
  if (realSizeCm !== undefined && !(realSizeCm > 0)) throw new Error('--real-size-cm must be > 0.');
  const maxTriangles = Number(values['max-triangles']);
  if (!(maxTriangles > 0)) throw new Error('--max-triangles must be > 0.');

  return { input, name, realSizeCm, axis: values.axis, maxTriangles };
}

/**
 * Loads a model into a glTF-Transform document. OBJ files are converted to GLB first.
 * @param {NodeIO} io - Configured IO
 * @param {string} input - Input file path
 * @returns {Promise<import('@gltf-transform/core').Document>}
 */
async function readDocument(io, input) {
  if (path.extname(input).toLowerCase() !== '.obj') return io.read(input);
  const glb = await obj2gltf(input, { binary: true });
  return io.readBinary(new Uint8Array(glb));
}

/**
 * Counts triangles across all mesh primitives.
 * @param {import('@gltf-transform/core').Document} document
 * @returns {number}
 */
function countTriangles(document) {
  let triangles = 0;
  for (const mesh of document.getRoot().listMeshes()) {
    for (const primitive of mesh.listPrimitives()) {
      const indices = primitive.getIndices();
      const vertexCount = indices
        ? indices.getCount()
        : primitive.getAttribute('POSITION').getCount();
      triangles += vertexCount / 3;
    }
  }
  return triangles;
}

/**
 * Runs the optimization pipeline in place.
 * @param {import('@gltf-transform/core').Document} document
 * @param {number} maxTriangles - Triangle budget
 */
async function optimize(document, maxTriangles) {
  await MeshoptSimplifier.ready;
  const ratio = Math.min(1, maxTriangles / countTriangles(document));
  await document.transform(
    dedup(),
    weld(), // merge duplicate vertices so the simplifier sees connected surfaces
    simplify({ simplifier: MeshoptSimplifier, ratio, error: SIMPLIFY_ERROR }),
    textureCompress({ encoder: sharp, targetFormat: 'webp', resize: [TEXTURE_SIZE, TEXTURE_SIZE] }),
    prune(),
  );
}

/**
 * Measures the model's bounding-box size in model units.
 * @param {import('@gltf-transform/core').Document} document
 * @returns {[number, number, number]} Size along x, y, z
 */
function measureSize(document) {
  const scene = document.getRoot().getDefaultScene() ?? document.getRoot().listScenes()[0];
  if (!scene) throw new Error('Model has no scene.');
  const { min, max } = getBounds(scene);
  return [max[0] - min[0], max[1] - min[1], max[2] - min[2]];
}

/**
 * Prints the before/after summary and the unit scale (if a real size was given).
 * @param {object} report - Values to print
 */
function printReport({ outputPath, bytes, trianglesBefore, trianglesAfter, meshCount, size, cli }) {
  const fmt = (n, digits = 4) => Number(n.toFixed(digits)).toString();
  console.log(`\nWrote ${outputPath} (${(bytes / 1024 / 1024).toFixed(2)} MB)`);
  console.log(
    `Triangles: ${trianglesBefore.toLocaleString()} → ${trianglesAfter.toLocaleString()}`,
  );
  console.log(`Meshes: ${meshCount}${meshCount > 1 ? ' (Step 5 merges them)' : ''}`);
  console.log(`Size (model units): x ${fmt(size[0])}, y ${fmt(size[1])}, z ${fmt(size[2])}`);

  if (cli.realSizeCm === undefined) {
    console.log('\nNo --real-size-cm given: rerun with your measurement to get unitScale.');
    return;
  }
  const modelSize = size[AXES[cli.axis]];
  const unitScale = cli.realSizeCm / 100 / modelSize; // metres per model unit
  const toCm = (units) => fmt(units * unitScale * 100, 1);
  console.log(`\nunitScale = ${fmt(unitScale, 6)} m per model unit`);
  console.log(`Real size: x ${toCm(size[0])} cm, y ${toCm(size[1])} cm, z ${toCm(size[2])} cm`);
  console.log('Check the other two dimensions against a ruler — they should match within ~2%.');
}

/** Entry point. */
async function main() {
  const cli = parseCli();
  await MeshoptDecoder.ready; // raw exports may already use meshopt compression
  const io = new NodeIO()
    .registerExtensions(ALL_EXTENSIONS)
    .registerDependencies({ 'meshopt.decoder': MeshoptDecoder });

  const document = await readDocument(io, cli.input);
  const trianglesBefore = countTriangles(document);
  await optimize(document, cli.maxTriangles);

  const outputPath = path.join(OUTPUT_DIR, `${cli.name}.glb`);
  await mkdir(OUTPUT_DIR, { recursive: true });
  await io.write(outputPath, document);

  printReport({
    outputPath,
    bytes: (await stat(outputPath)).size,
    trianglesBefore,
    trianglesAfter: countTriangles(document),
    meshCount: document.getRoot().listMeshes().length,
    size: measureSize(document),
    cli,
  });
}

main().catch((error) => {
  console.error(`\n${error.message}`);
  process.exit(1);
});
