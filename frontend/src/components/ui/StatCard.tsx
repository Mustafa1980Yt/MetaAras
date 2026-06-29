import { type ReactNode } from 'react';
import { cn } from '@/utils/cn';
import { Card } from './Card';
import { Skeleton } from './Skeleton';

interface StatCardProps {
  label: string;
  value?: string | number;
  sub?: string;
  icon?: ReactNode;
  trend?: { value: number; label: string };
  loading?: boolean;
  className?: string;
  accentColor?: string;
}

export function StatCard({
  label,
  value,
  sub,
  icon,
  trend,
  loading,
  className,
  accentColor = '#6366f1',
}: StatCardProps) {
  if (loading) {
    return (
      <div className={cn('rounded-2xl border border-[var(--border)] bg-[var(--surface-1)] p-6 space-y-3', className)}>
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-3 w-1/3" />
      </div>
    );
  }

  return (
    <Card glow className={cn('relative overflow-hidden', className)}>
      {/* background accent stripe */}
      <div
        className="absolute top-0 right-0 w-1 h-full rounded-r-2xl"
        style={{ background: accentColor }}
      />

      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-[var(--text-muted)]">{label}</p>
          <p className="mt-1 text-2xl font-bold text-[var(--text-primary)]">
            {value ?? '—'}
          </p>
          {sub && <p className="mt-0.5 text-xs text-[var(--text-muted)]">{sub}</p>}
          {trend && (
            <p
              className={cn(
                'mt-2 text-xs font-medium',
                trend.value >= 0 ? 'text-emerald-400' : 'text-red-400',
              )}
            >
              {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}% {trend.label}
            </p>
          )}
        </div>
        {icon && (
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: `${accentColor}20` }}
          >
            <span style={{ color: accentColor }}>{icon}</span>
          </div>
        )}
      </div>
    </Card>
  );
}
