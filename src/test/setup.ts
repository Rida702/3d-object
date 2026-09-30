/**
 * @file setup.ts
 * @description Global Vitest setup: adds DOM matchers (toBeInTheDocument, …) and
 *   unmounts rendered React trees after each test so tests stay isolated.
 */
import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

afterEach(() => {
  cleanup();
});
