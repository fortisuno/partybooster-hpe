import { io, Socket } from 'socket.io-client';
import Constants from 'expo-constants';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (socket) return socket;

  const url =
    Constants.expoConfig?.extra?.API_URL ??
    process.env.EXPO_PUBLIC_API_URL ??
    'http://localhost:3001';

  socket = io(url, {
    transports: ['websocket'],
    autoConnect: false,
    secure: true,
  });

  return socket;
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}