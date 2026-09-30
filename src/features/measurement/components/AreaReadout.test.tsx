/**
 * @file AreaReadout.test.tsx
 * @description Tests that the readout converts store areas to real-world units.
 */
import { act, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { useAppStore } from '@/store/useAppStore';
import { AreaReadout } from './AreaReadout';

/**
 * Finds the value shown next to a label in the readout.
 * @param label - The <dt> text
 * @returns The matching <dd> element
 */
function valueFor(label: string): HTMLElement {
  const term = screen.getByText(label);
  const value = term.nextElementSibling;
  if (!(value instanceof HTMLElement)) throw new Error(`No value for "${label}"`);
  return value;
}

describe('AreaReadout', () => {
  beforeEach(() => {
    useAppStore.getState().resetAreas();
  });

  it('shows the 10 cm cube with one face painted', () => {
    useAppStore.getState().setSurfaceAreas({ totalArea: 6, paintedArea: 1, metersPerUnit: 0.1 });
    render(<AreaReadout />);

    expect(valueFor('Painted area')).toHaveTextContent('100 cm²');
    expect(valueFor('Total surface')).toHaveTextContent('600 cm²');
    expect(valueFor('Coverage')).toHaveTextContent('16.7%');
  });

  it('shows zeros when nothing is loaded', () => {
    render(<AreaReadout />);

    expect(valueFor('Painted area')).toHaveTextContent('0 cm²');
    expect(valueFor('Coverage')).toHaveTextContent('0%');
  });

  it('updates when the painted area changes', () => {
    useAppStore.getState().setSurfaceAreas({ totalArea: 6, paintedArea: 0, metersPerUnit: 0.1 });
    render(<AreaReadout />);

    act(() => useAppStore.getState().setPaintedArea(3));

    expect(valueFor('Painted area')).toHaveTextContent('300 cm²');
    expect(valueFor('Coverage')).toHaveTextContent('50%');
  });
});
