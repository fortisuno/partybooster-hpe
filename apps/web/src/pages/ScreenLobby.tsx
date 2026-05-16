import { motion } from 'framer-motion';
import { useGameStore } from '@/store/useGameStore';
import { Button } from '@/components/ui/Button';
import { LobbyPlayerList } from '@/components/molecules/LobbyPlayerList';
import { RoomCodeDisplay } from '@/components/molecules/RoomCodeDisplay';
import { Header } from '@/components/organisms/Header';

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
      <Header />
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
