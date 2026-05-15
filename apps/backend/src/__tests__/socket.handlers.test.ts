import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import type { InMemoryStore } from '../infrastructure/persistence/in-memory-store.js';
import type { Server, Socket } from 'socket.io';
import { createSocketHandlers } from '../infrastructure/socket/handlers.js';

type MockSocket = {
  id: string;
  emit: jest.Mock;
  join: jest.Mock;
  leave: jest.Mock;
  to: jest.Mock;
  on: jest.Mock;
  removeAllListeners: jest.Mock;
};

type MockIO = {
  to: jest.Mock;
  in: jest.Mock;
  emit: jest.Mock;
};

function createMockSocket(id = 'socket-1'): MockSocket {
  return {
    id,
    emit: jest.fn(),
    join: jest.fn(),
    leave: jest.fn(),
    to: jest.fn().mockReturnThis(),
    on: jest.fn(),
    removeAllListeners: jest.fn(),
  };
}

function createMockIO(): MockIO {
  return {
    on: jest.fn(),
    to: jest.fn().mockReturnThis(),
    in: jest.fn().mockReturnThis(),
    emit: jest.fn(),
  };
}

function createMockStore(): InMemoryStore {
  return {
    rooms: new Map(),
    playerToRoom: new Map(),
    socketToPlayer: new Map(),
  };
}

describe('Socket Handlers', () => {
  let mockSocket: MockSocket;
  let mockIO: MockIO;
  let store: InMemoryStore;

  beforeEach(() => {
    mockSocket = createMockSocket();
    mockIO = createMockIO();
    store = createMockStore();
  });

  function triggerConnection(io: MockIO, socket: MockSocket) {
    const connectionCallback = io.on.mock.calls.find(
      (call) => call[0] === 'connection'
    )?.[1];
    expect(connectionCallback).toBeDefined();
    connectionCallback(socket);
  }

  describe('room:create', () => {
    it('creates a room and emits room:created', async () => {
      const handlers = createSocketHandlers(store, mockIO as unknown as Server);
      handlers.registerHandlers(mockIO as unknown as Server);
      triggerConnection(mockIO, mockSocket);

      const createHandler = mockSocket.on.mock.calls.find(
        (call) => call[0] === 'room:create'
      )?.[1];

      expect(createHandler).toBeDefined();

      await (createHandler as Function)({
        name: 'Harry',
        house: 'gryffindor',
      });

      expect(mockSocket.emit).toHaveBeenCalledWith('room:created', expect.objectContaining({
        roomCode: expect.any(String),
        playerId: expect.any(String),
        gameState: expect.objectContaining({
          roomCode: expect.any(String),
          status: 'lobby',
        }),
      }));
      expect(mockSocket.join).toHaveBeenCalled();
      expect(store.rooms.size).toBe(1);
      expect(store.playerToRoom.size).toBe(1);
      expect(store.socketToPlayer.size).toBe(1);
    });
  });

  describe('room:join', () => {
    it('joins an existing room', async () => {
      const handlers = createSocketHandlers(store, mockIO as unknown as Server);
      handlers.registerHandlers(mockIO as unknown as Server);
      triggerConnection(mockIO, mockSocket);

      const mockRoom = {
        roomCode: 'ABC123',
        status: 'lobby' as const,
        players: [],
        deck: [],
        discardPile: [],
        currentPlayerId: '',
        turnOrder: [],
      };
      store.rooms.set('ABC123', mockRoom);

      const joinHandler = mockSocket.on.mock.calls.find(
        (call) => call[0] === 'room:join'
      )?.[1];

      await (joinHandler as Function)({
        roomCode: 'ABC123',
        name: 'Hermione',
        house: 'ravenclaw',
      });

      expect(mockSocket.emit).toHaveBeenCalledWith('room:joined', expect.objectContaining({
        roomCode: 'ABC123',
        playerId: expect.any(String),
      }));
      expect(mockSocket.join).toHaveBeenCalledWith('ABC123');
      expect(store.playerToRoom.size).toBe(1);
    });

    it('returns error for non-existent room', async () => {
      const handlers = createSocketHandlers(store, mockIO as unknown as Server);
      handlers.registerHandlers(mockIO as unknown as Server);
      triggerConnection(mockIO, mockSocket);

      const joinHandler = mockSocket.on.mock.calls.find(
        (call) => call[0] === 'room:join'
      )?.[1];

      await (joinHandler as Function)({
        roomCode: 'NONEXIST',
        name: 'Hermione',
        house: 'ravenclaw',
      });

      expect(mockSocket.emit).toHaveBeenCalledWith('error', { message: 'La sala no existe.' });
    });

    it('returns error when game already started', async () => {
      const mockRoom = {
        roomCode: 'ABC123',
        status: 'playing' as const,
        players: [],
        deck: [],
        discardPile: [],
        currentPlayerId: '',
        turnOrder: [],
      };
      store.rooms.set('ABC123', mockRoom);

      const handlers = createSocketHandlers(store, mockIO as unknown as Server);
      handlers.registerHandlers(mockIO as unknown as Server);
      triggerConnection(mockIO, mockSocket);

      const joinHandler = mockSocket.on.mock.calls.find(
        (call) => call[0] === 'room:join'
      )?.[1];

      await (joinHandler as Function)({
        roomCode: 'ABC123',
        name: 'Hermione',
        house: 'ravenclaw',
      });

      expect(mockSocket.emit).toHaveBeenCalledWith('error', { message: 'El juego ya ha comenzado.' });
    });
  });

  describe('disconnect grace period', () => {
    it('removes player from room on disconnect', async () => {
      const playerId = 'player-1';
      const roomCode = 'ROOM1';

      const mockRoom = {
        roomCode: 'ROOM1',
        status: 'lobby' as const,
        players: [{ id: playerId, name: 'Test', house: 'gryffindor', isHost: false, offline: false }],
        deck: [],
        discardPile: [],
        currentPlayerId: '',
        turnOrder: [],
      };
      store.rooms.set(roomCode, mockRoom);
      store.playerToRoom.set(playerId, roomCode);
      store.socketToPlayer.set(mockSocket.id, playerId);

      const handlers = createSocketHandlers(store, mockIO as unknown as Server);
      handlers.registerHandlers(mockIO as unknown as Server);
      triggerConnection(mockIO, mockSocket);

      const disconnectHandler = mockSocket.on.mock.calls.find(
        (call) => call[0] === 'disconnect'
      )?.[1];

      await (disconnectHandler as Function)('client disconnect');

      const updatedRoom = store.rooms.get(roomCode);
      expect(updatedRoom?.players.find((p) => p.id === playerId)).toBeUndefined();
      expect(store.rooms.has(roomCode)).toBe(false);
      expect(store.playerToRoom.has(playerId)).toBe(false);
      expect(store.socketToPlayer.has(mockSocket.id)).toBe(false);
    });
  });

  describe('error wrapper', () => {
    it('catches errors in handler and emits error event', async () => {
      const handlers = createSocketHandlers(store, mockIO as unknown as Server);
      handlers.registerHandlers(mockIO as unknown as Server);
      triggerConnection(mockIO, mockSocket);

      const createHandler = mockSocket.on.mock.calls.find(
        (call) => call[0] === 'room:create'
      )?.[1];

      await (createHandler as Function)(null);

      expect(mockSocket.emit).toHaveBeenCalledWith('error', expect.objectContaining({
        message: expect.any(String),
      }));
    });
  });
});