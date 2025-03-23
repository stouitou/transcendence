import { registerSwagger } from "../plugins/swagger";
import dotenvPlugin from '../plugins/dotenvPlugin';
import { FastifyInstance } from "fastify";
import jwtPlugin from "../plugins/jwtPlugin";
import fastifyCookie from "@fastify/cookie";

//@TODO: Register AuthMiddleware
export async function registerPlugins(app: FastifyInstance) {
	app.register(fastifyCookie)
	await registerSwagger(app); // Intégration de Swagger
	await app.register(dotenvPlugin); // Intégration de dotenvPlugin
	app.register(jwtPlugin); // Intégration de jwtPlugin
  }

//export default registerPlugins;