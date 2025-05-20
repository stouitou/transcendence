import fp from 'fastify-plugin';
import { AuthService } from "../services/auth.service";
import { FastifyPluginAsync, FastifyInstance, FastifyPluginOptions } from 'fastify'
import { TwoFactorAuthService } from '@src/services/TwoFactorAuthServices';


const UserServicePlugin: FastifyPluginAsync = async (fastify: FastifyInstance, options: FastifyPluginOptions): Promise<void> => { 
   const authService = new AuthService(fastify);
  fastify.decorate('authService', authService);
  const twoFactorAuthService = new TwoFactorAuthService(fastify);
  fastify.decorate('twoFactorAuthService', twoFactorAuthService);
}
export default fp(UserServicePlugin)