import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { EntityRepository } from "../repositories/Entity.repository";
import { UrlSearchParams } from "../types/index.types";
import { DeepPartial, ObjectLiteral } from "typeorm";
import { generateErrorResponse, generateSucessResponse } from "../utils/responseHandler";
import { CustomIdNotFoundError } from "../config/Databases";
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
  private orderBy: string = "id"; // Default order by id
  private relations: string[] | undefined;
  private total: number | undefined
  constructor(private options: UrlSearchParams) {
    //set default values
    this.limits = undefined;
    this.offsets = undefined;
    this.orders = undefined;
    this.orderBy =options.orderBy || "id"; // Default order by id
    this.relations = undefined;
    this.total = undefined;
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
  getOptions() : {limit?: number; offset?: number; order?: "ASC" | "DESC",orderBy:string; relations?: string[], total?: number} {
    return {limit: this.limits, offset: this.offsets, order: this.orders,orderBy:this.orderBy, relations: this.relations};
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
   // this.getEntitysByParams = this.getEntitysByParams.bind(this);
    this.createEntity = this.createEntity.bind(this);
    this.updateEntity = this.updateEntity.bind(this);
    this.deleteEntity = this.deleteEntity.bind(this);
  }
  // 📌 📢 Route : GET /table/:entity
  getEntitys = async (req: FastifyRequest, reply: FastifyReply) => {
    
    try{
      const { filters } = req.query as UrlSearchParams;
     // console.log("getEntitysAndCount",req.query);
      // const { filters, limit, offset, order } = req.query as UrlSearchParams;
      const { database, entity } = req.params as { database: string, entity: string };
      //0- Récupérer la base de données par son nom
      const entityDataSource = (await this.app.DB.getDataBase(database));
      //1- Trouver l'entité par son nom
      const entityClass = entityDataSource.getEntityByName(entity);
      //2- Créer une instance de EntityRepository
      const repository =  new EntityRepository(entityDataSource.getDataSource() ,entityClass!);
      //3- Récupérer les données de l'entité avec les filtres
      const query = req.query as UrlSearchParams;
      const options = new buildOptions(query).getOptions();
      if (filters) {
        const parsedFilters =(filters as unknown as string[]).map((filter) => {
          return JSON.parse(decodeURIComponent(filter));
        });
        const [data,total] = await repository.findByParamsAndCount(parsedFilters,options);
        return generateSucessResponse(reply,200, data, {...options,total});
      }
      //4- Récupérer les données de l'entité
        const [result,total] = await repository.findAllAndCount(options);
      //5- Retourner les données
      return generateSucessResponse(reply,200, result, {...options,total});
    }
    catch (error) {

    return generateErrorResponse(reply, error);
  }
};
/* // 📌 📢 Route : GET /table/:entity
getEntitys = async (req: FastifyRequest, reply: FastifyReply) => {
  try{
    const { filters } = req.query as UrlSearchParams;
    // const { filters, limit, offset, order } = req.query as UrlSearchParams;
    const { database, entity } = req.params as { database: string, entity: string };
    //0- Récupérer la base de données par son nom
    const entityDataSource = (await this.app.DB.getDataBase(database));
     //1- Trouver l'entité par son nom
    const entityClass = entityDataSource.getEntityByName(entity);
     //2- Créer une instance de EntityRepository
     const repository =  new EntityRepository(entityDataSource.getDataSource() ,entityClass!);
    //3- Récupérer les données de l'entité avec les filtres
    const query = req.query as UrlSearchParams;
    const options = new buildOptions(query).getOptions();
    if (filters) {
      const parsedFilters =(filters as unknown as string[]).map((filter) => {
        return JSON.parse(decodeURIComponent(filter));
      });
//filters          | [ '[{"id":"5"},{"role":"user"}]' ]
//parsedFilters    | [ { id: '5' }, { role: 'user' } ]
      const [result,total] = await repository.findByParamsAndCount(parsedFilters,options);
      return generateSucessResponse(reply,200, result, {...options,total});
    }
    //4- Récupérer les données de l'entité
      const [result,total] = await repository.findAllAndCount(options);
    //5- Retourner les données
    return generateSucessResponse(reply,200, result, {...options,total});
  }
  catch (error) {

  return generateErrorResponse(reply, error);
}
}; */

// 📌 📢 Route : GET /table/:entity/:id
getEntityById = async (req: FastifyRequest, reply: FastifyReply) => {
  try {
    const { database, entity, id } = req.params as { database: string, entity: string, id: string };
    //0- Récupérer la base de données par son nom
    const entityDataSource = (await this.app.DB.getDataBase(database));

    //1- Trouver l'entité par son nom
    const entityClass = entityDataSource.getEntityByName(entity);
 
    //2- Créer une instance de EntityRepository
     const repository =  new EntityRepository(entityDataSource.getDataSource() ,entityClass!);
    //3- Récupérer les données de l'entité avec son ID
    //3- Récupérer les données de l'entité avec les filtres
    const query = req.query as UrlSearchParams;
    const options = new buildOptions(query).getOptions();
    const entityId = Number(id);
    const result = await repository.findById(entityId, options.relations);
    //3-a Vérifier si l'entité existe
    if (!result) throw  new CustomIdNotFoundError(`Entity '${entity}' with ID '${id}' not found`);//return generateErrorResponse(reply, 404, `Entity '${entity}' not found`);
    //4- Retourner les données
    options.total = result? 1: 0; // 👈 on a forcement 1 resultat a ce niveau
    //return reply.status(200).send(generateSucessResponse(200, result, options));
    return generateSucessResponse(reply,200, result, options);
  }
  catch (error) {
    return generateErrorResponse(reply, error);
  }
};

/* // 📌 📢 Route : GET /table/:entity?filters=filters                                 //ne serai ce pas en double?
getEntitysByParams = async (req: FastifyRequest, reply: FastifyReply) => {
  const { filters } = req.query as UrlSearchParams;
  // const { filters, limit, offset, order } = req.query as UrlSearchParams;
  const { database, entity } = req.params as { database: string, entity: string };
  //0- Récupérer la base de données par son nom
  const entityDataSource = (await this.app.DB.getDataBase(database));
  if (!entityDataSource) {
    return generateErrorResponse(reply,404, `Database '${database}' not found`, `Database '${database}' not found`);
  }
  //1- Trouver l'entité par son nom
  const entityClass = entityDataSource.getEntityByName(entity);
  console.log(entityClass);
  if (!entityClass) {
    return generateErrorResponse(reply, 404, `Entity '${entity}' not found`, `Entity '${entity}' not found`);
  }
  //2- Créer une instance de EntityRepository
  const repository =  new EntityRepository(entityDataSource.getDataSource() ,entityClass);
  //3- Récupérer les données de l'entité avec les filtres
  if (filters) {
   const parsedFilters = filters ? JSON.parse(decodeURIComponent(filters)) : [];

  const result = await repository.findByParams(parsedFilters);
   if (!result) return generateErrorResponse(reply, 404, `Entity '${entity}' not found`, `Entity '${entity}' not found`);
   return generateSucessResponse(reply,200, result);
  }
} */

// 📌 📢 Route : POST /table/:entity
createEntity = async (req: FastifyRequest, reply: FastifyReply) => {
  try {
    const { database, entity } = req.params as { database: string, entity: string };
    //0- Récupérer la base de données par son nom
    const entityDataSource = (await this.app.DB.getDataBase(database));
    //1- Trouver l'entité par son nom
    const entityClass = entityDataSource.getEntityByName(entity);

    //2- Créer une instance de EntityRepository
    const repository =  new EntityRepository(entityDataSource.getDataSource() ,entityClass!);
    //3- faire une validation des données ou pas
    //  const { valid, entity, errors }= repository.validate(req.body) ou const { valid, entity, errors } = entityValidator(entity, req.body);
    // if (!valid) return reply.status(400).send({ errors });
    //
    //4- recupérer les données de l'entité depuis le body de la requête
    const {id, ...data } = req.body as DeepPartial<ObjectLiteral>;
    //WARNING  id est un champ auto généré
    //5- Créer une nouvelle entité
    const createdEntity = await repository.create(data);


    //3- Récupérer les données de l'entité avec les filtres
    const query = req.query as UrlSearchParams;
    const options = new buildOptions(query).getOptions();
    // 5- Charger les relations associées
    const result = await repository.findById(createdEntity.id, options.relations); // Remplacez par vos relations

    //6- Retourner les données  
    return generateSucessResponse(reply,201, result);
  }
  catch (error) {
    return generateErrorResponse(reply, error);
  }
};

// 📌 📢 Route : PUT /users/:id
updateEntity = async (req: FastifyRequest, reply: FastifyReply) => {
  try {
    const { database, entity, id} = req.params as { database: string, entity: string, id: string };
    //0- Récupérer la base de données par son nom
    const entityDataSource = (await this.app.DB.getDataBase(database));
     //1- Trouver l'entité par son nom
    const entityClass = entityDataSource.getEntityByName(entity);
  //2- Créer une instance de EntityRepository
   const repository =  new EntityRepository(entityDataSource.getDataSource() ,entityClass!);  
  
   //4- recupérer les données de l'entité depuis le body de la requête
  const { ...data } = req.body as DeepPartial<ObjectLiteral>;
  //5- Mettre à jour l'entité
    const entityId = Number(id);
    const result = await repository.update(entityId, data);
  //5-a Vérifier si l'entité a été crée
    //if (!result) return generateErrorResponse(reply, 404, `Entity '${entity}' could not be updated`, `Entity '${entity}' could not be updated`);

        //3- Récupérer les données de l'entité avec les filtres
        const query = req.query as UrlSearchParams;
        if (!query) return generateSucessResponse(reply,200, result);
        const options = new buildOptions(query).getOptions();
        // 5- Charger les relations associées
        const resultwhithrelation = await repository.findById(entityId, options.relations); // Remplacez par vos relations
    //6- Retourner les données
    return generateSucessResponse(reply,200, resultwhithrelation);
  }
  catch (error) {
    console.log(error);
    return generateErrorResponse(reply, error);
  }
};

// 📌 📢 Route : DELETE /users/:id
deleteEntity = async (req: FastifyRequest, reply: FastifyReply) => {
  try {
    const { database, entity, id} = req.params as { database: string, entity: string, id: string };
    //0- Récupérer la base de données par son nom
    const entityDataSource = (await this.app.DB.getDataBase(database));
    //1- Trouver l'entité par son nom
    const entityClass = entityDataSource.getEntityByName(entity);

    //2- Créer une instance de EntityRepository
    const repository =  new EntityRepository(entityDataSource.getDataSource() ,entityClass!);
    //4- recupérer les données de l'entité depuis le body de la requête
    //5- Mettre à jour l'entité
    const entityId = Number(id);
    const result = await repository.delete(entityId);
 //  console.log(result);
    //5-a Vérifier si l'entité a été crée
    if (!result)  throw new CustomIdNotFoundError(`Entity '${entity}' with ID ${id} could not be deleted`) //return generateErrorResponse(reply, 404, `Entity '${entity}' could not be deleted`);
      //6- Retourner les données
      return generateSucessResponse(reply,200, result);
    }
    catch (error) {
      console.log(error);
      return generateErrorResponse(reply, error);
    }
  };
  
  //liste des base de données
  // 📌 📢 Route : GET /databases
  getDatabases = async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const databases = this.app.DB.getDataBaseNames();
      return generateSucessResponse(reply,200, databases);
    }
    catch (error) {
      return generateErrorResponse(reply, error);
    }
  }
  // 📌 📢 Route : GET /databases
  getDatabaseEntitys = async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const { database } = req.params as { database: string };
      const entityDataSource = await this.app.DB.getDataBase(database);
      const entityClass = entityDataSource.getEntitys();
      const entityArray = Object.values(entityClass).map((entity:any ) => entity.name);
      return generateSucessResponse(reply,200, entityArray);
    }
    catch (error) {
      return generateErrorResponse(reply, error);
    }
  }
  
}



// 📌 📢 Route : GET /table/:entity/:id/:entity2
// 📌 📢 Route : POST /table/:entity/:id/:entity2 //voir pour jointure
// 📌 📢 Route : PUT /table/:entity/:id/:entity2
// 📌 📢 Route : DELETE /table/:entity/:id/:entity2