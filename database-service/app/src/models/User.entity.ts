import "reflect-metadata";
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, UpdateDateColumn, CreateDateColumn, ManyToMany, JoinTable } from "typeorm";
import { AuthProvider } from "./AuthProvider.entity";
import { Game } from "./Game.entity";
import { Tournaments } from "./Tournament.entity";
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

  @Column({ type: "int", default: 1 }) // for match making
  level: number;

  @Column({ type: "text", nullable: true })
  avatar: string;


  @OneToMany(() => AuthProvider, (authproviders) => authproviders.user,{ cascade: true, onDelete: 'CASCADE', nullable:true,
  onUpdate: 'CASCADE' })
  authProviders: AuthProvider[];

  //chaque joueur a un ou plusieurs Tournois
  @ManyToMany(() => Tournaments, (tournements) => tournements.players ,{ onUpdate: 'CASCADE', nullable: true })
 @JoinTable()
 tournaments: Tournaments[];

  //chaque joueur a plusieurs parties
  @ManyToMany(() => Game, (game) => game.players ,{ /* cascade: true, */ onUpdate: 'CASCADE', nullable: true })
  @JoinTable()
  games: Game[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn(/* { type: "timestamp" } */)
  updated_at: Date;
}
