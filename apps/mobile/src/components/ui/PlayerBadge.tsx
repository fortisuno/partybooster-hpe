import { View, Text as RNText } from 'react-native';
import type { Player } from '@game/shared';
import { cn } from '../../lib/cn';

interface PlayerBadgeProps {
  player: Player;
  isCurrentTurn: boolean;
}

const houseDotColors: Record<string, string> = {
  Gryffindor: 'bg-gryffindor',
  Hufflepuff: 'bg-hufflepuff',
  Ravenclaw: 'bg-ravenclaw-light',
  Slytherin: 'bg-slytherin-light',
};

export function PlayerBadge({ player, isCurrentTurn }: PlayerBadgeProps) {
  const dotColor = houseDotColors[player.house] ?? 'bg-zinc-500';

  return (
    <View className={cn(
      'flex-row items-center gap-3 p-3 rounded-lg bg-zinc-900/50 border',
      isCurrentTurn ? 'border-gryffindor shadow-lg shadow-gryffindor/30' : 'border-zinc-800',
      player.offline && 'opacity-50'
    )}>
      <View className={cn('w-3 h-3 rounded-full', dotColor)} />
      <View className="flex-1">
        <View className="flex-row items-center gap-2">
          {player.isHost && <RNText className="text-xs">👑</RNText>}
          <RNText className={cn(
            'text-sm font-medium',
            player.offline && 'line-through text-zinc-500'
          )}>
            {player.name}
          </RNText>
        </View>
        <RNText className="text-xs text-zinc-500">{player.house}</RNText>
      </View>
      {player.offline && (
        <RNText className="text-xs text-zinc-600">OFFLINE</RNText>
      )}
      {isCurrentTurn && (
        <View className="bg-gryffindor/20 px-2 py-1 rounded">
          <RNText className="text-xs font-bold text-gryffindor">TURNO</RNText>
        </View>
      )}
    </View>
  );
}