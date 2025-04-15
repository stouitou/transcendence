import "reflect-metadata";
import { Entity, PrimaryGeneratedColumn, Column, OneToOne, UpdateDateColumn, CreateDateColumn, OneToMany } from "typeorm";
import { Game } from "./Game.entity";
import { Players } from "./RemotePlayers";

@Entity()
export class GameHistory {
  @PrimaryGeneratedColumn()
  id: number;

  //score du joueur 1
  @Column({ type: "int", nullable: true })
  score1: number;

  //relation joueur 1
  @Column({ type: "int", nullable: true })
  player1: number;

  //score du joueur 2
  @Column({ type: "int", nullable: true })
  score2: number;

  //relation joueur 2
  @Column({ type: "int", nullable: true })
  player2: number;

  //relation avec la partie
  //chaque historique a une partie
  @OneToOne(() => Game, (game) => game.gameHistory, { cascade: true, onDelete: 'CASCADE', nullable: true, onUpdate: 'CASCADE' })
  // @JoinColumn()//Utile?
  game: Game;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  //mode de la partie : local ou remote
  @Column({ type: "text", default: "local" }) //local, remote
  type: string;

  //is IA
  @Column({ type: "boolean", default: false }) //true si IA //@TODO a voir
  is_IA: boolean;

  //si local, les players sont un tableau de displaynames
  @Column({ type: "simple-array", nullable:true }) 
  local_players: string[];
  //si remote, les players sont un tableau de User
  @OneToMany(() => Players, (players) => players.gameHistory,{ cascade: true, onDelete: 'CASCADE', nullable:true,
  onUpdate: 'CASCADE',eager:true })
  players: Players[];

  @Column({ type: "text", nullable: true })
  winner: string;
}