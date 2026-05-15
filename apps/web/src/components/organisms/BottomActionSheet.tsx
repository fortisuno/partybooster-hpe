import * as React from 'react';
import { useGameStore } from '@/store/useGameStore';
import { CardDisplay } from '@/components/atoms/CardDisplay';
import { CardHand } from '@/components/molecules/CardHand';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from '@/components/ui/Sheet';

export function BottomActionSheet() {
  const { gameState, lastDrawnCard } = useGameStore();
  const [discardOpen, setDiscardOpen] = React.useState(false);

  if (!gameState || gameState.status !== 'playing') return null;

  const discardCount = gameState.discardPile.length;
  const deckCount = gameState.deck.length;

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 bg-zinc-900/95 backdrop-blur border-t border-zinc-800 p-4 safe-area-bottom">
        <div className="max-w-mobile mx-auto flex items-center justify-between gap-4">
          <div className="text-sm text-zinc-400">
            <span className="text-zinc-100 font-medium">{deckCount}</span> en baraja
          </div>

          <button
            onClick={() => setDiscardOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"
          >
            <span className="text-sm font-medium text-zinc-100">Descarte</span>
            {discardCount > 0 && (
              <span className="inline-flex items-center justify-center w-5 h-5 bg-zinc-700 rounded-full text-xs text-zinc-300">
                {discardCount}
              </span>
            )}
          </button>

          {lastDrawnCard && (
            <div className="w-12 h-16 rounded border border-zinc-700 overflow-hidden">
              <CardDisplay card={lastDrawnCard} variant="default" className="w-full h-full [&>div]:p-1" />
            </div>
          )}
        </div>
      </div>

      <Sheet open={discardOpen} onOpenChange={setDiscardOpen}>
        <SheetContent side="bottom">
          <SheetHeader>
            <SheetTitle>
              Pila de Descarte
              <SheetClose onClick={() => setDiscardOpen(false)} />
            </SheetTitle>
          </SheetHeader>
          <div className="mt-4">
            {gameState.discardPile.length === 0 ? (
              <p className="text-sm text-zinc-500 text-center py-8">Sin cartas en la pila de descarte</p>
            ) : (
              <CardHand cards={gameState.discardPile} className="max-h-64 overflow-y-auto" />
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}