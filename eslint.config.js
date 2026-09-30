/**
 * @file eslint.config.js
 * @description ESLint flat config. Enforces the rules in CLAUDE.md so they don't rely on memory:
 *   - Part 5.1: max 200 lines per file, 60 per function, 4 params
 *   - Part 4.1: import boundaries between app / features / store / shared / lib
 *   - Part 5.4 + 6.1: no `import * as THREE`, no barrel re-exports, no deep relative escapes
 */
import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

/** Blocks `../../x` — anything outside the current feature must use the "@/" alias. */
const NO_DEEP_RELATIVE = {
  regex: '^\\.\\./\\.\\./',
  message: 'Leave the current folder via the "@/" alias, not ../../ (CLAUDE.md 5.4).',
};

/** Nothing may import the app shell; it only composes features. */
const NO_APP = { group: ['@/app/**'], message: 'app/ is composition only; never import it.' };

/** Features may not import another feature's UI/hooks/tools — app/ composes them (4.1 rule 3). */
const NO_FOREIGN_FEATURE_UI = {
  group: ['@/features/*/components/**', '@/features/*/hooks/**', '@/features/*/tools/**'],
  message: "Only another feature's types.ts, config.ts or lib/ may be imported (CLAUDE.md 4.1).",
};

/** shared/ is feature-agnostic (4.1 rule 1). */
const NO_SHARED_DEPS = {
  group: ['@/features/**', '@/store/**', '@/app/**'],
  message: 'shared/ must not depend on features, store or app (CLAUDE.md 4.1 rule 1).',
};

/** lib/ files are pure functions (4.1 rule 4). */
const NO_IMPURE = {
  group: ['react', 'react-dom', 'react/**', '@react-three/**', 'zustand', '@/store/**'],
  message: 'lib/ files must be pure functions: no React, R3F, zustand or store.',
};

/**
 * Builds a `no-restricted-imports` rule entry from pattern groups.
 * Later config blocks replace (not merge) this rule, so each zone lists its full set.
 *
 * @param {...object} patterns - Pattern objects for the rule's `patterns` option
 * @returns {Array} ESLint rule entry
 */
function restrictImports(...patterns) {
  return ['error', { patterns: [NO_DEEP_RELATIVE, ...patterns] }];
}

export default defineConfig([
  globalIgnores(['dist', 'coverage', 'node_modules', 'public', 'assets-src']),

  // Base rules for all JS/TS files
  {
    files: ['**/*.{js,mjs,ts,tsx}'],
    extends: [js.configs.recommended, tseslint.configs.recommended],
    rules: {
      'max-lines': ['error', { max: 200, skipBlankLines: false, skipComments: false }],
      'max-lines-per-function': ['error', { max: 60, skipBlankLines: true, skipComments: true }],
      'max-params': ['error', 4],
      '@typescript-eslint/no-explicit-any': 'error',
      'no-restricted-syntax': [
        'error',
        {
          selector: "ImportDeclaration[source.value='three'] > ImportNamespaceSpecifier",
          message: "Import three.js members by name: import { Vector3 } from 'three'.",
        },
        {
          selector: 'ExportAllDeclaration, ExportNamedDeclaration[source]',
          message: 'No barrel re-exports; import from the real module path (CLAUDE.md 6.1).',
        },
      ],
    },
  },

  // Node-side config files and scripts
  {
    files: ['*.{js,ts}', 'scripts/**/*.{js,mjs}'],
    languageOptions: { globals: globals.node },
  },

  // Browser app source
  {
    files: ['src/**/*.{ts,tsx}'],
    extends: [reactHooks.configs.flat.recommended, reactRefresh.configs.vite],
    languageOptions: { globals: globals.browser },
    rules: {
      'no-restricted-imports': restrictImports(NO_APP),
    },
  },

  // main.tsx is the one file that mounts the app shell
  {
    files: ['src/main.tsx'],
    rules: { 'no-restricted-imports': restrictImports() },
  },

  // Explicit return types on exported functions in plain .ts modules (CLAUDE.md 5.3)
  {
    files: ['src/**/*.ts'],
    rules: { '@typescript-eslint/explicit-module-boundary-types': 'error' },
  },

  // shared/ is feature-agnostic: it imports nothing from features, store or app
  {
    files: ['src/shared/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': restrictImports(NO_SHARED_DEPS),
    },
  },

  // store/ may use shared/ and feature types/config only
  {
    files: ['src/store/**/*.ts'],
    rules: {
      'no-restricted-imports': restrictImports(NO_APP, {
        group: [
          '@/features/*/components/**',
          '@/features/*/hooks/**',
          '@/features/*/tools/**',
          '@/features/*/lib/**',
        ],
        message: 'store/ may import only feature types.ts / config.ts (CLAUDE.md 4.1 rule 2).',
      }),
    },
  },

  // features/: no foreign UI; own-feature imports are relative
  {
    files: ['src/features/**/*.{ts,tsx}'],
    rules: { 'no-restricted-imports': restrictImports(NO_APP, NO_FOREIGN_FEATURE_UI) },
  },

  // models/ is the one feature allowed to render painting's PaintableMesh (CLAUDE.md 4.1)
  {
    files: ['src/features/models/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': restrictImports(NO_APP, {
        ...NO_FOREIGN_FEATURE_UI,
        group: [...NO_FOREIGN_FEATURE_UI.group, '!@/features/painting/components/PaintableMesh'],
      }),
    },
  },

  // feature lib/ is pure: no React, no R3F, no zustand, no store (CLAUDE.md 4.1 rule 4)
  {
    files: ['src/features/**/lib/**/*.ts'],
    rules: {
      'no-restricted-imports': restrictImports(NO_APP, NO_FOREIGN_FEATURE_UI, NO_IMPURE),
    },
  },

  // shared/lib/ is both pure and feature-agnostic
  {
    files: ['src/shared/lib/**/*.ts'],
    rules: { 'no-restricted-imports': restrictImports(NO_SHARED_DEPS, NO_IMPURE) },
  },

  // Tests: describe/it callbacks naturally exceed the per-function limit; the 200-line file cap stays
  {
    files: ['src/**/*.test.{ts,tsx}', 'src/test/**/*.ts'],
    rules: { 'max-lines-per-function': 'off' },
  },

  // Must stay last: turns off stylistic rules that conflict with Prettier
  prettier,
]);
