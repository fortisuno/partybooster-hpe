import { cn } from '@/lib/utils';
import type { House } from '@/types';

interface TurnRingProps {
  isActive: boolean;
  house: House | null;
  className?: string;
  children: React.ReactNode;
}

const houseRingColors: Record<House, string> = {
  Gryffindor: 'ring-gryffindor',
  Hufflepuff: 'ring-hufflepuff',
  Ravenclaw: 'ring-ravenclaw',
  Slytherin: 'ring-slytherin',
};

export function TurnRing({ isActive, house, className, children }: TurnRingProps) {
  return (
    <div
      className={cn(
        'relative rounded-xl transition-all duration-300',
        isActive && house && houseRingColors[house],
        isActive && 'ring-2 ring-offset-2 ring-offset-zinc-950',
        !isActive && 'opacity-70',
        className
      )}
    >
      {children}
      {isActive && (
        <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-transparent to-white/5 pointer-events-none" />
      )}
    </div>
  );
}