import { CardDisplay } from '@/components/atoms/CardDisplay';
import type { Card } from '@/types';

interface CardHandProps {
  cards: Card[];
  className?: string;
}

export function CardHand({ cards, className }: CardHandProps) {
  if (cards.length === 0) {
    return (
      <div className={className}>
        <p className="text-sm text-zinc-500 text-center py-4">Sin cartas aún</p>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {cards.map((card, index) => (
          <div key={`${card.name}-${index}`} className="flex-shrink-0">
            <CardDisplay card={card} variant="discard" />
          </div>
        ))}
      </div>
    </div>
  );
}