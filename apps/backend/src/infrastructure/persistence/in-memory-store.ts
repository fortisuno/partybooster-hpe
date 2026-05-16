import type { GameState } from '@game/shared';
import type { GameStore } from './game-store.js';

export interface InMemoryStore extends GameStore {
  rooms: Map<string, GameState>;
  playerToRoom: Map<string, string>;
  socketToPlayer: Map<string, string>;
}

export function createInMemoryStore(): InMemoryStore {
  const rooms = new Map<string, GameState>();
  const playerToRoom = new Map<string, string>();
  const socketToPlayer = new Map<string, string>();

  async function getRoom(roomCode: string): Promise<GameState | undefined> {
    return rooms.get(roomCode);
  }

  async function setRoom(roomCode: string, gameState: GameState): Promise<void> {
    rooms.set(roomCode, gameState);
  }

  async function deleteRoom(roomCode: string): Promise<void> {
    rooms.delete(roomCode);
  }

  async function getAllRoomCodes(): Promise<string[]> {
    return Array.from(rooms.keys());
  }

  async function getPlayerRoom(playerId: string): Promise<string | undefined> {
    return playerToRoom.get(playerId);
  }

  async function setPlayerRoom(playerId: string, roomCode: string): Promise<void> {
    playerToRoom.set(playerId, roomCode);
  }

  async function deletePlayerRoom(playerId: string): Promise<void> {
    playerToRoom.delete(playerId);
  }

  async function getPlayersInRoom(roomCode: string): Promise<string[]> {
    const result: string[] = [];
    for (const [playerId, code] of playerToRoom) {
      if (code === roomCode) {
        result.push(playerId);
      }
    }
    return result;
  }

  async function clearAll(): Promise<void> {
    rooms.clear();
    playerToRoom.clear();
    socketToPlayer.clear();
  }

  return {
    rooms,
    playerToRoom,
    socketToPlayer,
    getRoom,
    setRoom,
    deleteRoom,
    getAllRoomCodes,
    getPlayerRoom,
    setPlayerRoom,
    deletePlayerRoom,
    getPlayersInRoom,
    clearAll,
  };
}
