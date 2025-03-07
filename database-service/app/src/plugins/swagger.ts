import { FastifyInstance } from "fastify";
import swagger from "@fastify/swagger";
import swaggerUI from "@fastify/swagger-ui";

export async function registerSwagger(app: FastifyInstance) {  
  const host = app.env.BACKEND_SERVER_NAME_API;
  const port = app.env.BACKEND_SERVER_SSH_PORT;
  // configuration de Swagger
  await app.register(swagger, {
    openapi: {
      info: {
        title: "Fastify API",
        description: "Documentation de l'API avec Swagger",
        version: "1.0.0",
      },
      components: {
        securitySchemes: {
          bearerAuth: {
            description: "RS256 JWT Token signed with the private key",
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
          },
        },
      },
      security: [
        {
          bearerAuth: [],
        },
      ],
	  servers: [{ url: `https://${host}:${port}` }],
    },
  });

  await app.register(swaggerUI, {
    routePrefix: "/api2/docs",
    uiConfig: {
      docExpansion: "list",
      deepLinking: false,
    },
  });
}
