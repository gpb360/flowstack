/**
 * Modal Component (Untitled UI)
 *
 * A versatile modal/dialog component with title, description, and actions.
 * Based on Untitled UI Modal design.
 *
 * Features:
 * - Controlled and uncontrolled modes
 * - Size variants (sm, md, lg, xl, full)
 * - Custom triggers
 * - Focus trapping
 * - Keyboard navigation (Esc to close, Enter to confirm)
 * - Backdrop blur
 */

import * as React from 'react';
import { cn } from '@/lib/utils';
import { X, AlertTriangle, Info, CheckCircle, AlertCircle } from '@/types/icons';

// ============================================================================
// Types
// ============================================================================

export interface ModalUntitledProps {
  /**
   * Control the open state of the modal
   */
  open?: boolean;

  /**
   * Callback when modal open state changes
   */
  onOpenChange?: (open: boolean) => void;

  /**
   * Modal title
   */
  title: string;

  /**
   * Optional subtitle or description
   */
  description?: string;

  /**
   * Modal content
   */
  children: React.ReactNode;

  /**
   * Primary action button
   */
  action?: React.ReactNode;

  /**
   * Secondary action button (e.g., Cancel)
   */
  secondaryAction?: React.ReactNode;

  /**
   * Modal size variant
   */
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';

  /**
   * Modal type/variant
   */
  variant?: 'default' | 'destructive' | 'warning' | 'success' | 'info';

  /**
   * Show close button in header
   */
  showCloseButton?: boolean;

  /**
   * Prevent closing on backdrop click
   */
  preventCloseOnBackdropClick?: boolean;

  /**
   * Prevent closing on Escape key
   */
  preventCloseOnEscape?: boolean;

  /**
   * Additional CSS classes
   */
  className?: string;

  /**
   * Additional CSS classes for the content
   */
  contentClassName?: string;

  /**
   * Custom trigger element
   */
  trigger?: React.ReactNode;

  /**
   * Footer content (overrides action buttons)
   */
  footer?: React.ReactNode;
}

// ============================================================================
// Helper Components
// ============================================================================

const ModalIcon = ({ variant }: { variant: ModalUntitledProps['variant'] }) => {
  const icons = {
    destructive: AlertTriangle,
    warning: AlertTriangle,
    success: CheckCircle,
    info: Info,
    default: AlertCircle,
  };

  const colors = {
    destructive: 'text-red-500',
    warning: 'text-yellow-500',
    success: 'text-green-500',
    info: 'text-blue-500',
    default: 'text-primary',
  };

  const Icon = icons[variant || 'default'];

  return Icon ? (
    <div className={cn('p-2 rounded-lg', colors[variant || 'default'], 'bg-opacity-10 bg-current')}>
      <Icon className="w-6 h-6" />
    </div>
  ) : null;
};

// ============================================================================
// Main Component
// ============================================================================

export const ModalUntitled = React.forwardRef<HTMLDivElement, ModalUntitledProps>(
  (
    {
      open: controlledOpen,
      onOpenChange,
      title,
      description,
      children,
      action,
      secondaryAction,
      size = 'md',
      variant = 'default',
      showCloseButton = true,
      preventCloseOnBackdropClick = false,
      preventCloseOnEscape = false,
      className,
      contentClassName,
      trigger,
      footer,
    },
    ref
  ) => {
    const [internalOpen, setInternalOpen] = React.useState(false);

    const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
    const setIsOpen = onOpenChange || setInternalOpen;

    const modalRef = React.useRef<HTMLDivElement>(null);

    // Handle Escape key
    React.useEffect(() => {
      if (!isOpen || preventCloseOnEscape) return;

      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setIsOpen(false);
        }
      };

      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, preventCloseOnEscape, setIsOpen]);

    // Focus trap
    React.useEffect(() => {
      if (!isOpen) return;

      const modal = modalRef.current;
      if (!modal) return;

      const focusableElements = modal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-"])'
      );

      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[
        focusableElements.length - 1
      ] as HTMLElement;

      if (firstElement) {
        firstElement.focus();
      }

      const handleTab = (e: KeyboardEvent) => {
        if (e.key !== 'Tab') return;

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement?.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement?.focus();
          }
        }
      };

      document.addEventListener('keydown', handleTab);
      return () => document.removeEventListener('keydown', handleTab);
    }, [isOpen]);

    // Handle backdrop click
    const handleBackdropClick = (e: React.MouseEvent) => {
      if (e.target === e.currentTarget && !preventCloseOnBackdropClick) {
        setIsOpen(false);
      }
    };

    const sizeStyles = {
      sm: 'max-w-sm',
      md: 'max-w-md',
      lg: 'max-w-lg',
      xl: 'max-w-xl',
      full: 'max-w-full mx-4',
    };

    // Render trigger if provided
    if (trigger && !isOpen) {
      return (
        <>
          <div onClick={() => setIsOpen(true)}>{trigger}</div>
        </>
      );
    }

    if (!isOpen) return null;

    return (
      <div
        ref={ref}
        className={cn(
          'fixed inset-0 z-50 flex items-center justify-center p-4',
          'animate-in fade-in duration-200',
          className
        )}
      >
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm"
          onClick={handleBackdropClick}
          aria-hidden="true"
        />

        {/* Modal */}
        <div
          ref={modalRef}
          className={cn(
            'relative bg-surface border border-border rounded-lg shadow-2xl',
            'w-full',
            sizeStyles[size],
            'animate-in zoom-in-95 duration-200',
            contentClassName
          )}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          aria-describedby={description ? 'modal-description' : undefined}
        >
          {/* Header */}
          <div className="flex items-start justify-between p-6 border-b border-border">
            <div className="flex items-center gap-3 flex-1">
              <ModalIcon variant={variant} />
              <div>
                <h2
                  id="modal-title"
                  className="text-lg font-semibold text-text-primary"
                >
                  {title}
                </h2>
                {description && (
                  <p
                    id="modal-description"
                    className="text-sm text-text-secondary mt-1"
                  >
                    {description}
                  </p>
                )}
              </div>
            </div>

            {showCloseButton && (
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded hover:bg-surface-hover transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5 text-text-muted" />
              </button>
            )}
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[60vh]">
            {children}
          </div>

          {/* Footer */}
          {footer ? (
            <div className="p-6 border-t border-border bg-surface/50">
              {footer}
            </div>
          ) : (action || secondaryAction) ? (
            <div className="p-6 border-t border-border bg-surface/50 flex items-center justify-end gap-3">
              {secondaryAction}
              {action}
            </div>
          ) : null}
        </div>
      </div>
    );
  }
);

ModalUntitled.displayName = 'ModalUntitled';

// ============================================================================
// Modal Trigger Component
// ============================================================================

export interface ModalTriggerProps {
  children: React.ReactNode;
  asChild?: boolean;
}

export const ModalTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & ModalTriggerProps
>(({ children, asChild = false, ...props }, ref) => {
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      ...props,
      ref,
    } as React.HTMLAttributes<HTMLElement>);
  }

  return (
    <button
      ref={ref}
      type="button"
      {...props}
      className={cn('w-full', props.className)}
    >
      {children}
    </button>
  );
});

ModalTrigger.displayName = 'ModalTrigger';

// ============================================================================
// Modal Content Component (for compound pattern)
// ============================================================================

export interface ModalContentProps {
  children: React.ReactNode;
  className?: string;
}

export const ModalContent = React.forwardRef<HTMLDivElement, ModalContentProps>(
  ({ children, className }, ref) => {
    return (
      <div ref={ref} className={cn('p-6', className)}>
        {children}
      </div>
    );
  }
);

ModalContent.displayName = 'ModalContent';

// ============================================================================
// Modal Footer Component
// ============================================================================

export interface ModalFooterProps {
  children: React.ReactNode;
  className?: string;
  align?: 'left' | 'center' | 'right';
}

export const ModalFooter = React.forwardRef<HTMLDivElement, ModalFooterProps>(
  ({ children, className, align = 'right' }, ref) => {
    const alignStyles = {
      left: 'justify-start',
      center: 'justify-center',
      right: 'justify-end',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'p-6 border-t border-border bg-surface/50 flex items-center gap-3',
          alignStyles[align],
          className
        )}
      >
        {children}
      </div>
    );
  }
);

ModalFooter.displayName = 'ModalFooter';

// ============================================================================
// Modal Header Component (for compound pattern)
// ============================================================================

export interface ModalHeaderProps {
  title: string;
  description?: string;
  variant?: ModalUntitledProps['variant'];
  className?: string;
}

export const ModalHeader = React.forwardRef<HTMLDivElement, ModalHeaderProps>(
  ({ title, description, variant = 'default', className }, ref) => {
    return (
      <div ref={ref} className={cn('p-6 border-b border-border', className)}>
        <div className="flex items-center gap-3">
          <ModalIcon variant={variant} />
          <div>
            <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
            {description && (
              <p className="text-sm text-text-secondary mt-1">{description}</p>
            )}
          </div>
        </div>
      </div>
    );
  }
);

ModalHeader.displayName = 'ModalHeader';
