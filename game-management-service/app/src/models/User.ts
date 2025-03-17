
import { AuthProvider } from "./authProvider";



/*
 * Rôle : Structure les données de la BDD sous forme d’objet manipulable.
 */

function createFilter<T extends Record<string, any>>(): Record<keyof T, true> {
  return Object.fromEntries(Object.keys({} as T).map(key => [key, true])) as Record<keyof T, true>;
}
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

 
	constructor(data: Partial<User>
	 /*  public id: number,
	 // private passwordHash: string,
	  public name: string,
	  public avatar: string,
	  public authProviders: AuthProvider[],
	  public created_at: Date = new Date(),
	  public updated_at: Date = new Date(),
    public role: string = "user" */
	) {
    this.id = 0;
    this.role = "user";
    Object.assign(this, data);
    this.created_at = new Date(data?.created_at?data.created_at:new Date());
	  this.updated_at = new Date(data?.updated_at?data.updated_at:new Date());
  }
  
  // 🔹 Factory method pour instancier un User proprement
  static async create(name: string, avatar: string, authProviders: AuthProvider[]): Promise<User> {
   console.log("🔐 User.create :  name ",name, " avatar ",avatar, " authProviders ",authProviders)
   const user = new User({name, avatar});
    return user; //new User(0, name, avatar, authProviders);
  }

	/* addAuthProvider(authProvider: AuthProvider) {
	  this.authProviders.push(authProvider);
	} */
  

  // 🔹 Transforme un JSON en instance User
  static fromJSON(json: any): User {
	const authProviders = [];
	const jsonAuthProviders:AuthProvider[] = json.authProviders;
	if (jsonAuthProviders) {
		for (const authProvider of jsonAuthProviders) {
			authProviders.push(AuthProvider.fromJSON(authProvider));
		}
	}
  return new User({
    id: json.id,
    name: json.name,
    avatar: json.avatar,
    created_at: new Date(json.created_at),
    updated_at: new Date(json.updated_at),
    role: json.role
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
    const keys = Object.keys(type) as (keyof User)[];
    //2- Créer un tableau de paires [clé, valeur] en filtrant selon les clés
    const entries = keys.map(key => [key, this[key]])
    //3- Transformer le tableau de paires en objet
    return Object.fromEntries(entries) as T;
  }

  // 🔹 Pour ne jamais exposer le hash du mot de passe
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      avatar: this.avatar,
      //authProviders: this.authProviders.map((p) => p.toJSON()),
      created_at: this.created_at,
      updated_at: this.updated_at,
      role: this.role
    };
  }
  toFilteredJSON({name = false, password = false, authProviders = false, created_at = false, updated_at = false, role = false}) {
    
    const json: any = {id: this.id};
    if(name) json.name = this.name;
   // if(authProviders) json.authProviders = this.authProviders.map((p) => p.toJSON());
    if(created_at) json.created_at = this.created_at;
    if(updated_at) json.updated_at = this.updated_at;
    if(role) json.role = this.role;
    return json;
   /*  return {
      id: this.id,
      email: ' ',
      name: this.name,
      avatar: this.avatar,
      authProviders: this.authProviders.map((p) => p.toJSON()),
      created_at: this.created_at,
      updated_at: this.updated_at,
      role: this.role
    }; */
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