import { FastifyInstance } from "fastify";
import swagger from "@fastify/swagger";
import swaggerUI from "@fastify/swagger-ui";
import { getEnvVariable } from "../utils/getEnvVariable";

export async function registerSwagger(app: FastifyInstance) {
  const BACKEND_SERVER_URL:string = getEnvVariable("BACKEND_SERVER_URL");
  // configuration de Swagger
  await app.register(swagger, {
    openapi: {
      info: {
        title: "Welcome to Auth Service API Documentation",
        description,
        version: "2.0.0",
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
	  servers: [{ url: `${BACKEND_SERVER_URL}` }],
    },
  });

  await app.register(swaggerUI, {
    routePrefix: "/api/auth/docs",
    uiConfig: {
      docExpansion: "list",
      deepLinking: false,
    },
  });
}

const description = "<h2>📚 API Documentation for Auth Service</h2>\
          <p>Welcome to the comprehensive documentation for our Auth Service API. Here, you'll find all the information you need to interact with our API endpoints effectively.</p>\
          <h3>🔐 Authentication</h3>\
          <p>Our API uses <strong>RS256 JWT Tokens</strong> for secure authentication. Ensure you include the token in your requests to access protected resources.</p>\
          <h3>📂 Available Endpoints</h3>\
          <p>Explore the various endpoints available for managing your authentication and authorization. Each endpoint is documented with detailed information on the required parameters, request bodies, and responses.</p>\
          <h3>📈 Examples and Use Cases</h3>\
          <p>We provide examples and use cases to help you understand how to use the API effectively. Check out the example requests and responses to get started quickly.</p>\
          <h3>🔧 Support and Feedback</h3>\
          <p>If you encounter any issues or have feedback, please reach out to our support team. We're here to help you make the most of our API.</p>\
          <h3>🚀 Ready to Get Started?</h3>\
          <p>Happy coding! 🚀</p>\
          <h4>📝 Note: </h4>\
          <ul>\
          <li><p>❌ 🚧 ⚠️ 🚨 ...inProgress...</p></li>\
          <li><p>❌ 🚧 ⚠️ 🚨 ...inProgress...</p></li>\
          ";