import Fastify from 'fastify';
import { Server, Socket } from 'socket.io';
import corsPlugin, { ALLOWED_ORIGINS } from './config/cors.js';
import { createGameStore } from './infrastructure/persistence/store-factory.js';
import { createSocketHandlers } from './infrastructure/socket/handlers.js';
import { SERVER_PORT } from './config/constants.js';

function formatLog(event: string, data?: unknown): string {
  const timestamp = new Date().toISOString();
  const payload = data ? ` ${JSON.stringify(data)}` : '';
  return `[${timestamp}] ${event}${payload}`;
}

process.on('uncaughtException', (err) => {
  console.error('Excepción no capturada:', err);
});

process.on('unhandledRejection', (reason) => {
  console.error('Rechazo no manejado:', reason);
});

async function bootstrap() {
  const fastify = Fastify();

  await fastify.register(corsPlugin);

  fastify.addHook('onRequest', async (request) => {
    console.log(formatLog(`[HTTP] ${request.method} ${request.url}`));
  });

  fastify.addHook('onResponse', async (request, reply) => {
    console.log(formatLog(`[HTTP] ${request.method} ${request.url} -> ${reply.statusCode}`));
  });

  const gameStore = createGameStore();

  const io = new Server(fastify.server, {
    cors: {
      origin: ALLOWED_ORIGINS,
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket: Socket) => {
    console.log(formatLog(`[SOCKET] connect socket_id=${socket.id} remote=${socket.handshake.address}`));

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const origEmit = socket.emit.bind(socket);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const origOn = socket.on.bind(socket);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (socket as any).on = function (event: string, fn: (...args: unknown[]) => void) {
      console.log(formatLog(`[SOCKET] event=${event} socket_id=${socket.id}`));
      return origOn(event, fn);
    };

    socket.on('disconnect', (reason: string) => {
      console.log(formatLog(`[SOCKET] disconnect socket_id=${socket.id} reason=${reason}`));
    });
  });

  const handlers = createSocketHandlers(gameStore, io);
  handlers.registerHandlers(io);

  fastify.get('/health', async () => ({
    status: 'ok',
    uptime: Math.floor(process.uptime()),
  }));

  fastify.post('/admin/reset', async (_req, reply) => {
    await gameStore.clearAll();
    return reply.send({ status: 'reset', rooms: 0, players: 0 });
  });

  fastify.get('/storage-status', async () => {
    const status = await gameStore.getStatus();
    return {
      ...status,
      timestamp: new Date().toISOString(),
    };
  });

  await fastify.listen({ port: SERVER_PORT, host: '0.0.0.0' });
  console.log(`Servidor iniciado en el puerto ${SERVER_PORT}`);
}

bootstrap().catch((err) => {
  console.error('Error al iniciar el servidor:', err);
  process.exit(1);
});