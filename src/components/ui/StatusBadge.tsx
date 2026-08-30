import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const statusBadgeVariants = cva(
  'inline-flex min-h-6 items-center gap-1.5 whitespace-nowrap rounded-full font-medium leading-none',
  {
    variants: {
      tone: {
        neutral:
          'bg-secondary/75 text-muted-foreground before:bg-muted-foreground/65',
        brand:
          'bg-brand-subtle text-brand before:bg-brand',
        success:
          'bg-success-subtle text-success-foreground before:bg-success',
        info:
          'bg-brand-subtle text-brand before:bg-brand',
        warning:
          'bg-warning-subtle text-warning-foreground before:bg-warning',
        danger:
          'bg-danger-subtle text-danger-foreground before:bg-danger',
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
