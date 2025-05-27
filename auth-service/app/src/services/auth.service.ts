import { FastifyInstance } from "fastify";
import { OauthProviderResponse } from "../types/provider.types";
import { User } from "../models/User.models";
import UserRepository from "../repository/User.repository";
import bcrypt from "bcryptjs"
import AuthProviderRepository from "../repository/AuthProvider.repository";

import { generateTOTPSecret, verifyTOTP } from "../utils/totp";
import { AuthProvider } from "../models/AuthProvider.models";
const defaultAvatar = "/uploads/defaultAvatar.jpg"; //@TODO : a changer
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
    this.generateTemp2FAToken = this.generateTemp2FAToken.bind(this);
    this.generateResetToken = this.generateResetToken.bind(this);
    this.isValidResetPassword = this.isValidResetPassword.bind(this);

  }

  /**
   * Vérifier si le mot de passe est valide
   * 
   * @param password 
   * @param hash 
   * @returns 
   */
  private async isValidPassword(password: string, hash: string) {
    console.log("🔐 AuthService: isValidPassword()  --",await bcrypt.compare(password, hash))
    return await bcrypt.compare(password, hash);
  }
  async isValidResetPassword(newPassword: string,oldPassword:string, hash: string| undefined) {
  
    try {
      if (!hash) {
        return false; // Le mot de passe n'est pas défini
      }
      // Vérifier si le mot de passe est valide
      const isValid = await bcrypt.compare(newPassword, hash);
      console.log("🔐 AuthService: bcrypt.compare(newPassword, hash)  --",isValid)
      if (!isValid) {
        const isOldPassword = await bcrypt.compare(oldPassword, hash);
        console.log("🔐 AuthService: bcrypt.compare(oldPassword, hash)  --",isOldPassword)
        if (!isOldPassword) {
          return false; // Le nouveau mot de passe est le même que l'ancien
        }
        return true; // Le nouveau mot de passe est valide
      } else {
        return false; // Le mot de passe est invalide
      }
    } catch (error) {
      console.error("Erreur lors de la vérification du mot de passe :", error);
      return false; // En cas d'erreur, on considère que le mot de passe est invalide
    }
  }

  /**
   * Générer un token JWT
   *
   * @param user
   * @returns
   */
  generateToken(user: { id: number,name:string,avatar?:string,role:string }) { //@TODO : changer le type de user et retourner un objet User complet
    return this.app.jwt.sign(
     // { id: user.id },
    //  { ...user },//on envoie tout l'objet user
    {
      id: user.id,
      name: user.name,
      avatar: user.avatar,
      role: user.role,
      //email: user.email,
      //authProviders: user.authProviders
    },
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
      return this.generateToken({ id: decoded.id,name:decoded.name, avatar:decoded.avatar, role:decoded.role });
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
    const newuser = new User({name,avatar:defaultAvatar, authProviders: [{provider: "local", provider_id: email, password:passwordHash}]});
    
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
  generateTemp2FAToken(email:string,method:string) {
    console.log("🔐AuthService:  generateTemp2FAToken()  email : ",email, 'method: ',method )
    //const method : 'totp' | 'email';
    return this.app.jwt.sign({
      email: email,
      stage: 'pending-2fa',
      method: method
    },
    { expiresIn: "5m" }
    );
  }

  //@TODO : in progress
  async generateResetToken(email: string): Promise<string> {
    //1- on verifie si l'utilisateur existe
    if (!email) throw new Error("email not found");
    //2- on verifie si l'utilisateur a deja un secret
    const user = await this.UserRepository.getOneByParams({authProviders:{provider_id:email, provider:"local"}});
    if (!user) throw new Error("User not found");
    //3- on genere le secret de l'authentification à deux facteurs
    const {secret,otpauth} = generateTOTPSecret(user.authProviders[0].provider_id)//this.app.authService.generateTemp2FAToken(user.authProviders[0].provider_id);
    console.log("[🔐AuthService]:  get2FASecret()  {secret,otpauth} = generateTOTPSecret : ",secret,otpauth)
    //4- on enregistre le secret dans la base de données
     const userUpdated = await  this.AuthProviderRepository.set2FASecret(user.authProviders[0].id!, secret);

     console.log("🔐AuthService:  get2FASecret()  userWithAuthProvider updated : ",userUpdated)
     return secret;
  }


  //@TODO : in progress
  async verifyResetToken(token: string): Promise<boolean> {
    try {
      const decoded = this.app.jwt.verify(token, "REFRESH_TOKEN_PUBLIC_KEY") as any;
      return true;
    } catch (err) {
      throw new Error("Invalid token");
    }
  }

  //@TODO : in progress
   async updatePassword(providerId:number , password: string) :Promise<AuthProvider | null>{
    // 1 - vérifier si l'utilisateur existe déjà

    // 2- crypter le mot de passe
    const passwordHash = bcrypt.hashSync(password, 10);
    // 3 - update le mot de passe
    const authProvider = await this.AuthProviderRepository.update({id:providerId, password:passwordHash});
    // 4- retourner le user
    console.log("🔐AuthService:  updatePassword()  updated ")
    return authProvider;
  }

}