import type { Player } from '@game/shared';
import { GRACE_PERIOD_MS } from '@game/shared';

export interface GracePeriodManager {
  handleDisconnect(
    playerId: string,
    roomCode: string,
    onTimeout: () => void
  ): void;
  handleReconnect(playerId: string): void;
  clearDisconnectTimer(playerId: string): void;
}

export function createGracePeriodManager(): GracePeriodManager {
  const timers = new Map<string, NodeJS.Timeout>();

  function handleDisconnect(
    playerId: string,
    roomCode: string,
    onTimeout: () => void
  ): void {
    clearDisconnectTimer(playerId);
    const timer = setTimeout(() => {
      timers.delete(playerId);
      onTimeout();
    }, GRACE_PERIOD_MS);
    timers.set(playerId, timer);
  }

  function handleReconnect(playerId: string): void {
    clearDisconnectTimer(playerId);
  }

  function clearDisconnectTimer(playerId: string): void {
    const existing = timers.get(playerId);
    if (existing) {
      clearTimeout(existing);
      timers.delete(playerId);
    }
  }

  return {
    handleDisconnect,
    handleReconnect,
    clearDisconnectTimer,
  };
}