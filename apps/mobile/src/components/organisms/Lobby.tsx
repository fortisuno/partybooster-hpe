import { View, Text as RNText, TouchableOpacity, Alert, Clipboard } from 'react-native';
import type { Player } from '@game/shared';
import { Heading } from '../ui/Heading';
import { PlayerList } from '../molecules/PlayerList';

interface LobbyProps {
  roomCode: string;
  players: Player[];
  currentPlayerId: string | null;
  isHost: boolean;
  onStartGame: () => void;
}

export function Lobby({ roomCode, players, currentPlayerId, isHost, onStartGame }: LobbyProps) {
  const copyRoomCode = () => {
    Clipboard.setString(roomCode);
    Alert.alert('Copiado', 'Código de sala copiado al portapapeles');
  };

  return (
    <View className="flex-1 items-center gap-6 p-6">
      <Heading level={1}>Sala Creada</Heading>

      <TouchableOpacity onPress={copyRoomCode} className="bg-zinc-900 rounded-xl p-6 border border-zinc-700">
        <RNText className="text-zinc-400 text-center text-xs uppercase mb-2">Código de Sala</RNText>
        <RNText className="text-3xl font-bold text-zinc-100 tracking-widest text-center">
          {roomCode}
        </RNText>
        <RNText className="text-zinc-500 text-center text-xs mt-2">Toca para copiar</RNText>
      </TouchableOpacity>

      <View className="w-full">
        <RNText className="text-zinc-400 text-sm mb-3 uppercase tracking-wide">
          Jugadores ({players.length})
        </RNText>
        <PlayerList players={players} currentPlayerId={currentPlayerId} />
      </View>

      <View className="flex-1" />

      {isHost && players.length >= 1 && (
        <View className="w-full">
          <TouchableOpacity
            onPress={onStartGame}
            className="bg-gryffindor rounded-xl p-4"
            activeOpacity={0.8}
          >
            <RNText className="text-white text-center font-bold text-lg uppercase tracking-wide">
              Iniciar Juego
            </RNText>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}