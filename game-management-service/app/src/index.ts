import { server } from "./server";
import  {registerPlugins}  from "./plugins/fastifyRegisterPlugins";
import gameRoutes from "./routes/game.routes";
import tournamentsRoutes from "./routes/tounament.routes";
import gameHistoryRoutes from "./routes/gameHistory.routes";
//import userRoutes from "./routes/user.routes";

const app = server();

async function start() {
  //1- Enregistrement des plugins
  await registerPlugins(app);
  //2- Enregistrer les routes
	await app.register(gameRoutes, { prefix: "/api/game-management-service/games" });
	await app.register(tournamentsRoutes, { prefix: "/api/game-management-service/tournaments" });
	await app.register(gameHistoryRoutes, { prefix: "/api/game-management-service/gameHistory" });
  //3- Recuperer les variables d'environnement
  const host = app.env.BACKEND_SERVER_NAME_API;
  const port = app.env.BACKEND_SERVER_SSH_PORT
  //4- Démarrer le serveur
  try {
    await app.listen({ port: 3000, host: "0.0.0.0" });
    console.log(`🚀 Server running on node container http://localhost:3000`);
    console.log(`📄 Documentation Swagger: https://${host}:${port}/api/game-management-service/docs`);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
start();
