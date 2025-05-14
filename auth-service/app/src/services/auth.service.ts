import { FastifyInstance } from "fastify";
import { OauthProviderResponse } from "../types/provider.types";
//import { UserRepository } from "../repository/UserRepository";
import { User } from "../models/User.models";
//import { AuthProvider } from "../Entity/AuthProvider.entity";
//import AuthProviderRepository from "../repository/AuthProvider.repository";
import UserRepository from "../repository/User.repository";
import bcrypt from "bcryptjs"
import AuthProviderRepository from "@src/repository/AuthProvider.repository";

import { generateTOTPSecret, verifyTOTP } from "@src/utils/totp";
/**
 * Service d'authentification
 * rappel: un service est une classe qui contient des méthodes qui effectuent des opérations spécifiques
 * -- Il est utilisé pour effectuer des opérations métier, des opérations de base de données, etc.
 * -- Il est utilisé pour effectuer des opérations spécifiques qui ne sont pas liées à une entité ou à un contrôleur.
 */
export class AuthService {

  private UserRepository: UserRepository;
  private AuthProviderRepository: AuthProviderRepository;

  constructor(private app: FastifyInstance) {
    this.UserRepository = new UserRepository();
    this.AuthProviderRepository = new AuthProviderRepository();
  }

  /**
   * Vérifier si le mot de passe est valide
   * 
   * @param password 
   * @param hash 
   * @returns 
   */
  private async isValidPassword(password: string, hash: string) {
    console.log("🔐 AuthService: isValidPassword()  --",await bcrypt.compare(password, hash),"--  password ",password, " hash ",hash)
    return await bcrypt.compare(password, hash);
  }

  /**
   * Générer un token JWT
   *
   * @param user
   * @returns
   */
  generateToken(user: { id: number,name:string,avatar?:string }) { //@TODO : changer le type de user et retourner un objet User complet
    return this.app.jwt.sign(
     // { id: user.id },
      { ...user },//on envoie tout l'objet user
      { expiresIn: "10h" } //@DEBUG
      //{ expiresIn: "1h" } 
      //{ expiresIn: "1m" } // 1 minute
    );
  }

  /**
   * 🔄 Vérifier un utilisateur avec email/password
   * 
   * @param email 
   * @param password 
   * @returns 
   */
  async validateUser(email: string, password: string): Promise<User | null> {

    //1- on recupere l'User par email grace a la methode getOneByParams
    //  de UserRepository grace au filtre sur authProviders
    const params = {authProviders:{provider_id:email, provider:"local"}};
    const existingUser = await this.UserRepository.getOneByParams(params);

    //2- on verifie si l'objet est null, si c'est le cas mail inconnu
    if (!existingUser) return null;

    //3- on verifie le mot de passe avec bcrypt via la methode isValidPassword de AuthProvider
    const isPasswordValid = await this.isValidPassword(password, existingUser.authProviders[0].password??"password");
    if (!isPasswordValid) return null;

    //4- on retourne l'authProvider
    console.log("🔐🟢 AuthService:validate user ok 🟢")
    return existingUser;
  }
 
  
  /**
   * 🔄 Vérifier un utilisateur avec un fournisseur d'authentification
   * 
   * @param provider_id 
   * @param provider 
   * @returns 
   */
  async validateAuthProvider(provider_id: string, provider: string): Promise<User | null> {
    const params = { authProviders:{"provider_id":provider_id, provider}};
    //1- on recupere l'authProvider par email    
    const existingUser = await this.UserRepository.getOneByParams(params);
    console.log("🔐 AuthService:validateAuthProvider()  --start--  email ",provider_id, " authprovider ",existingUser)
  
    //2- on verifie si l'objet est null, si c'est le cas mail inconnu
    if (!existingUser) return null;
  
    //3- on retourne l'authProvider
    console.log("🔐 AuthService:validateAuthProvider user ok 🟢")
    return existingUser;
  }


  /**
   * 🔄 Rafraîchir un token
   * 
   * @param token 
   * @returns 
   */
  refreshToken(token: string) {
    try {
      const decoded = this.app.jwt.verify(token, "REFRESH_TOKEN_PUBLIC_KEY") as any;
      return this.generateToken({ id: decoded.id,name:decoded.name, avatar:decoded.avatar });
    } catch (err) {
      throw new Error("Invalid token");
    }
  }


  /**
   * 🔄 Créer un utilisateur
   *  le mot de passe sera crypté
   * 
   * @param email 
   * @param password 
   * @returns 
   */
  async createUser(name:string , email: string, password: string) :Promise<User | null>{
    // 1 - vérifier si l'utilisateur existe déjà

    // 2- crypter le mot de passe
    const passwordHash = bcrypt.hashSync(password, 10);
    // 3- creer un nouvel utilisateur
    const newuser = new User({name,avatar:"noAvatar", authProviders: [{provider: "local", provider_id: email, password:passwordHash}]});
    
    // 4 - enregistrer le user dans la base de données
    const user = await this.UserRepository.create(newuser);

    // 5- retourner le user
    console.log("🔐AuthService:  createUser()  userWithAuthProvider created : ",user)
    return user;
  }
  
  /**
   * 🔄 Créer un JWT pour un provider
   * 
   * @param profile 
   * @param provider 
   * @returns 
   */
  buildOauthProviderResponse(user: { id: number,role:string,name:string,avatar:string }): OauthProviderResponse {
    const token = this.generateToken(user);
    return { user, token };
  }

  /**
   * 🔄 Créer un utilisateur avec un fournisseur d'authentification OAuth
   * 
   * @param profile 
   * @param provider 
   * @returns 
   */
  async createUserWithOauthProvider(profile:any, provider: string): Promise<OauthProviderResponse> {
    const user = await this.registerWithOauthProvider(profile, provider);
      if (user) {
        //on retourne le jwt
        return this.buildOauthProviderResponse({ id: user.id ,role: user.role, name: user.name, avatar: user.avatar });
      }
    throw new Error("User already exists");
  }
   
/** //@TODO : devrait être dans le service
   * Créer ou mettre à jour un utilisateur avec un fournisseur d'authentification OAuth
   *
   * @param profile
   * @param provider
   */
async registerWithOauthProvider(profile:any, provider: string) {
  console.log("auth.controller.ts  registerWithOauthProvider  start register")
  // 1️⃣- extraire l'identifiant du fournisseur d'authentification
  let provider_id = "";
  let name = "";
  let avatar = "";
  if (provider === "google") {
    provider_id = `${profile.id}`;
    name = profile.displayName;
    avatar = profile.photos[0].value;
  } else if (provider === "facebook") {
    provider_id = profile.id;
    name = profile.displayName;
    avatar = profile.photos[0].value;
  } else if (provider === "github") {
    provider_id = `${profile.id}`
    name = profile.username;
    avatar = profile.photos[0].value;
  } else if (provider === "42api") {
    provider_id = `${profile.id}`;
    name =
      profile.first_name && profile.last_name
        ? `${profile.first_name} ${profile.last_name}`
        : profile.login;
    avatar = profile.image.link;
  }
  // on dispose de l'objet profile qui contient les informations de l'utilisateur 
  // et de provider qui contient le nom du fournisseur d'authentification
  // on peut donc créer un utilisateur avec ces informations
  // 2️⃣- vérifier si l'utilisateur existe déjà dans la base de données
  const params = {authProviders:{"provider_id":provider_id, provider}};
  const existingUser = await this.UserRepository.getOneByParams(params);
  // 3️⃣- si l'utilisateur existe déjà, le retourner
  if (existingUser) return existingUser;
  // 4️⃣- si l'utilisateur n'existe pas, le créer
  const userData = new User({name , avatar , authProviders: [{provider: provider, provider_id}]});
 // const user = await  this.UserRepository.create({name , avatar , authProviders: [{provider: provider, provider_id}] });
  const user = await  this.UserRepository.create(userData);
  // 5️⃣- retourner l'utilisateur
  return user;
}


  //2FA
    /**
   * Générer un token JWT temporaire pour l'authentification à deux facteurs
   *
   * @param user
   * @returns
   */
  generateTemp2FAToken(email:string) { //@TODO : changer le type de user et retourner un objet User complet
    return this.app.jwt.sign({
      email: email,
      stage: 'pending-2fa',
    },
    { expiresIn: "5m" }
    );
  }
  async get2FASecret(email: string): Promise< {secret:string,otpauth:string| null } > {
    //1- on verifie si l'utilisateur existe
    if (!email) throw new Error("email not found");
    //2- on verifie si l'utilisateur a deja un secret
    const user = await this.UserRepository.getOneByParams({authProviders:{provider_id:email, provider:"local"}});
    if (!user) throw new Error("User not found");
    //3- on verifie si l'utilisateur a deja activé l'authentification à deux facteurs
    if (user.authProviders[0].two_factor_auth_secret) return {secret:user.authProviders[0].two_factor_auth_secret, otpauth:null};
    //3- on genere le secret de l'authentification à deux facteurs
    const {secret,otpauth} = generateTOTPSecret(user.authProviders[0].provider_id)//this.app.authService.generateTemp2FAToken(user.authProviders[0].provider_id);
    //4- on enregistre le secret dans la base de données
     const userUpdated = await  this.AuthProviderRepository.set2FASecret(user.authProviders[0].id!, secret);

     console.log("🔐AuthService:  get2FASecret()  userWithAuthProvider updated : ",userUpdated)
    return {secret,otpauth};
  }
  /**
   * 🔄 Activer l'authentification à deux facteurs
   * 
   * @param user 
   * @returns 
   */
  async enableTwoFactorAuth(user: User): Promise<User> {
    //1- on verifie si l'utilisateur existe
    if (!user) throw new Error("User not found");
    //2- on verifie si l'utilisateur a deja activé l'authentification à deux facteurs
    if (user.authProviders[0].two_factor_auth) throw new Error("Two factor auth already enabled");
    //3- on active l'authentification à deux facteurs
    user.authProviders[0].two_factor_auth = true;
    //4- on enregistre l'utilisateur dans la base de données
    const updatedUser = await this.UserRepository.update(user);
    return updatedUser;
  }
}