/**
 * @file ModelPicker.test.tsx
 * @description Tests that the model picker lists models and updates the selected model.
 */
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { useAppStore } from '@/store/useAppStore';
import { ModelPicker } from './ModelPicker';

const initialState = useAppStore.getState();

describe('ModelPicker', () => {
  beforeEach(() => {
    useAppStore.setState(initialState, true);
  });

  it('starts with the cube selected', () => {
    render(<ModelPicker />);

    expect(screen.getByRole('button', { name: 'Cube (10 cm)' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('selects the scanned flower', () => {
    render(<ModelPicker />);

    fireEvent.click(screen.getByRole('button', { name: 'Crochet flower (scan)' }));

    expect(useAppStore.getState().selectedModelId).toBe('crochet-flower');
    expect(screen.getByRole('button', { name: 'Cube (10 cm)' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });
});
