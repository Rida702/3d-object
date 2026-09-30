/**
 * @file throttle.test.ts
 * @description Tests leading + trailing throttle behaviour with fake timers.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { throttle } from './throttle';

describe('throttle', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('runs the first call immediately', () => {
    const fn = vi.fn();
    throttle(fn, 100).call();
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('collapses calls within the interval into one trailing run', () => {
    const fn = vi.fn();
    const throttled = throttle(fn, 100);

    throttled.call();
    throttled.call();
    throttled.call();
    expect(fn).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('runs immediately again once the interval has passed', () => {
    const fn = vi.fn();
    const throttled = throttle(fn, 100);

    throttled.call();
    vi.advanceTimersByTime(150);
    throttled.call();

    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('cancel drops a pending trailing run', () => {
    const fn = vi.fn();
    const throttled = throttle(fn, 100);

    throttled.call();
    throttled.call();
    throttled.cancel();
    vi.advanceTimersByTime(200);

    expect(fn).toHaveBeenCalledTimes(1);
  });
});
