import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const surfaceVariants = cva(
  'text-card-foreground',
  {
    variants: {
      variant: {
        default: 'bg-card shadow-surface ring-1 ring-black/[0.035]',
        subtle: 'bg-surface-subtle shadow-none',
        outlined: 'bg-transparent shadow-none ring-1 ring-inset ring-border',
        elevated: 'bg-card shadow-floating ring-1 ring-black/[0.04]',
      },
      padding: {
        none: 'p-0',
        sm: 'p-4',
        md: 'p-5',
        lg: 'p-6',
      },
      radius: {
        sm: 'rounded-control',
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
