import "reflect-metadata";
import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, UpdateDateColumn, CreateDateColumn,  ManyToMany, OneToMany, ManyToOne } from "typeorm";

import { User } from "./User.entity";
import { Game } from "./Game.entity";
import { Tournaments } from "./Tournament.entity";

@Entity()
export class Round {
  @PrimaryGeneratedColumn()
  id: number;

  //chaque Round a plusieurs parties
  @OneToMany(() => Game, (game) => game.rounds, { cascade: true , onUpdate: 'CASCADE' , nullable: true })
  @JoinColumn()
  games: Game[];

  //etat de la partie
  @Column({ type: "text", default: "en attente" }) //en attente, en cours, terminee
  state: string;
  //etat de la partie
  @Column({ type: "int", default: 0 }) //en attente, en cours, terminee
  current: number;
  
  //chaque Tournoi a plusieurs joueurs
  @ManyToMany(() => User, (user) => user.rounds, { cascade: true , onUpdate: 'CASCADE' , nullable: true  })
  @JoinColumn()
  players: User[];
  
  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  //chaque round a un tournoi
  @ManyToOne(() => Tournaments, (tournaments) => tournaments.rounds, { nullable: true, onUpdate: 'CASCADE'/* , eager:true */ })
 // @JoinColumn()//Utile?
  tournaments: Tournaments;
}

