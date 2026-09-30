/**
 * @file throttle.ts
 * @description Leading + trailing throttle: runs immediately, then at most once per interval,
 *   and always once more after the last call so the final value is never dropped.
 */

/** A throttled action. */
export interface Throttled {
  /** Requests a run; runs now or schedules one at the end of the current interval. */
  call: () => void;
  /** Cancels a scheduled trailing run (call on unmount). */
  cancel: () => void;
}

/**
 * Wraps `fn` so it runs at most once every `intervalMs`. `fn` takes no arguments: it should
 * read the latest value itself when it runs, which is what makes the trailing run correct.
 *
 * @param fn - Action to throttle
 * @param intervalMs - Minimum time between runs
 * @returns The throttled action
 */
export function throttle(fn: () => void, intervalMs: number): Throttled {
  let lastRun = -Infinity;
  let timer: ReturnType<typeof setTimeout> | undefined;

  const run = () => {
    timer = undefined;
    lastRun = Date.now();
    fn();
  };

  return {
    call: () => {
      if (timer !== undefined) return; // a trailing run is already scheduled
      const wait = lastRun + intervalMs - Date.now();
      if (wait <= 0) run();
      else timer = setTimeout(run, wait);
    },
    cancel: () => {
      clearTimeout(timer);
      timer = undefined;
    },
  };
}
