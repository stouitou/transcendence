import { User } from "@src/models/User";
import { AuthRepository } from "../repository/AuthRepository";
import { UserRepository } from "../repository/UserRepository";

export class AuthProviderController {
	 
    // 🟢 Inscription (register whith oAutht)  
    async registerWithOauthProvider(profile:any, provider: string) {
      console.log("registerWithOauthProvider  start register")
      let provider_id = "";
      if (provider === "google") {
        provider_id = `${profile.id}`;
      } else if (provider === "facebook") {
        provider_id = profile.id;
      } else if (provider === "github") {
        provider_id = `${profile.id}`
      } else if (provider === "42api") {
        provider_id = `${profile.id}`;
      }
      // on dispose de l'objet profile qui contient les informations de l'utilisateur 
      // et de provider qui contient le nom du fournisseur d'authentification
      // on peut donc créer un utilisateur avec ces informations
      // 1- vérifier si l'utilisateur existe déjà dans la base de données
      const authprovider =  await AuthRepository.getAutProviderByProviderId(provider_id,provider);
      // 2- si l'utilisateur existe déjà, le retourner
      if (authprovider) return authprovider as unknown as User;
      // 3- si l'utilisateur n'existe pas, le créer
      // 3.1- créer l'utilisateur dans la base de données
      const user = await UserRepository.createVoidUser();
      // 3.2- créer AuthProvider dans la base de données
      const authProvider = await AuthRepository.createAuthProvider({ provider_id/* : profile.id */, provider, user_id: user.id });
      // 4- retourner l'utilisateur créé
      return user;
  
      }
}
