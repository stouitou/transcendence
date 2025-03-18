import { Game } from "./Game";
import { Tournaments } from "./Tournaments";
import { User } from "./User";


export class Round{
  id: number;
  games: Game[];
  state: string;
  players?: User[]/*  | number[] */;
  created_at: Date;
  updated_at: Date;
  tournaments?: Tournaments;
  current: number;

 
	constructor(data: Partial<Round>) {
    this.id = 0;
    this.current = 0;
    this.games = [];
    this.state = "en attente";
    this.players = [];
    Object.assign(this, data);
    this.created_at = new Date(data?.created_at?data.created_at:new Date());
	  this.updated_at = new Date(data?.updated_at?data.updated_at:new Date());
  }

}


export type RoundCreate = {
  players: number[];
  difficulty: number;
  state: string;
  mode: string;
  created_at: Date;
  updated_at: Date;
}
// 📌 Définition des modèles avec contraintes
export type RoundBody = {
  id: number;
  games: Game[];
  state: string;
  players: User[]/*  | number[] */;
  created_at: Date;
  updated_at: Date;
}

export type RoundSafe = {
  id: number;
  games: Game[];
  state: string;
  players: User[] | number[];
  created_at: Date;
  updated_at: Date;
}

// 📌 Interface pour garantir que le modèle ne contient QUE des clés de User
export type RoundModel<T extends Partial<Record<keyof Round, any>>> = T;
// 📌 Définition des modèles avec contraintes
export const RoundBody: RoundModel<RoundBody> = {
  id: 0,
  games: [],
  state: "en attente",
  players: [],
  created_at: new Date(),
  updated_at: new Date(),
};
export const RoundSafe: RoundModel<RoundSafe> = {
  id: 0,
  games: [],
  state: "en attente",
  players: [],
  created_at: new Date(),
  updated_at: new Date(),
};

export const RoundCreate: RoundModel<RoundCreate> = {
  players: [],
  difficulty: 0,
  state: "en attente",
  mode: "en attente",
  created_at: new Date(),
  updated_at: new Date()
};