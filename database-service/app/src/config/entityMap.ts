import { AppDataSource } from "../config/data-source";
import { EntityTarget, ObjectLiteral } from "typeorm";

const entityMap: Record<string, EntityTarget<ObjectLiteral>> = {};

AppDataSource.entityMetadatas.forEach((meta) => {
  entityMap[meta.name.toLowerCase()] = meta.target;
});

/**
 * Récupère une entité par son nom.
 * 
 * @param entityName Nom de l'entité
 * @returns L'entité ou null si elle n'existe pas.
 */
export function getEntityByName(entityName: string): EntityTarget<ObjectLiteral> | null {
  return entityMap[entityName.toLowerCase()] || null;
}
