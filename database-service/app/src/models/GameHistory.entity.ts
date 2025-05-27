import "reflect-metadata";
import { Entity, PrimaryGeneratedColumn, Column, OneToOne, UpdateDateColumn, CreateDateColumn, OneToMany } from "typeorm";
import { Game } from "./Game.entity";
import { Players } from "./RemotePlayers";

@Entity()
export class GameHistory {
  @PrimaryGeneratedColumn()
  id: number;

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
  
  @Column({ type: "text", default: "classic" }) //classic, tournament
  format: string;

  //si remote, les players sont un tableau de User
  @OneToMany(() => Players, (players) => players.gameHistory,{ cascade: true, onDelete: 'CASCADE', nullable:true,
  onUpdate: 'CASCADE',eager:true })
  players: Players[];

  @Column({ type: "text", nullable: true })
  winner: string;
}