/**
 * @file registry.ts
 * @description Maps tool ids to tool implementations. To add a tool: implement PaintTool in
 *   a new file, add its id to PaintToolId (types.ts), its label to PAINT_TOOL_OPTIONS
 *   (config.ts) and an entry here. Nothing else changes (CLAUDE.md 4.4).
 */
import type { PaintTool, PaintToolId } from '../types';
import { brushTool } from './brushTool';
import { eraserTool } from './eraserTool';

/** Every tool, keyed by id. `Record` makes TypeScript fail if a PaintToolId has no tool. */
const TOOLS: Record<PaintToolId, PaintTool> = {
  brush: brushTool,
  eraser: eraserTool,
};

/**
 * Looks up a tool implementation by id.
 *
 * @param id - Tool id from the store
 * @returns The tool
 */
export function getPaintTool(id: PaintToolId): PaintTool {
  return TOOLS[id];
}
