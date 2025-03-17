
import { GameHistory } from "./GameHistory";
import { Tournaments } from "./Tournaments";
import { User } from "./User";



/*
 * Rôle : Structure les données de la BDD sous forme d’objet manipulable.
 */
/* 
function createFilter<T extends Record<string, any>>(): Record<keyof T, true> {
  return Object.fromEntries(Object.keys({} as T).map(key => [key, true])) as Record<keyof T, true>;
} */
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

 
	constructor(data: Partial<Game>) {
    this.id = 0;
    this.gameHistory = undefined;
    this.difficulty = 1;
    this.state = "en attente";
    this.mode = "normal";
    this.players = [];
    Object.assign(this, data);
    this.created_at = new Date(data?.created_at?data.created_at:new Date());
	  this.updated_at = new Date(data?.updated_at?data.updated_at:new Date());
  }
  
  // 🔹 Factory method pour instancier un User proprement
  static async create(players:number[]): Promise<Game> {
   console.log("🔐 Game.create :  player[]: ",players)
   const game = new Game({players});
    return game;
  }

	/* addPlayer(playerId: number) {
	  this.players.push(playerId);
	} */
  

  // 🔹 Transforme un JSON en instance User
  static fromJSON(json: any): Game {
/* 	const authProviders = [];
	const jsonAuthProviders:AuthProvider[] = json.authProviders;
	if (jsonAuthProviders) {
		for (const authProvider of jsonAuthProviders) {
			authProviders.push(AuthProvider.fromJSON(authProvider));
		}
	} */
  return new Game({
    id: json.id,
    difficulty: json.difficulty,
    state: json.state,
    mode: json.mode,
    players: json.players,
    tournaments: json.tournaments,
    created_at: new Date(json.created_at),
    updated_at: new Date(json.updated_at)
  });
  }

    createFilter<T extends Record<string, any>>(): Record<keyof T, true> {
      return new Proxy({} as Record<keyof T, true>, {
        get: (_, prop) => true
      });
    }
/*
function createFilter<T extends Record<string, any>>(example: T): Record<keyof T, true> {
  const keys = Object.keys(example) as Array<keyof T>;
  console.log("🔐 UserRepository.createFilter() keys ", keys);
  const entries = keys.map(key => [key, true]);
  return Object.fromEntries(entries) as Record<keyof T, true>;
}*/
      // Méthode toJson générique pour filtrer le>s propriétés
  toJson<T extends  Record<string, any>>(type: T): T {
   
    //1- Récupérer les clés de l'objet
    const keys = Object.keys(type) as (keyof Game)[];
    //2- Créer un tableau de paires [clé, valeur] en filtrant selon les clés
    const entries = keys.map(key => [key, this[key]])
    //3- Transformer le tableau de paires en objet
    return Object.fromEntries(entries) as T;
  }

  // 🔹 Pour ne jamais exposer le hash du mot de passe
  toJSON() {
    return {
      id: this.id,
      gameHistory: this.gameHistory,
      difficulty: this.difficulty,
      state: this.state,
      mode: this.mode,
      players: this.players,
      tournaments: this.tournaments,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }
  toFilteredJSON({gameHistory=false,  difficulty = false, state = false, mode = false, players = false, tournaments = false, created_at = false, updated_at = false}) {

    
    const json: any = {id: this.id};
    if(gameHistory) json.gameHistory = this.gameHistory;
    if(difficulty) json.difficulty = this.difficulty;
    if(state) json.state = this.state;
    if(mode) json.mode = this.mode;
    if(players) json.players = this.players;
    if(tournaments) json.tournaments = this.tournaments;
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