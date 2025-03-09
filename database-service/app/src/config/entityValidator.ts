import { getMetadataArgsStorage,  ObjectLiteral } from "typeorm";
import { FastifyInstance } from "fastify";

/**
 * @TODO 1️⃣ rendre cette fonction utilisable dans les controllers ou l'implemente dans une classe db
 * Valide les données d'une entité et les transforme en instance de l'entité.
 * 
 * @param entityClassName Nom de l'entité
 * @param data Données à valider
 * @returns Un objet avec le statut de la validation, l'entité et les erreurs.
 */
export async function entityValidator<T extends ObjectLiteral>(
  app: FastifyInstance,
  entityClassName: string,
  data: any
): Promise<{ valid: boolean; entity?: T; errors?: string[] }> {
  
  // 📌 1️⃣ Récupérer la classe de l'entité
  const entityClass = (await app.DB.getDataBase(" ")).getEntityByName(entityClassName)  // getEntityByName(entityClassName) as EntityTarget<T>;
  if (!entityClass) {
    return { valid: false, errors: [`L'entité '${entityClassName}' n'existe pas.`] };
  }

  try {
    // 📌 2️⃣ Instancier l'entité avec les données reçues
    const entityInstance = new (entityClass as { new (): T })();
    const entity = Object.assign(entityInstance, data);

    // 📌 3️⃣ Récupérer les colonnes définies dans TypeORM
    const entityColumns = getMetadataArgsStorage()
      .columns  // Récupérer les colonnes //@todo voir si on etend a .relations
      .filter(col => col.target === entityClass)
      .map(col => col.propertyName);

    // 📌 4️⃣ Vérifier les champs invalides
    const dataKeys = Object.keys(data);
    const invalidKeys = dataKeys.filter((key) => !entityColumns.includes(key));

    if (invalidKeys.length > 0) {
      return { valid: false, errors: invalidKeys.map((key) => `Le champ '${key}' n'existe pas sur '${entityClassName}'.`) };
    }

    return { valid: true, entity };
  } catch (error) {
    return { valid: false, errors: [`Erreur lors de la transformation des données: ${error.message}`] };
  }
}
