import { motion } from 'framer-motion';
import { useEffect } from 'react';
import { useGameStore } from '@/store/useGameStore';
import type { Player } from '@/types';
import { Button } from '@/components/ui/Button';
import { LobbyPlayerList } from '@/components/molecules/LobbyPlayerList';
import { RoomCodeDisplay } from '@/components/molecules/RoomCodeDisplay';

export function ScreenLobby() {
  const {
    gameState,
    isHost,
    playerId,
    startGame,
    leaveRoom,
    kickPlayer,
    isLoading,
  } = useGameStore();

  useEffect(() => {
    const socket = useGameStore.getState().socket;
    if (!socket) return;

    const onPlayerJoined = (data: { player: Player }) => {
      useGameStore.setState((state) => {
        if (!state.gameState) return state;
        if (state.gameState.players.some((p) => p.id === data.player.id)) return state;
        return { gameState: { ...state.gameState, players: [...state.gameState.players, data.player] } };
      });
    };

    const onPlayerLeft = (data: { playerId: string }) => {
      useGameStore.setState((state) => {
        if (!state.gameState) return state;
        return { gameState: { ...state.gameState, players: state.gameState.players.filter((p) => p.id !== data.playerId) } };
      });
    };

    const onPlayerOffline = (data: { playerId: string }) => {
      useGameStore.setState((state) => {
        if (!state.gameState) return state;
        return { gameState: { ...state.gameState, players: state.gameState.players.map((p) => p.id === data.playerId ? { ...p, offline: true } : p) } };
      });
    };

    const onPlayerReconnected = (data: { playerId: string }) => {
      useGameStore.setState((state) => {
        if (!state.gameState) return state;
        return { gameState: { ...state.gameState, players: state.gameState.players.map((p) => p.id === data.playerId ? { ...p, offline: false } : p) } };
      });
    };

    const onHostChanged = (data: { newHostId: string }) => {
      useGameStore.setState((state) => {
        if (!state.gameState) return state;
        return {
          gameState: { ...state.gameState, players: state.gameState.players.map((p) => ({ ...p, isHost: p.id === data.newHostId })) },
          isHost: data.newHostId === state.playerId,
        };
      });
    };

    const onRoomUpdated = (data: { gameState: any }) => {
      useGameStore.setState({ gameState: data.gameState });
    };

    socket.on('player:joined', onPlayerJoined as any);
    socket.on('player:left', onPlayerLeft);
    socket.on('player:offline', onPlayerOffline);
    socket.on('player:reconnected', onPlayerReconnected);
    socket.on('host:changed', onHostChanged);
    socket.on('room:updated', onRoomUpdated as any);

    return () => {
      socket.off('player:joined', onPlayerJoined as any);
      socket.off('player:left', onPlayerLeft);
      socket.off('player:offline', onPlayerOffline);
      socket.off('player:reconnected', onPlayerReconnected);
      socket.off('host:changed', onHostChanged);
      socket.off('room:updated', onRoomUpdated as any);
    };
  }, []);

  if (!gameState) return null;

  const players = gameState.players;
  const roomCode = gameState.roomCode;

  const screenVariants = {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
  };

  return (
    <>
      <motion.div
        key="lobby"
        variants={screenVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="flex flex-col h-full overflow-hidden pt-16"
      >
        <div className="text-center mb-8">
          <p className="text-[11px] text-white/30 uppercase tracking-[0.14em] font-medium font-body mb-2">
            Código de Sala
          </p>
          <RoomCodeDisplay roomCode={roomCode} />
          <p className="text-white/20 text-xs mt-2 font-body">
            Comparte este código con otros magos
          </p>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs text-white/40 uppercase tracking-[0.1em] font-medium font-body">
              Jugadores <span className="text-white/20">({players.length})</span>
            </p>
          </div>

          <LobbyPlayerList
            players={players}
            currentPlayerId={playerId}
            isHost={isHost}
            onKick={kickPlayer}
          />
        </div>

        <div className="mt-6 space-y-3">
          {isHost ? (
            <Button
              onClick={startGame}
              disabled={isLoading || players.length < 2}
              variant="glow-pulse"
              className="w-full"
              size="lg"
            >
              Iniciar Partida
            </Button>
          ) : (
            <p className="text-center text-xs text-white/20 font-body">
              Esperando al anfitrión para iniciar…
            </p>
          )}
          <button
            onClick={() => {
              leaveRoom();
            }}
            className="w-full h-10 rounded-2xl text-xs text-white/20 hover:text-white/40 transition-colors"
          >
            Abandonar Sala
          </button>
        </div>
      </motion.div>
    </>
  );
}
