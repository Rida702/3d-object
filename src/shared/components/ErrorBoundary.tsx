/**
 * @file ErrorBoundary.tsx
 * @description Catches errors thrown while rendering its children (e.g. a model file that is
 *   missing or broken) and shows a fallback instead of a blank screen. React only supports
 *   this as a class component. Give it a `key` that changes to reset it (e.g. the model id).
 */
import { Component, type ErrorInfo, type ReactNode } from 'react';

type ErrorBoundaryProps = {
  children: ReactNode;
  /** What to show instead of the children once something has failed. */
  fallback: ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
};

/**
 * Renders its children, or `fallback` after any child throws during rendering.
 *
 * @param props.children - Content that might fail
 * @param props.fallback - Shown after a failure
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  override state: ErrorBoundaryState = { hasError: false };

  /**
   * Switches to the fallback after a child throws.
   * @returns The new state
   */
  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  /**
   * Logs the error so it is still visible in the browser console for debugging.
   * @param error - What was thrown
   * @param info - React's component stack
   */
  override componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('ErrorBoundary caught:', error, info.componentStack);
  }

  /** @returns The children, or the fallback after an error */
  override render(): ReactNode {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}
