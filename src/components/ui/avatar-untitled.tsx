import React, { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/**
 * Enhanced Avatar component inspired by Untitled UI
 * Features online indicators, group layouts, and gold accents
 */

const avatarVariants = cva(
  'relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full font-semibold transition-all duration-200',
  {
    variants: {
      size: {
        xs: 'h-6 w-6 text-[10px]',
        sm: 'h-8 w-8 text-xs',
        md: 'h-10 w-10 text-sm',
        lg: 'h-12 w-12 text-base',
        xl: 'h-16 w-16 text-lg',
        '2xl': 'h-20 w-20 text-xl',
      },
      variant: {
        default: 'bg-surface border-2 border-border',
        primary: 'bg-primary/10 border-2 border-primary/30 text-primary',
        gold: 'bg-gradient-to-br from-primary/20 to-primary/10 border-2 border-primary/40 text-primary shadow-gold',
        solid: 'bg-primary text-white border-2 border-primary',
      },
    },
    defaultVariants: {
      size: 'md',
      variant: 'default',
    },
  }
);

export interface AvatarProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof avatarVariants> {
  src?: string;
  alt?: string;
  fallback?: string;
  isOnline?: boolean;
}

const AvatarComponent = forwardRef<HTMLDivElement, AvatarProps>(
  (
    {
      className,
      size,
      variant,
      src,
      alt,
      fallback,
      isOnline,
      children,
      ...props
    },
    ref
  ) => {
    const getInitials = (name: string) => {
      return name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    };

    const content = src ? (
      <img
        src={src}
        alt={alt || 'Avatar'}
        className="h-full w-full object-cover"
        onError={(e) => {
          e.currentTarget.src = '';
        }}
      />
    ) : (
      <span>{fallback || getInitials(alt || 'User')}</span>
    );

    return (
      <div
        ref={ref}
        className={cn(avatarVariants({ size, variant }), className)}
        {...props}
      >
        {content}
        {isOnline && (
          <span
            className={cn(
              'absolute bottom-0 right-0 block rounded-full ring-2 ring-background',
              size === 'xs' && 'h-2 w-2',
              size === 'sm' && 'h-2.5 w-2.5',
              (size === 'md' || size === 'lg') && 'h-3 w-3',
              (size === 'xl' || size === '2xl') && 'h-4 w-4',
              'bg-success shadow-sm shadow-success/30'
            )}
          />
        )}
        {children}
      </div>
    );
  }
);

AvatarComponent.displayName = 'Avatar';

// Avatar Group component
interface AvatarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  max?: number;
  size?: AvatarProps['size'];
}

const AvatarGroup = forwardRef<HTMLDivElement, AvatarGroupProps>(
  ({ className, children, max = 3, size = 'md', ...props }, ref) => {
    const avatars = React.Children.toArray(children).slice(0, max);
    const remaining = React.Children.count(children) - max;

    const getSpacing = () => {
      switch (size) {
        case 'xs':
          return '-space-x-1';
        case 'sm':
          return '-space-x-1.5';
        case 'lg':
          return '-space-x-2.5';
        case 'xl':
          return '-space-x-3';
        case '2xl':
          return '-space-x-4';
        default:
          return '-space-x-2';
      }
    };

    return (
      <div
        ref={ref}
        className={cn('flex', getSpacing(), className)}
        {...props}
      >
        {avatars}
        {remaining > 0 && (
          <AvatarComponent
            size={size}
            variant="default"
            className="bg-surface-hover text-text-muted"
          >
            +{remaining}
          </AvatarComponent>
        )}
      </div>
    );
  }
);

AvatarGroup.displayName = 'AvatarGroup';

// Compound sub-components for Radix-style usage: AvatarUntitled.Image, AvatarUntitled.Fallback
const AvatarImage = forwardRef<HTMLImageElement, React.ImgHTMLAttributes<HTMLImageElement>>(
  ({ className, ...props }, ref) => (
    <img ref={ref} className={cn('h-full w-full object-cover', className)} {...props} />
  )
);
AvatarImage.displayName = 'AvatarImage';

const AvatarFallback = forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>(
  ({ className, ...props }, ref) => (
    <span ref={ref} className={cn('flex h-full w-full items-center justify-center', className)} {...props} />
  )
);
AvatarFallback.displayName = 'AvatarFallback';

export const AvatarUntitled = Object.assign(AvatarComponent, {
  Group: AvatarGroup,
  Image: AvatarImage,
  Fallback: AvatarFallback,
});
