import fp from 'fastify-plugin';
import { Databases } from '@src/config/Databases';


declare module "fastify" {
	interface FastifyInstance {
	  DB: Databases;
	}
}

export default fp(async (fastify, opts) => {
  const databases = new Databases(["myDb"]);
  fastify.decorate('DB', databases);
});