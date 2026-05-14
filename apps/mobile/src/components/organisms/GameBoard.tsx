import { View, Text as RNText, TouchableOpacity } from 'react-native';
import type { Card as CardType, Player, House } from '@game/shared';
import { Card } from '../ui/Card';
import { Heading } from '../ui/Heading';
import { TurnIndicator } from '../molecules/TurnIndicator';
import { Button } from '../ui/Button';
import { cn } from '../../lib/cn';

interface GameBoardProps {
  deckCount: number;
  discardPile: CardType[];
  lastDrawnCard: CardType | null;
  players: Player[];
  currentPlayerId: string | null;
  myPlayerId: string | null;
  myHouse: House | null;
  isMyTurn: boolean;
  onDrawCard: () => void;
  error: string | null;
  onClearError: () => void;
}

const houseTextColors: Record<House, string> = {
  Gryffindor: 'text-gryffindor-light',
  Hufflepuff: 'text-hufflepuff',
  Ravenclaw: 'text-ravenclaw-light',
  Slytherin: 'text-slytherin-light',
};

export function GameBoard({
  deckCount,
  discardPile,
  lastDrawnCard,
  players,
  currentPlayerId,
  myPlayerId,
  myHouse,
  isMyTurn,
  onDrawCard,
  error,
  onClearError,
}: GameBoardProps) {
  const lastDiscard = discardPile[discardPile.length - 1];

  return (
    <View className="flex-1 items-center gap-4 p-4">
      {error && (
        <View className="bg-red-500/20 border border-red-500 rounded-lg p-3 w-full">
          <RNText className="text-red-400 text-sm text-center">{error}</RNText>
        </View>
      )}

      <TurnIndicator
        currentPlayerId={currentPlayerId}
        myPlayerId={myPlayerId}
        players={players}
        myHouse={myHouse}
      />

      <View className="flex-row justify-between items-center w-full px-4">
        <View className="items-center">
          <RNText className="text-zinc-500 text-xs uppercase mb-2">Mazo</RNText>
          <View className="w-20 h-28 bg-zinc-800 rounded-lg border-2 border-zinc-700 justify-center items-center">
            <RNText className="text-2xl font-bold text-zinc-500">{deckCount}</RNText>
          </View>
        </View>

        <View className="items-center">
          <RNText className="text-zinc-500 text-xs uppercase mb-2">Descarte</RNText>
          {lastDiscard ? (
            <Card card={lastDiscard} variant="discard" />
          ) : (
            <View className="w-20 h-28 bg-zinc-900 rounded-lg border-2 border-dashed border-zinc-800 justify-center items-center">
              <RNText className="text-zinc-600 text-xs">Vacío</RNText>
            </View>
          )}
        </View>
      </View>

      {lastDrawnCard && (
        <View className="items-center mt-2 mb-4">
          <RNText className="text-zinc-400 text-xs uppercase mb-2">Última robada</RNText>
          <Card card={lastDrawnCard} variant="drawn" />
        </View>
      )}

      <View className="flex-1" />

      <View className="w-full">
        {isMyTurn ? (
          <TouchableOpacity
            onPress={onDrawCard}
            className={cn(
              'rounded-xl p-4',
              myHouse ? `bg-${myHouse.toLowerCase()}` : 'bg-gryffindor'
            )}
            activeOpacity={0.8}
          >
            <RNText className="text-white text-center font-bold text-lg uppercase tracking-wide">
              Robar Carta
            </RNText>
          </TouchableOpacity>
        ) : (
          <View className="bg-zinc-900 rounded-xl p-4 border border-zinc-800">
            <RNText className="text-zinc-400 text-center text-sm">
              Espera tu turno...
            </RNText>
          </View>
        )}
      </View>

      <View className="w-full">
        <RNText className="text-zinc-500 text-xs uppercase mb-2 text-center">
          Jugadores
        </RNText>
        <View className="flex-row flex-wrap gap-2 justify-center">
          {players.map((p) => (
            <View
              key={p.id}
              className={cn(
                'px-3 py-1.5 rounded-full border text-xs',
                p.id === currentPlayerId
                  ? 'border-gryffindor bg-gryffindor/20 text-gryffindor-light'
                  : 'border-zinc-700 text-zinc-400'
              )}
            >
              <RNText>{p.name}</RNText>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}