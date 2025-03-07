import "reflect-metadata";
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { AuthProvider } from "./AuthProvider.entity";
@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "text", unique: true })
  email: string;

  @Column({ type: "text" })
  name: string;

  @Column({ type: "text", default: "user" })
  role: string;

  @OneToMany(() => AuthProvider, (authproviders) => authproviders.user,{ cascade: true, onDelete: 'CASCADE',nullable:true })//✅ Ajout de la relation OneToMany
  authProviders: AuthProvider[];
  
}
