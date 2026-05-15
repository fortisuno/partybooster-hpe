import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-white/10 text-white/70 border border-white/5',
        gryffindor: 'bg-gryffindor text-white',
        'gryffindor-gold': 'bg-gryffindor-gold text-zinc-900',
        hufflepuff: 'bg-hufflepuff text-zinc-900',
        'hufflepuff-dark': 'bg-gryffindor text-white',
        ravenclaw: 'bg-ravenclaw text-white',
        'ravenclaw-bronze': 'bg-ravenclaw-bronze text-white',
        slytherin: 'bg-slytherin text-white',
        'slytherin-silver': 'bg-slytherin-silver text-zinc-900',
        offline: 'bg-white/5 text-white/30 border border-white/5',
        host: 'bg-amber-500/20 text-amber-300 border border-amber-500/20',
        online: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };