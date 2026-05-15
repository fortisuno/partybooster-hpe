import { Card as UICard, CardContent } from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import type { Card as CardType, House } from '@/types';

interface CardDisplayProps {
  card: CardType;
  variant?: 'default' | 'drawn' | 'discard';
  className?: string;
}

const houseColors: Record<House, string> = {
  Gryffindor: 'border-gryffindor bg-gryffindor/10',
  Hufflepuff: 'border-hufflepuff bg-hufflepuff/10',
  Ravenclaw: 'border-ravenclaw bg-ravenclaw/10',
  Slytherin: 'border-slytherin bg-slytherin/10',
};

const houseTextColors: Record<House, string> = {
  Gryffindor: 'text-gryffindor-light',
  Hufflepuff: 'text-white',
  Ravenclaw: 'text-ravenclaw-light',
  Slytherin: 'text-slytherin-light',
};

export function CardDisplay({ card, variant = 'default', className }: CardDisplayProps) {
  return (
    <UICard
      className={cn(
        'w-32 h-44 rounded-xl border-2 transition-all duration-200',
        houseColors[card.house],
        variant === 'drawn' && 'ring-2 ring-offset-2 ring-offset-zinc-950 ring-amber-400 scale-105',
        variant === 'discard' && 'opacity-70',
        className
      )}
    >
      <CardContent className="p-3 flex flex-col h-full">
        <div className="flex-1">
          <p className="text-xs font-bold text-zinc-300 uppercase tracking-wide mb-1">
            {card.house}
          </p>
          <h3 className={cn('text-sm font-bold leading-tight mb-2', houseTextColors[card.house])}>
            {card.name}
          </h3>
          <p className="text-xs text-white/70 leading-relaxed">
            {card.description}
          </p>
        </div>
        {card.isCounter && (
          <div className="mt-2">
            <span className="inline-block px-2 py-0.5 bg-red-900/50 border border-red-700 rounded text-[10px] font-medium text-red-300">
              COUNTER
            </span>
          </div>
        )}
        <p className="text-[10px] text-white/60 mt-2 italic">
          {card.houseAdvantage}
        </p>
      </CardContent>
    </UICard>
  );
}