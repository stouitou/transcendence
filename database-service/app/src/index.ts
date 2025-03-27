import "reflect-metadata";
import Fastify from "fastify";
import { registerSwagger } from "./plugins/swagger";
import dotenvPlugin from "./plugins/dotenvPlugin";
import { entityRoutes } from "./routes/entity.routes";
import databases from "./plugins/databases";
import { managerRoutes } from "./routes/manager.routes";

import Seed from "./config/seed";

  let isSeed = false;
const start = async () => {
  try {
    const app = Fastify({ logger: true, ignoreTrailingSlash: true });   // ✅ On crée une instance de Fastify
    await app.register(dotenvPlugin);        // ✅ On charge le plugin Dotenv
    await app.register(databases);           // ✅ On charge le plugin Databases
    await registerSwagger(app);              // ✅ Ensuite, on charge le plugin Swagger

    // ✅ Gestion des erreurs
    // 📌 Si une erreur est levée, on log l'erreur et on renvoie une réponse d'erreur
    app.setErrorHandler(function (error, request, reply) {
      this.log.error(error)
      reply.status(409).send({ setErrorHandler: error }) // 409 Conflict @TODO: create errorhandling()
    })

    //@TODO: A supprimer en production
    app.get("/api/v2/database/seed", async (request, reply) => {
      if (isSeed) {
        return { message: "Seed already executed" };
      }
      const seedInstance = new Seed(app);
      const users = await seedInstance.seedUsers();
      const round = await seedInstance.seedRoundTournaments();
      const tournaments = await seedInstance.seedTournaments();
      isSeed = true;
      return { users, round, tournaments };
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
