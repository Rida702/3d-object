/**
 * @file Button.tsx
 * @description Generic button. Pass `isPressed` to make it a toggle (announced to screen
 *   readers via aria-pressed and styled as active).
 */
import type { ReactNode } from 'react';
import styles from './Button.module.css';

type ButtonProps = {
  children: ReactNode;
  onClick: () => void;
  /** Set for toggle buttons; omit for plain actions. */
  isPressed?: boolean;
  /** Tooltip, e.g. a keyboard shortcut hint. */
  title?: string;
};

/**
 * Renders a styled button.
 *
 * @param props.children - Button content
 * @param props.onClick - Click handler
 * @param props.isPressed - Toggle state, if this is a toggle button
 * @param props.title - Tooltip text
 */
export function Button({ children, onClick, isPressed, title }: ButtonProps) {
  return (
    <button
      type="button"
      className={styles.button}
      aria-pressed={isPressed}
      title={title}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
