import { FastifyReply, FastifyRequest } from "fastify";
import { UserRepository } from "../repositories/User.repository";
import { User,UserParams,AuthProvider,AuthProviderParams } from "../types/index.types";
import { UrlSearchParams } from "@src/types/User.types";

/**
 * 📌 🔍 User CRUD
 * 
 * **Routes**:          CREATE
 * - createUser            POST    /users
 * 
 * **Routes**:          READ
 * - getUsers              GET     /users
 * - getUserById           GET     /users/:id
 * 
 * **Routes**:          UPDATE
 * - addAuthProvider       POST    /users/:id/auth-providers * 
 * - updateUser            PUT     /users/:id
 * 
 * **Routes**:          DELETE
 * - deleteUser            DELETE  /users/:id
 */
const userRepo = new UserRepository();

// 📌 📢 Route : GET /users
export const getUsers = async (req: FastifyRequest, reply: FastifyReply) => {
  const { filters } = req.query as UrlSearchParams;
  // const { filters, limit, offset, order } = req.query as UrlSearchParams;
  if (filters) {
   const parsedFilters = filters ? JSON.parse(decodeURIComponent(filters)) : [];
   const user = await userRepo.findByParams(parsedFilters);
   if (!user) return reply.status(404).send({ message: "User not found" });
   return reply.send(user);
  }

  const user = await userRepo.findAll();

  if (!user) return reply.status(404).send({ message: "User not found" });
  return reply.send(user);
};
// 📌 📢 Route : GET /users/:id
export const getUserById = async (req: FastifyRequest, reply: FastifyReply) => {
  const { id } = req.params as UserParams;
  const userId = Number(id);
  const user = await userRepo.findById(userId);

  if (!user) return reply.status(404).send({ message: "User not found" });
  return reply.send(user);
};

// 📌 📢 Route : GET /users?filters=filters
export const getUsersByParams = async (req: FastifyRequest, reply: FastifyReply) => {
  const filters = req.query as UserParams;
  const user = await userRepo.findByParams(filters);

  if (!user) return reply.status(404).send({ message: "User not found" });
  return reply.send(user);
 
}



// 📌 📢 Route : POST /users
export const createUser = async (req: FastifyRequest, reply: FastifyReply) => {
  const { email, name, authProviders } = req.body as User;
  const user = await userRepo.createUser(email, name, authProviders);
  return reply.status(201).send(user);
};

// 📌 📢 Route : POST /users/:id/auth-providers
export const addAuthProvider = async (req: FastifyRequest, reply: FastifyReply) => {
  const { id } = req.params as UserParams;
  const userId = Number(id);
  const { provider, provider_id } = req.body as AuthProviderParams;
  
  try {
    const authProvider = await userRepo.addAuthProvider(userId, provider!, provider_id!);
    return reply.status(201).send(authProvider);
  } catch (error) {
    return reply.status(404).send({ message: error.message });
  }
};

// 📌 📢 Route : PUT /users/:id
export const updateUser = async (req: FastifyRequest, reply: FastifyReply) => {
  const { id } = req.params as UserParams;
  const userId = Number(id);
  const data = req.body as Partial<User>;

  const user = await userRepo.updateUser(userId, data);
  return reply.send(user);
};

// 📌 📢 Route : DELETE /users/:id
export const deleteUser = async (req: FastifyRequest, reply: FastifyReply) => {
  const { id } = req.params as UserParams;
  const userId = Number(id);
  await userRepo.deleteUser(userId);
  return reply.status(204).send();
};
