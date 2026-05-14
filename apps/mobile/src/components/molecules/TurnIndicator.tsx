import { View, Text as RNText } from 'react-native';
import type { Player, House } from '@game/shared';
import { cn } from '../../lib/cn';

interface TurnIndicatorProps {
  currentPlayerId: string | null;
  myPlayerId: string | null;
  players: Player[];
  myHouse: House | null;
}

const houseBannerColors: Record<House, string> = {
  Gryffindor: 'bg-gryffindor/20 border-gryffindor',
  Hufflepuff: 'bg-hufflepuff/20 border-hufflepuff',
  Ravenclaw: 'bg-ravenclaw/20 border-ravenclaw',
  Slytherin: 'bg-slytherin/20 border-slytherin',
};

const houseTextColors: Record<House, string> = {
  Gryffindor: 'text-gryffindor-light',
  Hufflepuff: 'text-hufflepuff',
  Ravenclaw: 'text-ravenclaw-light',
  Slytherin: 'text-slytherin-light',
};

export function TurnIndicator({ currentPlayerId, myPlayerId, players, myHouse }: TurnIndicatorProps) {
  if (!currentPlayerId) return null;

  const isMyTurn = currentPlayerId === myPlayerId;
  const currentPlayer = players.find((p) => p.id === currentPlayerId);

  if (isMyTurn) {
    return (
      <View className={cn(
        'rounded-xl p-4 border-2 mb-4',
        myHouse ? houseBannerColors[myHouse] : 'bg-zinc-800 border-zinc-600'
      )}>
        <RNText className={cn(
          'text-lg font-bold text-center',
          myHouse ? houseTextColors[myHouse] : 'text-zinc-100'
        )}>
          🎯 Es tu turno
        </RNText>
      </View>
    );
  }

  return (
    <View className="rounded-xl p-4 bg-zinc-900 border border-zinc-800 mb-4">
      <RNText className="text-zinc-400 text-center text-sm">
        Esperando a <RNText className="text-zinc-200 font-semibold">{currentPlayer?.name ?? '...'}</RNText>
      </RNText>
    </View>
  );
}