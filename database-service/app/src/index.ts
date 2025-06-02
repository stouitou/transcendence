import "reflect-metadata";
import Fastify from "fastify";
import { registerSwagger } from "./plugins/swagger";
import dotenvPlugin from "./plugins/dotenvPlugin";
import { entityRoutes } from "./routes/entity.routes";
import databases from "./plugins/databases";
import { managerRoutes } from "./routes/manager.routes";


const start = async () => {
  try {
    const app = Fastify({ /* logger: true, */ ignoreTrailingSlash: true });   // ✅ On crée une instance de Fastify
    await app.register(dotenvPlugin);        // ✅ On charge le plugin Dotenv
    await app.register(databases);           // ✅ On charge le plugin Databases
    await registerSwagger(app);              // ✅ Ensuite, on charge le plugin Swagger

    // ✅ Gestion des erreurs
    // 📌 Si une erreur est levée, on log l'erreur et on renvoie une réponse d'erreur
    app.setErrorHandler(function (error, request, reply) {
      this.log.error(error)
      reply.status(409).send({ setErrorHandler: error }) // 409 Conflict @TODO: create errorhandling()
    })
    // ✅ Gestion des routes
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


    app.register(entityRoutes ,{prefix:"/api/v2/database"});
    app.register(managerRoutes ,{prefix:"/api/v2/database/manager"});

    app.listen({port: 3000, host: "0.0.0.0" }, () => {
      console.log("Server running on http://localhost:3000");
    });
  } catch (error) {
    console.error("Error starting server:", error);
    process.exit(1);
  }
};

start();
