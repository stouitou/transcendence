import { registerSwagger } from "../plugins/swagger";
import dotenvPlugin from '../plugins/dotenvPlugin';
import { FastifyInstance } from "fastify";
import jwtPlugin from "../plugins/jwtPlugin";
import fastifyMultipart from '@fastify/multipart';
import fastifyCookie from "@fastify/cookie";

/* async function onFile(part:any) {
	const buff = await part.toBuffer()
	const decoded = Buffer.from(buff.toString(), 'base64').toString()
	part.value = buff // set `part.value` to specify the request body value
	console.log("part",part)
  } */
export async function registerPlugins(app: FastifyInstance) {
	app.register(fastifyCookie)
	//register '@fastify/multipart' plugin
	await app.register(fastifyMultipart/* , { attachFieldsToBody: 'keyValues', onFile  }*/);
	await registerSwagger(app); // Intégration de Swagger
	await app.register(dotenvPlugin); // Intégration de dotenvPlugin
	app.register(jwtPlugin); // Intégration de jwtPlugin

  }

//export default registerPlugins;