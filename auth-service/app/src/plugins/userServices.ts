import fp from 'fastify-plugin';
import { FastifyPluginAsync, FastifyInstance, FastifyPluginOptions } from 'fastify'
import { UserModel } from '../models/User.Model';

const UserServicePlugin: FastifyPluginAsync = async (fastify: FastifyInstance, options: FastifyPluginOptions): Promise<void> => { 
 
  const userModels = new UserModel();
  fastify.decorate('userModels', userModels);
}
export default fp(UserServicePlugin)