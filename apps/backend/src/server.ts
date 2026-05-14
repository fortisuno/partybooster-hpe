import Fastify from 'fastify';
import { Server } from 'socket.io';
import { createServer } from 'http';
import corsPlugin from './config/cors.js';
import { createInMemoryStore } from './infrastructure/persistence/in-memory-store.js';
import { createSocketHandlers } from './infrastructure/socket/handlers.js';
import { SERVER_PORT } from './config/constants.js';

async function bootstrap() {
  const fastify = Fastify();

  await fastify.register(corsPlugin);

  const httpServer = createServer(fastify.server);

  const io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  const store = createInMemoryStore();
  const handlers = createSocketHandlers(store, io);
  handlers.registerHandlers(io);

  httpServer.listen(SERVER_PORT, () => {
    console.log(`Servidor iniciado en el puerto ${SERVER_PORT}`);
  });
}

bootstrap().catch((err) => {
  console.error('Error al iniciar el servidor:', err);
  process.exit(1);
});