import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "../models/User.entity";
import { config } from "./env"; // Import des variables d'environnement
import { AuthProvider } from "@src/models/AuthProvider.entity";

export const AppDataSource = new DataSource({
  type: "sqlite",
  database: config.DB_PATH,  // Chemin du fichier SQLite
  synchronize: true,         // Auto-sync des modèles (⚠ à désactiver en prod)
  logging: false,            // Désactiver les logs SQL
  entities: [User,AuthProvider],          // Entités TypeORM
});


/* 
export const AppDataSource = new DataSource({
  type: "mysql",
  host: "localhost",
  port: 3306,
  username: "root",
  password: "password",
  database: "mydb",
  synchronize: true,
  entities: [User], // Ajout manuel
}); */