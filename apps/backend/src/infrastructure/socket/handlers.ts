import type { Server, Socket } from 'socket.io';
import type { House } from '@game/shared';
import { createDeckManager, drawCard } from '../../domain/deck-manager.js';
import { createTurnManager } from '../../domain/turn-manager.js';
import { createRoomManager } from '../../domain/room-manager.js';
import { createGracePeriodManager } from '../../domain/grace-period.js';
import type { InMemoryStore } from '../persistence/in-memory-store.js';
import { emitError } from './error-wrapper.js';

export interface SocketHandlers {
  registerHandlers(io: Server): void;
}

export function createSocketHandlers(store: InMemoryStore, io: Server): SocketHandlers {
  const roomManager = createRoomManager();
  const turnManager = createTurnManager();
  const gracePeriodManager = createGracePeriodManager();

  function getPlayerFromSocket(
    socket: Socket
  ): { playerId: string; roomCode: string } | null {
    const playerId = store.socketToPlayer.get(socket.id);
    if (!playerId) return null;
    const roomCode = store.playerToRoom.get(playerId);
    if (!roomCode) return null;
    return { playerId, roomCode };
  }

  async function handleCreateRoom(socket: Socket, payload: unknown) {
    try {
      const { name, house } = payload as { name: string; house: House };
      const playerId = crypto.randomUUID();
      const gameState = roomManager.createRoom(playerId, name, house);

      store.rooms.set(gameState.roomCode, gameState);
      store.playerToRoom.set(playerId, gameState.roomCode);
      store.socketToPlayer.set(socket.id, playerId);

      socket.emit('room:created', {
        roomCode: gameState.roomCode,
        playerId,
        gameState,
      });

      socket.join(gameState.roomCode);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error interno del servidor';
      socket.emit('error', { message });
    }
  }

  async function handleJoinRoom(socket: Socket, payload: unknown) {
    try {
      const { roomCode, name, house } = payload as { roomCode: string; name: string; house: House };
      const gameState = store.rooms.get(roomCode);

      if (!gameState) {
        emitError(socket, 'La sala no existe.');
        return;
      }

      if (gameState.status !== 'lobby') {
        emitError(socket, 'El juego ya ha comenzado.');
        return;
      }

      const playerId = crypto.randomUUID();
      const player = roomManager.joinRoom(roomCode, playerId, name, house);

      if (!player) {
        emitError(socket, 'No se pudo crear el jugador.');
        return;
      }

      gameState.players.push(player);
      store.playerToRoom.set(playerId, roomCode);
      store.socketToPlayer.set(socket.id, playerId);

      socket.emit('room:joined', {
        roomCode,
        playerId,
        gameState,
      });

      socket.join(roomCode);
      socket.to(roomCode).emit('player:joined', { player });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error interno del servidor';
      socket.emit('error', { message });
    }
  }

  async function handleStartGame(socket: Socket) {
    try {
      const lookup = getPlayerFromSocket(socket);
      if (!lookup) {
        emitError(socket, 'No estás en ninguna sala.');
        return;
      }

      const gameState = store.rooms.get(lookup.roomCode);
      if (!gameState) {
        emitError(socket, 'La sala no existe.');
        return;
      }

      const player = gameState.players.find((p) => p.id === lookup.playerId);
      if (!player?.isHost) {
        emitError(socket, 'Solo el anfitrión puede iniciar el juego.');
        return;
      }

      const updatedState = roomManager.startGame(gameState);
      store.rooms.set(lookup.roomCode, updatedState);

      socket.to(lookup.roomCode).emit('game:started', { gameState: updatedState });
      socket.emit('game:started', { gameState: updatedState });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error interno del servidor';
      socket.emit('error', { message });
    }
  }

  async function handleDrawCard(socket: Socket) {
    try {
      const lookup = getPlayerFromSocket(socket);
      if (!lookup) {
        emitError(socket, 'No estás en ninguna sala.');
        return;
      }

      let gameState = store.rooms.get(lookup.roomCode);
      if (!gameState) {
        emitError(socket, 'La sala no existe.');
        return;
      }

      if (gameState.status !== 'playing') {
        emitError(socket, 'El juego no está en progreso.');
        return;
      }

      if (gameState.currentPlayerId !== lookup.playerId) {
        emitError(socket, 'No es tu turno.');
        return;
      }

      const deckManager = createDeckManager();
      let { card, updatedDeck } = drawCard(gameState.deck);

      if (!card && gameState.discardPile.length > 0) {
        gameState = {
          ...gameState,
          deck: deckManager.reshuffleDiscard(gameState.discardPile),
          discardPile: [],
        };
        store.rooms.set(lookup.roomCode, gameState);
        ({ card, updatedDeck } = drawCard(gameState.deck));
      }

      if (!card) {
        emitError(socket, 'No quedan cartas en la baraja.');
        return;
      }

      gameState = {
        ...gameState,
        deck: updatedDeck,
        discardPile: [...gameState.discardPile, card],
      };

      gameState = turnManager.advanceTurn(gameState);
      store.rooms.set(lookup.roomCode, gameState);

      io.to(lookup.roomCode).emit('card:drawn', { card, gameState });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error interno del servidor';
      socket.emit('error', { message });
    }
  }

  async function handleTerminateSession(socket: Socket) {
    try {
      const lookup = getPlayerFromSocket(socket);
      if (!lookup) {
        emitError(socket, 'No estás en ninguna sala.');
        return;
      }

      const gameState = store.rooms.get(lookup.roomCode);
      if (!gameState) {
        emitError(socket, 'La sala no existe.');
        return;
      }

      const player = gameState.players.find((p) => p.id === lookup.playerId);
      if (!player?.isHost) {
        emitError(socket, 'Solo el anfitrión puede terminar la sesión.');
        return;
      }

      io.to(lookup.roomCode).emit('session:terminated');
      io.in(lookup.roomCode).disconnectSockets(true);

      store.rooms.delete(lookup.roomCode);

      for (const [playerId, code] of store.playerToRoom) {
        if (code === lookup.roomCode) {
          store.playerToRoom.delete(playerId);
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error interno del servidor';
      socket.emit('error', { message });
    }
  }

  async function handleReconnect(socket: Socket, payload: unknown) {
    try {
      const { playerId } = payload as { playerId: string };
      const roomCode = store.playerToRoom.get(playerId);

      if (!roomCode) {
        emitError(socket, 'No se encontró tu sala.');
        return;
      }

      const gameState = store.rooms.get(roomCode);
      if (!gameState) {
        emitError(socket, 'La sala ya no existe.');
        return;
      }

      const player = gameState.players.find((p) => p.id === playerId);
      if (!player) {
        emitError(socket, 'No se encontró tu jugador en la sala.');
        return;
      }

      player.offline = false;
      store.socketToPlayer.set(socket.id, playerId);
      gracePeriodManager.handleReconnect(playerId);

      socket.emit('room:joined', { roomCode, playerId, gameState });
      socket.join(roomCode);
      io.to(roomCode).emit('player:reconnected', { playerId });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error interno del servidor';
      socket.emit('error', { message });
    }
  }

  function registerHandlers(_io: Server): void {
    io.on('connection', (socket: Socket) => {
      socket.on('room:create', handleCreateRoom);
      socket.on('room:join', handleJoinRoom);
      socket.on('game:start', handleStartGame);
      socket.on('game:draw', handleDrawCard);
      socket.on('game:terminate', handleTerminateSession);
      socket.on('player:reconnect', handleReconnect);
      socket.on('disconnect', (reason: string) => {
        const playerId = store.socketToPlayer.get(socket.id);
        if (!playerId) return;

        const roomCode = store.playerToRoom.get(playerId);
        if (!roomCode) {
          store.socketToPlayer.delete(socket.id);
          return;
        }

        const gameState = store.rooms.get(roomCode);
        if (!gameState) {
          store.socketToPlayer.delete(socket.id);
          return;
        }

        const player = gameState.players.find((p) => p.id === playerId);
        if (player) {
          player.offline = true;
        }

        gracePeriodManager.handleDisconnect(playerId, roomCode, () => {
          const currentState = store.rooms.get(roomCode);
          if (!currentState) return;

          const targetPlayer = currentState.players.find((p) => p.id === playerId);
          if (!targetPlayer) return;

          if (targetPlayer.isHost) {
            io.to(roomCode).emit('session:terminated');
            io.in(roomCode).disconnectSockets(true);
            store.rooms.delete(roomCode);
            for (const [pid, code] of store.playerToRoom) {
              if (code === roomCode) store.playerToRoom.delete(pid);
            }
          } else {
            const updatedPlayers = currentState.players.filter(
              (p) => p.id !== playerId
            );
            store.rooms.set(roomCode, { ...currentState, players: updatedPlayers });
            io.to(roomCode).emit('player:left', { playerId });
          }

          store.playerToRoom.delete(playerId);
        });

        io.to(roomCode).emit('player:offline', { playerId });
      });
    });
  }

  return { registerHandlers };
}