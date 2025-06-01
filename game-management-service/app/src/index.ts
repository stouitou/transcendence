import { server } from "./server";
import { registerPlugins }  from "./plugins/fastifyRegisterPlugins";
import tournamentsRoutes from "./routes/tounament.routes";
import gameHistoryRoutes from "./routes/gameHistory.routes";
import gameRoutes from "./routes/game.routes";

const app = server();

async function start() {
  //1- Enregistrement des plugins
  await registerPlugins(app);


  app.addHook('onRequest', async (request, reply) => {
    console.log(`[${new Date().toLocaleString()}] ${request.method} ${request.url}`);
  });

  app.addHook('onResponse', async (request, reply) => {
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
  //2- Enregistrer les routes
	await app.register(gameHistoryRoutes, { prefix: "/internal/gameHistory" });
	await app.register(gameRoutes, { prefix: "/internal/games" });
	await app.register(tournamentsRoutes, { prefix: "/internal/tournaments" });

  //3- Recuperer les variables d'environnement
  const host = app.env.BACKEND_SERVER_NAME_API;
  const port = app.env.BACKEND_SERVER_SSH_PORT
  //4- Démarrer le serveur
  try {
    await app.listen({ port: 3000, host: "0.0.0.0" });
    //!! Warning only internal routes; isolated from local network and not exposed to the public
    //!! this service is only accessible from other services in the docker network
    console.warn("⚠️ Warning: This service is only accessible from other services in the docker network. It is not exposed to the public.");
    console.log(`🚀 Server running on node container http://localhost:3000`);
    console.log(`📄 Documentation Swagger: https://${host}:${port}/api/game-management-service/docs`);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
start();
