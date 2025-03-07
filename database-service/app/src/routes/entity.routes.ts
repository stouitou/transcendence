import { FastifyInstance } from "fastify";
import { EntityController } from "../controllers/Entity.controller";

export async function entityRoutes(fastify: FastifyInstance) {
  
  const entityController = new EntityController(fastify);
  // 📌 📢 Route : CREATE 
  fastify.post("/:database/table/:entity", entityController.createEntity);
  // 📌 📢 Route : READ
  fastify.get("/list", entityController.getDatabases); // list all databases
  fastify.get("/:database/list", entityController.getDatabaseEntitys); // list all tables in a database
  fastify.get("/:database/table/:entity", entityController.getEntitys);
  fastify.get("/:database/table/:entity/id/:id", entityController.getEntityById);
   // 📌 📢 Route : UPDATE
  fastify.put("/:database/table/:entity/id/:id", entityController.updateEntity);
   // 📌 📢 Route : DELETE
  fastify.delete("/:database/table/:entity/id/:id", entityController.deleteEntity);
}
