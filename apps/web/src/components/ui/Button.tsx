import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-white/10 hover:bg-white/[0.14] text-white border border-white/10',
        destructive: 'bg-red-600/20 text-red-400 hover:bg-red-600/30 border border-red-500/20',
        outline: 'border border-white/8 bg-transparent text-white/50 hover:text-white/80 hover:bg-white/5',
        secondary: 'bg-white/5 text-white/70 hover:bg-white/10 border border-white/5',
        ghost: 'hover:bg-white/5 text-white/50 hover:text-white/80',
        link: 'text-white/60 underline-offset-4 hover:underline hover:text-white',
        glass: 'glass-strong hover:bg-white/[0.09] text-white border border-white/10',
        'gryffindor': 'bg-gryffindor text-white hover:bg-gryffindor/90 border border-gryffindor-gold/20',
        'hufflepuff': 'bg-hufflepuff text-zinc-900 hover:bg-hufflepuff/90',
        'ravenclaw': 'bg-ravenclaw text-white hover:bg-ravenclaw/90 border border-ravenclaw-bronze/20',
        'slytherin': 'bg-slytherin text-white hover:bg-slytherin/90 border border-slytherin-silver/20',
        'glow-pulse': 'bg-gryffindor text-white/90 border border-gryffindor-gold/20 animate-glow-pulse',
      },
      size: {
        default: 'h-12 px-4 py-2',
        sm: 'h-9 rounded-xl px-3',
        lg: 'h-12 rounded-2xl px-8',
        icon: 'h-10 w-10 rounded-full',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };