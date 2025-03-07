import { Repository } from "typeorm";
import { AppDataSource } from "../config/data-source";
import { AuthProvider } from "../models/AuthProvider.entity";
import { User } from "../models/User.entity";

export class AuthProviderRepository {
  private repo: Repository<AuthProvider>;

  constructor() {
    this.repo = AppDataSource.getRepository(AuthProvider);
  }

  // 📌 Trouver un AuthProvider par ID
  async findById(id: number): Promise<AuthProvider | null> {
    return this.repo.findOne({ where: { id }, relations: ["user"] });
  }

  // 📌 Trouver tous les providers d'un User
  async findByUserId(userId: number): Promise<AuthProvider[]> {
    return this.repo.find({ where: { user: { id: userId } } });
  }

  // 📌 Ajouter un provider à un utilisateur
  async addAuthProvider(user: User, provider: string, providerId: string): Promise<AuthProvider> {
    const newProvider = this.repo.create({ provider, provider_id: providerId, user });
    return await this.repo.save(newProvider);
  }

  // 📌 Supprimer un AuthProvider
  async deleteAuthProvider(id: number): Promise<void> {
    await this.repo.delete(id);
  }
}
