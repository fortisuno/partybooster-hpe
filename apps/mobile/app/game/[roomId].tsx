import { useEffect } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { View, Text as RNText } from 'react-native';
import { useGameStore } from '../../src/store/useGameStore';
import { Lobby } from '../../src/components/organisms/Lobby';
import { GameBoard } from '../../src/components/organisms/GameBoard';

export default function GameScreen() {
  const { roomId } = useLocalSearchParams<{ roomId: string }>();
  const router = useRouter();

  const {
    gameState,
    roomCode,
    playerId,
    playerHouse,
    isHost,
    lastDrawnCard,
    lastError,
    connect,
    drawCard,
    startGame,
    clearError,
  } = useGameStore();

  useEffect(() => {
    connect();
  }, []);

  useEffect(() => {
    if (!gameState || gameState.roomCode !== roomId) {
      router.replace('/');
    }
  }, [gameState, roomId]);

  useEffect(() => {
    if (!gameState) {
      router.replace('/');
    }
  }, [gameState]);

  if (!gameState || !playerId) {
    return (
      <View className="flex-1 bg-zinc-950 items-center justify-center">
        <RNText className="text-zinc-400">Conectando...</RNText>
      </View>
    );
  }

  const isMyTurn = gameState.currentPlayerId === playerId;

  return (
    <View className="flex-1 bg-zinc-950">
      {gameState.status === 'lobby' && (
        <Lobby
          roomCode={gameState.roomCode}
          players={gameState.players}
          currentPlayerId={playerId}
          isHost={isHost}
          onStartGame={startGame}
        />
      )}

      {gameState.status === 'playing' && (
        <GameBoard
          deckCount={gameState.deck.length}
          discardPile={gameState.discardPile}
          lastDrawnCard={lastDrawnCard}
          players={gameState.players}
          currentPlayerId={gameState.currentPlayerId}
          myPlayerId={playerId}
          myHouse={playerHouse}
          isMyTurn={isMyTurn}
          onDrawCard={drawCard}
          error={lastError}
          onClearError={clearError}
        />
      )}
    </View>
  );
}