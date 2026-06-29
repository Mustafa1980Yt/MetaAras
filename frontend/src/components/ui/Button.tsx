'use client';

import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type Size    = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  fullWidth?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-brand-600 hover:bg-brand-500 text-white shadow-sm shadow-brand-900/30 ' +
    'dark:bg-brand-600 dark:hover:bg-brand-500',
  secondary:
    'bg-[var(--surface-3)] hover:bg-[var(--surface-2)] text-[var(--text-primary)] ' +
    'border border-[var(--border)]',
  outline:
    'bg-transparent border border-brand-500 text-brand-500 hover:bg-brand-500/10',
  ghost:
    'bg-transparent hover:bg-[var(--surface-2)] text-[var(--text-secondary)]',
  danger:
    'bg-red-600 hover:bg-red-500 text-white',
};

const sizeClasses: Record<Size, string> = {
  xs: 'px-2.5 py-1    text-xs  rounded-md  gap-1.5',
  sm: 'px-3   py-1.5  text-sm  rounded-lg  gap-2',
  md: 'px-4   py-2    text-sm  rounded-xl  gap-2',
  lg: 'px-5   py-2.5  text-base rounded-xl gap-2.5',
  xl: 'px-6   py-3    text-base rounded-2xl gap-3',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, fullWidth, className, children, disabled, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center font-medium transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'active:scale-[0.98]',
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && 'w-full',
        className,
      )}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
      )}
      {children}
    </button>
  ),
);
Button.displayName = 'Button';
