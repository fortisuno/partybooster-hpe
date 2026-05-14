import { View, ScrollView } from 'react-native';
import type { Player } from '@game/shared';
import { PlayerBadge } from '../ui/PlayerBadge';

interface PlayerListProps {
  players: Player[];
  currentPlayerId: string | null;
}

export function PlayerList({ players, currentPlayerId }: PlayerListProps) {
  const sorted = [...players].sort((a, b) => {
    if (a.isHost && !b.isHost) return -1;
    if (!a.isHost && b.isHost) return 1;
    return a.name.localeCompare(b.name);
  });

  return (
    <View className="w-full">
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-2">
        <View className="flex-row gap-3 pb-2">
          {sorted.map((player) => (
            <View key={player.id} className="w-40">
              <PlayerBadge
                player={player}
                isCurrentTurn={player.id === currentPlayerId}
              />
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}