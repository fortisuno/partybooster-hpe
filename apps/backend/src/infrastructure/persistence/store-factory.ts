import type { GameStore } from './game-store.js';
import { createInMemoryStore } from './in-memory-store.js';
import { createRedisStore } from './redis-store.js';

export function createGameStore(): GameStore {
  const redisUrl = process.env.REDIS_URL;
  if (redisUrl) {
    console.log('Usando almacenamiento Redis:', redisUrl);
    return createRedisStore(redisUrl);
  }
  console.log('Usando almacenamiento en memoria');
  return createInMemoryStore();
}
