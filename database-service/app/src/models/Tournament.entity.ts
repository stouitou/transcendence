import "reflect-metadata";
import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, UpdateDateColumn, CreateDateColumn,  ManyToMany, OneToMany } from "typeorm";

import { User } from "./User.entity";
import { Game } from "./Game.entity";

@Entity()
export class Tournaments {
  @PrimaryGeneratedColumn()
  id: number;

  //chaque Tournoi a plusieurs parties
  @OneToMany(() => Game, (game) => game.tournaments, { cascade: true , onUpdate: 'CASCADE' , nullable: true })
  @JoinColumn()
  games: Game[];

  //etat de la partie
  @Column({ type: "text", default: "en attente" }) //en attente, en cours, terminee
  state: string;

  //chaque Tournoi a plusieurs joueurs
  @ManyToMany(() => User, (user) => user.tournaments, { cascade: true , onUpdate: 'CASCADE' , nullable: true  })
  @JoinColumn()
  players: User[];
  
  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

