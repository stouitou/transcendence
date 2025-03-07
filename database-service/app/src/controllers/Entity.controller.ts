import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { EntityRepository } from "../repositories/Entity.repository";
import { User,UserParams,AuthProvider,AuthProviderParams } from "../types/index.types";
import { UrlSearchParams } from "@src/types/User.types";
import { DeepPartial, EntityTarget, ObjectLiteral } from "typeorm";
import { getEntityByName } from "@src/config/entityMap";

/*
options?: {
    limit?: number;
    offset?: number;
    order?: "ASC" | "DESC";
    relations?: string[];
}): Promise<T[]>;
*/
// 📌 🔍 Trouver un élément avec des filtres avancés
class buildOptions {
  private limits: number | undefined;
  private offsets: number | undefined;
  private orders: "ASC" | "DESC" | undefined;
  private relations: string[] | undefined;
  constructor(private options: UrlSearchParams) {
    //set default values
    this.limits = undefined;
    this.offsets = undefined;
    this.orders = undefined;
    this.relations = undefined;
    this.setLimits(options.limit);
    this.setOffsets(options.offset);
    this.setOrders(options.order as "ASC" | "DESC");
    this.setRelations(options.relations);
  }
  setLimits(limit: number | undefined | string) {
    if (limit) {
      this.limits = Number(limit);
    }
  }
  setOffsets(offset: number | undefined | string) {
    if (offset) {
      this.offsets = Number(offset);
    }
  }
  setOrders(order: "ASC" | "DESC") {
    this.orders = order;
  }
  setRelations(relations: string | string[]) {
    if (typeof relations === "string") {
      relations = relations.split(",");
    }    
    this.relations = relations;
  }
  getOptions() : {limit?: number; offset?: number; order?: "ASC" | "DESC"; relations?: string[] }{
    return {limit: this.limits, offset: this.offsets, order: this.orders, relations: this.relations};
  }
}

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

export class EntityController {
  constructor(private app: FastifyInstance) {
    // Lier les méthodes pour conserver le contexte de `this`
    this.app = app;
    this.getEntitys = this.getEntitys.bind(this);
    this.getEntityById = this.getEntityById.bind(this);
    this.getEntitysByParams = this.getEntitysByParams.bind(this);
    this.createEntity = this.createEntity.bind(this);
    this.updateEntity = this.updateEntity.bind(this);
    this.deleteEntity = this.deleteEntity.bind(this);
  }

// 📌 📢 Route : GET /table/:entity
getEntitys = async (req: FastifyRequest, reply: FastifyReply) => {
  
   const { filters } = req.query as UrlSearchParams;
  // const { filters, limit, offset, order } = req.query as UrlSearchParams;
  const { database, entity } = req.params as { database: string, entity: string };
  //0- Récupérer la base de données par son nom
  const entityDataSource = (await this.app.DB.getDataBase(database));
   if (!entityDataSource) {
    return reply.status(404).send({ error: `Database '${database}' not found` }); // 👈 Error ou message?
  }
   //1- Trouver l'entité par son nom
  const entityClass = entityDataSource.getEntityByName(entity);
  if (!entityClass) {
    return reply.status(404).send({ error: `Entity '${entity}' not found` }); // 👈 Error ou message?
  }
  console.log("🚀 ~ file: Entity.controller.ts ~ line 56 ~ EntityController ~ getEntitys= ~ entityClass", entityClass);
  //2- Créer une instance de EntityRepository
   const repository =  new EntityRepository(entityDataSource.getDataSource() ,entityClass);
  //3- Récupérer les données de l'entité avec les filtres
  console.log("🚀 ~ file: Entity.controller.ts ~ line 61 ~ EntityController ~ getEntitys= ~ filters", filters);
  const query = req.query as UrlSearchParams;
  const options = new buildOptions(query).getOptions();
  if (filters) { 
   const parsedFilters = JSON.parse(decodeURIComponent(filters));
  //const result = await repository.findByParams(parsedFilters);

  const result = await repository.findByParams(parsedFilters,options);
   if (!result) return reply.status(404).send({ error: "User not found" });
   return reply.send(result);
  }
  //4- Récupérer les données de l'entité
  const result = await repository.findAll(options);

  if (!result) return reply.status(404).send({ error: "User not found" });
  //5- Retourner les données
  return reply.send(result);
};

// 📌 📢 Route : GET /table/:entity/:id
getEntityById = async (req: FastifyRequest, reply: FastifyReply) => {
  const { database, entity, id } = req.params as { database: string, entity: string, id: string };
  //0- Récupérer la base de données par son nom
  const entityDataSource = (await this.app.DB.getDataBase(database));
  if (!entityDataSource) {
    return reply.status(404).send({ error: `Database '${database}' not found` }); // 👈 Error ou message?
  }
  //1- Trouver l'entité par son nom
  const entityClass = entityDataSource.getEntityByName(entity);
  console.log(entityClass);
  //1-a Vérifier si l'entité existe
  if (!entityClass) {
    return reply.status(404).send({ error: `Entity '${entity}' not found` }); // 👈 Error ou message?
  }
  //2- Créer une instance de EntityRepository
   const repository =  new EntityRepository(entityDataSource.getDataSource() ,entityClass);
  //3- Récupérer les données de l'entité avec son ID
  const entityId = Number(id);
  const result = await repository.findById(entityId);
  //3-a Vérifier si l'entité existe
  if (!result) return reply.status(404).send({ error: `Entity '${entity}' not found` });
  //4- Retourner les données
  return reply.send(result);
};

// 📌 📢 Route : GET /table/:entity?filters=filters                                 //ne serai ce pas en double?
getEntitysByParams = async (req: FastifyRequest, reply: FastifyReply) => {
  const { filters } = req.query as UrlSearchParams;
  // const { filters, limit, offset, order } = req.query as UrlSearchParams;
  const { database, entity } = req.params as { database: string, entity: string };
  //0- Récupérer la base de données par son nom
  const entityDataSource = (await this.app.DB.getDataBase(database));
  if (!entityDataSource) {
    return reply.status(404).send({ error: `Database '${database}' not found` }); // 👈 Error ou message?
  }
  //1- Trouver l'entité par son nom
  const entityClass = entityDataSource.getEntityByName(entity);
  console.log(entityClass);
  if (!entityClass) {
    return reply.status(404).send({ error: `Entity '${entity}' not found` });        // 👈 Error ou message?
  }
  //2- Créer une instance de EntityRepository
  const repository =  new EntityRepository(entityDataSource.getDataSource() ,entityClass);
  //3- Récupérer les données de l'entité avec les filtres
  if (filters) {
   const parsedFilters = filters ? JSON.parse(decodeURIComponent(filters)) : [];

  const result = await repository.findByParams(parsedFilters);
   if (!result) return reply.status(404).send({ error: "User not found" });
   return reply.send(result);
  }
}

// 📌 📢 Route : POST /table/:entity
createEntity = async (req: FastifyRequest, reply: FastifyReply) => {
  const { database, entity } = req.params as { database: string, entity: string };
  //0- Récupérer la base de données par son nom
  const entityDataSource = (await this.app.DB.getDataBase(database));
  if (!entityDataSource) {
    return reply.status(404).send({ error: `Database '${database}' not found` }); // 👈 Error ou message?
  }
   //1- Trouver l'entité par son nom
  const entityClass = entityDataSource.getEntityByName(entity);
  console.log(entityClass);
  if (!entityClass) {
    return reply.status(404).send({ error: `Entity '${entity}' not found` }); // 👈 Error ou message?
  }
  //2- Créer une instance de EntityRepository
   const repository =  new EntityRepository(entityDataSource.getDataSource() ,entityClass);
   //3- faire une validation des données
   //  const { valid, entity, errors }= repository.validate(req.body) ou const { valid, entity, errors } = entityValidator(entity, req.body);
    // if (!valid) return reply.status(400).send({ errors });
   //
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
updateEntity = async (req: FastifyRequest, reply: FastifyReply) => {
  const { database, entity, id} = req.params as { database: string, entity: string, id: string };
  //0- Récupérer la base de données par son nom
  const entityDataSource = (await this.app.DB.getDataBase(database));
  if (!entityDataSource) {
    return reply.status(404).send({ error: `Database '${database}' not found` }); // 👈 Error ou message?
  }
   //1- Trouver l'entité par son nom
  const entityClass = entityDataSource.getEntityByName(entity);
  if (!entityClass) {
    return reply.status(404).send({ error: `Entity '${entity}' not found` }); // 👈 Error ou message?
  }
  //2- Créer une instance de EntityRepository
   const repository =  new EntityRepository(entityDataSource.getDataSource() ,entityClass);
  
  
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
deleteEntity = async (req: FastifyRequest, reply: FastifyReply) => {
  const { database, entity, id} = req.params as { database: string, entity: string, id: string };
   //0- Récupérer la base de données par son nom
   const entityDataSource = (await this.app.DB.getDataBase(database));
   if (!entityDataSource) {
     return reply.status(404).send({ error: `Database '${database}' not found` }); // 👈 Error ou message?
   }
    //1- Trouver l'entité par son nom
   const entityClass = entityDataSource.getEntityByName(entity);
   console.log(entityClass);
   if (!entityClass) {
     return reply.status(404).send({ error: `Entity '${entity}' not found` }); // 👈 Error ou message?
   }
   //2- Créer une instance de EntityRepository
    const repository =  new EntityRepository(entityDataSource.getDataSource() ,entityClass);
   //4- recupérer les données de l'entité depuis le body de la requête
  //5- Mettre à jour l'entité
  const entityId = Number(id);
  const result = await repository.delete(entityId);
  //5-a Vérifier si l'entité a été crée
  if (!result) return reply.status(404).send({ error: `Entity '${entity}' could not be updated` });
  //6- Retourner les données
   return reply.status(204).send();
  };
  
  //liste des base de données
  // 📌 📢 Route : GET /databases
  getDatabases = async (req: FastifyRequest, reply: FastifyReply) => {
    const databases = this.app.DB.getDataBaseNames();
    return reply.send(databases);
  }
  // 📌 📢 Route : GET /databases
  getDatabaseEntitys = async (req: FastifyRequest, reply: FastifyReply) => {
    const { database } = req.params as { database: string };
  
    const entityDataSource = await this.app.DB.getDataBase(database);
    if (!entityDataSource) {
      return reply.status(404).send({ error: `Database '${database}' not found` });
    }
    const entityClass = entityDataSource.getEntitys();
    const entityArray = Object.values(entityClass).map((entity:any ) => entity.name);
    return reply.send({ ...entityArray });
  }
  
}


//@TODO :
// 📌 📢 Route : GET /table/:entity/:id/:entity2
// 📌 📢 Route : POST /table/:entity/:id/:entity2 //voir pour jointure
// 📌 📢 Route : PUT /table/:entity/:id/:entity2
// 📌 📢 Route : DELETE /table/:entity/:id/:entity2