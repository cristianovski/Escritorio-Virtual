import * as React from 'react';
import { cn } from '../../lib/utils';

export interface PageHeaderProps
  extends Omit<React.HTMLAttributes<HTMLElement>, 'title'> {
  title: React.ReactNode;
  description?: React.ReactNode;
  eyebrow?: React.ReactNode;
  leading?: React.ReactNode;
  actions?: React.ReactNode;
  headingId?: string;
}

export function PageHeader({
  title,
  description,
  eyebrow,
  leading,
  actions,
  headingId,
  className,
  ...props
}: PageHeaderProps) {
  const generatedId = React.useId();
  const resolvedHeadingId = headingId ?? generatedId;

  return (
    <header
      aria-labelledby={resolvedHeadingId}
      className={cn(
        'flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between',
        className,
      )}
      {...props}
    >
      <div className="flex min-w-0 items-start gap-3">
        {leading ? (
          <div className="mt-0.5 shrink-0 text-muted-foreground">{leading}</div>
        ) : null}
        <div className="min-w-0">
          {eyebrow ? (
            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.08em] text-bronze-foreground">
              {eyebrow}
            </p>
          ) : null}
          <h1
            id={resolvedHeadingId}
            className="text-2xl font-semibold leading-tight tracking-[-0.015em] text-foreground"
          >
            {title}
          </h1>
          {description ? (
            <div className="mt-1.5 max-w-3xl text-sm leading-5 text-muted-foreground">
              {description}
            </div>
          ) : null}
        </div>
      </div>

      {actions ? (
        <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">
          {actions}
        </div>
      ) : null}
    </header>
  );
}
