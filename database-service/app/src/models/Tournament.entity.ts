import "reflect-metadata";
import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, UpdateDateColumn, CreateDateColumn,  ManyToMany, OneToMany } from "typeorm";

import { User } from "./User.entity";
//import { Round } from "./Round.entity";
import { Game } from "./Game.entity";
import { Players } from "./RemotePlayers";

@Entity()
export class Tournaments {
  @PrimaryGeneratedColumn()
  id: number;

  //current round
  @Column({ type: "int", default: 0 }) //en attente, en cours, terminee
  currentRound: number;

  //chaque Tournoi a plusieurs parties+
  //@OneToMany(() => Round, (round) => round.tournaments, { cascade: true , onUpdate: 'CASCADE' , nullable: true/* ,eager:true */ })
  //@JoinColumn()
  //rounds: Round[];
  // Liste des parties du tournoi
  @OneToMany(() => Game, (game) => game.tournament, { cascade: true, eager: true })
  games: Game[];
  //etat de la partie
  @Column({ type: "text", default: "en attente" }) //en attente, en cours, terminee
  state: string;

  //max_players de la partie
  @Column({ type: "int", default: 16 })
  max_players: number;

  //chaque Tournoi a plusieurs joueurs
  @ManyToMany(() => User, (user) => user.tournaments, { cascade: true , onUpdate: 'CASCADE' , nullable: true  })
  @JoinColumn()
  players: User[];
  
  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  //un seul ganant
/*   @OneToOne(() => User, (user) => user.tournaments, { nullable: true, onUpdate: 'CASCADE', eager:true })
  @JoinColumn()//Utile?
  winner: User; */
  //le winner est un Player
  @OneToOne(() => Players, (player) => player/* .tournament *//* .user.tournaments */, {cascade: true , nullable: true , onUpdate: 'CASCADE'/*, eager:true*/  })
 @JoinColumn()//Utile?
  winner: Players; 
  

  //mode de la partie : local ou remote
  @Column({ type: "text", default: "local" }) //local, remote
  type: string;

  //si local, les players sont un tableau de displaynames
/*   @Column({ type: "simple-array", nullable:true }) 
  local_players: string[]; */
}

