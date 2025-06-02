import { AuthProvider } from "./authProvider";

/*
 * Rôle : Structure les données de la BDD sous forme d’objet manipulable.
 */
export interface UserStats {
  id: number;
      classic_total_game_played: number;
      classic_total_game_won: number;
      classic_total_game_lost: number;
      classic_total_game_draw: number;
      classic_local_game_played: number;
      classic_local_game_won: number;
      classic_local_game_lost: number;
      classic_local_game_draw: number;
      classic_remote_game_played: number;
      classic_remote_game_won: number;
      classic_remote_game_lost: number;
      classic_remote_game_draw: number;

      tournament_total_game_played: number;
      tournament_total_game_won: number;
      tournament_total_game_lost: number;
      tournament_total_game_draw: number;
      tournament_local_game_played: number;
      tournament_local_game_won: number;
      tournament_local_game_lost: number;
      tournament_local_game_draw: number;
      tournament_remote_game_played: number;
      tournament_remote_game_won: number;
      tournament_remote_game_lost: number;
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
  level?: number;
  
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
}