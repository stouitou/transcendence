import { FastifyReply, FastifyRequest } from "fastify";
import { EntityRepository } from "../repositories/Entity.repository";
import { User,UserParams,AuthProvider,AuthProviderParams } from "../types/index.types";
import { UrlSearchParams } from "@src/types/User.types";
import { DeepPartial, EntityTarget, ObjectLiteral } from "typeorm";
import { getEntityByName } from "@src/config/entityMap";

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


// 📌 📢 Route : GET /table/:entity
export const getEntitys = async (req: FastifyRequest, reply: FastifyReply) => {
  const { filters } = req.query as UrlSearchParams;
  // const { filters, limit, offset, order } = req.query as UrlSearchParams;
  const { entity } = req.params as { entity: string };
  //1- Trouver l'entité par son nom
  const entityClass = getEntityByName(entity);
  console.log(entityClass);
  if (!entityClass) {
    return reply.status(404).send({ error: `Entity '${entity}' not found` }); // 👈 Error ou message?
  }
  //2- Créer une instance de EntityRepository
   const repository =  new EntityRepository(entityClass);
  //3- Récupérer les données de l'entité avec les filtres
  if (filters) { 
   const parsedFilters = JSON.parse(decodeURIComponent(filters));

  const result = await repository.findByParams(parsedFilters);
   if (!result) return reply.status(404).send({ message: "User not found" });
   return reply.send(result);
  }
  //4- Récupérer les données de l'entité
  const result = await repository.findAll();

  if (!result) return reply.status(404).send({ message: "User not found" });
  //5- Retourner les données
  return reply.send(result);
};

// 📌 📢 Route : GET /table/:entity/:id
export const getEntityById = async (req: FastifyRequest, reply: FastifyReply) => {
  const { entity, id } = req.params as { entity: string, id: string };
  //1- Trouver l'entité par son nom
  const entityClass = getEntityByName(entity);
  console.log(entityClass);
  //1-a Vérifier si l'entité existe
  if (!entityClass) {
    return reply.status(404).send({ error: `Entity '${entity}' not found` }); // 👈 Error ou message?
  }
  //2- Créer une instance de EntityRepository
   const repository =  new EntityRepository(entityClass);
  //3- Récupérer les données de l'entité avec son ID
  const entityId = Number(id);
  const result = await repository.findById(entityId);
  //3-a Vérifier si l'entité existe
  if (!result) return reply.status(404).send({ error: `Entity '${entity}' not found` });
  //4- Retourner les données
  return reply.send(result);
};

// 📌 📢 Route : GET /table/:entity?filters=filters                                 //ne serai ce pas en double?
export const getEntitysByParams = async (req: FastifyRequest, reply: FastifyReply) => {
  const { filters } = req.query as UrlSearchParams;
  // const { filters, limit, offset, order } = req.query as UrlSearchParams;
  const { entity } = req.params as { entity: string };
  //1- Trouver l'entité par son nom
  const entityClass = getEntityByName(entity);
  console.log(entityClass);
  if (!entityClass) {
    return reply.status(404).send({ error: `Entity '${entity}' not found` });        // 👈 Error ou message?
  }
  //2- Créer une instance de EntityRepository
   const repository =  new EntityRepository(entityClass);
  //3- Récupérer les données de l'entité avec les filtres
  if (filters) {
   const parsedFilters = filters ? JSON.parse(decodeURIComponent(filters)) : [];

  const result = await repository.findByParams(parsedFilters);
   if (!result) return reply.status(404).send({ message: "User not found" });
   return reply.send(result);
  }
}

// 📌 📢 Route : POST /table/:entity
export const createEntity = async (req: FastifyRequest, reply: FastifyReply) => {
  const { entity} = req.params as { entity: string, id: string };
  //1- Trouver l'entité par son nom
  const entityClass = getEntityByName(entity);
  console.log(entityClass);
  //1-a Vérifier si l'entité existe
  if (!entityClass) {
    return reply.status(404).send({ error: `Entity '${entity}' not found` }); // 👈 Error ou message?
  }
  //2- Créer une instance de EntityRepository
   const repository =  new EntityRepository(entityClass);
  //4- recupérer les données de l'entité depuis le body de la requête
  const { ...data } = req.body as DeepPartial<ObjectLiteral>;
  //5- Créer une nouvelle entité
  const result = await repository.create(data);
  //5-a Vérifier si l'entité a été crée
  if (!result) return reply.status(404).send({ error: `Entity '${entity}' could not be created` });
  //6- Retourner les données  
  return reply.status(201).send(result);
};

// 📌 📢 Route : PUT /users/:id
export const updateEntity = async (req: FastifyRequest, reply: FastifyReply) => {
  const { entity, id} = req.params as { entity: string, id: string };
  //1- Trouver l'entité par son nom
  const entityClass = getEntityByName(entity);
  console.log(entityClass);
  //1-a Vérifier si l'entité existe
  if (!entityClass) {
    return reply.status(404).send({ error: `Entity '${entity}' not found` }); // 👈 Error ou message?
  }
  //2- Créer une instance de EntityRepository
   const repository =  new EntityRepository(entityClass);
  //4- recupérer les données de l'entité depuis le body de la requête
  const { ...data } = req.body as DeepPartial<ObjectLiteral>;
  //5- Mettre à jour l'entité
  const entityId = Number(id);
  const result = await repository.update(entityId, data);
  //5-a Vérifier si l'entité a été crée
  if (!result) return reply.status(404).send({ error: `Entity '${entity}' could not be updated` });
  //6- Retourner les données
  return reply.send(result);
};

// 📌 📢 Route : DELETE /users/:id
export const deleteEntity = async (req: FastifyRequest, reply: FastifyReply) => {
  const { entity, id} = req.params as { entity: string, id: string };
  //1- Trouver l'entité par son nom
  const entityClass = getEntityByName(entity);
  console.log(entityClass);
  //1-a Vérifier si l'entité existe
  if (!entityClass) {
    return reply.status(404).send({ error: `Entity '${entity}' not found` }); // 👈 Error ou message?
  }
  //2- Créer une instance de EntityRepository
   const repository =  new EntityRepository(entityClass);
  //4- recupérer les données de l'entité depuis le body de la requête
  //5- Mettre à jour l'entité
  const entityId = Number(id);
  const result = await repository.delete(entityId);
  //5-a Vérifier si l'entité a été crée
  if (!result) return reply.status(404).send({ error: `Entity '${entity}' could not be updated` });
  //6- Retourner les données
   return reply.status(204).send();
};



//@TODO :
// 📌 📢 Route : GET /table/:entity/:id/:entity2
// 📌 📢 Route : POST /table/:entity/:id/:entity2 //voir pour jointure
// 📌 📢 Route : PUT /table/:entity/:id/:entity2
// 📌 📢 Route : DELETE /table/:entity/:id/:entity2