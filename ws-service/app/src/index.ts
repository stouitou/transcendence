import { server } from "./server";
import  {registerPlugins}  from "./plugins/fastifyRegisterPlugins";
import wsRoutes from "./routes/wsRoutes.routes";

const app = server();

async function start() {
  //1- Enregistrement des plugins
  await registerPlugins(app);
  //2- Enregistrer les routes
	await app.register(wsRoutes, { prefix: "/ws" });
  //3- Recuperer les variables d'environnement 
 /* const host = app.env.BACKEND_SERVER_NAME_API;
  const port = app.env.BACKEND_SERVER_SSH_PORT */
  //4- Démarrer le serveur
  try {
    await app.listen({ port: 3000, host: "0.0.0.0" });
    console.log(`🚀 ws-Server running on node container http://localhost:3000`);
    console.log(`🚀 ws-Server running on  wss://localhost:4433/ws`);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
start();
