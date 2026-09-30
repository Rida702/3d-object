/**
 * @file App.test.tsx
 * @description Smoke test for the app shell: both layout regions render and the lazy 3D scene
 *   mounts inside the viewport. The real Scene is mocked — jsdom has no WebGL.
 */
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { App } from './App';

vi.mock('./Scene', () => ({
  Scene: () => <div data-testid="scene" />,
}));

describe('App', () => {
  it('renders the viewport and the side panel', () => {
    render(<App />);

    expect(screen.getByRole('main', { name: '3D viewport' })).toBeInTheDocument();
    expect(
      screen.getByRole('complementary', { name: 'Tools and measurements' }),
    ).toBeInTheDocument();
  });

  it('shows a loading message, then the lazy-loaded scene', async () => {
    // React.lazy caches its module once resolved; re-import App so this test sees a cold load.
    vi.resetModules();
    const { App: ColdApp } = await import('./App');
    render(<ColdApp />);

    expect(screen.getByRole('status')).toHaveTextContent('Loading 3D viewport…');
    expect(await screen.findByTestId('scene')).toBeInTheDocument();
  });
});
