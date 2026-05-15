import { useGameStore } from '@/store/useGameStore';
import { PlayerSlot } from '@/components/molecules/PlayerSlot';
import { BottomActionSheet } from './BottomActionSheet';
import { CustomButton } from '@/components/atoms/CustomButton';
import { Sparkles } from 'lucide-react';

export function GameBoard() {
  const { gameState, playerId, playerHouse, drawCard, isLoading } = useGameStore();

  if (!gameState || gameState.status !== 'playing') return null;

  const currentPlayerId = gameState.currentPlayerId;
  const isMyTurn = currentPlayerId === playerId;
  const isEmptyDeck = gameState.deck.length === 0;

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {gameState.players.map((player) => (
            <PlayerSlot
              key={player.id}
              player={player}
              isCurrentPlayer={player.id === playerId}
              isActiveTurn={player.id === currentPlayerId}
            />
          ))}
        </div>

        {isMyTurn && (
          <div className="mt-6 p-4 bg-gradient-to-t from-amber-900/20 to-transparent rounded-xl border border-amber-700/30">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <span className="text-amber-400 font-semibold">¡Tu Turno!</span>
            </div>
            <CustomButton
              house={playerHouse ?? undefined}
              onClick={drawCard}
              disabled={isLoading || isEmptyDeck}
              className="w-full"
              size="lg"
            >
              {isEmptyDeck ? '¡Sin Cartas!' : 'Robar Carta'}
            </CustomButton>
          </div>
        )}

        {!isMyTurn && currentPlayerId && (
          <div className="mt-6 p-4 bg-zinc-900/50 rounded-xl border border-zinc-800">
            <p className="text-sm text-zinc-400 text-center">
              Esperando a otro jugador...
            </p>
          </div>
        )}
      </div>

      <BottomActionSheet />
    </div>
  );
}