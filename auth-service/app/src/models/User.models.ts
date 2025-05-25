//import "reflect-metadata";
//import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
//import { AuthProvider } from "./AuthProvider.entity";
//@Entity()

import { AuthProvider } from "./AuthProvider.models";

export interface UserStats {
  id?: number;

//nombre de parties jouées
  classic_total_game_played: number;
 //nombre de parties gagnées
  classic_total_game_won: number;
 //nombre de parties perdues
  classic_total_game_lost: number;
 //nombre de parties nulles
  classic_total_game_draw: number;

 //nombre de parties jouées en local
  classic_local_game_played: number;
 //nombre de parties gagnées en local
  classic_local_game_won: number;
 //nombre de parties perdues en local
  classic_local_game_lost: number;
 //nombre de parties nulles en local
  classic_local_game_draw: number;

 //nombre de parties jouées en remote
  classic_remote_game_played: number;
 //nombre de parties gagnées en remote
  classic_remote_game_won: number;
 //nombre de parties perdues en remote
  classic_remote_game_lost: number;
 //nombre de parties nulles en remote
  classic_remote_game_draw: number;

 //nombre de parties jouées en tournoi
  tournament_total_game_played: number;
 //nombre de parties gagnées en tournoi
  tournament_total_game_won: number;
 //nombre de parties perdues en tournoi
  tournament_total_game_lost: number;
 //nombre de parties nulles en tournoi
  tournament_total_game_draw: number;

 //nombre de parties jouées en tournoi local
  tournament_local_game_played: number;
 //nombre de parties gagnées en tournoi local
  tournament_local_game_won: number;
 //nombre de parties perdues en tournoi local
  tournament_local_game_lost: number;
 //nombre de parties nulles en tournoi local
  tournament_local_game_draw: number;
  
 //nombre de parties jouées en tournoi remote
  tournament_remote_game_played: number;
 //nombre de parties gagnées en tournoi remote
  tournament_remote_game_won: number;
 //nombre de parties perdues en tournoi remote
  tournament_remote_game_lost: number;
 //nombre de parties nulles en tournoi remote
  tournament_remote_game_draw: number;
}
/* export interface IModel<T> {
	toJSON(): T;
	fromJSON(json: any): T;
	create(...args: any): T;
  } */
//a renomer model
export interface User /* extends IModel<User> */ {
  id: number;
  name: string;
  role: string;
  avatar: string;
  authProviders: AuthProvider[];
  created_at: Date;
  updated_at: Date;
  userStats: UserStats;
};
/* export abstract class AModel<T> {
  abstract toJSON(): T;
  abstract fromJSON(json: any): T;
  abstract create(...args: any): T;
} */
/*   export class BaseModel<T> {
	constructor(data: Partial<T>) {
	  Object.assign(this, data);
	}
  
	static fromJSON<U>(this: new (data: Partial<U>) => U, json: any): U {
	  return new this(json);
	}
  
	static fromJSONArray<U>(this: new (data: Partial<U>) => U, jsonArray: any[]): U[] {
	  return jsonArray.map(json => new this(json));
	}  
  } */

export class User/*  extends BaseModel<User>  */{
	constructor(user:{
       id?:number,
       name?: string,
       role?: string,
       avatar?: string,
       authProviders?:AuthProvider[],
       created_at?:Date,
       updated_at?:Date,
       userStats?:UserStats}) {
		//super(user);
		this.id = user.id ?? 0; // <=> user.id ? user.id : 0
		this.name = user.name ?? "";
		this.role = user.role ?? "user";
    this.avatar = user.avatar ?? "";
		this.authProviders =user.authProviders ??[]// user.authProviders ?user.authProviders.map(AuthProvider.fromJSON):[];
		this.created_at = user.created_at ?? new Date();
		this.updated_at = user.updated_at ?? new Date();
    //@TODO reset test value
    this.userStats = user.userStats ?? {
      classic_total_game_played: 0,
      classic_total_game_won: 0,
      classic_total_game_lost: 0,
      classic_total_game_draw: 0,
      classic_local_game_played: 0,
      classic_local_game_won: 0,
      classic_local_game_lost: 0,
      classic_local_game_draw: 0,
      classic_remote_game_played: 0,
      classic_remote_game_won: 0,
      classic_remote_game_lost: 0,
      classic_remote_game_draw: 0,

      tournament_total_game_played: 0,
      tournament_total_game_won: 0,
      tournament_total_game_lost: 0,
      tournament_total_game_draw: 0,
      tournament_local_game_played: 0,
      tournament_local_game_won: 0,
      tournament_local_game_lost: 0,
      tournament_local_game_draw: 0,
      tournament_remote_game_played: 0,
      tournament_remote_game_won: 0,
      tournament_remote_game_lost: 0,
      tournament_remote_game_draw: 0
    };
	}
  //@PrimaryGeneratedColumn()
  id: number;

  //@Column({ type: "text" })
  name: string;

  //@Column({ type: "text", default: "user" })
  role: string;

  //@Column({ type: "text", default: "" })
  avatar: string;

/* 
  @OneToMany(() => AuthProvider, (authproviders) => authproviders.user,{ cascade: true, onDelete: 'CASCADE',nullable:true,
    onUpdate: 'CASCADE',  })//✅ Ajout de la relation OneToMany */
  authProviders: AuthProvider[];
  //@Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  created_at: Date;

  //@Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  updated_at: Date;

}
