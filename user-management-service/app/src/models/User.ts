import { AuthProvider } from "./authProvider";

/*
 * Rôle : Structure les données de la BDD sous forme d’objet manipulable.
 */
export interface UserStats {
  id: number;

//nombre de parties jouées
  total_game_played: number;
 //nombre de parties gagnées
  total_game_won: number;
 //nombre de parties perdues
  total_game_lost: number;
 //nombre de parties nulles
  total_game_draw: number;

 //nombre de parties jouées en local
  local_game_played: number;
 //nombre de parties gagnées en local
  local_game_won: number;
 //nombre de parties perdues en local
  local_game_lost: number;
 //nombre de parties nulles en local
  local_game_draw: number;

 //nombre de parties jouées en remote
  remote_game_played: number;
 //nombre de parties gagnées en remote
  remote_game_won: number;
 //nombre de parties perdues en remote
  remote_game_lost: number;
 //nombre de parties nulles en remote
  remote_game_draw: number;

 //nombre de parties jouées en tournoi
  tournament_game_played: number;
 //nombre de parties gagnées en tournoi
  tournament_game_won: number;
 //nombre de parties perdues en tournoi
  tournament_game_lost: number;
 //nombre de parties nulles en tournoi
  tournament_game_draw: number;

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
export class User{
  id: number;
  name?: string;
  avatar?: string;
  password?: string;
  created_at: Date;
  updated_at: Date;
  role: string;
  friends?: User[];
  userStats: UserStats;
  
	constructor(data: Partial<User>) {
    this.id = 0;
    this.role = "user";
    Object.assign(this, data);
    this.created_at = new Date(data?.created_at?data.created_at:new Date());
	  this.updated_at = new Date(data?.updated_at?data.updated_at:new Date());
    this.userStats = data?.userStats??UserStatsCreate;
  }
  
  // 🔹 Factory method pour instancier un User proprement
  static async create(name: string, avatar: string, authProviders: AuthProvider[]): Promise<User> {
   console.log("🔐 User.create :  name ",name, " avatar ",avatar, " authProviders ",authProviders)
   const user = new User({name, avatar});
    return user; //new User(0, name, avatar, authProviders);
  }
  
    createFilter<T extends Record<string, any>>(): Record<keyof T, true> {
      return new Proxy({} as Record<keyof T, true>, {
        get: (_, prop) => true
      });
    }
}

export type UserCreate = {
  avatar: string;
  name: string;
  created_at: Date;
  updated_at: Date;
}
// 📌 Définition des modèles avec contraintes
export type UserBody = {
  id: number;
  name: string;
  avatar: string;
  created_at: Date;
  updated_at: Date;
  role: string;
}

export type UserSafe = {
  id: number;
  name?: string;
  created_at: Date;  
}

// 📌 Interface pour garantir que le modèle ne contient QUE des clés de User
export type UserModel<T extends Partial<Record<keyof User, any>>> = T;
// 📌 Définition des modèles avec contraintes
export const UserBody: UserModel<UserBody> = {
  id: 0,
  name: "",
  avatar: "",
  created_at: new Date(),
  updated_at: new Date(),
  role: "user",
};
export const UserSafe: UserModel<UserSafe> = {
  id: 0,
  name: "",
  created_at: new Date(),
};

export const UserCreate: UserModel<UserCreate> = {
  avatar: "",
  name: "",
  created_at: new Date(),
  updated_at: new Date(),
};

export const UserStatsCreate: UserModel<UserStats> = {
  id: 0,
  total_game_played: 0,
  total_game_won: 0,
  total_game_lost: 0,
  total_game_draw: 0,
  local_game_played: 0,
  local_game_won: 0,
  local_game_lost: 0,
  local_game_draw: 0,
  remote_game_played: 0,
  remote_game_won: 0,
  remote_game_lost: 0,
  remote_game_draw: 0,
  tournament_game_played: 0,
  tournament_game_won: 0,
  tournament_game_lost: 0,
  tournament_game_draw: 0,
  tournament_local_game_played: 0,
  tournament_local_game_won: 0,
  tournament_local_game_lost: 0,
  tournament_local_game_draw: 0,
  tournament_remote_game_played: 0,
  tournament_remote_game_won: 0,
  tournament_remote_game_lost: 0,
  tournament_remote_game_draw: 0,
}