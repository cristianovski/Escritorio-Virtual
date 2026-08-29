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
  headingLevel?: 1 | 2;
}

export function PageHeader({
  title,
  description,
  eyebrow,
  leading,
  actions,
  headingId,
  headingLevel = 1,
  className,
  ...props
}: PageHeaderProps) {
  const generatedId = React.useId();
  const resolvedHeadingId = headingId ?? generatedId;
  const Heading = headingLevel === 2 ? 'h2' : 'h1';

  return (
    <header
      aria-labelledby={resolvedHeadingId}
      className={cn(
        'flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between',
        className,
      )}
      {...props}
    >
      <div className="flex min-w-0 items-start gap-3">
        {leading ? (
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-control bg-secondary text-muted-foreground">{leading}</div>
        ) : null}
        <div className="min-w-0">
          {eyebrow ? (
            <p className="mb-1.5 text-xs font-medium text-primary">
              {eyebrow}
            </p>
          ) : null}
          <Heading
            id={resolvedHeadingId}
            className={cn(
              'font-semibold leading-[1.12] tracking-[-0.03em] text-foreground',
              headingLevel === 2
                ? 'text-2xl sm:text-[1.75rem]'
                : 'text-[1.75rem] sm:text-[2rem]',
            )}
          >
            {title}
          </Heading>
          {description ? (
            <div className="mt-2 max-w-3xl text-[0.9375rem] leading-6 text-muted-foreground">
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
