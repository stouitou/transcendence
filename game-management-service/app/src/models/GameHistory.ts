
import { Game } from "./Game";
import { Players } from "./Players";

export class GameHistory{
  id: number;
  game?: Game;
  created_at: Date;
  updated_at: Date;
  //mode de la partie : local ou remote
  type: 'local'|'remote'/* string */;
  format:"classic"|"tournament"; //classic, tournament
  players?: Players[];
  winner: string|null = null;

 
	constructor(data: Partial<GameHistory>) {
    this.id = 0;
/*     this.score1 = 0;
    this.score2 = 0;
    this.player1 = 0;
    this.player2 = 0; */
    this.type = "local";
    this.format = "classic"; //default format
    this.players = data?.players ? data.players : [];
    //this.game = new Game({});
    Object.assign(this, data);
    this.created_at = new Date(data?.created_at?data.created_at:new Date());
	  this.updated_at = new Date(data?.updated_at?data.updated_at:new Date());

  }
}


export type GameHistoryCreate = {
/*   score1: number;
  score2: number;
  player1: number;
  player2: number; */
  game?: Game;
  players?: Players[];
  type: "local" | "remote";
  format: "classic" | "tournament"; //classic, tournament
/*   created_at: Date;
  updated_at: Date; */
}
// 📌 Définition des modèles avec contraintes
export type GameHistoryBody = {
  id: number;
/*   score1: number;
  score2: number;
  player1: number;
  player2: number; */
  game?: Game;
  created_at: Date;
  updated_at: Date;
}

export type GameHistorySafe = {
  id: number;
/*   score1: number;
  score2: number;
  player1: number;
  player2: number; */
  game?: Game;
  created_at: Date;
  updated_at: Date;
}

// 📌 Interface pour garantir que le modèle ne contient QUE des clés de User
export type GameHistoryModel<T extends Partial<Record<keyof GameHistory, any>>> = T;
// 📌 Définition des modèles avec contraintes
export const GameHistoryBody: GameHistoryModel<GameHistoryBody> = {
  id: 0,
/*   score1: 0,
  score2: 0,
  player1: 0,
  player2: 0, */
  game: undefined,
  created_at: new Date(),
  updated_at: new Date(),
};
export const GameHistorySafe: GameHistoryModel<GameHistorySafe> = {
  id: 0,
/*   score1: 0,
  score2: 0,
  player1: 0,
  player2: 0, */
  game: undefined,
  created_at: new Date(),
  updated_at: new Date(),
};

export const GameHistoryCreate: GameHistoryModel<GameHistoryCreate> = {
/*   score1: 0,
  score2: 0,
  player1: 0,
  player2: 0, */
  game: undefined,
  players: [],
  type: "local",
  format: "classic", //default format
/*   created_at: new Date(),
  updated_at: new Date() */
};