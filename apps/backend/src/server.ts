import Fastify from 'fastify';
import { Server } from 'socket.io';
import corsPlugin from './config/cors.js';
import { createInMemoryStore } from './infrastructure/persistence/in-memory-store.js';
import { createSocketHandlers } from './infrastructure/socket/handlers.js';
import { SERVER_PORT } from './config/constants.js';

async function bootstrap() {
  const fastify = Fastify();

  await fastify.register(corsPlugin);

  fastify.get('/health', async () => ({
    status: 'ok',
    uptime: Math.floor(process.uptime()),
  }));

  const io = new Server(fastify.server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  const store = createInMemoryStore();
  const handlers = createSocketHandlers(store, io);
  handlers.registerHandlers(io);

  await fastify.listen({ port: SERVER_PORT, host: '0.0.0.0' });
  console.log(`Servidor iniciado en el puerto ${SERVER_PORT}`);
}

bootstrap().catch((err) => {
  console.error('Error al iniciar el servidor:', err);
  process.exit(1);
});