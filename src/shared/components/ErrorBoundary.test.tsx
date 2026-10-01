/**
 * @file ErrorBoundary.test.tsx
 * @description Tests that the error boundary shows its fallback when a child throws.
 */
import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ErrorBoundary } from './ErrorBoundary';

/** A child that always fails to render. */
function Broken(): never {
  throw new Error('model file missing');
}

describe('ErrorBoundary', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders children when nothing fails', () => {
    render(
      <ErrorBoundary fallback={<p>failed</p>}>
        <p>model</p>
      </ErrorBoundary>,
    );

    expect(screen.getByText('model')).toBeInTheDocument();
    expect(screen.queryByText('failed')).not.toBeInTheDocument();
  });

  it('shows the fallback when a child throws, and logs the error', () => {
    // React and the boundary both log the error; keep test output clean but still check it.
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary fallback={<p>failed</p>}>
        <Broken />
      </ErrorBoundary>,
    );

    expect(screen.getByText('failed')).toBeInTheDocument();
    expect(consoleError).toHaveBeenCalledWith(
      'ErrorBoundary caught:',
      expect.any(Error),
      expect.any(String),
    );
  });
});
