import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Socket } from 'socket.io-client';
import type { GameState, Player, Card, House } from '@game/shared';
import { getSocket } from '../services/socket';

interface GameStore {
  socket: Socket | null;
  isConnected: boolean;
  playerId: string | null;
  playerName: string | null;
  playerHouse: House | null;
  roomCode: string | null;
  isHost: boolean;
  gameState: GameState | null;
  lastError: string | null;
  lastDrawnCard: Card | null;

  connect: () => void;
  disconnect: () => void;
  createRoom: (name: string, house: House) => void;
  joinRoom: (roomCode: string, name: string, house: House) => void;
  startGame: () => void;
  drawCard: () => void;
  terminateSession: () => void;
  clearError: () => void;
  reset: () => void;
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      socket: null,
      isConnected: false,
      playerId: null,
      playerName: null,
      playerHouse: null,
      roomCode: null,
      isHost: false,
      gameState: null,
      lastError: null,
      lastDrawnCard: null,

      connect: () => {
        const existing = get().socket;
        if (existing) return;

        const socket = getSocket();

        socket.on('connect', () => {
          set({ isConnected: true });

          const { playerId, roomCode } = get();
          if (playerId && roomCode) {
            socket.emit('player:reconnect', { playerId });
          }
        });

        socket.on('disconnect', () => {
          set({ isConnected: false });
        });

        socket.on('room:created', (data: { roomCode: string; playerId: string; gameState: GameState }) => {
          set({
            roomCode: data.roomCode,
            playerId: data.playerId,
            isHost: true,
            gameState: data.gameState,
            lastError: null,
          });
        });

        socket.on('room:joined', (data: { roomCode: string; playerId: string; gameState: GameState }) => {
          set({
            roomCode: data.roomCode,
            playerId: data.playerId,
            isHost: false,
            gameState: data.gameState,
            lastError: null,
          });
        });

        socket.on('player:joined', (data: { player: Player }) => {
          const { gameState } = get();
          if (!gameState) return;
          const exists = gameState.players.find((p) => p.id === data.player.id);
          if (!exists) {
            set({
              gameState: {
                ...gameState,
                players: [...gameState.players, data.player],
              },
            });
          }
        });

        socket.on('game:started', (data: { gameState: GameState }) => {
          set({ gameState: data.gameState });
        });

        socket.on('card:drawn', (data: { card: Card; gameState: GameState }) => {
          set({
            gameState: data.gameState,
            lastDrawnCard: data.card,
          });
        });

        socket.on('session:terminated', () => {
          get().reset();
        });

        socket.on('player:offline', (data: { playerId: string }) => {
          const { gameState } = get();
          if (!gameState) return;
          set({
            gameState: {
              ...gameState,
              players: gameState.players.map((p) =>
                p.id === data.playerId ? { ...p, offline: true } : p
              ),
            },
          });
        });

        socket.on('player:left', (data: { playerId: string }) => {
          const { gameState } = get();
          if (!gameState) return;
          set({
            gameState: {
              ...gameState,
              players: gameState.players.filter((p) => p.id !== data.playerId),
            },
          });
        });

        socket.on('player:reconnected', (data: { playerId: string }) => {
          const { gameState } = get();
          if (!gameState) return;
          set({
            gameState: {
              ...gameState,
              players: gameState.players.map((p) =>
                p.id === data.playerId ? { ...p, offline: false } : p
              ),
            },
          });
        });

        socket.on('error', (data: { message: string }) => {
          set({ lastError: data.message });
        });

        socket.connect();
        set({ socket });
      },

      disconnect: () => {
        const { socket } = get();
        if (socket) {
          socket.removeAllListeners();
          socket.disconnect();
        }
        set({ socket: null, isConnected: false });
      },

      createRoom: (name: string, house: House) => {
        const { socket } = get();
        if (!socket) return;
        set({ playerName: name, playerHouse: house, lastError: null });
        socket.emit('room:create', { name, house });
      },

      joinRoom: (roomCode: string, name: string, house: House) => {
        const { socket } = get();
        if (!socket) return;
        set({ playerName: name, playerHouse: house, lastError: null });
        socket.emit('room:join', { roomCode: roomCode.toUpperCase(), name, house });
      },

      startGame: () => {
        const { socket } = get();
        if (!socket) return;
        socket.emit('game:start');
      },

      drawCard: () => {
        const { socket } = get();
        if (!socket) return;
        socket.emit('game:draw');
      },

      terminateSession: () => {
        const { socket } = get();
        if (!socket) return;
        socket.emit('game:terminate');
      },

      clearError: () => {
        set({ lastError: null });
      },

      reset: () => {
        const { socket } = get();
        if (socket) {
          socket.removeAllListeners();
          socket.disconnect();
        }
        set({
          socket: null,
          isConnected: false,
          playerId: null,
          playerName: null,
          playerHouse: null,
          roomCode: null,
          isHost: false,
          gameState: null,
          lastError: null,
          lastDrawnCard: null,
        });
      },
    }),
    {
      name: 'game-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        playerId: state.playerId,
        playerName: state.playerName,
        playerHouse: state.playerHouse,
        roomCode: state.roomCode,
        isHost: state.isHost,
      }),
    }
  )
);