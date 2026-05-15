import { cn } from '@/lib/utils';

interface TurnDotProps {
  className?: string;
}

export function TurnDot({ className }: TurnDotProps) {
  return (
    <div
      className={cn(
        'w-2 h-2 rounded-full bg-emerald-400/70 shadow-[0_0_8px_rgba(52,211,153,0.3)]',
        className
      )}
    />
  );
}