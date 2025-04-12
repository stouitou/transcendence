
import { GameHistory } from "./GameHistory";
import { Tournaments } from "./Tournaments";
import { User } from "./User";

export class Game{
  id: number;
  gameHistory?: GameHistory;
  difficulty: number;
  state: string;
  mode: string;
  players: User[] | number[];
  tournaments?: Tournaments;
  created_at: Date;
  updated_at: Date;
  //mode de la partie : local ou remote
  type: string;
  //si local, les players sont un tableau de displaynames
  local_players: string[];

 
	constructor(data: Partial<Game>) {
    this.id = 0;
    this.gameHistory = undefined;
    this.difficulty = 1;
    this.state = "en attente";
    this.mode = "normal";
    this.players = [];
    this.type = "local";
    this.local_players = [];
    Object.assign(this, data);
    this.created_at = new Date(data?.created_at?data.created_at:new Date());
	  this.updated_at = new Date(data?.updated_at?data.updated_at:new Date());
  }
  
}


export type GameCreate = {
  players: number[];
  difficulty: number;
  state: string;
  mode: string;
  created_at: Date;
  updated_at: Date;
}
// 📌 Définition des modèles avec contraintes
export type GameBody = {
  id: number;
  gameHistory?: GameHistory;
  difficulty: number;
  state: string;
  mode: string;
  players: User[] | number[];
  tournaments?: Tournaments;
  created_at: Date;
  updated_at: Date;
}

export type GameSafe = {
  id: number;
  gameHistory?: GameHistory;
  difficulty: number;
  state: string;
  mode: string;
  players: User[] | number[];
  created_at: Date;
  updated_at: Date;
}

// 📌 Interface pour garantir que le modèle ne contient QUE des clés de User
export type GameModel<T extends Partial<Record<keyof Game, any>>> = T;
// 📌 Définition des modèles avec contraintes
export const GameBody: GameModel<GameBody> = {
  id: 0,
  difficulty: 1,
  state: "en attente",
  mode: "normal",
  players: [],
  tournaments: undefined,
  created_at: new Date(),
  updated_at: new Date(),
};
export const GameSafe: GameModel<GameSafe> = {
  id: 0,
  difficulty: 1,
  state: "en attente",
  mode: "normal",
  players: [],
  created_at: new Date(),
  updated_at: new Date(),
};

export const GameCreate: GameModel<GameCreate> = {
  players: [],
  difficulty: 1,
  state: "en attente",
  mode: "normal",
  created_at: new Date(),
  updated_at: new Date()
};