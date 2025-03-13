import { CustomEntityNotFoundError } from "@src/config/Databases";
import { Repository, DeepPartial, FindManyOptions, FindOneOptions, ObjectLiteral, EntityTarget, DataSource, EntityMetadata } from "typeorm";


/**
 * Repository générique pour les entités de la base de données.
 * @template T Type de l'entité
 * @class EntityRepository
 * @example
 * const userRepo = new EntityRepository(User);
 * const user = await userRepo.findById(1);
 */
export class EntityRepository<T extends ObjectLiteral> {
  private repo: Repository<T>;

  constructor(private entityDataSource: DataSource,private entity: EntityTarget<T>) {
 //   this.repo = AppDataSource.getRepository(entity);
    this.repo = entityDataSource.getRepository(entity);
  }

  // 📌 🔍 Trouver tous les éléments avec relations optionnelles
  async findAll(options?: { limit?: number; offset?: number; order?: "ASC" | "DESC"; relations?: string[] }): Promise<T[]> {
    const { limit, offset, order, relations = [] } = options || {};
    return this.repo.find({
      where: {} as any,
      order: order ? { id: order } as any : undefined,
      take: limit,
      skip: offset,
      relations,
    } as FindManyOptions<T>);
  }

  // 📌 🔍 Trouver un élément par ID avec relations optionnelles
  async findById(id: number, relations: string[] = []): Promise<T | null> {
    console.log("🚀 ~ file: Entity.repository.ts ~ line 77 ~ EntityRepository ~ findById ~ id", id)
    return this.repo.findOne({ where: { id } as any, relations } as FindOneOptions<T>);
  }

  // 📌 🔍 Trouver un élément avec des filtres avancés
  async findByParams(params: Partial<T>, options?: { limit?: number; offset?: number; order?: "ASC" | "DESC"; relations?: string[] }): Promise<T[]> {
    const { limit, offset, order, relations = [] } = options || {};
    return this.repo.find({
      where: params as any,
      order: order ? { id: order } as any : undefined,
      take: limit,
      skip: offset,
      relations,
    } as FindManyOptions<T>);
  }

  // 📌 🔍 Trouver un élément unique avec une condition spécifique
  async findOneByParams(params: Partial<T>, relations: string[] = []): Promise<T | null> {
    return this.repo.findOne({
      where: params as any,
      relations,
    } as FindOneOptions<T>);
  }

  // 📌 🆕 Créer un élément
  async create(data: DeepPartial<T>): Promise<T> {
    const entity = this.repo.create(data);
    return this.repo.save(entity);
  }

  // 📌 ✏️ Mettre à jour un élément
  async update(id: number, data: DeepPartial<T>): Promise<T | null> {
    const entity = await this.repo.findOne({ where: { id } as any });
    if (!entity) throw new CustomEntityNotFoundError(`L'entité @TODO avec l'ID ${id} n'existe pas.`);
   // this.repo.merge(entity, data);
     // ❌ Supprimer explicitement l'ID de data s'il est présent
    // const dataRemoveid = this.removeIdsRecursively(data); // 🔥 Supprime tous les `id`
     
   /*  if ("id" in data) {
      delete (data as Partial<T>).id;
      console.warn("❌ L'ID ne peut pas être modifié. il a été supprimé des données. traitement en cours...");
    }  */



    //1️⃣ Filtrer les propriétés valides
    const cleanData = filterValidProperties(this.repo,data);
    console.log("🚀 cleandata", cleanData)
    //2️⃣ mettre a jour les relation si il y en a
   
    if (Object.keys(cleanData).length === 0) {
      console.warn("⚠️ Aucune donnée valide à mettre à jour.");
      return entity;
    }

 /*  if ("id" in data) {
    delete (data as Partial<T>).id;
    console.warn("❌ L'ID ne peut pas être modifié. il a été supprimé des données. traitement en cours...");
  } */
    return this.repo.save({ ...entity, ...cleanData });
   // return this.repo.save({ ...entity, ...data });
  }

  // 📌 ❌ Supprimer un élément
  async delete(id: number): Promise<boolean> {
    const result = await this.repo.delete(id);
    return result.affected !== 0;
  }



  //❌❌❌❌❌❌ ne marche pas
  removeIdsRecursively<T>(data: T): T {
    if (Array.isArray(data)) {
      return data.map(item => this.removeIdsRecursively(item)) as T;
    } else if (typeof data === "object" && data !== null) {
      const newData = { ...data };
      if ("id" in newData) {
        delete newData.id; // Supprime `id` à la racine
        console.warn("❌ L'ID ne peut pas être modifié. il a été supprimé des données. traitement en cours...");
      }
      for (const key in newData) {
        if (typeof newData[key] === "object") {
          newData[key] = this.removeIdsRecursively(newData[key]); // Récursion sur les objets imbriqués
        }
      }
      return newData;
    }
    return data;
  }


  
}

 //function filterValidProperties<T extends ObjectLiteral>(repo: Repository<T>, data: any): Partial<T> {
 export  function filterValidProperties<T extends ObjectLiteral>(repo: Repository<T>, data: any): Partial<T> {
    const entityMetadata: EntityMetadata = repo.metadata;
  
    // 📌 Récupérer les colonnes + relations
    const validKeys = new Set([
      ...entityMetadata.columns.map(col => col.propertyName),
      ...entityMetadata.relations.map(rel => rel.propertyName)
    ]);
  
    if (Array.isArray(data)) {
      return data.map(item => filterValidProperties(repo, item)) as any;
    } else if (typeof data === "object" && data !== null) {
      return Object.keys(data).reduce((acc:any , key) => {
        if (validKeys.has(key)) {
          const relation = entityMetadata.relations.find(rel => rel.propertyName === key);
  
          if (relation) {
            // Si c'est une relation, appliquer récursivement le filtrage sur l'entité liée
            const relatedRepo = repo.manager.getRepository(relation.type as any);
            acc[key] = Array.isArray(data[key])
              ? data[key].map(item => filterValidProperties(relatedRepo, item))
              : filterValidProperties(relatedRepo, data[key]);
          } else {
            // Sinon, c'est une colonne normale, on la garde
            acc[key] = data[key];
          }
        }
        return acc;
      }, {} as Partial<T>);
    }
  
    return data;
  }
  


