import { server } from "./server";
import  {registerPlugins}  from "./plugins/fastifyRegisterPlugins";
import userRoutes from "./routes/user.routes";
import userMeRoutes from "./routes/userMe.routes";
import userAdminRoutes from "./routes/user.admin.routes";
import { generateErrorResponse } from "./Errors/handler";

const app = server();
app.setNotFoundHandler((request, reply) => {
  console.error('Route not found:', request.raw.url);
  return reply.status(404).send({
    success: false,
    statusCode: 404,
    error: "NotFound",
    type: "NotFoundError",
    name: "NotFoundError",
    message: "Route not found",
    timestamp: new Date().toISOString(),
    details: {
      method: request.raw.method,
      url: request.raw.url,}
  });
});
app.setErrorHandler((error, request, reply) => {
 // console.error('Erreur capturée:', error);
  return generateErrorResponse(reply, error);
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

async function start() {
  //1- Enregistrement des plugins
  await registerPlugins(app);
  //2- Enregistrer les routes
	await app.register(userAdminRoutes, { prefix: "/api/users/admin/users" });
	await app.register(userMeRoutes, { prefix: "/api/users/me" });
//	await app.register(userRoutes, { prefix: "/api/users" });
  //3- Recuperer les variables d'environnement
  const host = app.env.BACKEND_SERVER_NAME_API;
  const port = app.env.BACKEND_SERVER_SSH_PORT
  //4- Démarrer le serveur
  try {
    await app.listen({ port: 3000, host: "0.0.0.0" });
    console.log(`🚀 Server running on node container http://localhost:3000`);
    console.log(`📄 Documentation Swagger: https://${host}:${port}/api/users/docs`);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
start();
