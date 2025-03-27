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

}
  