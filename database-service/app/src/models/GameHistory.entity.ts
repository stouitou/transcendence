import "reflect-metadata";
import { Entity, PrimaryGeneratedColumn, Column, OneToOne, UpdateDateColumn, CreateDateColumn } from "typeorm";
import { Game } from "./Game.entity";

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
}