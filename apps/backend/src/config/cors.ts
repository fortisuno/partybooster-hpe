import type { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';

export const ALLOWED_ORIGINS = [
  'http://localhost:3001',
  'http://localhost:5173',
  'https://partybooster-hpe-d30hs8idn-pgomezm0486s-projects.vercel.app',
];

async function corsConfig(fastify: FastifyInstance) {
  await fastify.register(import('@fastify/cors'), {
    origin: ALLOWED_ORIGINS,
    methods: ['GET', 'POST'],
    credentials: true,
  });
}

export default fp(corsConfig);