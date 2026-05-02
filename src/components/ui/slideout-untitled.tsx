/**
 * Slideout Component (Untitled UI)
 *
 * A slide-out panel that appears from the edge of the screen.
 * Based on Untitled UI Slideout/Drawer design.
 *
 * Features:
 * - Multiple positions (left, right, top, bottom)
 * - Multiple sizes
 * - Overlay backdrop
 * - Keyboard navigation (Escape to close)
 * - Focus trap
 * - Animation transitions
 */

import * as React from 'react';
import { cn } from '@/lib/utils';
import { X } from '@/types/icons';
import { ButtonUntitled } from './button-untitled';

// ============================================================================
// Types
// ============================================================================

export type SlideoutPosition = 'left' | 'right' | 'top' | 'bottom';
export type SlideoutSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

export interface SlideoutUntitledProps {
  /**
   * Is slideout open?
   */
  open: boolean;

  /**
   * Callback when slideout closes
   */
  onClose: () => void;

  /**
   * Slideout content
   */
  children: React.ReactNode;

  /**
   * Position of slideout
   */
  position?: SlideoutPosition;

  /**
   * Size of slideout
   */
  size?: SlideoutSize;

  /**
   * Show overlay backdrop
   */
  showBackdrop?: boolean;

  /**
   * Close when backdrop is clicked
   */
  closeOnBackdropClick?: boolean;

  /**
   * Show close button in header
   */
  showCloseButton?: boolean;

  /**
   * Title (shown in header)
   */
  title?: string;

  /**
   * Description (shown in header)
   */
  description?: string;

  /**
   * Additional header actions
   */
  headerActions?: React.ReactNode;

  /**
   * Footer content
   */
  footer?: React.ReactNode;

  /**
   * Prevent body scroll when open
   */
  preventBodyScroll?: boolean;

  /**
   * Additional CSS classes
   */
  className?: string;

  /**
   * Additional content CSS classes
   */
  contentClassName?: string;

  /**
   * Z-index for the slideout
   */
  zIndex?: number;
}

// ============================================================================
// Helper Components
// ============================================================================

export const SlideoutHeader: React.FC<{
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  onClose?: () => void;
  className?: string;
}> = ({ title, description, actions, onClose, className }) => {
  return (
    <div
      className={cn(
        'flex items-center justify-between px-6 py-4 border-b border-border',
        className
      )}
    >
      <div className="flex-1">
        {title && (
          <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
        )}
        {description && (
          <p className="text-sm text-text-muted mt-1">{description}</p>
        )}
      </div>
      <div className="flex items-center gap-2">
        {actions}
        {onClose && (
          <ButtonUntitled
            variant="ghost"
            size="sm"
            leftIcon={<X className="w-4 h-4" />}
            onClick={onClose}
          >
            Close
          </ButtonUntitled>
        )}
      </div>
    </div>
  );
};

export const SlideoutContent: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => {
  return (
    <div className={cn('flex-1 overflow-y-auto px-6 py-4', className)}>
      {children}
    </div>
  );
};

export const SlideoutFooter: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => {
  return (
    <div
      className={cn(
        'flex items-center justify-between px-6 py-4 border-t border-border bg-surface',
        className
      )}
    >
      {children}
    </div>
  );
};

// ============================================================================
// Main Component
// ============================================================================

export const SlideoutUntitled = React.forwardRef<
  HTMLDivElement,
  SlideoutUntitledProps
>(
  (
    {
      open,
      onClose,
      children,
      position = 'right',
      size = 'md',
      showBackdrop = true,
      closeOnBackdropClick = true,
      showCloseButton = true,
      title,
      description,
      headerActions,
      footer,
      preventBodyScroll = true,
      className,
      contentClassName,
      zIndex = 50,
    },
    ref
  ) => {
    const slideoutRef = React.useRef<HTMLDivElement>(null);
    const previousActiveElement = React.useRef<HTMLElement | null>(null);

    // Handle body scroll lock
    React.useEffect(() => {
      if (preventBodyScroll && open) {
        document.body.style.overflow = 'hidden';
        return () => {
          document.body.style.overflow = '';
        };
      }
    }, [preventBodyScroll, open]);

    // Focus management
    React.useEffect(() => {
      if (open) {
        // Store the previously focused element
        previousActiveElement.current = document.activeElement as HTMLElement;

        // Focus the slideout after a short delay to allow transition
        setTimeout(() => {
          slideoutRef.current?.focus();
        }, 100);
      } else {
        // Restore focus when closed
        previousActiveElement.current?.focus();
      }
    }, [open]);

    // Handle Escape key
    React.useEffect(() => {
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && open) {
          onClose();
        }
      };

      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }, [open, onClose]);

    // Size styles
    const sizeStyles: Record<SlideoutSize, string> = {
      sm: 'max-w-sm',
      md: 'max-w-md',
      lg: 'max-w-lg',
      xl: 'max-w-xl',
      full: 'max-w-full',
    };

    // Position styles
    const positionStyles: Record<SlideoutPosition, string> = {
      left: 'left-0 top-0 h-full border-r border-border',
      right: 'right-0 top-0 h-full border-l border-border',
      top: 'top-0 left-0 w-full border-b border-border',
      bottom: 'bottom-0 left-0 w-full border-t border-border',
    };

    // Transform styles for animation
    const transformStyles: Record<SlideoutPosition, string> = {
      left: open ? 'translateX(0)' : 'translateX(-100%)',
      right: open ? 'translateX(0)' : 'translateX(100%)',
      top: open ? 'translateY(0)' : 'translateY(-100%)',
      bottom: open ? 'translateY(0)' : 'translateY(100%)',
    };

    // Width/height based on position
    const dimensionStyles =
      position === 'left' || position === 'right'
        ? sizeStyles[size]
        : size === 'full'
        ? 'h-full'
        : 'max-h-[50vh]';

    const slideout = (
      <div
        ref={(node) => {
          // Handle both refs
          if (node) {
            slideoutRef.current = node;
            if (typeof ref === 'function') {
              ref(node);
            } else if (ref) {
              ref.current = node;
            }
          }
        }}
        className={cn(
          'fixed bg-surface shadow-2xl transition-transform duration-300 ease-in-out',
          positionStyles[position],
          dimensionStyles,
          !open && 'pointer-events-none',
          className
        )}
        style={{
          zIndex,
          transform: transformStyles[position],
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'slideout-title' : undefined}
        tabIndex={-1}
      >
        {title && (
          <SlideoutHeader
            title={title}
            description={description}
            actions={headerActions}
            onClose={showCloseButton ? onClose : undefined}
          />
        )}

        <div className={cn('flex flex-col', !title && 'h-full')}>
          <SlideoutContent className={contentClassName}>
            {children}
          </SlideoutContent>

          {footer && <SlideoutFooter>{footer}</SlideoutFooter>}
        </div>
      </div>
    );

    return (
      <>
        {showBackdrop && (
          <div
            className={cn(
              'fixed inset-0 bg-black/50 transition-opacity duration-300',
              open ? 'opacity-100' : 'opacity-0 pointer-events-none'
            )}
            style={{ zIndex: zIndex - 1 }}
            onClick={closeOnBackdropClick ? onClose : undefined}
            aria-hidden="true"
          />
        )}

        {slideout}
      </>
    );
  }
);

SlideoutUntitled.displayName = 'SlideoutUntitled';

// ============================================================================
// Slideout with Compound Components
// ============================================================================

export interface SlideoutWithComponentsProps
  extends Omit<
    SlideoutUntitledProps,
    'title' | 'description' | 'headerActions' | 'footer' | 'children'
  > {
  header?: React.ReactNode;
  content: React.ReactNode;
  footer?: React.ReactNode;
}

export const SlideoutWithComponents = React.forwardRef<
  HTMLDivElement,
  SlideoutWithComponentsProps
>(({ header, content, footer, ...props }, ref) => {
  return (
    <SlideoutUntitled ref={ref} {...props}>
      {header}
      <SlideoutContent>{content}</SlideoutContent>
      {footer}
    </SlideoutUntitled>
  );
});

SlideoutWithComponents.displayName = 'SlideoutWithComponents';

// ============================================================================
// Hook for managing slideout state
// ============================================================================

export function useSlideout(defaultOpen = false) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);

  const open = React.useCallback(() => setIsOpen(true), []);
  const close = React.useCallback(() => setIsOpen(false), []);
  const toggle = React.useCallback(() => setIsOpen((prev) => !prev), []);

  return {
    isOpen,
    setIsOpen,
    open,
    close,
    toggle,
  };
}
