import { Repository } from "typeorm";
import { AppDataSource } from "../config/data-source";
import { User } from "../models/User.entity";
import { AuthProvider } from "../models/AuthProvider.entity";
import { UrlSearchParams, UserParams } from "@src/types/User.types";
import { AuthProviderParams } from "@src/types/AuthProvider.types";
import { Url } from "url";


export class UserRepository {
  private repo: Repository<User>;

  constructor() {
    this.repo = AppDataSource.getRepository(User);
  }
    // 📌 🔍 Trouver un utilisateur par ID avec ses AuthProviders
	async findAll(): Promise<User[] | null> {
		return this.repo.find({relations: ["authProviders"]});
	  }

    // 📌 🔍 Trouver un utilisateur par PARAMS avec ses AuthProviders
  async findByParams(params:UserParams): Promise<User[] | null> {
    const { filters,limit,offset,order, ... otherparams } = params as UrlSearchParams;
    return this.repo.find({
      where: otherparams, // where: { id: Number(id) }, ou where: [{ id: 1 }, { name: "John" }]
      order: { id: order==="ASC"? "ASC":"DESC" }, 
      take: limit ? Number(limit) : undefined, // 👈 Limite le nombre de résultats
      relations: ["authProviders"], // 👈 Charge les relations
    });
  }

  // 📌 🔍 Trouver un utilisateur par ID avec ses AuthProviders
  async findById(userId: number): Promise<User | null> {
    return this.repo.findOne({
      where: { id: userId },
      relations: ["authProviders"], // 👈 Charge les relations
    });
  }

  // 📌 🔍 Trouver un utilisateur par email avec ses AuthProviders
  async findByEmail(email: string): Promise<User | null> {
    return this.repo.findOne({
      where: { email },
      relations: ["authProviders"], // 👈 Charge les relations
    });
  }

  // 📌 🆕 Créer un utilisateur avec des providers (optionnels)
  async createUser(email: string, name: string, providers?: { provider: string; provider_id: string }[]) {
    const newUser = this.repo.create({
      email,
      name,
      authProviders: providers ? providers.map((p) => Object.assign(new AuthProvider(), p)) : [],
    });

    return await this.repo.save(newUser);
  }

  // 📌 🔄 Ajouter un provider à un utilisateur existant
  async addAuthProvider(userId: number, provider: string, providerId: string) {
    const user = await this.findById(userId);
    if (!user) throw new Error("User not found");

    const authProviderRepo = AppDataSource.getRepository(AuthProvider);
    const newProvider = authProviderRepo.create({ provider, provider_id: providerId, user });

    return await authProviderRepo.save(newProvider);
  }

  // 📌 🔄 Mettre à jour un utilisateur
  async updateUser(userId: number, data: Partial<User>) {
    await this.repo.update(userId, data);
    return this.findById(userId);
  }

  // 📌 ❌ Supprimer un utilisateur et ses providers (grâce à onDelete: "CASCADE")
  async deleteUser(userId: number) {
    return await this.repo.delete(userId);
  }
}
