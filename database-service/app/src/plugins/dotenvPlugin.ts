import fp from 'fastify-plugin';
import * as dotenv from 'dotenv';


declare module 'fastify' {
  interface FastifyInstance {
    env: any;
  }
}

dotenv.config();
export default fp(async (fastify, opts) => {
  fastify.decorate('env', process.env);
});