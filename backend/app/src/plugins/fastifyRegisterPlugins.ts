import { registerSwagger } from "../plugins/swagger";
import dotenvPlugin from '../plugins/dotenvPlugin';
import userRoutes from "../routes/user.routes";
import { FastifyInstance } from "fastify";
import jwtPlugin from "../plugins/jwtPlugin";


export async function registerPlugins(app: FastifyInstance) {
	await registerSwagger(app); // Intégration de Swagger
	await app.register(dotenvPlugin); // Intégration de dotenvPlugin
	app.register(jwtPlugin); // Intégration de jwtPlugin

  }

//export default registerPlugins;