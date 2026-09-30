/**
 * @file vite.config.ts
 * @description Build, dev-server and test (Vitest) configuration.
 *   Defines the "@/" path alias (mirrors tsconfig.json) and the jsdom test environment.
 */
import { fileURLToPath, URL } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  build: {
    // three.js alone is ~650 KB minified; it ships in the lazy Scene chunk, off the critical
    // path. Warn only if that chunk grows well beyond three + R3F + drei.
    chunkSizeWarningLimit: 1000,
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    css: { modules: { classNameStrategy: 'non-scoped' } },
  },
});
