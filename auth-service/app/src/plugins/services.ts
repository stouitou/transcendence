import fp from 'fastify-plugin';
import { AuthService } from "../services/auth.service";
import { FastifyPluginAsync, FastifyInstance, FastifyPluginOptions } from 'fastify'


const UserServicePlugin: FastifyPluginAsync = async (fastify: FastifyInstance, options: FastifyPluginOptions): Promise<void> => { 
   const authService = new AuthService(fastify);
  fastify.decorate('authService', authService);
}
export default fp(UserServicePlugin)