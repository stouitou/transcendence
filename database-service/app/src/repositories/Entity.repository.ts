import { Repository, DeepPartial, FindManyOptions, FindOneOptions, ObjectLiteral, EntityTarget, DataSource } from "typeorm";
import { AppDataSource } from "../config/data-source";

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

  constructor(entityDataSource: DataSource,entity: EntityTarget<T>) {
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
    if (!entity) return null;
    return this.repo.save({ ...entity, ...data });
  }

  // 📌 ❌ Supprimer un élément
  async delete(id: number): Promise<boolean> {
    console.log("🚀 ~ file: Entity.repository.ts ~ line 74 ~ EntityRepository ~ delete ~ id", id)
    const result = await this.repo.delete(id);
    console.log("🚀 ~ file: Entity.repository.ts ~ line 76 ~ EntityRepository ~ delete ~ result", result)
    return result.affected !== 0;
    /*
      try {
    const result = await this.repo.delete(id);
    return result.affected !== 0;
  } catch (error) {
    if (error.code === "SQLITE_CONSTRAINT") {
      console.error("Foreign key constraint violation:", error.message);
      // Handle the error appropriately
    }
    throw error;
  }*/
  }
}
