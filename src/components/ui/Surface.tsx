import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const surfaceVariants = cva(
  'border text-card-foreground',
  {
    variants: {
      variant: {
        default: 'border-border bg-card shadow-surface',
        subtle: 'border-border/80 bg-surface-subtle shadow-none',
        outlined: 'border-border bg-transparent shadow-none',
        elevated: 'border-border bg-card shadow-floating',
      },
      padding: {
        none: 'p-0',
        sm: 'p-4',
        md: 'p-5',
        lg: 'p-6',
      },
      radius: {
        sm: 'rounded-lg',
        default: 'rounded-surface',
        lg: 'rounded-dialog',
      },
    },
    defaultVariants: {
      variant: 'default',
      padding: 'md',
      radius: 'default',
    },
  },
);

export interface SurfaceProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof surfaceVariants> {}

const Surface = React.forwardRef<HTMLDivElement, SurfaceProps>(
  ({ className, variant, padding, radius, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(surfaceVariants({ variant, padding, radius }), className)}
      {...props}
    />
  ),
);

Surface.displayName = 'Surface';

export { Surface };
