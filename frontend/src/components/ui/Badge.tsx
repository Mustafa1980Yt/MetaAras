import { type HTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'brand' | 'accent';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  dot?: boolean;
}

const variants: Record<BadgeVariant, string> = {
  default:  'bg-[var(--surface-3)] text-[var(--text-secondary)] border-[var(--border)]',
  success:  'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  warning:  'bg-amber-500/10   text-amber-400   border-amber-500/20',
  danger:   'bg-red-500/10     text-red-400     border-red-500/20',
  brand:    'bg-brand-500/10   text-brand-400   border-brand-500/20',
  accent:   'bg-cyan-500/10    text-cyan-400    border-cyan-500/20',
};

const dotColors: Record<BadgeVariant, string> = {
  default: 'bg-[var(--text-muted)]',
  success: 'bg-emerald-400',
  warning: 'bg-amber-400',
  danger:  'bg-red-400',
  brand:   'bg-brand-400',
  accent:  'bg-cyan-400',
};

export function Badge({ variant = 'default', dot, className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border',
        variants[variant],
        className,
      )}
      {...props}
    >
      {dot && <span className={cn('w-1.5 h-1.5 rounded-full', dotColors[variant])} />}
      {children}
    </span>
  );
}
