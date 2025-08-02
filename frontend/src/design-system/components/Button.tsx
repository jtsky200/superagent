import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

// Button variant definitions with accessibility in mind
const buttonVariants = cva(
  // Base styles (always applied)
  [
    'inline-flex items-center justify-center gap-2',
    'rounded-lg font-medium transition-all duration-200',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    'disabled:pointer-events-none disabled:opacity-50',
    'whitespace-nowrap',
    // Accessibility improvements
    'touch-manipulation', // Prevents double-tap zoom on mobile
    'select-none', // Prevents text selection
    'relative overflow-hidden', // For ripple effects
  ],
  {
    variants: {
      variant: {
        primary: [
          'bg-primary-600 text-white shadow-sm',
          'hover:bg-primary-700 hover:shadow-md',
          'active:bg-primary-800 active:shadow-sm',
          'focus-visible:ring-primary-500',
          'disabled:bg-neutral-300 disabled:text-neutral-500',
        ],
        secondary: [
          'bg-neutral-100 text-neutral-900 border border-neutral-300',
          'hover:bg-neutral-200 hover:border-neutral-400',
          'active:bg-neutral-300',
          'focus-visible:ring-neutral-500',
          'disabled:bg-neutral-100 disabled:text-neutral-400 disabled:border-neutral-200',
        ],
        outline: [
          'border border-neutral-300 bg-transparent text-neutral-700',
          'hover:bg-neutral-50 hover:border-neutral-400',
          'active:bg-neutral-100',
          'focus-visible:ring-neutral-500',
          'disabled:text-neutral-400 disabled:border-neutral-200',
        ],
        ghost: [
          'bg-transparent text-neutral-700',
          'hover:bg-neutral-100 hover:text-neutral-900',
          'active:bg-neutral-200',
          'focus-visible:ring-neutral-500',
          'disabled:text-neutral-400',
        ],
        link: [
          'bg-transparent text-primary-600 underline-offset-4',
          'hover:text-primary-700 hover:underline',
          'active:text-primary-800',
          'focus-visible:ring-primary-500',
          'disabled:text-neutral-400',
        ],
        destructive: [
          'bg-error-600 text-white shadow-sm',
          'hover:bg-error-700 hover:shadow-md',
          'active:bg-error-800 active:shadow-sm',
          'focus-visible:ring-error-500',
          'disabled:bg-neutral-300 disabled:text-neutral-500',
        ],
        success: [
          'bg-success-600 text-white shadow-sm',
          'hover:bg-success-700 hover:shadow-md',
          'active:bg-success-800 active:shadow-sm',
          'focus-visible:ring-success-500',
          'disabled:bg-neutral-300 disabled:text-neutral-500',
        ],
        warning: [
          'bg-warning-500 text-warning-900 shadow-sm',
          'hover:bg-warning-600 hover:shadow-md',
          'active:bg-warning-700 active:shadow-sm',
          'focus-visible:ring-warning-500',
          'disabled:bg-neutral-300 disabled:text-neutral-500',
        ],
      },
      size: {
        xs: 'h-7 px-2 text-xs', // 28px height
        sm: 'h-8 px-3 text-sm', // 32px height
        md: 'h-10 px-4 text-sm', // 40px height
        lg: 'h-11 px-6 text-base', // 44px height (WCAG minimum)
        xl: 'h-12 px-8 text-base', // 48px height (comfortable)
      },
      fullWidth: {
        true: 'w-full',
        false: 'w-auto',
      },
      loading: {
        true: 'cursor-not-allowed',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      fullWidth: false,
      loading: false,
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  loadingText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      loading = false,
      loadingText,
      leftIcon,
      rightIcon,
      asChild = false,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : 'button';
    const isDisabled = disabled || loading;

    return (
      <Comp
        className={cn(
          buttonVariants({ variant, size, fullWidth, loading }),
          className
        )}
        ref={ref}
        disabled={isDisabled}
        aria-disabled={isDisabled}
        aria-busy={loading}
        {...props}
      >
        {/* Loading spinner */}
        {loading && (
          <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
        )}
        
        {/* Left icon */}
        {!loading && leftIcon && (
          <span className="flex-shrink-0" aria-hidden="true">
            {leftIcon}
          </span>
        )}
        
        {/* Button content */}
        <span className={cn(loading && 'opacity-0')}>
          {loading && loadingText ? loadingText : children}
        </span>
        
        {/* Right icon */}
        {!loading && rightIcon && (
          <span className="flex-shrink-0" aria-hidden="true">
            {rightIcon}
          </span>
        )}
        
        {/* Ripple effect container */}
        <span className="absolute inset-0 overflow-hidden rounded-lg">
          <span className="ripple-effect" />
        </span>
      </Comp>
    );
  }
);

Button.displayName = 'Button';

// Icon button variant for square buttons with just icons
export interface IconButtonProps extends Omit<ButtonProps, 'leftIcon' | 'rightIcon'> {
  icon: React.ReactNode;
  'aria-label': string; // Required for accessibility
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, className, size = 'md', ...props }, ref) => {
    const iconSizes = {
      xs: 'h-7 w-7', // 28px
      sm: 'h-8 w-8', // 32px
      md: 'h-10 w-10', // 40px
      lg: 'h-11 w-11', // 44px
      xl: 'h-12 w-12', // 48px
    };

    return (
      <Button
        ref={ref}
        size={size}
        className={cn(
          'p-0',
          iconSizes[size as keyof typeof iconSizes],
          className
        )}
        {...props}
      >
        <span aria-hidden="true">{icon}</span>
      </Button>
    );
  }
);

IconButton.displayName = 'IconButton';

// Button group for related actions
export interface ButtonGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: 'horizontal' | 'vertical';
  spacing?: 'none' | 'sm' | 'md';
}

export const ButtonGroup = forwardRef<HTMLDivElement, ButtonGroupProps>(
  ({ children, orientation = 'horizontal', spacing = 'sm', className, ...props }, ref) => {
    const spacingClasses = {
      none: '',
      sm: orientation === 'horizontal' ? 'gap-2' : 'gap-2',
      md: orientation === 'horizontal' ? 'gap-4' : 'gap-4',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'flex',
          orientation === 'horizontal' ? 'flex-row' : 'flex-col',
          spacingClasses[spacing],
          className
        )}
        role="group"
        {...props}
      >
        {children}
      </div>
    );
  }
);

ButtonGroup.displayName = 'ButtonGroup';