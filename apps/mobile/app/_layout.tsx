import '../global.css';
import { Stack } from 'expo-router';
import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <View className="flex-1 bg-zinc-950">
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#09090b' },
          headerTintColor: '#f4f4f5',
          contentStyle: { backgroundColor: '#09090b' },
          headerShown: false,
        }}
      />
    </View>
  );
}