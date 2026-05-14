import type { House } from './card.js';

export interface Player {
  id: string;
  name: string;
  house: House;
  isHost: boolean;
  offline: boolean;
}

export type PlayerId = string;