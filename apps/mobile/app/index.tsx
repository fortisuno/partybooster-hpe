import { useState, useEffect } from 'react';
import { View, Text as RNText, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import type { House } from '@game/shared';
import { useGameStore } from '../src/store/useGameStore';

type Tab = 'create' | 'join';

const houses: { name: House; color: string; border: string; text: string }[] = [
  { name: 'Gryffindor', color: 'bg-gryffindor', border: 'border-gryffindor', text: 'text-gryffindor-light' },
  { name: 'Hufflepuff', color: 'bg-hufflepuff', border: 'border-hufflepuff', text: 'text-hufflepuff' },
  { name: 'Ravenclaw', color: 'bg-ravenclaw', border: 'border-ravenclaw', text: 'text-ravenclaw-light' },
  { name: 'Slytherin', color: 'bg-slytherin', border: 'border-slytherin', text: 'text-slytherin-light' },
];

export default function IndexScreen() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('create');
  const [name, setName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [selectedHouse, setSelectedHouse] = useState<House | null>(null);

  const { gameState, roomCode: activeRoom, playerId, connect, createRoom, joinRoom, lastError, clearError } = useGameStore();

  useEffect(() => {
    connect();
  }, []);

  useEffect(() => {
    if (activeRoom && gameState) {
      router.push(`/game/${activeRoom}`);
    }
  }, [activeRoom, gameState]);

  const handleCreateRoom = () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Ingresa tu nombre');
      return;
    }
    if (!selectedHouse) {
      Alert.alert('Error', 'Selecciona tu casa');
      return;
    }
    createRoom(name.trim(), selectedHouse);
  };

  const handleJoinRoom = () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Ingresa tu nombre');
      return;
    }
    if (!selectedHouse) {
      Alert.alert('Error', 'Selecciona tu casa');
      return;
    }
    if (!roomCode.trim() || roomCode.trim().length !== 6) {
      Alert.alert('Error', 'Ingresa un código de 6 caracteres');
      return;
    }
    joinRoom(roomCode.trim().toUpperCase(), name.trim(), selectedHouse);
  };

  return (
    <ScrollView className="flex-1 bg-zinc-950" contentContainerStyle={{ flexGrow: 1 }}>
      <View className="flex-1 items-center px-6 pt-16 pb-8">
        <RNText className="text-4xl font-bold text-zinc-100 mb-2">🏆 Party Booster</RNText>
        <RNText className="text-zinc-500 text-sm mb-12">Harry Potter Card Game</RNText>

        <View className="flex-row w-full max-w-sm bg-zinc-900 rounded-xl p-1 mb-8">
          <TouchableOpacity
            onPress={() => setTab('create')}
            className={`flex-1 py-3 rounded-lg ${tab === 'create' ? 'bg-zinc-800' : ''}`}
          >
            <RNText className={`text-center font-semibold ${tab === 'create' ? 'text-zinc-100' : 'text-zinc-500'}`}>
              Crear Sala
            </RNText>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setTab('join')}
            className={`flex-1 py-3 rounded-lg ${tab === 'join' ? 'bg-zinc-800' : ''}`}
          >
            <RNText className={`text-center font-semibold ${tab === 'join' ? 'text-zinc-100' : 'text-zinc-500'}`}>
              Unirse
            </RNText>
          </TouchableOpacity>
        </View>

        {lastError && (
          <TouchableOpacity onPress={clearError} className="w-full max-w-sm bg-red-500/20 border border-red-500 rounded-lg p-3 mb-4">
            <RNText className="text-red-400 text-sm text-center">{lastError}</RNText>
          </TouchableOpacity>
        )}

        <View className="w-full max-w-sm gap-4">
          <View>
            <RNText className="text-zinc-400 text-xs uppercase mb-2">Tu Nombre</RNText>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Harry Potter"
              placeholderTextColor="#71717a"
              className="bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-zinc-100"
            />
          </View>

          <View>
            <RNText className="text-zinc-400 text-xs uppercase mb-2">Selecciona tu Casa</RNText>
            <View className="flex-row gap-3">
              {houses.map((house) => (
                <TouchableOpacity
                  key={house.name}
                  onPress={() => setSelectedHouse(house.name)}
                  className={`w-16 h-16 rounded-xl ${house.color} justify-center items-center border-2 ${selectedHouse === house.name ? house.border : 'border-transparent'}`}
                >
                  <RNText className="text-xs font-bold text-white">
                    {house.name[0]}
                  </RNText>
                </TouchableOpacity>
              ))}
            </View>
            {selectedHouse && (
              <RNText className="text-zinc-400 text-sm mt-2">{selectedHouse}</RNText>
            )}
          </View>

          {tab === 'join' && (
            <View>
              <RNText className="text-zinc-400 text-xs uppercase mb-2">Código de Sala</RNText>
              <TextInput
                value={roomCode}
                onChangeText={(text) => setRoomCode(text.toUpperCase().slice(0, 6))}
                placeholder="ABC123"
                placeholderTextColor="#71717a"
                maxLength={6}
                className="bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-zinc-100 text-center text-2xl tracking-widest font-bold uppercase"
              />
            </View>
          )}

          <TouchableOpacity
            onPress={tab === 'create' ? handleCreateRoom : handleJoinRoom}
            className="bg-gryffindor rounded-xl p-4 mt-4"
            activeOpacity={0.8}
          >
            <RNText className="text-white text-center font-bold text-lg uppercase tracking-wide">
              {tab === 'create' ? 'Crear Sala' : 'Unirse a Sala'}
            </RNText>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}