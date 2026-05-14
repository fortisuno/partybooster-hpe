import { View, Text as RNText, TouchableOpacity } from 'react-native';
import type { GameStatus } from '@game/shared';
import { Button } from '../ui/Button';

interface GameControlsProps {
  status: GameStatus;
  isHost: boolean;
  isMyTurn: boolean;
  onStartGame: () => void;
  onDrawCard: () => void;
  error: string | null;
  onClearError: () => void;
}

export function GameControls({
  status,
  isHost,
  isMyTurn,
  onStartGame,
  onDrawCard,
  error,
  onClearError,
}: GameControlsProps) {
  return (
    <View className="w-full gap-3">
      {error && (
        <TouchableOpacity
          onPress={onClearError}
          className="bg-red-500/20 border border-red-500 rounded-lg p-3 mb-2"
        >
          <RNText className="text-red-400 text-sm text-center">{error}</RNText>
        </TouchableOpacity>
      )}

      {status === 'lobby' && (
        <>
          {isHost ? (
            <Button variant="primary" onPress={onStartGame}>
              Iniciar Juego
            </Button>
          ) : (
            <View className="bg-zinc-900 rounded-lg p-4 border border-zinc-800">
              <RNText className="text-zinc-400 text-center text-sm">
                Esperando al anfitrión...
              </RNText>
            </View>
          )}
        </>
      )}

      {status === 'playing' && (
        <>
          {isMyTurn ? (
            <Button variant="primary" onPress={onDrawCard}>
              Robar Carta
            </Button>
          ) : (
            <View className="bg-zinc-900 rounded-lg p-4 border border-zinc-800">
              <RNText className="text-zinc-400 text-center text-sm">
                Espera tu turno...
              </RNText>
            </View>
          )}
        </>
      )}
    </View>
  );
}