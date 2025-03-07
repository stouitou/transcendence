import { FastifyInstance } from "fastify";
import { getUsers, getUserById, createUser, addAuthProvider, getUsersByParams, updateUser, deleteUser } from "../controllers/User.controller";
import { getAuthProviderById, getAuthProvidersByUserId, addAuthProviderToUser, deleteAuthProvider } from "../controllers/AuthProvider.controller";


export async function userRoutes(fastify: FastifyInstance) {
  fastify.get("/users", getUsers);
  fastify.get("/users?filters=filters", getUsersByParams);
  fastify.get("/users/:id", getUserById);
  fastify.post("/users", createUser);
  fastify.post("/users/:id/auth-providers", addAuthProvider);
  fastify.put("/users/:id", updateUser);
  fastify.delete("/users/:id", deleteUser);

  //export async function authProviderRoutes(fastify: FastifyInstance) {
     fastify.get("/auth-providers/:id", getAuthProviderById);
    fastify.get("/users/:id/auth-providers", getAuthProvidersByUserId);
    //fastify.post("/users/:id/auth-providers2", addAuthProviderToUser);
    fastify.delete("/auth-providers/:id", deleteAuthProvider);
 // }
  
}
