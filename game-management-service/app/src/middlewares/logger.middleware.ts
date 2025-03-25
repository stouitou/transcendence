import { FastifyRequest, FastifyReply, HookHandlerDoneFunction } from 'fastify';


const loggerMiddleware = async (request: FastifyRequest, reply: FastifyReply) => {
  console.log(`[${new Date().toISOString()}] ${request.method} ${request.url}`);
};

export default loggerMiddleware;
