import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const statusBadgeVariants = cva(
  'inline-flex min-h-6 items-center gap-1.5 whitespace-nowrap rounded-md border font-semibold leading-none',
  {
    variants: {
      tone: {
        neutral:
          'border-border bg-neutral-subtle text-muted-foreground before:bg-muted-foreground/70',
        brand:
          'border-brand/20 bg-brand-subtle text-brand before:bg-brand',
        navy:
          'border-navy/20 bg-navy-subtle text-navy before:bg-navy',
        bronze:
          'border-bronze/25 bg-bronze-subtle text-bronze-foreground before:bg-bronze',
        success:
          'border-success/20 bg-success-subtle text-success-foreground before:bg-success',
        info:
          'border-info/20 bg-info-subtle text-info-foreground before:bg-info',
        warning:
          'border-warning/20 bg-warning-subtle text-warning-foreground before:bg-warning',
        danger:
          'border-danger/20 bg-danger-subtle text-danger-foreground before:bg-danger',
      },
      size: {
        sm: 'px-2 py-0.5 text-xs',
        default: 'px-2.5 py-1 text-xs',
      },
      dot: {
        true: 'before:block before:h-1.5 before:w-1.5 before:shrink-0 before:rounded-full',
        false: '',
      },
    },
    defaultVariants: {
      tone: 'neutral',
      size: 'default',
      dot: false,
    },
  },
);

export interface StatusBadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof statusBadgeVariants> {}

const StatusBadge = React.forwardRef<HTMLSpanElement, StatusBadgeProps>(
  ({ className, tone, size, dot, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(statusBadgeVariants({ tone, size, dot }), className)}
      {...props}
    />
  ),
);

StatusBadge.displayName = 'StatusBadge';

export { StatusBadge };
