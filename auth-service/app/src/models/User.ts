import bcrypt from "bcryptjs";
import { AuthProvider } from "./authProvider";
const SALT_ROUNDS = 10;
/*
 * Rôle : Structure les données de la BDD sous forme d’objet manipulable.
 */


/**
 * providers: {
          create: {
            provider: "local",
            providerId: email,
            userId: email,        
          },
 */

export class User{
	constructor(
	  public id: number,
	//  public email: string,
	 // private passwordHash: string,
	  public name: string,
	  public avatar: string,
	  public authProviders: AuthProvider[],
	  public created_at: Date = new Date(),
	  public updated_at: Date = new Date(),
    public role: string = "user"
	) {}
  
  // 🔹 Factory method pour instancier un User proprement
  static async create(name: string, avatar: string, authProviders: AuthProvider[]): Promise<User> {
   console.log("🔐 User.create :  name ",name, " avatar ",avatar, " authProviders ",authProviders)
    return new User(0, name, avatar, authProviders);
  }

	addAuthProvider(authProvider: AuthProvider) {
	  this.authProviders.push(authProvider);
	}
  

  // 🔹 Transforme un JSON en instance User
  static fromJSON(json: any): User {
	const authProviders = [];
	const jsonAuthProviders:AuthProvider[] = json.authProviders;
	if (jsonAuthProviders) {
		for (const authProvider of jsonAuthProviders) {
			authProviders.push(AuthProvider.fromJSON(authProvider));
		}
	}
/*   const user ={
    id: json.id,
    name: json.name,
    avatar: json.avatar,
    authProviders: jsonAuthProviders as AuthProvider[],
    created_at: json.created_at,
    updated_at: json.updated_at,
    role: json.role
  }
  return user as User; */
    return new User(
      json.id,
     // (json.email as string).toLowerCase().trim(),
	 //json.email,
    //  json.passwordHash, // 🔹 On récupère le hash, pas le password en clair
      json.name,
      json.avatar,
	    authProviders,// (json.authProviders as AuthProvider[]).map(AuthProvider.fromJSON),
      new Date(json.created_at),
      new Date(json.updated_at),
      json.role
    );
  }

/*   // 🔹 Vérifier un mot de passe lors d'une connexion
  async verifyPassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.passwordHash);
  } */

  // 🔹 Pour ne jamais exposer le hash du mot de passe
  toJSON() {
    return {
      id: this.id,
     // email: this.email,
      name: this.name,
      avatar: this.avatar,
      authProviders: this.authProviders.map((p) => p.toJSON()),
      created_at: this.created_at,
      updated_at: this.updated_at,
      role: this.role
    };
  }
}
  