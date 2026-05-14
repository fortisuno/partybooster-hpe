import type { Card, Deck } from '@game/shared';
import { buildDeck, shuffle } from '@game/shared';

export interface DeckManager {
  createDeck(): Deck;
  reshuffleDiscard(discardPile: Deck): Deck;
}

export function createDeckManager(): DeckManager {
  return {
    createDeck(): Deck {
      const deck = buildDeck();
      return shuffle(deck);
    },
    reshuffleDiscard(discardPile: Deck): Deck {
      if (discardPile.length === 0) {
        return [];
      }
      return shuffle([...discardPile]);
    },
  };
}

export function drawCard(deck: Deck): { card: Card | undefined; updatedDeck: Deck } {
  const card = deck.pop();
  return { card, updatedDeck: deck };
}