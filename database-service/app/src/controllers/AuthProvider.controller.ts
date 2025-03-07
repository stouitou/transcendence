import { FastifyReply, FastifyRequest } from "fastify";
import { AuthProviderRepository } from "../repositories/AuthProvider.repository";
import { UserRepository } from "../repositories/User.repository";

import { User,UserParams,AuthProvider,AuthProviderParams } from "../types/index.types";

const authProviderRepo = new AuthProviderRepository();
const userRepo = new UserRepository();


// 📌 📢 Route : GET /auth-providers/:id
export const getAuthProviderById = async (req: FastifyRequest, reply: FastifyReply) => {
  const { id } = req.params as UserParams;
  const providerId = Number(id);
  const provider = await authProviderRepo.findById(providerId);

  if (!provider) return reply.status(404).send({ message: "AuthProvider not found" });
  return reply.send(provider);
};

// 📌 📢 Route : GET /users/:id/auth-providers
export const getAuthProvidersByUserId = async (req: FastifyRequest, reply: FastifyReply) => {
  const { id } = req.params as UserParams;
  const userId = Number(id);
  const providers = await authProviderRepo.findByUserId(userId);
  return reply.send(providers);
};

// 📌 📢 Route : POST /users/:id/auth-providers
export const addAuthProviderToUser = async (req: FastifyRequest, reply: FastifyReply) => {
  const { id } = req.params as UserParams;
  const userId = Number(id);
  const { provider, provider_id } = req.body as AuthProviderParams;

  const user = await userRepo.findById(userId);
  if (!user) return reply.status(404).send({ message: "User not found" });

  const newProvider = await authProviderRepo.addAuthProvider(user, provider!, provider_id!);
  return reply.status(201).send(newProvider);
};

// 📌 📢 Route : DELETE /auth-providers/:id
export const deleteAuthProvider = async (req: FastifyRequest, reply: FastifyReply) => {
  const { id } = req.params as AuthProviderParams
  const providerId = Number(id);
  await authProviderRepo.deleteAuthProvider(providerId);
  return reply.status(204).send();
};
