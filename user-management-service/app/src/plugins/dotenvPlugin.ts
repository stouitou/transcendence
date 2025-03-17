import fp from 'fastify-plugin';
import * as dotenv from 'dotenv';

dotenv.config();

export default fp(async (fastify, opts) => {
  fastify.decorate('env', process.env);
});