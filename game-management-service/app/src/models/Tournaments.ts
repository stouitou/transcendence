import { Game } from "./Game";
import { Players } from "./Players";
import { User } from "./User";


export class Tournaments{
  id: number;
  games?: Game[];
  state?: string;
  players?: User[];
  created_at: Date;
  updated_at: Date;
  currentRound?: number;
  winner?: /* User */Players | number | string;//Players //ok
  type: 'local' | 'remote'
  max_players: number;

 
	constructor(data: Partial<Tournaments>) {
    this.id = 0;
    this.games = [];
    this.state = "en attente";
    this.players = [];
    this.type = "local";
    this.max_players = 16;
    Object.assign(this, data);
    this.created_at = new Date(data?.created_at?data.created_at:new Date());
	  this.updated_at = new Date(data?.updated_at?data.updated_at:new Date());
  }

}


export type TournamentsCreate = {
  id?: number;
  players: number[];
  currentRound?: number;
  state: string; // en attente, en cours, terminee
  type: "local"| "remote"
  max_players?: number;
}

// 📌 Définition des modèles avec contraintes
export type TournamentsBody = {
  id: number;
  games: Game[];
  state: string;
  players: User[];
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
  state: "en attente",
  type: "local",
  max_players: 20,
  currentRound: 0,
};