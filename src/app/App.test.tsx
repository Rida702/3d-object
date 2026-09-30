/**
 * @file App.test.tsx
 * @description Smoke test for the app shell: both layout regions render.
 */
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { App } from './App';

describe('App', () => {
  it('renders the viewport and the side panel', () => {
    render(<App />);

    expect(screen.getByRole('main', { name: '3D viewport' })).toBeInTheDocument();
    expect(
      screen.getByRole('complementary', { name: 'Tools and measurements' }),
    ).toBeInTheDocument();
  });
});
