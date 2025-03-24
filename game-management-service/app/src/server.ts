import Fastify from "fastify";
import { JWT } from "./plugins/jwtPlugin";
import { JwtPayload}  from "jsonwebtoken" //@todo type

interface AuthenticatedUser { role: string; id?: number; name?: string; iat?: number; exp?: number; }
declare module 'fastify' {
  interface FastifyRequest {
	authenticatedUser?: AuthenticatedUser;
	user: string | JwtPayload;
  }
}

declare module 'fastify' {
  interface FastifyInstance {
	jwt: JWT;
	env: NodeJS.ProcessEnv
  }
}

 const logger = {  
  logger: false,
  ignoreTrailingSlash: true, // Ignore les slashs en trop
  trustProxy: true, // Indique à Fastify qu'il est derrière un proxy
}

export const server = () => {
	const app = Fastify(logger);
	console.log("🚀 Fastify server created");
	return app;
} 
