import { FastifyInstance } from "fastify";
import { OauthProviderResponse } from "../types/provider.types";
import { UserRepository } from "../repository/UserRepository";
import { User } from "../models/User";
import { AuthProvider } from "../models/authProvider";
import { AuthRepository } from "../repository/AuthRepository";
import  {AuthProviderController}  from "../controllers/authProvider.controller";

export class AuthService {

  constructor(private app: FastifyInstance) {}

  // 🔐 Génération d'un token JWT
  generateToken(user: { id: number }) {
    return this.app.jwt.sign(
     // { id: user.id },
      { ...user },//on envoie tout l'objet user
      { expiresIn: "1h" }
    );
  }

  // 🔄 Vérifier un utilisateur avec email/password
  async validateUser(email: string, password: string) {

    //1- on recupere l'authProvider par email
    const authprovider = /* null;// */ await AuthRepository.getAutProviderByEmail(email);

    //2- on verifie si l'objet est null, si c'est le cas mail inconnu
    if (!authprovider) return null;

    //3- on verifie le mot de passe avec bcrypt via la methode isValidPassword de AuthProvider
    const isPasswordValid = authprovider.isValidPassword(password)
    if (!isPasswordValid) return null;

    //4- on retourne l'authProvider
    console.log("🔐 AuthService:validate user ok ")
    return authprovider;
  }
 
  
  // 🔄 Vérifier un utilisateur avec profile.id/provider
  async validateAuthProvider(provider_id: string, provider: string) {
  
    //1- on recupere l'authProvider par email
    const authprovider =  await AuthRepository.getAutProviderByProviderId(provider_id,provider);
    console.log("🔐 AuthService:validateAuthProvider()  --start--  email ",provider_id, " authprovider ",authprovider)
  
    //2- on verifie si l'objet est null, si c'est le cas mail inconnu
    if (!authprovider) return null;
    /* 
    //3- on verifie le mot de passe avec bcrypt via la methode isValidPassword de AuthProvider
      const isPasswordValid = authprovider.isValidPassword(password)
      if (!isPasswordValid) return null; 
    */
  
    //4- on retourne l'authProvider
    console.log("🔐 AuthService:validateAuthProvider user ok ")
    return authprovider;
  }


  // 🔄 Rafraîchir le token JWT (optionnel)
  refreshToken(token: string) {
    try {
      const decoded = this.app.jwt.verify(token, "REFRESH_TOKEN_PUBLIC_KEY") as any;
      return this.generateToken({ id: decoded.id });
    } catch (err) {
      throw new Error("Invalid token");
    }
  }

  // 🆕 Créer un utilisateur (avec hash du mot de passe)
  async createUser(email: string, password: string) {
    // 1 - creer une instance de AuthProvider
    const newAuthProvider =  AuthProvider.create("local",  email, 0, password); // une instance de AuthProvider

   // 2 - une instance de User
    const newUser = await User.create("", "", [newAuthProvider]);

    // 3 - enregistrer le user dans la base de données
    const user = await UserRepository.createUser(newUser.toJSON());

    // 4 - enregistrer l'authProvider dans la base de données enrichie de l'id du user
    newAuthProvider.setUserFKId(user.id);
    const authProvider = await AuthRepository.createAuthProvider(newAuthProvider.toJSON());//a renomer en AuthProviderRepository

    //5-merge user et authProvider
    const userWithAuthProvider = {...user,authProviders:[authProvider]};

    //6- s'assoir et regarder le resultat
    console.log("🔐AuthService:  createUser()  userWithAuthProvider created : ",userWithAuthProvider)
    return userWithAuthProvider;
  }
  
  buildOauthProviderResponse(user: { id: number,role:string }): OauthProviderResponse {
    const token = this.generateToken(user);
    return { user, token };
  }

  // 🆕 Créer ou mettre à jour un utilisateur avec un provider OAuth
  async createUserWithOauthProvider(profile:any, provider: string): Promise<OauthProviderResponse> {
    const user = await new  AuthProviderController().registerWithOauthProvider(profile, provider);
      if (user) {
        //on retourne le jwt
        return this.buildOauthProviderResponse({ id: user.id ,role: user.role});
      }
    throw new Error("User already exists");
  }
}