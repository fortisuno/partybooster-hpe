import { useGameStore } from '@/store/useGameStore';
import { MobileLayout } from '@/components/templates/MobileLayout';
import { RoomHeader } from '@/components/molecules/RoomHeader';
import { GameBoard } from '@/components/organisms/GameBoard';
import { GameLobby } from '@/components/organisms/GameLobby';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

export default function Game() {
  const { gameState, disconnect, reset } = useGameStore();

  const handleLeave = () => {
    disconnect();
    reset();
  };

  if (!gameState) {
    return (
      <MobileLayout>
        <div className="flex flex-col items-center justify-center min-h-screen p-6">
          <Card className="w-full max-w-sm">
            <CardHeader>
              <CardTitle>Sin Partida Activa</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-zinc-400">
                No estás en una partida actualmente. Regresa a la página de inicio para crear o unirte a una sala.
              </p>
              <Button onClick={handleLeave} className="w-full">
                Ir al Inicio
              </Button>
            </CardContent>
          </Card>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout className="flex flex-col">
      <RoomHeader />

      <div className="flex-1 overflow-hidden">
        {gameState.status === 'lobby' && <GameLobby />}
        {gameState.status === 'playing' && <GameBoard />}
        {gameState.status === 'finished' && (
          <div className="flex flex-col items-center justify-center min-h-full p-6">
            <Card className="w-full max-w-sm">
              <CardHeader>
                <CardTitle>Fin de la Partida</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-zinc-400">
                  ¡El juego ha terminado! Gracias por jugar.
                </p>
                <Button onClick={handleLeave} className="w-full">
                  Jugar de Nuevo
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </MobileLayout>
  );
}