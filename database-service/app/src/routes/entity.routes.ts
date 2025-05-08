import { FastifyInstance } from "fastify";
import { EntityController } from "../controllers/Entity.controller";
import { Schemas } from "../schema/entity.schema";

export async function entityRoutes(fastify: FastifyInstance) {
  
  const entityController = new EntityController(fastify);
  // 📌 📢 Route : CREATE 
  fastify.post("/:database/table/:entity" ,{schema:Schemas.createEntity} ,entityController.createEntity);
  // 📌 📢 Route : READ
  fastify.get("/list",{schema:Schemas.getDatabases}, entityController.getDatabases); // list all databases
  fastify.get("/:database/list",{schema:Schemas.getDatabaseEntitys}, entityController.getDatabaseEntitys); // list all tables in a database
  fastify.get("/:database/table/:entity",{schema:Schemas.getEntitys}, entityController.getEntitys);
  fastify.get("/:database/table/:entity/id/:id",{schema:Schemas.getEntityById},  entityController.getEntityById);
   // 📌 📢 Route : UPDATE
  fastify.put("/:database/table/:entity/id/:id",{schema:Schemas.updateEntity}, entityController.updateEntity);//@revoir le comportement si invalid key
   // 📌 📢 Route : DELETE
  fastify.delete("/:database/table/:entity/id/:id",{schema:Schemas.deleteEntity}, entityController.deleteEntity);
}
