/**
 * @file Toolbar.test.tsx
 * @description Tests that toolbar controls read from and write to the app store.
 */
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { useAppStore } from '@/store/useAppStore';
import { Toolbar } from './Toolbar';

const initialState = useAppStore.getState();

describe('Toolbar', () => {
  beforeEach(() => {
    useAppStore.setState(initialState, true);
  });

  it('toggles paint mode', () => {
    render(<Toolbar />);
    const toggle = screen.getByRole('button', { name: 'Paint mode' });

    expect(toggle).toHaveAttribute('aria-pressed', 'false');
    fireEvent.click(toggle);

    expect(toggle).toHaveAttribute('aria-pressed', 'true');
    expect(useAppStore.getState().isPaintMode).toBe(true);
  });

  it('selects a tool', () => {
    render(<Toolbar />);

    fireEvent.click(screen.getByRole('button', { name: 'Eraser' }));

    expect(useAppStore.getState().activeToolId).toBe('eraser');
    expect(screen.getByRole('button', { name: 'Eraser' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Brush' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('picks a preset colour and changes the brush size', () => {
    render(<Toolbar />);

    fireEvent.click(screen.getByRole('button', { name: 'Colour #3b6cf6' }));
    fireEvent.change(screen.getByLabelText('Brush size (radius)'), { target: { value: '2.5' } });

    expect(useAppStore.getState().color).toBe('#3b6cf6');
    expect(useAppStore.getState().brushRadiusCm).toBe(2.5);
    expect(screen.getByText('2.5 cm')).toBeInTheDocument();
  });
});
