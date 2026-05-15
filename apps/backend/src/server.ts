import Fastify from 'fastify';
import { Server } from 'socket.io';
import corsPlugin, { ALLOWED_ORIGINS } from './config/cors.js';
import { createInMemoryStore } from './infrastructure/persistence/in-memory-store.js';
import { createSocketHandlers } from './infrastructure/socket/handlers.js';
import { SERVER_PORT } from './config/constants.js';

process.on('uncaughtException', (err) => {
  console.error('Excepción no capturada:', err);
});

process.on('unhandledRejection', (reason) => {
  console.error('Rechazo no manejado:', reason);
});

async function bootstrap() {
  const fastify = Fastify();

  await fastify.register(corsPlugin);

  const store = createInMemoryStore();

  const io = new Server(fastify.server, {
    cors: {
      origin: ALLOWED_ORIGINS,
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  const handlers = createSocketHandlers(store, io);
  handlers.registerHandlers(io);

  fastify.get('/health', async () => ({
    status: 'ok',
    uptime: Math.floor(process.uptime()),
  }));

  fastify.post('/admin/reset', async (_req, reply) => {
    store.rooms.clear();
    store.playerToRoom.clear();
    store.socketToPlayer.clear();
    return reply.send({ status: 'reset', rooms: 0, players: 0 });
  });

  await fastify.listen({ port: SERVER_PORT, host: '0.0.0.0' });
  console.log(`Servidor iniciado en el puerto ${SERVER_PORT}`);
}

bootstrap().catch((err) => {
  console.error('Error al iniciar el servidor:', err);
  process.exit(1);
});