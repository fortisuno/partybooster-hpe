import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Socket } from 'socket.io-client';
import { getSocket } from '@/services/socket';
import type { Card, GameState, House, Player } from '@/types';

type ScreenId = 'join-create' | 'lobby' | 'game-arena' | 'profile-edit' | 'card-info';

interface UserProfile {
  name: string;
  house: House;
}

interface GameStore {
  socket: Socket | null;
  isConnected: boolean;
  isLoading: boolean;
  isJoiningRoom: boolean;
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
  finishTurn(): void;
  leaveRoom(): void;
  kickPlayer(targetPlayerId: string): void;
  terminateSession(): void;
  clearError(): void;
  reset(): void;
  setScreen(screen: ScreenId): void;
  goBack(): void;
  goToProfile(): void;
  goToCardInfo(): void;
  updateUserProfile(profile: UserProfile): void;
  toggleSidebar(open?: boolean): void;
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      socket: null,
      isConnected: false,
      isLoading: false,
      isJoiningRoom: false,
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

        socket.removeAllListeners();

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
            isJoiningRoom: false,
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
            isJoiningRoom: false,
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
            isJoiningRoom: false,
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

        socket.on('game:started', (data: { gameState: GameState; card: Card }) => {
          set({
            gameState: data.gameState,
            lastDrawnCard: data.card,
            currentScreen: 'game-arena',
            prevScreen: 'lobby',
            isLoading: false,
          });
        });

        socket.on('turn:finished', (data: { card: Card; gameState: GameState }) => {
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

        socket.on('room:updated', (data: { gameState: GameState }) => {
          set({ gameState: data.gameState });
        });

        socket.on('error', (data: { message: string }) => {
          set({ lastError: data.message, isLoading: false, isJoiningRoom: false });
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
        const { socket, playerId, isJoiningRoom } = get();
        if (!socket || isJoiningRoom) return;
        set({ userProfile: { name, house }, playerName: name, playerHouse: house, roomCode: roomCode.toUpperCase(), isLoading: true, isJoiningRoom: true });
        socket.emit('room:join', { roomCode: roomCode.toUpperCase(), name, house, playerId });
      },

      startGame() {
        const { socket } = get();
        if (!socket) return;
        set({ isLoading: true });
        socket.emit('game:start');
      },

      finishTurn() {
        const { socket } = get();
        if (!socket) return;
        set({ isLoading: true });
        socket.emit('turn:finish');
      },

      leaveRoom() {
        const { socket } = get();
        if (!socket) return;
        set({ isLoading: true });
        socket.emit('room:leave');
      },

      kickPlayer(targetPlayerId: string) {
        const { socket } = get();
        if (!socket) return;
        set({ isLoading: true });
        socket.emit('player:kick', { targetPlayerId });
        set({ isLoading: false });
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

      goToCardInfo() {
        const { currentScreen } = get();
        set({ prevScreen: currentScreen, currentScreen: 'card-info' });
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
