import { useGameStore } from '@/store/useGameStore';
import { PlayerSlot } from '@/components/molecules/PlayerSlot';
import { Button } from '@/components/ui/Button';

export function GameLobby() {
  const { gameState, isHost, startGame, terminateSession, isLoading } = useGameStore();

  if (!gameState || gameState.status !== 'lobby') return null;

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {gameState.players.map((player) => (
          <PlayerSlot
            key={player.id}
            player={player}
            isCurrentPlayer={player.id === useGameStore.getState().playerId}
            isActiveTurn={false}
          />
        ))}
      </div>

      <div className="p-4 border-t border-zinc-800 bg-zinc-900/80">
        <div className="max-w-mobile mx-auto space-y-3">
          {isHost ? (
            <>
              <Button
                onClick={startGame}
                disabled={isLoading || gameState.players.length < 2}
                variant="glow-pulse"
                className="w-full"
                size="lg"
              >
                {gameState.players.length < 2
                  ? 'Se necesitan al menos 2 jugadores'
                  : 'Iniciar Partida'}
              </Button>
              <Button
                onClick={terminateSession}
                disabled={isLoading}
                variant="destructive"
                className="w-full"
              >
                Terminar Sesión
              </Button>
            </>
          ) : (
            <p className="text-sm text-zinc-400 text-center">
              Esperando al anfitrión para iniciar...
            </p>
          )}
        </div>
      </div>
    </div>
  );
}