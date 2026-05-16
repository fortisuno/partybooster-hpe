import type { GameState, Player, House, Card } from '@game/shared';
import { ROOM_CODE_LENGTH } from '@game/shared';
import { ALPHANUMERIC } from '../config/constants.js';
import { createDeckManager, drawCard } from './deck-manager.js';
import { createTurnManager } from './turn-manager.js';

export interface RoomManager {
  createRoom(hostId: string, hostName: string, hostHouse: House): GameState;
  joinRoom(roomCode: string, playerId: string, name: string, house: House): Player | null;
  startGame(gameState: GameState): { gameState: GameState; firstCard: Card };
  terminateRoom(roomCode: string, requesterId: string): boolean;
  findPlayerRoom(playerId: string): GameState | null;
  removePlayer(players: Player[], playerId: string): { players: Player[]; newHostId: string | null };
  markPlayerOffline(players: Player[], playerId: string): { players: Player[]; newHostId: string | null };
  reactivatePlayer(players: Player[], playerId: string): Player[];
}

export function createRoomManager(): RoomManager {
  function generateRoomCode(): string {
    let code = '';
    for (let i = 0; i < ROOM_CODE_LENGTH; i++) {
      code += ALPHANUMERIC[Math.floor(Math.random() * ALPHANUMERIC.length)];
    }
    return code;
  }

  function createRoom(
    hostId: string,
    hostName: string,
    hostHouse: House
  ): GameState {
    const host: Player = {
      id: hostId,
      name: hostName,
      house: hostHouse,
      isHost: true,
      offline: false,
    };

    return {
      roomCode: generateRoomCode(),
      status: 'lobby',
      players: [host],
      deck: [],
      discardPile: [],
      currentPlayerId: null,
    };
  }

  function joinRoom(
    roomCode: string,
    playerId: string,
    name: string,
    house: House
  ): Player | null {
    return {
      id: playerId,
      name,
      house,
      isHost: false,
      offline: false,
    };
  }

  function startGame(gameState: GameState): { gameState: GameState; firstCard: Card } {
    const deckManager = createDeckManager();
    const turnManager = createTurnManager();

    const deck = deckManager.createDeck();
    const startPlayer = turnManager.getRandomStartPlayer(gameState.players);

    const { card: firstCard, updatedDeck } = drawCard(deck);
    if (!firstCard) {
      throw new Error('No se pudo robar la primera carta.');
    }

    return {
      gameState: {
        ...gameState,
        status: 'playing',
        deck: updatedDeck,
        discardPile: [firstCard],
        currentPlayerId: startPlayer?.id ?? null,
      },
      firstCard,
    };
  }

  function terminateRoom(
    roomCode: string,
    requesterId: string
  ): boolean {
    return true;
  }

  function findPlayerRoom(playerId: string): GameState | null {
    return null;
  }

  function removePlayer(players: Player[], playerId: string): { players: Player[]; newHostId: string | null } {
    const leavingPlayer = players.find((p) => p.id === playerId);
    if (!leavingPlayer) return { players, newHostId: null };

    const wasHost = leavingPlayer.isHost;
    const remainingPlayers = players.filter((p) => p.id !== playerId);

    if (remainingPlayers.length === 0) {
      return { players: [], newHostId: null };
    }

    let updatedPlayers: Player[] = remainingPlayers;
    let newHostId: string | null = null;

    if (wasHost && remainingPlayers.length > 0) {
      const nextHost = remainingPlayers.find((p) => !p.offline) ?? remainingPlayers[0];
      newHostId = nextHost.id;
      updatedPlayers = remainingPlayers.map((p) => ({
        ...p,
        isHost: p.id === nextHost.id,
      }));
    }

    return { players: updatedPlayers, newHostId };
  }

  function markPlayerOffline(players: Player[], playerId: string): { players: Player[]; newHostId: string | null } {
    const player = players.find((p) => p.id === playerId);
    if (!player) return { players, newHostId: null };

    const wasHost = player.isHost;

    const updatedPlayers = players.map((p) =>
      p.id === playerId
        ? { ...p, offline: true, offlineAt: Date.now() }
        : p
    );

    let newHostId: string | null = null;

    if (wasHost) {
      const onlinePlayers = updatedPlayers.filter((p) => !p.offline && p.id !== playerId);
      if (onlinePlayers.length > 0) {
        const nextHost = onlinePlayers[0];
        newHostId = nextHost.id;
        return {
          players: updatedPlayers.map((p) => ({
            ...p,
            isHost: p.id === nextHost.id,
          })),
          newHostId,
        };
      }
      // If no online players, keep host on the offline player or pick first remaining
      const anyRemaining = updatedPlayers.find((p) => p.id !== playerId);
      if (anyRemaining) {
        newHostId = anyRemaining.id;
        return {
          players: updatedPlayers.map((p) => ({
            ...p,
            isHost: p.id === anyRemaining.id,
          })),
          newHostId,
        };
      }
    }

    return { players: updatedPlayers, newHostId };
  }

  function reactivatePlayer(players: Player[], playerId: string): Player[] {
    return players.map((p) =>
      p.id === playerId
        ? { ...p, offline: false, offlineAt: undefined }
        : p
    );
  }

  return {
    createRoom,
    joinRoom,
    startGame,
    terminateRoom,
    findPlayerRoom,
    removePlayer,
    markPlayerOffline,
    reactivatePlayer,
  };
}
