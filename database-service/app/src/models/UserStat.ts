import "reflect-metadata";
import { Entity, PrimaryGeneratedColumn, Column, OneToOne } from "typeorm";
import { User } from "./User.entity";

@Entity()
export class UserStats {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "int", default: 0 }) //nombre de parties jouées
  classic_total_game_played: number;
  @Column({ type: "int", default: 0 }) //nombre de parties gagnées
  classic_total_game_won: number;
  @Column({ type: "int", default: 0 }) //nombre de parties perdues
  classic_total_game_lost: number;
  @Column({ type: "int", default: 0 }) //nombre de parties nulles
  classic_total_game_draw: number;

  @Column({ type: "int", default: 0 }) //nombre de parties jouées en local
  classic_local_game_played: number;
  @Column({ type: "int", default: 0 }) //nombre de parties gagnées en local
  classic_local_game_won: number;
  @Column({ type: "int", default: 0 }) //nombre de parties perdues en local
  classic_local_game_lost: number;
  @Column({ type: "int", default: 0 }) //nombre de parties nulles en local
  classic_local_game_draw: number;

  @Column({ type: "int", default: 0 }) //nombre de parties jouées en remote
  classic_remote_game_played: number;
  @Column({ type: "int", default: 0 }) //nombre de parties gagnées en remote
  classic_remote_game_won: number;
  @Column({ type: "int", default: 0 }) //nombre de parties perdues en remote
  classic_remote_game_lost: number;
  @Column({ type: "int", default: 0 }) //nombre de parties nulles en remote
  classic_remote_game_draw: number;

  @Column({ type: "int", default: 0 }) //nombre de parties jouées en tournoi
  tournament_total_game_played: number;
  @Column({ type: "int", default: 0 }) //nombre de parties gagnées en tournoi
  tournament_total_game_won: number;
  @Column({ type: "int", default: 0 }) //nombre de parties perdues en tournoi
  tournament_total_game_lost: number;
  @Column({ type: "int", default: 0 }) //nombre de parties nulles en tournoi
  tournament_total_game_draw: number;

  @Column({ type: "int", default: 0 }) //nombre de parties jouées en tournoi local
  tournament_local_game_played: number;
  @Column({ type: "int", default: 0 }) //nombre de parties gagnées en tournoi local
  tournament_local_game_won: number;
  @Column({ type: "int", default: 0 }) //nombre de parties perdues en tournoi local
  tournament_local_game_lost: number;
  @Column({ type: "int", default: 0 }) //nombre de parties nulles en tournoi local
  tournament_local_game_draw: number;

  @Column({ type: "int", default: 0 }) //nombre de parties jouées en tournoi remote
  tournament_remote_game_played: number;
  @Column({ type: "int", default: 0 }) //nombre de parties gagnées en tournoi remote
  tournament_remote_game_won: number;
  @Column({ type: "int", default: 0 }) //nombre de parties perdues en tournoi remote
  tournament_remote_game_lost: number;
  @Column({ type: "int", default: 0 }) //nombre de parties nulles en tournoi remote
  tournament_remote_game_draw: number;

  @OneToOne(() => User, (user) => user.userStats, { /* cascade: true,  */onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  user: User;
/*   @ManyToOne(() => User, (user) => user.userStats, {onUpdate: 'CASCADE',  onDelete: "CASCADE" })
  user: User; */
}