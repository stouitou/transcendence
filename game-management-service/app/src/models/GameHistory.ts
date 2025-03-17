
import { AuthProvider } from "./authProvider";
import { Game } from "./Game";
import { User } from "./User";



/*
 * Rôle : Structure les données de la BDD sous forme d’objet manipulable.
 */

function createFilter<T extends Record<string, any>>(): Record<keyof T, true> {
  return Object.fromEntries(Object.keys({} as T).map(key => [key, true])) as Record<keyof T, true>;
}
export class GameHistory{
  id: number;
  score1: number;
  score2: number;
  player1: number;
  player2: number;
  game?: Game;
  created_at: Date;
  updated_at: Date;

 
	constructor(data: Partial<GameHistory>) {
    this.id = 0;
    this.score1 = 0;
    this.score2 = 0;
    this.player1 = 0;
    this.player2 = 0;
    //this.game = new Game({});
    Object.assign(this, data);
    this.created_at = new Date(data?.created_at?data.created_at:new Date());
	  this.updated_at = new Date(data?.updated_at?data.updated_at:new Date());
  }
  
  // 🔹 Factory method pour instancier un User proprement
  static async create(gameHistory:{id:number,score1:number,score2:number,player1:number,player2:number}): Promise<GameHistory> {
   console.log("🔐 gameHistory.create :  player[]: ",gameHistory)
   const game = new GameHistory({...gameHistory});
    return game;
  }

	/* addPlayer(playerId: number) {
	  this.players.push(playerId);
	} */
  

  // 🔹 Transforme un JSON en instance User
  static fromJSON(json: any): GameHistory {

  return new GameHistory({
    id: json.id,
    score1: json.score1,
    score2: json.score2,
    player1: json.player1,
    player2: json.player2,
    game: json.game,
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
    const keys = Object.keys(type) as (keyof GameHistory)[];
    //2- Créer un tableau de paires [clé, valeur] en filtrant selon les clés
    const entries = keys.map(key => [key, this[key]])
    //3- Transformer le tableau de paires en objet
    return Object.fromEntries(entries) as T;
  }

  // 🔹 Pour ne jamais exposer le hash du mot de passe
  toJSON() {
    return {
      id: this.id,
      score1: this.score1,
      score2: this.score2,
      player1: this.player1,
      player2: this.player2,
      game: this.game,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }
  toFilteredJSON({
    id = true,
    score1 = true,
    score2 = true,
    player1 = true,
    player2 = true,
    game = true,
    created_at = true,
    updated_at = true
  }/* : Record<keyof GameHistory, boolean> */) {

    
    const json: any = {id: this.id};
    if(score1) json.score1 = this.score1;
    if(score2) json.score2 = this.score2;
    if(player1) json.player1 = this.player1;
    if(player2) json.player2 = this.player2;
    if(game) json.game = this.game;
    if(created_at) json.created_at = this.created_at;
    if(updated_at) json.updated_at = this.updated_at;
    return json;
  }
}


export type GameHistoryCreate = {
  score1: number;
  score2: number;
  player1: number;
  player2: number;
  game?: Game;
  created_at: Date;
  updated_at: Date;
}
// 📌 Définition des modèles avec contraintes
export type GameHistoryBody = {
  id: number;
  score1: number;
  score2: number;
  player1: number;
  player2: number;
  game?: Game;
  created_at: Date;
  updated_at: Date;
}

export type GameHistorySafe = {
  id: number;
  score1: number;
  score2: number;
  player1: number;
  player2: number;
  game?: Game;
  created_at: Date;
  updated_at: Date;
}

// 📌 Interface pour garantir que le modèle ne contient QUE des clés de User
export type GameHistoryModel<T extends Partial<Record<keyof GameHistory, any>>> = T;
// 📌 Définition des modèles avec contraintes
export const GameHistoryBody: GameHistoryModel<GameHistoryBody> = {
  id: 0,
  score1: 0,
  score2: 0,
  player1: 0,
  player2: 0,
  game: undefined,
  created_at: new Date(),
  updated_at: new Date(),
};
export const GameHistorySafe: GameHistoryModel<GameHistorySafe> = {
  id: 0,
  score1: 0,
  score2: 0,
  player1: 0,
  player2: 0,
  game: undefined,
  created_at: new Date(),
  updated_at: new Date(),
};

export const GameHistoryCreate: GameHistoryModel<GameHistoryCreate> = {
  score1: 0,
  score2: 0,
  player1: 0,
  player2: 0,
  game: undefined,
  created_at: new Date(),
  updated_at: new Date()
};