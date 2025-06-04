import fastify from 'fastify'
import { registerPlugins }  from "../plugins/fastifyRegisterPlugins";
import { generateErrorResponse } from '../Errors/handler';
const server = fastify({
  ignoreTrailingSlash: true, // Ignore les slashs en trop
  trustProxy: true, // Indique à Fastify qu'il est derrière un proxy

});

export async function buildServer() {
server.setNotFoundHandler((request, reply) => {
  console.error('Route not found:', request.raw.url);
  return reply.status(404).send({
	success: false,
	statusCode: 404,
	error: "NotFound",
	type: "NotFoundError",
	name: "NotFoundError",
	code: "ERROR_NOT_FOUND",
	message: "Not found",
	timestamp: new Date().toISOString(),
	details: {
	  method: request.raw.method,
	  url: request.raw.url,}
  });
});
server.setErrorHandler((error, request, reply) => {
  return generateErrorResponse(reply, error);
});

server.addHook('onRequest', async (request, reply) => {
  console.log(`[${new Date().toLocaleString()}] ${request.method} ${request.url}`);
});

server.addHook('onResponse', async (request, reply) => {
  // Log uniquement les succès (statut 2xx)
  if (reply.statusCode >= 200 && reply.statusCode < 300) {
	console.log(`[SUCCESS] ${request.method} ${request.url} - ${reply.statusCode}`);
	// le body si besoin :
	// console.log('Response payload:', reply.payload);
  }else if (reply.statusCode >= 400) {
	console.error(`[ERROR] ${request.method} ${request.url} - ${reply.statusCode}`);
	// console.error('Response payload:', reply.payload);
  }
});



  await registerPlugins(server); // Enregistre routes/plugins

  return server;
}