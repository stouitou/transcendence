import AuthProviderRepository from "../repository/AuthProvider.repository";
import  UserRepository  from "../repository/User.repository";
import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { BaseController } from "./BaseController";
import { send2FAEmail } from "../services/mail.service";
import { generateCSRFToken } from "../utils/crypto";
import { AuthError, NotFoundError, ValidationError } from "@src/Errors/errors";
import { generateErrorResponse } from "@src/Errors/handler";


/**
 * Contrôleur d'authentification
 * rappel: un contrôleur est une classe qui contient des méthodes qui gèrent les requêtes HTTP
 * -- Il est utilisé pour gérer les requêtes HTTP et les réponses.
 */
export class AuthController extends BaseController {
  //Une classe BaseController qui contient les méthodes communes à tous les contrôleurs??? et qui est étendue par les contrôleurs

  private UserRepository: UserRepository;
  private AuthProviderRepository: AuthProviderRepository;

  /**
   * Crée une instance de AuthController.
   * 
   * @param app 
   */
  constructor(app: FastifyInstance) {
      super(app);
      this.UserRepository = new UserRepository();
      this.AuthProviderRepository = new AuthProviderRepository();
			console.log("🟢 AuthController is initialized");
      // Lier les méthodes pour conserver le contexte de `this`
      this.register = this.register.bind(this);
      this.login = this.login.bind(this);
      this.me = this.me.bind(this);
      this.logout = this.logout.bind(this);
      this.loginForgetPassword = this.loginForgetPassword.bind(this);
      this.loginResetPassword = this.loginResetPassword.bind(this);
      this.decodeToken = this.decodeToken.bind(this);

      this.updateMePassword = this.updateMePassword.bind(this);
	  }

  /**
   *  Inscription (register) by email/password
   * 
   * @param req 
   * @param reply 
   * @returns 
   */ 
  async register(req: FastifyRequest, reply: FastifyReply) {
    try {
	  console.log("🔵 AuthController  start register")
    const { name, email, password } = req.body as { name : string, email: string; password: string };
    // Vérifier si l'utilisateur existe déjà dan AuthProvider
    const existingUser = await this.AuthProviderRepository.getByParams({provider_id:email,provider:"local"});
  //	console.log("❓ AuthController   existingUser: ", existingUser)
    if (existingUser) {
      throw new ValidationError("User already exists", "email");
     // return reply.status(400).send({ error: "User already exists",message: "User already exists" });
    }
    console.log("🟠 AuthController  try create User")

    // Créer l'utilisateur  
    const newUser = await this.app.authService.createUser(name, email, password);
	  console.log("🟡 newUser",newUser)
    if (!newUser) {
      //return reply.status(400).send({ error: "User already exists" });
      throw new ValidationError("User already exists", "name");
    }
    const token = this.app.authService.generateToken(newUser!); // `!` pour forcer le non-null
  //  console.log("🔗🟢 token",{token})
    return reply.status(201).send({ token });
  }
    catch (error) {
      console.error("🔴 AuthController register error", error);
      return generateErrorResponse(reply, error);
    }
  }

  /**
   * Connexion (login) by email/password
   * 
   * @param req 
   * @param reply 
   * @returns 
   */
  async login(req: FastifyRequest, reply: FastifyReply) {
    try {
    const { email, password } = req.body as { email: string; password: string };
    console.log("🔐[LOGIN] email",email)
    console.log("🔐[LOGIN] req.session.crsf",req.session.csrfToken)
    const user = await this.app.authService.validateUser(email, password);
    if (!user) {
     // return reply.status(401).send({ error: "Invalid credentials" });
      throw new AuthError("Invalid credentials");
    }
    //rapel une session est instancie des que des données sont stockées dans req.session
    // la session pour l'utilisateur actuelle a debuté par la creation du req.session.csrfToken
    //la cette session est a present atache a l'utilisateur
    req.session.userID = user.id
    /*   const csrfToken = req.cookies.csrf_token;
      const csrfTokenHeader = req.headers['x-csrf-token'];
      console.log("🔐[LOGIN] req.headers['x-csrf-token']", csrfTokenHeader)
      console.log("🔐[LOGIN] req.cookies.csrf_token", csrfToken)
    console.log("🔐[LOGIN] req.session.crsf",req.session.csrfToken) */

    // Vérifier si l'utilisateur a activé l'authentification à deux facteurs
    // Si oui, générer un token temporaire pour l'authentification à deux facteurs
    const is2FAEnabled = user.authProviders && user.authProviders[0].two_factor_auth;
    if (user.authProviders && is2FAEnabled ) {
      //1- generer un token temporaire pour l'authentification à deux facteurs
      const {provider_id, two_factor_auth_method = "totp"} = user.authProviders[0];
      const tempToken = this.app.authService.generateTemp2FAToken(provider_id,two_factor_auth_method);
      console.log("🔐[LOGIN] tempToken generate")
      reply.setCookie('authToken2FA', tempToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production', // Utiliser 'secure' en production
          sameSite: 'strict',
          path: '/',
          maxAge: 350 //==> 5 minutes
      });
      //2- si la methode est email, envoyer un code de vérification par email
      if (two_factor_auth_method === "email") {
        const { otp, otpExpiration } = await this.app.twoFactorAuthService.generate2FAEmailCode(user);
        console.log("🔐 otp",otp)
        console.log("🔐 otpExpiration",otpExpiration)
        // Envoyer le code de vérification par email
         console.log("🔐[LOGIN] send2FAEmail to: ",email)

        await send2FAEmail(email, otp);
      }
      return reply.status(201).send({ twoFactorRequired: true, method: two_factor_auth_method });
    }
    // Sinon, générer un token JWT normal

    const token = this.app.authService.generateToken(user);
  //  console.log("🟢 token ",token)

        // Définir le cookie avec le token
      reply.setCookie('authToken', token, {
          httpOnly: true,
          secure: true,// process.env.NODE_ENV === 'production', // Utiliser 'secure' en production
          sameSite: 'strict',
          path: '/',
          maxAge: 3600 // 1 heure
      });

     // 🟢 Associer l'utilisateur à la session
    req.session.userID = user.id
    req.session.crsfToken = generateCSRFToken();
    console.log("🟢 AuthController  login session",req.session.test)
    return reply.status(201).send({ token: token });
  }
    catch (error) {
      console.error("🔴 AuthController login error", error);
      return generateErrorResponse(reply, error);
    }
  }

  /**
   * Déconnexion (logout)
   * 
   * @param req 
   * @param reply 
   * @returns 
   */
  async logout(req: FastifyRequest, reply: FastifyReply) {
    console.log("🔴 logout")
    // Supprimer  la session
    if (req.session) {
      req.session.destroy((err) => {
        if (err) {
          console.error("🔴 logout error", err);
          return reply.status(500).send({ error: "Failed to destroy session" });
        }
      });
      reply.clearCookie('sessionId'); // Supprimer le cookie de session
    }
    // Supprimer le cookie
    reply.clearCookie('authToken');
    return reply.status(200).send({ message: "Logged out" });
  }

  // 🟢 Vérification du token
  async decodeToken(req: FastifyRequest, reply: FastifyReply) {
   // const startTime = Date.now(); // Démarrer le chronomètre
    const authHeader = req.headers.authorization;
    if (!authHeader) return reply.status(401).send({ error: "No token provided" });
    try {
      const token = authHeader.split(" ")[1];
      const decoded = this.app.jwt.verify(token,"ACCESS_TOKEN_PUBLIC_KEY") as any;
   return reply.status(200).send(decoded);
    } catch (err) {
      console.error("🔴 me error",err)
      if (err.message === "jwt expired") {
        console.log("🔴 me jwt expired")
        return reply.status(401).send({ error: "Token expired",statusText:"Token expired" });
      }
      if (err.message === "Invalid token") {
        console.log("🔴 me invalid token")
        return reply.status(401).send({ error: "Invalid token",statusText:"Invalid token" });
      }
      console.log("🔴 me error","err")
      console.log("🔴 me mess error",err.message)
     

      return reply.status(401).send({ error: err.message, statusText:err.message });
    }
  }
  // 🟢 Vérification du token
  async me(req: FastifyRequest, reply: FastifyReply) {
  //  console.log("🔓 [me]-----    req.session.userID> ", req.session.userID)
  //  console.log("🔓 [me]----- req.session.crsfToken> ", req.session.crsfToken)
    try {
   // const startTime = Date.now(); // Démarrer le chronomètre
    const authHeader = req.headers.authorization;
   // if (!authHeader) return reply.status(401).send({ error: "No token provided" });
    if (!authHeader) throw new AuthError("No token provided");
   // let endTime = Date.now(); // Arrêter le chronomètre
   // console.log(`⏱️ [AuthController]  [AuthController] Hook onRequest [check authToken] exécuté en ${endTime - startTime} ms`);

     // console.log("🔓 me authHeader",authHeader)

      const token = authHeader.split(" ")[1];
      const decoded = this.app.jwt.verify(token,"ACCESS_TOKEN_PUBLIC_KEY") as any;
     if (!req.session.userID) {
        console.log("🔴 Session expired or not found");
        throw new AuthError("Session expired or not found");
        //return reply.status(401).send({ error: "Session expired or not found" });
      }

       if (decoded.id !== req.session.userID) {
        console.log("🔴 Token does not match session");
        throw new AuthError("Token does not match session");
        //return reply.status(401).send({ error: "Invalid token or session" });
      }
     // console.log("🟢 me decoded",decoded)

      /**
       * debug token info
       * 
       */
    //  const iatDate = new Date(decoded.iat * 1000);
    //  const expDate = new Date(decoded.exp * 1000);
    //  console.log("Issued At:");
    //  console.log("Issued At:", iatDate);
    //  console.log("Expires At:", expDate);

     // let endTime = Date.now(); // Arrêter le chronomètre
     // console.log(`⏱️ [AuthController]  Hook onRequest [this.app.jwt.verify] exécuté en ${endTime - startTime} ms`);
   //const result = await  UserRepository.getUserById(decoded.id);
/*    const result = await  this.UserRepository.getById(decoded.id);

   //endTime = Date.now(); // Arrêter le chronomètre
  // console.log(`⏱️ [AuthController]  Hook onRequest [await  this.UserRepository.getById(decoded.id)] exécuté en ${endTime - startTime} ms`);
  // console.log("🟢 me result",result)
   if (!result) {
    return reply.status(401).send({ error: "Invalid token" });
  } */
  //created_at
  //created_at
  //endTime = Date.now(); // Arrêter le chronomètre
  //console.log(`⏱️ [AuthController]  Hook onRequest [reply.status(200).send(result)] exécuté en ${endTime - startTime} ms`);
 
   return reply.status(200).send(decoded);
    } catch (err) {
    return  generateErrorResponse(reply, err);
      console.error("🔴 me error",err)
      if (err.message === "jwt expired") {
        console.log("🔴 me jwt expired")
        return reply.status(401).send({ error: "Token expired",statusText:"Token expired" });
      }
      if (err.message === "Invalid token") {
        console.log("🔴 me invalid token")
        return reply.status(401).send({ error: "Invalid token",statusText:"Invalid token" });
      }
      console.log("🔴 me error","err")
      console.log("🔴 me mess error",err.message)
     

      return reply.status(401).send({ error: err.message, statusText:err.message });
    }
  }

  /**
  * Connexion (login) avec 42API OAuth
  * 
  * @param req 
  * @param reply 
  * @param token 
  */
  async oauthCallbackApi42(req: FastifyRequest, reply: FastifyReply, token: any) {
    // 1. Récupérer le profil de l'utilisateur depuis l'API 42 en utilisant le token bearer
    try {
      const response = await fetch("https://api.intra.42.fr/v2/me", {
        headers: {
         Authorization: `Bearer ${token}`,
      },
    })
    const profile = await response.json();
  //  reply.send(profile);
    console.log("🔓 42 Api Callback"/* , profile */);
    const user = await this.app.authService.createUserWithOauthProvider(profile, "42api");
/*     if (user) {
      req.session.userID = user.id
      req.session.crsfToken = generateCSRFToken();
    } */
   // console.log("🔓 42 Api Callback", user);
   return user;
   // reply.send( user);
      
    } catch (error) {
      reply.send(error);
    }
  }


   /**
   * Connexion (loginForgetPassword) by email
   * 
   * @param req 
   * @param reply 
   * @returns 
   */
  async loginForgetPassword(req: FastifyRequest, reply: FastifyReply) {
    const { email } = req.body as { email: string; password: string };
    const user = await this.app.authService.validateAuthProvider(email, "local");    
    if (!user) {
      return reply.status(201).send({ twoFactorRequired: true, method: 'email' });//on doit pas dire que les identifiants sont invalides
    }
    // Vérifier si l'utilisateur a activé l'authentification à deux facteurs
    // Si oui, générer un token temporaire pour l'authentification à deux facteurs
    if (user.authProviders/*  && is2FAEnabled */ ) {
      //1- generer un token temporaire pour l'authentification à deux facteurs
      const {provider_id, two_factor_auth_method = "totp"} = user.authProviders[0];
      const tempToken = this.app.authService.generateTemp2FAToken(provider_id,two_factor_auth_method);
      console.log("🔐[LOGIN][loginForgetPassword] tempToken generate")
      reply.setCookie('authToken2FA', tempToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production', // Utiliser 'secure' en production
          sameSite: 'strict',
          path: '/',
          maxAge: 350 //==> 5 minutes
      });
      //2- si la methode est email, envoyer un code de vérification par email
      if (two_factor_auth_method != "totp") {
        const { otp, otpExpiration } = await this.app.twoFactorAuthService.generate2FAEmailCode(user,true);
        console.log("🔐 otp",otp)
        // Envoyer le code de vérification par email
         console.log("🔐[LOGIN] send2FAEmail to: ",email)

 //@TEST a decommenter pour un envoie de mail
        await send2FAEmail(email, otp);
      }
      return reply.status(201).send({ twoFactorRequired: true, method: two_factor_auth_method });
    }
      // Sinon, générer un token JWT forgot password

    const token = this.app.authService.generateToken(user);
        // Définir le cookie avec le token
      reply.setCookie('authForgetPasswordToken', token, {
          httpOnly: true,
          secure: true,//process.env.NODE_ENV === 'production', // Utiliser 'secure' en production
          sameSite: 'strict',
          path: '/',
          maxAge: 350 //==> 5 minutes
      });
      console.log("🔐[LOGIN] [loginForgetPassword]  authForgetPasswordToken generate")
    return reply.status(201).send({ twoFactorRequired: true, method: email });
  }

  /**
   * changer le mot de passe oublié
   * on utilise le token de reinitialisation du mot de passe: authForgetPasswordToken
   * 
   * @param req 
   * @param reply 
   * @returns 
   */
  async loginResetPassword(req: FastifyRequest, reply: FastifyReply) {
    console.log("🔐[LOGIN] [loginResetPassword]  start---")
    const { password } = req.body as { password: string };
    if (!password) {
      return reply.status(400).send({ error: "Password is required" });
    }
    //- recuperer le token de reinitialisation du mot de mot de passe depuis les cookies
    const authForgetPasswordToken = req.cookies.authForgetPasswordToken;
    if (!authForgetPasswordToken) {
      console.log("🔴 loginResetPassword No token provided",req.cookies)
      return reply.status(401).send({ error: "No token provided" });
    }
    console.log("🔐[LOGIN] [loginResetPassword]  [authForgetPasswordToken] cookie ok")
    try {
      console.log("🔐[LOGIN] [loginResetPassword]  authForgetPasswordToken",this.app.jwt.decode(authForgetPasswordToken,{}))
    } catch (err) {
      console.error("🔴 loginResetPassword error",err)
    }
    //- verifier le token de reinitialisation du mot de mot de passe et y recuperer l'id de l'utilisateur
    const decoded = this.app.jwt.verify(authForgetPasswordToken,"ACCESS_TOKEN_PUBLIC_KEY") as {id: number};
    if (!decoded) {
      return reply.status(401).send({ error: "Invalid token" });
    }
    console.log("🔐[LOGIN] [loginResetPassword]  decoded",decoded)
    //- recuperer l'utilisateur depuis la base de donnees
    const user = await this.UserRepository.getById(decoded.id);
    if (!user) {
      return reply.status(401).send({ error: "User not found" });
    }
    console.log("🔐[LOGIN] [loginResetPassword]  user",user)
    //- verifier si l'utilisateur a un authProvider
    if (!user.authProviders || user.authProviders.length === 0) {
      return reply.status(401).send({ error: "User has no auth provider" });
    }
    console.log("🔐[LOGIN] [loginResetPassword]  user.authProviders",user.authProviders)
    if (user.authProviders.length === 0) {
      return reply.status(401).send({ error: "User has no auth provider" });
    }
    //- verifier si l'utilisateur a un authProvider de type local
    if (user.authProviders[0].provider !== "local") {
      return reply.status(401).send({ error: "User has no auth provider of type local" });
    }
    //- changer le mot de passe de l'utilisateur
    const updatedUser = await this.app.authService.updatePassword(user.authProviders[0].id!, password);
    if (!updatedUser) {
      return reply.status(401).send({ error: "User not found" });
    }
    //- supprimer le cookie de reinitialisation du mot de passe
    reply.clearCookie('authForgetPasswordToken');
    // - retourner le cookie defini avec le token
    const token = this.app.authService.generateToken(user);
    reply.setCookie('authToken', token, {
                httpOnly: true,
                secure: true,
                sameSite: 'strict',
                path: '/',
                maxAge:3600 //  1 heure
            });
    console.log("🔐[LOGIN] [loginResetPassword]  Password changed successfully")
    //- retourner un message de succes
    return reply.status(200).send({ token:token, message: "Password changed successfully" });
  }




  async updateMePassword(req: FastifyRequest, reply: FastifyReply) {
 
    try {
      const { oldPassword, newPassword } = req.body as { oldPassword: string; newPassword: string };
      if (!oldPassword || !newPassword) {
        //return reply.status(400).send({ error: "Old password and new password are required" });
        throw new ValidationError("Old password and new password are required", "oldPassword");
      }
      if (oldPassword === newPassword) {
     //   return reply.status(400).send({ error: "Old password and new password are the same" });
        throw new ValidationError("Old password and new password cannot be the same", "oldPassword");
      }
      console.log("[updateMePassword] --start--")
      const authToken = req.cookies.authToken;
      //2- Vérifier si le token d'authentification est présent
      if (!authToken) {
        console.log("[updateMePassword] no authToken")
       // return reply.status(401).send({ error: "Unauthorized" });
        throw new AuthError();
      }
      // Vérifier le token pour l'authentification
      const decoded = this.app.jwt.verify(authToken, "ACCESS_TOKEN_PUBLIC_KEY") as {id: number};
     
       console.log("[updateMePassword] decoded");
      const user = await this.UserRepository.getById(decoded.id);
      if (!user) {
       console.log("[updateMePassword] !user");
        //return reply.status(401).send({ error: "Unauthorized" });
        throw new AuthError("User not found");
      }
      //3- Vérifier si l'utilisateur a déjà un secret pour l'authentification à deux facteurs
      const {authProviders} = user;
      if (!authProviders || authProviders.length === 0) {

       console.log("[updateMePassword] !authProviders || authProviders.length === 0");
       // return reply.status(400).send({ error: "User has no authProviders" });
        throw new ValidationError("User has no authProviders", "authProviders");
      }
      const authProvider = authProviders[0];

       console.log("[updateMePassword] authProvider",authProvider);
      if (!authProvider) {
       // return reply.status(400).send({ error: "User has no authProviders" });
        throw new ValidationError("User has no authProviders", "authProviders");
      }
      const {id, provider, provider_id, password } = authProvider;
      if (!id ||provider !== "local") {
       // return reply.status(400).send({ error: "User has no authProviders" });
       throw new ValidationError("User has no authProviders", "authProviders");
      }
      console.log("[updateMePassword] provider_id",provider_id);
      /* if (provider !== "local") {
        return reply.status(400).send({ error: "User has no authProviders of type local" });
      } */
      //4- Vérifier si le mot de passe est correct
    //  const isValid = await this.app.authService.validateUser(provider_id, oldPassword);
      const isValid = await this.app.authService.isValidResetPassword(provider_id, oldPassword, password);
      console.log("[updateMePassword] isValidResetPassword",isValid)
      if (!isValid) {
        //return reply.status(400).send({ error: "Invalid credentials" });
        throw new ValidationError("Invalid credentials", "oldPassword");
      }
      //5- Changer le mot de passe
      const updatedUser = await this.app.authService.updatePassword(id, newPassword);
      console.log("[updateMePassword] updatedUser",updatedUser)
      if (!updatedUser) {
        //return reply.status(400).send({ error: "User not found" });
        throw new ValidationError("User not found", "user");
      }
      //return no content
      console.log("[updateMePassword] --end--")
      return reply.status(204).send();
    } catch (error) {
/*       console.error("🔴[updateMePassword] error", error);
      return reply.status(500).send({ error: "Internal server error" }); */
      console.error("🔴[updateMePassword] error");
      return generateErrorResponse(reply, error);
    }
    
  }
}
