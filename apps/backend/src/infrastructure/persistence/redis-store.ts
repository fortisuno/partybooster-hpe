import Redis from 'ioredis';
import type { GameState } from '@game/shared';
import type { GameStore, StorageStatus } from './game-store.js';

const ROOM_PREFIX = 'room:';
const PLAYER_PREFIX = 'player:';
const ROOM_PLAYERS_PREFIX = 'room-players:';

export function createRedisStore(redisUrl: string): GameStore {
  const redis = new Redis(redisUrl);

  async function getRoom(roomCode: string): Promise<GameState | undefined> {
    const data = await redis.get(`${ROOM_PREFIX}${roomCode}`);
    if (!data) return undefined;
    try {
      return JSON.parse(data) as GameState;
    } catch {
      return undefined;
    }
  }

  async function setRoom(roomCode: string, gameState: GameState): Promise<void> {
    await redis.set(`${ROOM_PREFIX}${roomCode}`, JSON.stringify(gameState));
  }

  async function deleteRoom(roomCode: string): Promise<void> {
    await redis.del(`${ROOM_PREFIX}${roomCode}`);
    await redis.del(`${ROOM_PLAYERS_PREFIX}${roomCode}`);
  }

  async function getAllRoomCodes(): Promise<string[]> {
    const keys = await redis.keys(`${ROOM_PREFIX}*`);
    return keys.map((k) => k.replace(ROOM_PREFIX, ''));
  }

  async function getPlayerRoom(playerId: string): Promise<string | undefined> {
    const roomCode = await redis.get(`${PLAYER_PREFIX}${playerId}`);
    return roomCode ?? undefined;
  }

  async function setPlayerRoom(playerId: string, roomCode: string): Promise<void> {
    await redis.set(`${PLAYER_PREFIX}${playerId}`, roomCode);
    await redis.sadd(`${ROOM_PLAYERS_PREFIX}${roomCode}`, playerId);
  }

  async function deletePlayerRoom(playerId: string): Promise<void> {
    const roomCode = await redis.get(`${PLAYER_PREFIX}${playerId}`);
    if (roomCode) {
      await redis.srem(`${ROOM_PLAYERS_PREFIX}${roomCode}`, playerId);
    }
    await redis.del(`${PLAYER_PREFIX}${playerId}`);
  }

  async function getPlayersInRoom(roomCode: string): Promise<string[]> {
    return await redis.smembers(`${ROOM_PLAYERS_PREFIX}${roomCode}`);
  }

  async function getStatus(): Promise<StorageStatus> {
    const redisStatus = redis.status === 'ready' ? 'operational' : 'degraded';
    const roomKeys = await redis.keys(`${ROOM_PREFIX}*`);
    const playerKeys = await redis.keys(`${PLAYER_PREFIX}*`);
    const roomCodes = roomKeys.map((k) => k.replace(ROOM_PREFIX, ''));

    return {
      storageType: 'redis',
      status: redisStatus,
      metrics: {
        totalRooms: roomKeys.length,
        totalPlayers: playerKeys.length,
        totalSocketMappings: 0,
      },
      payload: {
        roomCodes,
        playerIds: playerKeys.map((k) => k.replace(PLAYER_PREFIX, '')),
      },
    };
  }

  async function clearAll(): Promise<void> {
    const keys = await redis.keys(`${ROOM_PREFIX}*`);
    const playerKeys = await redis.keys(`${PLAYER_PREFIX}*`);
    const roomPlayerKeys = await redis.keys(`${ROOM_PLAYERS_PREFIX}*`);
    const allKeys = [...keys, ...playerKeys, ...roomPlayerKeys];
    if (allKeys.length > 0) {
      await redis.del(...allKeys);
    }
  }

  return {
    getRoom,
    setRoom,
    deleteRoom,
    getAllRoomCodes,
    getPlayerRoom,
    setPlayerRoom,
    deletePlayerRoom,
    getPlayersInRoom,
    getStatus,
    clearAll,
  };
}
