import type { Deck } from './card.js';
import type { Player } from './player.js';

export type GameStatus = 'lobby' | 'playing' | 'finished';

export interface GameState {
  roomCode: string;
  status: GameStatus;
  players: Player[];
  deck: Deck;
  discardPile: Deck;
  currentPlayerId: string | null;
}

export interface Room {
  code: string;
  hostId: string;
}