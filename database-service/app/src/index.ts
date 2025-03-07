import "reflect-metadata";
import Fastify from "fastify";
import { AppDataSource } from "./config/data-source";
import { userRoutes } from "./routes/user.routes";
import { authProviderRoutes } from "./routes/authProvider.routes";
import { registerSwagger } from "./plugins/swagger";
import dotenvPlugin from "./plugins/dotenvPlugin";
import { entityRoutes } from "./routes/entity.routes";
import databases from "./plugins/databases";

// Initialisation des connexions
async function initDatabases() {
  // Initialisation des connexions aux bases de données
  /* await MainDB.initialize();
  console.log("MainDB connected!"); */

  await AppDataSource.initialize();
  console.log("AppDataSource connected!");
}

const start = async () => {
  try {
   // await initDatabases();  // ✅ D'abord, connexion aux DB

    const app = Fastify({ logger: true });
    await app.register(dotenvPlugin);
    await app.register(databases);  // ✅ Ensuite, on charge les routes
    await registerSwagger(app);  // ✅ Ensuite, on charge le plugin Swagger

/*     app.get("/", async () => {
      return { message: "Hello World" };
    });
    app.get("/api2", async () => {
      return { message: "Hello World" };
    });
    app.get("/api2/", async () => {
      return { message: "Hello World" };
    });
    app.get("/database", async () => {
      return { message: "Hello World" };
    }); */
    app.register(entityRoutes ,{prefix:"/api2/database2"});  // ✅ Ensuite, on charge les routes
    app.register(userRoutes ,{prefix:"/api2/database"});  // ✅ Ensuite, on charge les routes
   // app.register(authProviderRoutes ,{prefix:"/api2/database"});  // ✅ Ensuite, on charge les routes

    app.listen({port: 3000, host: "0.0.0.0" }, () => {
      console.log("Server running on http://localhost:3000");
    });
  } catch (error) {
    console.error("Error starting server:", error);
    process.exit(1);
  }
};

start();
