import type { Socket } from 'socket.io';

export interface ErrorPayload {
  message: string;
}

type GenericHandler = (socket: Socket, ...args: unknown[]) => void | Promise<void>;

export function withErrorWrapper(handler: GenericHandler): GenericHandler {
  return async function wrappedHandler(socket: Socket, ...args: unknown[]) {
    try {
      await handler(socket, ...args);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Error interno del servidor';
      socket.emit('error', { message } satisfies ErrorPayload);
    }
  };
}

export function emitError(socket: Socket, message: string) {
  socket.emit('error', { message } satisfies ErrorPayload);
}