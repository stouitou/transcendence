import fastify from 'fastify'
import { registerPlugins }  from "./plugins/fastifyRegisterPlugins";
const server = fastify({
  //logger: true,
  ignoreTrailingSlash: true, // Ignore les slashs en trop
  trustProxy: true, // Indique à Fastify qu'il est derrière un proxy
});


// Démarrage du serveur
async function start() {
  await registerPlugins(server); // Enregistrement des plugins  

  try {
    await server.listen({ port: 3000, host: "0.0.0.0" });
     console.log(`🚀 Server running on node container http://localhost:3000`);
     console.log(`🟩 API DOC Swagger : https://localhost:4433/api/auth/docs`);
    } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
start();
