import "reflect-metadata";
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { User } from "./User.entity";

@Entity()
export class AuthProvider {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "text" })
  provider: string;

  @Column({ type: "text", unique: true })
  provider_id: string;

  @ManyToOne(() => User, (user) => user.authProviders, {onUpdate: 'CASCADE',  onDelete: "CASCADE" })
  user: User;

  @Column({ type: "text", nullable: true })
  password: string;

  //2FA
  //activation de l'authentification à deux facteurs
  @Column({ type: "boolean", default: false })
  two_factor_auth: boolean;
  //secret de l'authentification à deux facteurs
  // utilisé pour générer le code de vérification
  //ex: "JBSWY3DPEHPK3PXP" sera HASHED
  @Column({ type: "text", nullable: true })
  two_factor_auth_secret: string;
}