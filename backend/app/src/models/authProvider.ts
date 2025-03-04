//import bcrypt from 'bcryptjs';
/**
 * Rôle : Structure les données de la BDD sous forme d’objet manipulable.
 */

export class AuthProvider{
	constructor(
	  public id: number,
	  public provider: string, // "local" | "google" | "github"
	  public provider_id: string, //"test@mail.com" | "123456789" | "123456789"
	//  public userId: string, //"1" | "222" | "52562"
	  public user_id:number = 0,//ma clé étrangère
	  //public createdAt: Date,
	  //public updatedAt: Date
	  public password: string = "",//hash du mot de passe
	) {}
  
	static fromJSON(json: any): AuthProvider {
	  return new AuthProvider(
		json.id,
		json.provider,
		json.provider_id,
		//json.userId,
		json.user_id		
		//new Date(json.created_at),
		//new Date(json.updated_at)
	  );
	}

/* 	static create(provider: string, provider_id: string, user_id: number,password?:string): AuthProvider {
		if(provider === "local") {
			if(!password) {
				throw new Error("Password is required for local provider");
			}
			const passwordHash = bcrypt.hashSync(password, 10);
			return new AuthProvider(0, provider, provider_id, user_id, passwordHash);
		}
		return new AuthProvider(0, provider, provider_id, user_id);
	} */

	toJSON(): any {

	const authProvider: any = {
			id: this.id,
			provider: this.provider,
			provider_id: this.provider_id,
			user_id: this.user_id,
			//created_at: authProvider.createdAt,
			//updated_at: authProvider.updatedAt
		};
		if(this.provider === "local") {
			authProvider.password = this.password;
		}
		return authProvider;


  }
  setUserFKId(user_id: number) {
	this.user_id = user_id;
  }

}
  