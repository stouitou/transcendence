import "reflect-metadata";
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToOne, JoinColumn } from "typeorm";
import { User } from "./User.entity";
import { GameHistory } from "./GameHistory.entity";

@Entity()
export class Players {
  @PrimaryGeneratedColumn()
  id: number;
  //liee a un GameHistory
  @ManyToOne(() => GameHistory, (gameHistory) => gameHistory.players, {onUpdate: 'CASCADE',  onDelete: "CASCADE" })
  gameHistory: GameHistory;
  //mode de la partie : local ou remote
  @Column({ type: "text", default: "local" }) //local, remote
  type: string;

  @Column({ type: "text", nullable: true })
  avatar: string;

  @Column({ type: "text", nullable: true })
  display_name: string;

  @Column({ type: "int", default: 0 }) //score
  score: number;

  @ManyToOne(() =>  (User),{ nullable: true,  onDelete: 'CASCADE',onUpdate: 'CASCADE', eager:true })
  @JoinColumn()
  user: User;

    //is IA
  @Column({ type: "boolean", default: false }) //true si IA 
  is_IA: boolean;

}