import { registerSwagger } from "../plugins/swagger";
import dotenvPlugin from '../plugins/dotenvPlugin';
import authRoutes from "../routes/auth.routes";
import { FastifyInstance } from "fastify";
import jwtPlugin ,{ JWT } from "../plugins/jwtPlugin";
import { AuthService } from "../services/auth.service";
import  ServicesPlugin  from "../plugins/services"; 
import { registerAuthPlugin } from "./auth.plugin";

interface AuthenticatedUser { role: string; id?: number; name?: string; display_name?:string;avatar?:string }
declare module 'fastify' {
   interface FastifyRequest {
    authenticatedUser?: AuthenticatedUser;
	user?: PassportUser | undefined;
  }
}
declare module 'fastify' {
   interface FastifyInstance {
	authService: AuthService;
	jwt: JWT;
  }
}
export async function registerPlugins(app: FastifyInstance) {
	//await app.register(UserModelServices); // Intégration de UserServices UserModels
	await registerSwagger(app); // Intégration de Swagger
	app.register(jwtPlugin); // Intégration de jwtPlugin
	app.register(dotenvPlugin); // Intégration de dotenvPlugin
	app.register(ServicesPlugin);
	await registerAuthPlugin(app);
	await app.register(authRoutes, { prefix: "/api/auth/" }); // register auth routes
}
