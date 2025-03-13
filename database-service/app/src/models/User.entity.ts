import "reflect-metadata";
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, UpdateDateColumn, CreateDateColumn } from "typeorm";
import { AuthProvider } from "./AuthProvider.entity";
@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  /* @Column({ type: "text", unique: true })
  email: string; */

  @Column({ type: "text", nullable: true })
  name: string;

  @Column({ type: "text", default: "user" })
  role: string;

  @Column({ type: "text", nullable: true })
  avatar: string;


  @OneToMany(() => AuthProvider, (authproviders) => authproviders.user,{ cascade: true, onDelete: 'CASCADE',nullable:true,
    onUpdate: 'CASCADE',  })//✅ Ajout de la relation OneToMany
  authProviders: AuthProvider[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn(/* { type: "timestamp" } */)
  updated_at: Date;
}
