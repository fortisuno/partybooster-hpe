import type { GameState, Player, House } from '@game/shared';
import { ROOM_CODE_LENGTH } from '@game/shared';
import { ALPHANUMERIC } from '../config/constants.js';
import { createDeckManager } from './deck-manager.js';
import { createTurnManager } from './turn-manager.js';

export interface RoomManager {
  createRoom(hostId: string, hostName: string, hostHouse: House): GameState;
  joinRoom(roomCode: string, playerId: string, name: string, house: House): Player | null;
  startGame(gameState: GameState): GameState;
  terminateRoom(roomCode: string, requesterId: string): boolean;
  findPlayerRoom(playerId: string): GameState | null;
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

  function startGame(gameState: GameState): GameState {
    const deckManager = createDeckManager();
    const turnManager = createTurnManager();

    const deck = deckManager.createDeck();
    const startPlayer = turnManager.getRandomStartPlayer(gameState.players);

    return {
      ...gameState,
      status: 'playing',
      deck,
      discardPile: [],
      currentPlayerId: startPlayer?.id ?? null,
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

  return {
    createRoom,
    joinRoom,
    startGame,
    terminateRoom,
    findPlayerRoom,
  };
}