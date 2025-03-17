
import { Game } from "./Game";
import { GameHistory } from "./GameHistory";
import { User } from "./User";



/*
 * Rôle : Structure les données de la BDD sous forme d’objet manipulable.
 */
/* 
function createFilter<T extends Record<string, any>>(): Record<keyof T, true> {
  return Object.fromEntries(Object.keys({} as T).map(key => [key, true])) as Record<keyof T, true>;
} */
export class Tournaments{
  id: number;
  games: Game[];
  state: string;
  players: User[] | number[];
  created_at: Date;
  updated_at: Date;

 
	constructor(data: Partial<Tournaments>) {
    this.id = 0;
    this.games = [];
    this.state = "en attente";
    this.players = [];
    Object.assign(this, data);
    this.created_at = new Date(data?.created_at?data.created_at:new Date());
	  this.updated_at = new Date(data?.updated_at?data.updated_at:new Date());
  }
  
  // 🔹 Factory method pour instancier un User proprement
  static async create(games:any,players:number[]): Promise<Tournaments> { //games:Game[]
   console.log("🔐 Game.create :  games[]: ",games, "players[] : ",players)
   const tournament = new Tournaments({games,players});
    return tournament;
  }

	/* addPlayer(playerId: number) {
	  this.players.push(playerId);
	} */
  

  // 🔹 Transforme un JSON en instance User
  static fromJSON(json: any): Tournaments {

  return new Tournaments({
    id: json.id,
    games: json.games,
    players: json.players,
    state: json.state,
    created_at: new Date(json.created_at),
    updated_at: new Date(json.updated_at)
  });
  }

    createFilter<T extends Record<string, any>>(): Record<keyof T, true> {
      return new Proxy({} as Record<keyof T, true>, {
        get: (_, prop) => true
      });
    }
      // Méthode toJson générique pour filtrer le>s propriétés
  toJson<T extends  Record<string, any>>(type: T): T {
   
    //1- Récupérer les clés de l'objet
    const keys = Object.keys(type) as (keyof Tournaments)[];
    //2- Créer un tableau de paires [clé, valeur] en filtrant selon les clés
    const entries = keys.map(key => [key, this[key]])
    //3- Transformer le tableau de paires en objet
    return Object.fromEntries(entries) as T;
  }

  // 🔹 Pour ne jamais exposer le hash du mot de passe
  toJSON() {
    return {
      id: this.id,
      games: this.games,
      state: this.state,
      players: this.players,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }
  toFilteredJSON({
    games = true,
    state = true,
    players = true,
    created_at = true,
    updated_at = true
  }/*  = createFilter<Tournaments>() */) {

    
    const json: any = {id: this.id};
    if(games) json.games = this.games;
    if(state) json.state = this.state;
    if(players) json.players = this.players;
    if(created_at) json.created_at = this.created_at;
    if(updated_at) json.updated_at = this.updated_at;
    return json;
  }
}




/* export const UserBody = {
  id: 0,
  email: "",
  name: "",
} as const; // as const permet de figer les valeurs
export type UserBody = typeof UserBody;
 */

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
  players: User[] | number[];
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