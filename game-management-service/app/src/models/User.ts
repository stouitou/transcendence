export interface UserStats {
  id?: number;

//nombre de parties jouées
  classic_total_game_played: number;
 //nombre de parties gagnées
  classic_total_game_won: number;
 //nombre de parties perdues
  classic_total_game_lost: number;
 //nombre de parties nulles
  classic_total_game_draw: number;

 //nombre de parties jouées en local
  classic_local_game_played: number;
 //nombre de parties gagnées en local
  classic_local_game_won: number;
 //nombre de parties perdues en local
  classic_local_game_lost: number;
 //nombre de parties nulles en local
  classic_local_game_draw: number;

 //nombre de parties jouées en remote
  classic_remote_game_played: number;
 //nombre de parties gagnées en remote
  classic_remote_game_won: number;
 //nombre de parties perdues en remote
  classic_remote_game_lost: number;
 //nombre de parties nulles en remote
  classic_remote_game_draw: number;

 //nombre de parties jouées en tournoi
  tournament_total_game_played: number;
 //nombre de parties gagnées en tournoi
  tournament_total_game_won: number;
 //nombre de parties perdues en tournoi
  tournament_total_game_lost: number;
 //nombre de parties nulles en tournoi
  tournament_total_game_draw: number;

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
  created_at: Date;
  updated_at: Date;
  role: string;
  level?: number;
  userStats: UserStats;
  //authProviders: AuthProvider[];
  //tournaments: Tournaments[];
  //games: Game[];

 
	constructor(data: Partial<User>) {
    this.id = 0;
    this.role = "user";
    Object.assign(this, data);
    this.created_at = new Date(data?.created_at?data.created_at:new Date());
	  this.updated_at = new Date(data?.updated_at?data.updated_at:new Date());
    this.userStats = data?.userStats || {
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
  }
}




/* export const UserBody = {
  id: 0,
  email: "",
  name: "",
} as const; // as const permet de figer les valeurs
export type UserBody = typeof UserBody;
 */

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