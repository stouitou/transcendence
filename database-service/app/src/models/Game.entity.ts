import "reflect-metadata";
import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, UpdateDateColumn, CreateDateColumn, ManyToOne, ManyToMany } from "typeorm";
import { GameHistory } from "./GameHistory.entity";
import { User } from "./User.entity";
import { Tournaments } from "./Tournament.entity";
import { Round } from "./Round.entity";

@Entity()
export class Game {
  @PrimaryGeneratedColumn()
  id: number;

  //chaque partie a un historique
  @OneToOne(() => GameHistory, (gameHistory)=>gameHistory.game,{ nullable: true, onUpdate: 'CASCADE', eager:true })
  @JoinColumn()//Utile?
  gameHistory: GameHistory;

  //difficulte de la partie
  @Column({ type: "int", default: 1 })
  difficulty: number;

  //etat de la partie
  @Column({ type: "text", default: "en attente" }) //en attente, en cours, terminee
  state: string;

  //mode de la partie
  @Column({ type: "text", default: "normal" }) //normal: classique, rapide: contre la montre, tournoi?: plusieurs joueurs
  mode: string;

  //chaque partie a plusieurs joueurs
  @ManyToMany(() => User, (user) => user.games, { cascade: true , onUpdate: 'CASCADE'  })
  @JoinColumn()
  players: User[];

  //chaque partie a un ou aucun round
  @ManyToOne(() => Round, (rounds) => rounds.games, { /* cascade: true , */ onUpdate: 'CASCADE'  })
  @JoinColumn() //Utile?
  rounds: Round;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

