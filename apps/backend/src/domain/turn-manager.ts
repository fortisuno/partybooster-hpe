import type { GameState, Player } from '@game/shared';

export interface TurnManager {
  getRandomStartPlayer(players: Player[]): Player | null;
  getNextPlayerIndex(players: Player[], currentIndex: number): number;
  getCurrentPlayer(gameState: GameState): Player | null;
  advanceTurn(gameState: GameState): GameState;
}

export function createTurnManager(): TurnManager {
  function getActivePlayers(players: Player[]): Player[] {
    return players.filter((p) => !p.offline);
  }

  function getRandomStartPlayer(players: Player[]): Player | null {
    const active = getActivePlayers(players);
    if (active.length === 0) return null;
    const index = Math.floor(Math.random() * active.length);
    return active[index];
  }

  function getNextPlayerIndex(players: Player[], currentIndex: number): number {
    const active = getActivePlayers(players);
    if (active.length === 0) return 0;
    return (currentIndex + 1) % active.length;
  }

  function getCurrentPlayer(gameState: GameState): Player | null {
    if (!gameState.currentPlayerId) return null;
    return (
      gameState.players.find((p) => p.id === gameState.currentPlayerId) ?? null
    );
  }

  function advanceTurn(gameState: GameState): GameState {
    const active = getActivePlayers(gameState.players);
    if (active.length === 0) return gameState;

    const currentIndex = active.findIndex(
      (p) => p.id === gameState.currentPlayerId
    );
    const nextIndex = getNextPlayerIndex(active, currentIndex);
    const nextPlayer = active[nextIndex];

    return {
      ...gameState,
      currentPlayerId: nextPlayer.id,
    };
  }

  return {
    getRandomStartPlayer,
    getNextPlayerIndex,
    getCurrentPlayer,
    advanceTurn,
  };
}