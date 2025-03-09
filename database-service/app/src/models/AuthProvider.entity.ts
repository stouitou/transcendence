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
}