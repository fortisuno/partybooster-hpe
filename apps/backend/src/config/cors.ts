import type { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';

async function corsConfig(fastify: FastifyInstance) {
  await fastify.register(import('@fastify/cors'), {
    origin: true,
    methods: ['GET', 'POST'],
  });
}

export default fp(corsConfig);