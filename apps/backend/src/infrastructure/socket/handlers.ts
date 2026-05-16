import type { Server, Socket } from 'socket.io';
import type { House } from '@game/shared';
import { createDeckManager, drawCard } from '../../domain/deck-manager.js';
import { createTurnManager } from '../../domain/turn-manager.js';
import { createRoomManager } from '../../domain/room-manager.js';
import type { GameStore } from '../persistence/game-store.js';
import { emitError, withErrorWrapper } from './error-wrapper.js';

export interface SocketHandlers {
  registerHandlers(io: Server): void;
}

const OFFLINE_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes

export function createSocketHandlers(gameStore: GameStore, io: Server): SocketHandlers {
  const roomManager = createRoomManager();
  const turnManager = createTurnManager();

  // Ephemeral socket-to-player mapping (connection-local, not persisted)
  const socketToPlayer = new Map<string, string>();

  async function getPlayerFromSocket(
    socket: Socket
  ): Promise<{ playerId: string; roomCode: string } | null> {
    const playerId = socketToPlayer.get(socket.id);
    if (!playerId) return null;
    const roomCode = await gameStore.getPlayerRoom(playerId);
    if (!roomCode) return null;
    return { playerId, roomCode };
  }

  async function cleanupOfflinePlayers() {
    const roomCodes = await gameStore.getAllRoomCodes();
    const now = Date.now();

    for (const roomCode of roomCodes) {
      const gameState = await gameStore.getRoom(roomCode);
      if (!gameState) continue;

      const playersToRemove: string[] = [];
      let updatedPlayers = [...gameState.players];

      for (const player of gameState.players) {
        if (player.offline && player.offlineAt && now - player.offlineAt > OFFLINE_TIMEOUT_MS) {
          playersToRemove.push(player.id);
        }
      }

      if (playersToRemove.length === 0) continue;

      let newHostId: string | null = null;

      for (const playerId of playersToRemove) {
        const result = roomManager.removePlayer(updatedPlayers, playerId);
        updatedPlayers = result.players;
        if (result.newHostId) {
          newHostId = result.newHostId;
        }
        await gameStore.deletePlayerRoom(playerId);
      }

      if (updatedPlayers.length === 0) {
        await gameStore.deleteRoom(roomCode);
        continue;
      }

      await gameStore.setRoom(roomCode, {
        ...gameState,
        players: updatedPlayers,
      });

      for (const playerId of playersToRemove) {
        io.to(roomCode).emit('player:left', { playerId });
      }

      if (newHostId) {
        io.to(roomCode).emit('host:changed', { newHostId });
      }
    }
  }

  // Run cleanup every 5 minutes
  setInterval(() => {
    cleanupOfflinePlayers().catch((err) => {
      console.error('Error en limpieza de jugadores offline:', err);
    });
  }, 5 * 60 * 1000);

  async function handleCreateRoom(socket: Socket, payload: unknown) {
    try {
      const { name, house } = payload as { name: string; house: House };
      const playerId = crypto.randomUUID();
      const gameState = roomManager.createRoom(playerId, name, house);

      await gameStore.setRoom(gameState.roomCode, gameState);
      await gameStore.setPlayerRoom(playerId, gameState.roomCode);
      socketToPlayer.set(socket.id, playerId);

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
      const { roomCode, name, house, playerId: existingPlayerId } = payload as {
        roomCode: string;
        name: string;
        house: House;
        playerId?: string;
      };

      const upperRoomCode = roomCode.toUpperCase();
      const gameState = await gameStore.getRoom(upperRoomCode);

      if (!gameState) {
        emitError(socket, 'La sala no existe.');
        return;
      }

      // Check if this is a rejoin of an offline player
      if (existingPlayerId) {
        const existingPlayer = gameState.players.find((p) => p.id === existingPlayerId);
        if (existingPlayer && existingPlayer.offline) {
          const updatedPlayers = roomManager.reactivatePlayer(gameState.players, existingPlayerId);
          const updatedGameState = { ...gameState, players: updatedPlayers };

          await gameStore.setRoom(upperRoomCode, updatedGameState);
          socketToPlayer.set(socket.id, existingPlayerId);

          socket.emit('room:rejoined', {
            roomCode: upperRoomCode,
            playerId: existingPlayerId,
            gameState: updatedGameState,
          });
          socket.join(upperRoomCode);
          socket.to(upperRoomCode).emit('player:reconnected', { playerId: existingPlayerId });
          return;
        }
      }

      if (gameState.status !== 'lobby') {
        emitError(socket, 'El juego ya ha comenzado.');
        return;
      }

      // Check for duplicate join on same socket
      const existingSocketPlayerId = socketToPlayer.get(socket.id);
      if (existingSocketPlayerId) {
        const existingRoomCode = await gameStore.getPlayerRoom(existingSocketPlayerId);
        if (existingRoomCode) {
          const existingGameState = await gameStore.getRoom(existingRoomCode);
          const existingPlayer = existingGameState?.players.find((p) => p.id === existingSocketPlayerId);
          if (existingPlayer) {
            socket.emit('room:joined', {
              roomCode: existingRoomCode,
              playerId: existingSocketPlayerId,
              gameState: existingGameState,
            });
            return;
          }
        }
      }

      const playerId = crypto.randomUUID();
      const player = roomManager.joinRoom(upperRoomCode, playerId, name, house);

      if (!player) {
        emitError(socket, 'No se pudo crear el jugador.');
        return;
      }

      const updatedGameState = {
        ...gameState,
        players: [...gameState.players, player],
      };

      await gameStore.setRoom(upperRoomCode, updatedGameState);
      await gameStore.setPlayerRoom(playerId, upperRoomCode);
      socketToPlayer.set(socket.id, playerId);

      socket.emit('room:joined', {
        roomCode: upperRoomCode,
        playerId,
        gameState: updatedGameState,
      });

      socket.join(upperRoomCode);
      socket.to(upperRoomCode).emit('player:joined', { player });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error interno del servidor';
      socket.emit('error', { message });
    }
  }

  async function handleStartGame(socket: Socket) {
    try {
      const lookup = await getPlayerFromSocket(socket);
      if (!lookup) {
        emitError(socket, 'No estás en ninguna sala.');
        return;
      }

      const gameState = await gameStore.getRoom(lookup.roomCode);
      if (!gameState) {
        emitError(socket, 'La sala no existe.');
        return;
      }

      const player = gameState.players.find((p) => p.id === lookup.playerId);
      if (!player?.isHost) {
        emitError(socket, 'Solo el anfitrión puede iniciar el juego.');
        return;
      }

      const { gameState: updatedState, firstCard } = roomManager.startGame(gameState);
      await gameStore.setRoom(lookup.roomCode, updatedState);

      socket.to(lookup.roomCode).emit('game:started', { gameState: updatedState, card: firstCard });
      socket.emit('game:started', { gameState: updatedState, card: firstCard });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error interno del servidor';
      socket.emit('error', { message });
    }
  }

  async function handleFinishTurn(socket: Socket) {
    try {
      const lookup = await getPlayerFromSocket(socket);
      if (!lookup) {
        emitError(socket, 'No estás en ninguna sala.');
        return;
      }

      let gameState = await gameStore.getRoom(lookup.roomCode);
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
        await gameStore.setRoom(lookup.roomCode, gameState);
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
      await gameStore.setRoom(lookup.roomCode, gameState);

      io.to(lookup.roomCode).emit('turn:finished', { card, gameState });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error interno del servidor';
      socket.emit('error', { message });
    }
  }

  async function handleKickPlayer(socket: Socket, payload: unknown) {
    try {
      const { targetPlayerId } = payload as { targetPlayerId: string };
      const lookup = await getPlayerFromSocket(socket);

      if (!lookup) {
        emitError(socket, 'No estás en ninguna sala.');
        return;
      }

      const gameState = await gameStore.getRoom(lookup.roomCode);
      if (!gameState) {
        emitError(socket, 'La sala no existe.');
        return;
      }

      const requester = gameState.players.find((p) => p.id === lookup.playerId);
      if (!requester?.isHost) {
        emitError(socket, 'Solo el anfitrión puede expulsar jugadores.');
        return;
      }

      const targetPlayer = gameState.players.find((p) => p.id === targetPlayerId);
      if (!targetPlayer) {
        emitError(socket, 'Jugador no encontrado.');
        return;
      }

      if (targetPlayer.id === lookup.playerId) {
        emitError(socket, 'No puedes expulsarte a ti mismo.');
        return;
      }

      const { players: updatedPlayers, newHostId } = roomManager.removePlayer(gameState.players, targetPlayerId);

      await gameStore.deletePlayerRoom(targetPlayerId);

      // Disconnect the kicked player's socket if connected
      for (const [sockId, pid] of socketToPlayer) {
        if (pid === targetPlayerId) {
          const targetSocket = io.sockets.sockets.get(sockId);
          if (targetSocket) {
            targetSocket.leave(lookup.roomCode);
            targetSocket.emit('room:left');
            targetSocket.disconnect(true);
          }
          socketToPlayer.delete(sockId);
          break;
        }
      }

      if (updatedPlayers.length === 0) {
        await gameStore.deleteRoom(lookup.roomCode);
        return;
      }

      await gameStore.setRoom(lookup.roomCode, {
        ...gameState,
        players: updatedPlayers,
      });

      io.to(lookup.roomCode).emit('player:left', { playerId: targetPlayerId });

      if (newHostId) {
        io.to(lookup.roomCode).emit('host:changed', { newHostId });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error interno del servidor';
      socket.emit('error', { message });
    }
  }

  async function handleTerminateSession(socket: Socket) {
    try {
      const lookup = await getPlayerFromSocket(socket);
      if (!lookup) {
        emitError(socket, 'No estás en ninguna sala.');
        return;
      }

      const gameState = await gameStore.getRoom(lookup.roomCode);
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

      await gameStore.deleteRoom(lookup.roomCode);

      for (const p of gameState.players) {
        await gameStore.deletePlayerRoom(p.id);
      }

      // Clear ephemeral socket mappings for this room
      for (const [sockId, pid] of socketToPlayer) {
        if (gameState.players.some((p) => p.id === pid)) {
          socketToPlayer.delete(sockId);
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error interno del servidor';
      socket.emit('error', { message });
    }
  }

  async function handleLeaveRoom(socket: Socket) {
    try {
      const lookup = await getPlayerFromSocket(socket);
      if (!lookup) {
        socket.emit('room:left');
        return;
      }

      const { playerId, roomCode } = lookup;
      const gameState = await gameStore.getRoom(roomCode);

      if (!gameState) {
        socket.emit('room:left');
        return;
      }

      const { players: updatedPlayers, newHostId } = roomManager.removePlayer(gameState.players, playerId);

      await gameStore.deletePlayerRoom(playerId);
      socketToPlayer.delete(socket.id);
      socket.leave(roomCode);

      if (updatedPlayers.length === 0) {
        await gameStore.deleteRoom(roomCode);
        socket.emit('room:left');
        return;
      }

      const updatedGameState = {
        ...gameState,
        players: updatedPlayers,
      };
      await gameStore.setRoom(roomCode, updatedGameState);

      io.to(roomCode).emit('player:left', { playerId });

      if (newHostId) {
        io.to(roomCode).emit('host:changed', { newHostId });
      }

      socket.emit('room:left');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error interno del servidor';
      socket.emit('error', { message });
    }
  }

  async function handleReconnect(socket: Socket, payload: unknown) {
    try {
      const { playerId } = payload as { playerId: string };
      const roomCode = await gameStore.getPlayerRoom(playerId);

      if (!roomCode) {
        emitError(socket, 'No se encontró tu sala.');
        return;
      }

      const gameState = await gameStore.getRoom(roomCode);
      if (!gameState) {
        emitError(socket, 'La sala ya no existe.');
        return;
      }

      const player = gameState.players.find((p) => p.id === playerId);
      if (!player) {
        emitError(socket, 'No se encontró tu jugador en la sala.');
        return;
      }

      const updatedPlayers = roomManager.reactivatePlayer(gameState.players, playerId);
      const updatedGameState = { ...gameState, players: updatedPlayers };
      await gameStore.setRoom(roomCode, updatedGameState);

      socketToPlayer.set(socket.id, playerId);

      socket.emit('room:rejoined', { roomCode, playerId, gameState: updatedGameState });
      socket.join(roomCode);
      io.to(roomCode).emit('player:reconnected', { playerId });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error interno del servidor';
      socket.emit('error', { message });
    }
  }

  function registerHandlers(_io: Server): void {
    io.on('connection', (socket: Socket) => {
      socket.on('room:create', (payload) => withErrorWrapper(handleCreateRoom)(socket, payload));
      socket.on('room:join', (payload) => withErrorWrapper(handleJoinRoom)(socket, payload));
      socket.on('room:leave', () => withErrorWrapper(handleLeaveRoom)(socket));
      socket.on('game:start', () => withErrorWrapper(handleStartGame)(socket));
      socket.on('turn:finish', () => withErrorWrapper(handleFinishTurn)(socket));
      socket.on('player:kick', (payload) => withErrorWrapper(handleKickPlayer)(socket, payload));
      socket.on('game:terminate', () => withErrorWrapper(handleTerminateSession)(socket));
      socket.on('player:reconnect', (payload) => withErrorWrapper(handleReconnect)(socket, payload));
      socket.on('disconnect', async (reason: string) => {
        const playerId = socketToPlayer.get(socket.id);
        if (!playerId) return;

        const roomCode = await gameStore.getPlayerRoom(playerId);
        if (!roomCode) {
          socketToPlayer.delete(socket.id);
          return;
        }

        const gameState = await gameStore.getRoom(roomCode);
        if (!gameState) {
          socketToPlayer.delete(socket.id);
          await gameStore.deletePlayerRoom(playerId);
          return;
        }

        const player = gameState.players.find((p) => p.id === playerId);
        if (!player) {
          socketToPlayer.delete(socket.id);
          await gameStore.deletePlayerRoom(playerId);
          return;
        }

        const { players: updatedPlayers, newHostId } = roomManager.markPlayerOffline(gameState.players, playerId);

        if (updatedPlayers.length === 0) {
          await gameStore.deleteRoom(roomCode);
          const roomPlayerIds = await gameStore.getPlayersInRoom(roomCode);
          for (const pid of roomPlayerIds) {
            await gameStore.deletePlayerRoom(pid);
          }
          socketToPlayer.delete(socket.id);
          return;
        }

        const updatedGameState = {
          ...gameState,
          players: updatedPlayers,
        };
        await gameStore.setRoom(roomCode, updatedGameState);

        io.to(roomCode).emit('player:offline', { playerId });

        if (newHostId) {
          io.to(roomCode).emit('host:changed', { newHostId });
        }

        socketToPlayer.delete(socket.id);
      });
    });
  }

  return { registerHandlers };
}
