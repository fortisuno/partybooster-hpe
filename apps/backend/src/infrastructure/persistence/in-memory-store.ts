import type { GameState } from '@game/shared';

export interface InMemoryStore {
  rooms: Map<string, GameState>;
  playerToRoom: Map<string, string>;
  socketToPlayer: Map<string, string>;
}

export function createInMemoryStore(): InMemoryStore {
  return {
    rooms: new Map<string, GameState>(),
    playerToRoom: new Map<string, string>(),
    socketToPlayer: new Map<string, string>(),
  };
}