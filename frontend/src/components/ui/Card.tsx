import { type HTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  glass?: boolean;
  glow?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export function Card({ glass, glow, padding = 'md', className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-[var(--border)] bg-[var(--surface-1)]',
        'transition-all duration-300',
        glass && 'glass',
        glow && 'hover:border-brand-500/50 hover:shadow-lg hover:shadow-brand-900/20',
        padding === 'none' && 'p-0',
        padding === 'sm'   && 'p-4',
        padding === 'md'   && 'p-6',
        padding === 'lg'   && 'p-8',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('mb-4 flex items-center justify-between', className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className, children, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn('text-lg font-semibold text-[var(--text-primary)]', className)} {...props}>
      {children}
    </h3>
  );
}

export function CardContent({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('', className)} {...props}>
      {children}
    </div>
  );
}
