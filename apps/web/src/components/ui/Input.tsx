import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-12 w-full rounded-2xl glass-strong px-4 py-2 text-sm text-white placeholder:text-white/20',
          'outline-none transition-all duration-200',
          'focus:ring-2 focus:ring-amber-200/20 focus:border-transparent focus:shadow-[0_0_20px_rgba(212,168,67,0.08)]',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'font-body',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input };