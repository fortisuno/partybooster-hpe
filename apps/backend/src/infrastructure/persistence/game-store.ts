import type { GameState } from '@game/shared';

export interface StorageMetrics {
  totalRooms: number;
  totalPlayers: number;
  totalSocketMappings: number;
}

export interface StorageStatus {
  storageType: 'in-memory' | 'redis';
  status: 'operational' | 'degraded' | 'offline';
  metrics: StorageMetrics;
  payload: {
    roomCodes: string[];
    playerIds: string[];
  };
}

export interface GameStore {
  getRoom(roomCode: string): Promise<GameState | undefined>;
  setRoom(roomCode: string, gameState: GameState): Promise<void>;
  deleteRoom(roomCode: string): Promise<void>;
  getAllRoomCodes(): Promise<string[]>;

  getPlayerRoom(playerId: string): Promise<string | undefined>;
  setPlayerRoom(playerId: string, roomCode: string): Promise<void>;
  deletePlayerRoom(playerId: string): Promise<void>;
  getPlayersInRoom(roomCode: string): Promise<string[]>;

  getStatus(): Promise<StorageStatus>;
  clearAll(): Promise<void>;
}
