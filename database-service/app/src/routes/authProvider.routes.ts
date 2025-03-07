import { FastifyInstance } from "fastify";
import { getAuthProviderById, getAuthProvidersByUserId, addAuthProviderToUser, deleteAuthProvider } from "../controllers/AuthProvider.controller";

export async function authProviderRoutes(fastify: FastifyInstance) {
   fastify.get("/auth-providers/:id", getAuthProviderById);
  fastify.get("/users/:id/auth-providers", getAuthProvidersByUserId);
  fastify.post("/users/:id/auth-providers2", addAuthProviderToUser);
  fastify.delete("/auth-providers/:id", deleteAuthProvider);
}
