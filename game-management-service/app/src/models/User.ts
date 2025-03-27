
import { AuthProvider } from "./authProvider";

export class User{
  id: number;
  name?: string;
  avatar?: string;
  password?: string;
  created_at: Date;
  updated_at: Date;
  role: string;
  level?: number;
  //authProviders: AuthProvider[];
  //tournaments: Tournaments[];
  //games: Game[];

 
	constructor(data: Partial<User>) {
    this.id = 0;
    this.role = "user";
    Object.assign(this, data);
    this.created_at = new Date(data?.created_at?data.created_at:new Date());
	  this.updated_at = new Date(data?.updated_at?data.updated_at:new Date());
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