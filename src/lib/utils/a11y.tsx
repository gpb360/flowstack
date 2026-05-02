/**
 * Accessibility utility functions for FlowStack
 * Provides helper functions for focus management, keyboard navigation,
 * and screen reader support.
 */

import { useEffect, useRef } from 'react';

/**
 * Focus trap hook for modals and dialogs
 * Keeps keyboard focus within a component while active
 */
export function useFocusTrap(isActive: boolean) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isActive) return;

    const container = containerRef.current;
    if (!container) return;

    // Get all focusable elements within the container
    const focusableElements = container.querySelectorAll<
      HTMLElement
    >(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleTabKey);

    // Focus first element when trap activates
    firstElement?.focus();

    return () => {
      document.removeEventListener('keydown', handleTabKey);
    };
  }, [isActive]);

  return containerRef;
}

/**
 * Hook to manage focus restoration
 * Returns focus to the previously focused element when unmounted
 */
export function useFocusRestore(isActive: boolean) {
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isActive) {
      previousActiveElement.current = document.activeElement as HTMLElement;
    } else {
      previousActiveElement.current?.focus();
    }
  }, [isActive]);
}

/**
 * Generate unique ID for ARIA attributes
 */
let idCounter = 0;
export function generateId(prefix: string = 'flowstack'): string {
  return `${prefix}-${idCounter++}`;
}

/**
 * Announce messages to screen readers
 * Uses a live region for dynamic content announcements
 */
export function announceToScreenReader(
  message: string,
  priority: 'polite' | 'assertive' = 'polite'
): void {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.setAttribute('class', 'sr-only');

  // Add sr-only styles
  Object.assign(announcement.style, {
    position: 'absolute',
    width: '1px',
    height: '1px',
    padding: '0',
    margin: '-1px',
    overflow: 'hidden',
    clip: 'rect(0, 0, 0, 0)',
    whiteSpace: 'nowrap',
    borderWidth: '0',
  });

  announcement.textContent = message;
  document.body.appendChild(announcement);

  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

/**
 * Check if an element is visible to screen readers
 */
export function isScreenReaderVisible(element: HTMLElement): boolean {
  const styles = window.getComputedStyle(element);
  return (
    styles.display !== 'none' &&
    styles.visibility !== 'hidden' &&
    styles.opacity !== '0' &&
    element.getAttribute('aria-hidden') !== 'true'
  );
}

/**
 * Keyboard shortcut handler
 * Prevents conflicts with browser shortcuts and screen readers
 */
export function handleKeyboardShortcut(
  event: KeyboardEvent,
  shortcuts: Record<string, () => void>,
  enabled: boolean = true
): void {
  if (!enabled) return;

  // Don't trigger if user is typing in an input
  const target = event.target as HTMLElement;
  if (
    target.tagName === 'INPUT' ||
    target.tagName === 'TEXTAREA' ||
    target.isContentEditable
  ) {
    return;
  }

  const key = event.key.toLowerCase();
  const modifiers: string[] = [];

  if (event.ctrlKey) modifiers.push('ctrl');
  if (event.metaKey) modifiers.push('meta');
  if (event.shiftKey) modifiers.push('shift');
  if (event.altKey) modifiers.push('alt');

  const shortcutKey = [...modifiers, key].join('+');

  if (shortcuts[shortcutKey]) {
    event.preventDefault();
    shortcuts[shortcutKey]();
  }
}

/**
 * Get safe ARIA values for attributes
 * Ensures values are properly formatted and won't cause accessibility issues
 */
export function getAriaValue(value: unknown): string | undefined {
  if (value === null || value === undefined) return undefined;
  return String(value);
}

/**
 * Create a visually hidden but screen reader accessible element
 */
export function VisuallyHidden({
  children,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  const srStyle = {
    position: 'absolute' as const,
    width: '1px',
    height: '1px',
    padding: '0',
    margin: '-1px',
    overflow: 'hidden' as const,
    clip: 'rect(0, 0, 0, 0)' as const,
    whiteSpace: 'nowrap' as const,
    borderWidth: '0',
  };

  return (
    <span style={srStyle} {...props}>
      {children}
    </span>
  );
}

/**
 * Focus management utilities
 */
export const focusUtils = {
  /**
   * Move focus to the next focusable element
   */
  focusNext: (container?: HTMLElement) => {
    const focusable = Array.from(
      (container || document.body).querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
    );
    const currentIndex = focusable.indexOf(document.activeElement as HTMLElement);
    const nextIndex = (currentIndex + 1) % focusable.length;
    focusable[nextIndex]?.focus();
  },

  /**
   * Move focus to the previous focusable element
   */
  focusPrevious: (container?: HTMLElement) => {
    const focusable = Array.from(
      (container || document.body).querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
    );
    const currentIndex = focusable.indexOf(document.activeElement as HTMLElement);
    const previousIndex =
      currentIndex <= 0 ? focusable.length - 1 : currentIndex - 1;
    focusable[previousIndex]?.focus();
  },

  /**
   * Focus first focusable element in container
   */
  focusFirst: (container: HTMLElement) => {
    const first = container.querySelector<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    first?.focus();
  },

  /**
   * Focus last focusable element in container
   */
  focusLast: (container: HTMLElement) => {
    const focusable = Array.from(
      container.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
    );
    focusable[focusable.length - 1]?.focus();
  },
};

/**
 * Common ARIA role definitions
 */
export const ARIA_ROLES = {
  BUTTON: 'button',
  LINK: 'link',
  MENU: 'menu',
  MENUITEM: 'menuitem',
  DIALOG: 'dialog',
  ALERT: 'alert',
  ALERTDIALOG: 'alertdialog',
  STATUS: 'status',
  TABLIST: 'tablist',
  TAB: 'tab',
  TABPANEL: 'tabpanel',
  REGION: 'region',
  NAVIGATION: 'navigation',
  MAIN: 'main',
  COMPLEMENTARY: 'complementary',
  CONTENTINFO: 'contentinfo',
  SEARCH: 'search',
  FORM: 'form',
  ARTICLE: 'article',
} as const;

/**
 * Common ARIA live region values
 */
export const ARIA_LIVE = {
  OFF: 'off',
  POLITE: 'polite',
  ASSERTIVE: 'assertive',
} as const;
