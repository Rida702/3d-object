/**
 * @file units.test.ts
 * @description Tests unit conversion and area/percent formatting.
 */
import { describe, expect, it } from 'vitest';
import { formatArea, formatPercent, toSquareMeters } from './units';

describe('toSquareMeters', () => {
  it('scales area by the square of metres-per-unit', () => {
    // 10 cm cube: 6 units² × (0.1 m)² = 0.06 m²
    expect(toSquareMeters(6, 0.1)).toBeCloseTo(0.06, 10);
  });

  it('is the identity when one unit is one metre', () => {
    expect(toSquareMeters(2.5, 1)).toBe(2.5);
  });
});

describe('formatArea', () => {
  it('shows the 10 cm cube total as 600 cm²', () => {
    expect(formatArea(toSquareMeters(6, 0.1))).toBe('600 cm²');
  });

  it('shows one cube face as 100 cm²', () => {
    expect(formatArea(toSquareMeters(1, 0.1))).toBe('100 cm²');
  });

  it('rounds to one decimal in cm²', () => {
    expect(formatArea(0.00124)).toBe('12.4 cm²');
  });

  it('switches to m² from 1 m²', () => {
    expect(formatArea(1.254)).toBe('1.25 m²');
  });

  it('shows zero as 0 cm²', () => {
    expect(formatArea(0)).toBe('0 cm²');
  });
});

describe('formatPercent', () => {
  it('formats a fraction as a percentage with one decimal', () => {
    expect(formatPercent(1, 6)).toBe('16.7%');
  });

  it('is 0% when the total is 0', () => {
    expect(formatPercent(0, 0)).toBe('0%');
  });
});
