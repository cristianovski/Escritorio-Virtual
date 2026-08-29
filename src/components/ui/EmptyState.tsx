import * as React from 'react';
import { cn } from '../../lib/utils';

export interface EmptyStateProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  icon?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  compact?: boolean;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  compact = false,
  className,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-surface border border-dashed border-border bg-surface/60 px-6 text-center',
        compact ? 'py-8' : 'py-12',
        className,
      )}
      {...props}
    >
      {icon ? (
        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground shadow-surface [&_svg]:h-5 [&_svg]:w-5">
          {icon}
        </div>
      ) : null}
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      {description ? (
        <div className="mt-1 max-w-md text-sm leading-5 text-muted-foreground">
          {description}
        </div>
      ) : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
