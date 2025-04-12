import { Game } from "./Game";
import { Round } from "./Round";
import { User } from "./User";


export class Tournaments{
  id: number;
  games?: Game[];
  state?: string;
  players?: User[]/*  | number[] */;
  created_at: Date;
  updated_at: Date;
  rounds?: Round[];
  currentRound?: number;
  winner?: User | number | string;
  //mode de la partie : local ou remote
  type: string;
  //si local, les players sont un tableau de displaynames
  local_players: string[];

 
	constructor(data: Partial<Tournaments>) {
    this.id = 0;
    this.games = [];
    this.state = "en attente";
    this.players = [];
    this.type = "local";
    this.local_players = [];
    Object.assign(this, data);
    this.created_at = new Date(data?.created_at?data.created_at:new Date());
	  this.updated_at = new Date(data?.updated_at?data.updated_at:new Date());
  }

}


export type TournamentsCreate = {
  players: number[];
  difficulty: number;
  state: string;
  mode: string;
  created_at: Date;
  updated_at: Date;
}
// 📌 Définition des modèles avec contraintes
export type TournamentsBody = {
  id: number;
  games: Game[];
  state: string;
  players: User[]/*  | number[] */;
  created_at: Date;
  updated_at: Date;
}

export type TournamentsSafe = {
  id: number;
  games: Game[];
  state: string;
  players: User[] | number[];
  created_at: Date;
  updated_at: Date;
}

// 📌 Interface pour garantir que le modèle ne contient QUE des clés de User
export type TournamentsModel<T extends Partial<Record<keyof Tournaments, any>>> = T;
// 📌 Définition des modèles avec contraintes
export const TournamentsBody: TournamentsModel<TournamentsBody> = {
  id: 0,
  games: [],
  state: "en attente",
  players: [],
  created_at: new Date(),
  updated_at: new Date(),
};
export const TournamentsSafe: TournamentsModel<TournamentsSafe> = {
  id: 0,
  games: [],
  state: "en attente",
  players: [],
  created_at: new Date(),
  updated_at: new Date(),
};

export const TournamentsCreate: TournamentsModel<TournamentsCreate> = {
  players: [],
  difficulty: 0,
  state: "en attente",
  mode: "en attente",
  created_at: new Date(),
  updated_at: new Date()
};