import type { House } from './card.js';

export interface Player {
  id: string;
  name: string;
  house: House;
  isHost: boolean;
  offline: boolean;
  offlineAt?: number;
}

export type PlayerId = string;