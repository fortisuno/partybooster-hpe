import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Socket } from 'socket.io-client';
import { getSocket } from '@/services/socket';
import type { Card, GameState, House, Player } from '@/types';

type ScreenId = 'join-create' | 'lobby' | 'game-arena' | 'profile-edit';

interface UserProfile {
  name: string;
  house: House;
}

interface GameStore {
  socket: Socket | null;
  isConnected: boolean;
  isLoading: boolean;
  playerId: string | null;
  playerName: string | null;
  playerHouse: House | null;
  roomCode: string | null;
  isHost: boolean;
  gameState: GameState | null;
  lastError: string | null;
  lastDrawnCard: Card | null;
  currentScreen: ScreenId;
  prevScreen: ScreenId | null;
  userProfile: UserProfile;
  sidebarOpen: boolean;

  connect(): void;
  disconnect(): void;
  createRoom(name: string, house: House): void;
  joinRoom(roomCode: string, name: string, house: House): void;
  startGame(): void;
  drawCard(): void;
  leaveRoom(): void;
  terminateSession(): void;
  clearError(): void;
  reset(): void;
  setScreen(screen: ScreenId): void;
  goBack(): void;
  goToProfile(): void;
  updateUserProfile(profile: UserProfile): void;
  toggleSidebar(open?: boolean): void;
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      socket: null,
      isConnected: false,
      isLoading: false,
      playerId: null,
      playerName: null,
      playerHouse: null,
      roomCode: null,
      isHost: false,
      gameState: null,
      lastError: null,
      lastDrawnCard: null,
      currentScreen: 'join-create',
      prevScreen: null,
      userProfile: {
        name: 'Harry',
        house: 'Gryffindor' as House,
      },
      sidebarOpen: false,

      connect() {
        const socket = getSocket();

        if (socket.connected) {
          set({ socket, isConnected: true });
          const { playerId } = get();
          if (playerId) {
            socket.emit('player:reconnect', { playerId });
          }
          return;
        }

        socket.on('connect', () => {
          set({ isConnected: true, lastError: null });
          const { playerId } = get();
          if (playerId) {
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
            gameState: data.gameState,
            isHost: true,
            lastError: null,
            isLoading: false,
            currentScreen: 'lobby',
            prevScreen: 'join-create',
          });
        });

        socket.on('room:joined', (data: { roomCode: string; playerId: string; gameState: GameState }) => {
          set({
            roomCode: data.roomCode,
            playerId: data.playerId,
            gameState: data.gameState,
            isHost: false,
            lastError: null,
            isLoading: false,
            currentScreen: 'lobby',
            prevScreen: 'join-create',
          });
        });

        socket.on('room:rejoined', (data: { roomCode: string; playerId: string; gameState: GameState }) => {
          set({
            roomCode: data.roomCode,
            playerId: data.playerId,
            gameState: data.gameState,
            isHost: data.gameState.players.find((p: Player) => p.id === data.playerId)?.isHost ?? false,
            currentScreen: data.gameState.status === 'playing' ? 'game-arena' : 'lobby',
            prevScreen: 'join-create',
            lastError: null,
            isLoading: false,
          });
        });

        socket.on('room:left', () => {
          set({
            roomCode: null,
            isHost: false,
            gameState: null,
            lastDrawnCard: null,
            currentScreen: 'join-create',
            prevScreen: null,
            sidebarOpen: false,
            isLoading: false,
          });
        });

        socket.on('player:joined', (data: { player: Player }) => {
          const { gameState } = get();
          if (gameState) {
            set({
              gameState: {
                ...gameState,
                players: [...gameState.players, data.player],
              },
            });
          }
        });

        socket.on('game:started', (data: { gameState: GameState }) => {
          set({
            gameState: data.gameState,
            currentScreen: 'game-arena',
            prevScreen: 'lobby',
            isLoading: false,
          });
        });

        socket.on('card:drawn', (data: { card: Card; gameState: GameState }) => {
          set({
            gameState: data.gameState,
            lastDrawnCard: data.card,
            isLoading: false,
          });
        });

        socket.on('session:terminated', () => {
          set({
            gameState: null,
            roomCode: null,
            isHost: false,
            lastDrawnCard: null,
            currentScreen: 'join-create',
            prevScreen: null,
            isLoading: false,
          });
        });

        socket.on('player:left', (data: { playerId: string }) => {
          const { gameState } = get();
          if (gameState) {
            set({
              gameState: {
                ...gameState,
                players: gameState.players.filter((p: Player) => p.id !== data.playerId),
              },
            });
          }
        });

        socket.on('player:reconnected', (data: { playerId: string }) => {
          const { gameState } = get();
          if (gameState) {
            set({
              gameState: {
                ...gameState,
                players: gameState.players.map((p: Player) =>
                  p.id === data.playerId ? { ...p, offline: false } : p
                ),
              },
            });
          }
        });

        socket.on('host:changed', (data: { newHostId: string }) => {
          const { gameState } = get();
          const { playerId } = get();
          if (gameState) {
            set({
              gameState: {
                ...gameState,
                players: gameState.players.map((p: Player) => ({
                  ...p,
                  isHost: p.id === data.newHostId,
                })),
              },
              isHost: data.newHostId === playerId,
            });
          }
        });

        socket.on('error', (data: { message: string }) => {
          set({ lastError: data.message, isLoading: false });
        });

        socket.connect();
        set({ socket, isConnected: socket.connected });
      },

      disconnect() {
        const { socket } = get();
        if (socket) {
          socket.removeAllListeners();
          socket.disconnect();
          set({ socket: null, isConnected: false, isLoading: false });
        }
      },

      createRoom(name: string, house: House) {
        const { socket } = get();
        if (!socket) return;
        set({ userProfile: { name, house }, playerName: name, playerHouse: house, isLoading: true });
        socket.emit('room:create', { name, house });
      },

      joinRoom(roomCode: string, name: string, house: House) {
        const { socket } = get();
        if (!socket) return;
        set({ userProfile: { name, house }, playerName: name, playerHouse: house, roomCode: roomCode.toUpperCase(), isLoading: true });
        socket.emit('room:join', { roomCode: roomCode.toUpperCase(), name, house });
      },

      startGame() {
        const { socket } = get();
        if (!socket) return;
        set({ isLoading: true });
        socket.emit('game:start');
      },

      drawCard() {
        const { socket } = get();
        if (!socket) return;
        set({ isLoading: true });
        socket.emit('game:draw');
      },

      leaveRoom() {
        const { socket } = get();
        if (!socket) return;
        set({ isLoading: true });
        socket.emit('room:leave');
      },

      terminateSession() {
        const { socket } = get();
        if (!socket) return;
        set({ isLoading: true });
        socket.emit('game:terminate');
      },

      clearError() {
        set({ lastError: null });
      },

      reset() {
        const { socket } = get();
        if (socket) {
          socket.removeAllListeners();
          socket.disconnect();
        }
        set({
          socket: null,
          isConnected: false,
          isLoading: false,
          playerId: null,
          playerName: null,
          playerHouse: null,
          roomCode: null,
          isHost: false,
          gameState: null,
          lastError: null,
          lastDrawnCard: null,
          currentScreen: 'join-create',
          prevScreen: null,
          sidebarOpen: false,
        });
      },

      setScreen(screen: ScreenId) {
        const { currentScreen } = get();
        set({ prevScreen: currentScreen, currentScreen: screen });
      },

      goBack() {
        const { prevScreen } = get();
        if (prevScreen) {
          set({ currentScreen: prevScreen, prevScreen: null });
        } else {
          set({ currentScreen: 'join-create' });
        }
      },

      goToProfile() {
        const { currentScreen } = get();
        set({ prevScreen: currentScreen, currentScreen: 'profile-edit' });
      },

      updateUserProfile(profile: UserProfile) {
        set({
          userProfile: profile,
          playerName: profile.name,
          playerHouse: profile.house,
        });
      },

      toggleSidebar(open?: boolean) {
        const { sidebarOpen } = get();
        set({ sidebarOpen: open !== undefined ? open : !sidebarOpen });
      },
    }),
    {
      name: 'hpe-game-storage',
      partialize: (state) => ({
        playerId: state.playerId,
        playerName: state.playerName,
        playerHouse: state.playerHouse,
        roomCode: state.roomCode,
        isHost: state.isHost,
        userProfile: state.userProfile,
      }),
    }
  )
);