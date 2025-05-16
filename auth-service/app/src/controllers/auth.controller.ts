import AuthProviderRepository from "../repository/AuthProvider.repository";
import  UserRepository  from "../repository/User.repository";
import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { BaseController } from "./BaseController";
import { send2FAEmail } from "@src/services/mail.service";


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

		if (!this.app.authService) {
			console.error("🔴 authService is not initialized");
		  } else {
			console.log("🟢 authService is initialized");
		  }
		   // Lier les méthodes pour conserver le contexte de `this`
		   this.register = this.register.bind(this);
		   this.login = this.login.bind(this);
		   this.me = this.me.bind(this);
       this.logout = this.logout.bind(this);
       this.loginForgetPassword = this.loginForgetPassword.bind(this);
	  }

  /**
   *  Inscription (register) by email/password
   * 
   * @param req 
   * @param reply 
   * @returns 
   */ 
  async register(req: FastifyRequest, reply: FastifyReply) {
	  console.log("🔵 AuthController  start register")
    const { name, email, password } = req.body as { name : string, email: string; password: string };
    // Vérifier si l'utilisateur existe déjà dan AuthProvider
    const existingUser = await this.AuthProviderRepository.getByParams({provider_id:email,provider:"local"});
  //	console.log("❓ AuthController   existingUser: ", existingUser)
    if (existingUser) {
      return reply.status(400).send({ error: "User already exists" });
    }
    console.log("🟠 AuthController  try create User")

    // Créer l'utilisateur  
    const newUser = await this.app.authService.createUser(name, email, password);
	  console.log("🟡 newUser",newUser)
    if (!newUser) {
      return reply.status(400).send({ error: "User already exists" });
    }
    const token = this.app.authService.generateToken(newUser!); // `!` pour forcer le non-null
  //  console.log("🔗🟢 token",{token})
    return reply.status(201).send({ token });
  }

  /**
   * Connexion (login) by email/password
   * 
   * @param req 
   * @param reply 
   * @returns 
   */
  async login(req: FastifyRequest, reply: FastifyReply) {
    const { email, password } = req.body as { email: string; password: string };
    const user = await this.app.authService.validateUser(email, password);
    if (!user) {
      return reply.status(401).send({ error: "Invalid credentials" });
    }

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
          secure: process.env.NODE_ENV === 'production', // Utiliser 'secure' en production
          sameSite: 'strict',
          path: '/',
          maxAge: 3600 // 1 heure
      });
    return reply.status(201).send({ token: token });
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
    // Supprimer le cookie
    reply.clearCookie('authToken');
    return reply.status(200).send({ message: "Logged out" });
  }

  // 🟢 Vérification du token
  async me(req: FastifyRequest, reply: FastifyReply) {

   // const startTime = Date.now(); // Démarrer le chronomètre
    const authHeader = req.headers.authorization;
    if (!authHeader) return reply.status(401).send({ error: "No token provided" });
   // let endTime = Date.now(); // Arrêter le chronomètre
   // console.log(`⏱️ [AuthController]  [AuthController] Hook onRequest [check authToken] exécuté en ${endTime - startTime} ms`);
    try {
     // console.log("🔓 me authHeader",authHeader)

      const token = authHeader.split(" ")[1];
      const decoded = this.app.jwt.verify(token,"ACCESS_TOKEN_PUBLIC_KEY") as any;
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
   const result = await  this.UserRepository.getById(decoded.id);

   //endTime = Date.now(); // Arrêter le chronomètre
  // console.log(`⏱️ [AuthController]  Hook onRequest [await  this.UserRepository.getById(decoded.id)] exécuté en ${endTime - startTime} ms`);
  // console.log("🟢 me result",result)
   if (!result) {
    return reply.status(401).send({ error: "Invalid token" });
  }
  //created_at
  //created_at
  //endTime = Date.now(); // Arrêter le chronomètre
  //console.log(`⏱️ [AuthController]  Hook onRequest [reply.status(200).send(result)] exécuté en ${endTime - startTime} ms`);
 
   return reply.status(200).send(result);
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
    console.log("🔓 42 Api Callback", profile);
    const user = await this.app.authService.createUserWithOauthProvider(profile, "42api");
   // console.log("🔓 42 Api Callback", user);
   return user;
   // reply.send( user);
      
    } catch (error) {
      reply.send(error);
    }
  }


//@BUG : a revoir
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
      return reply.status(201).send({ twoFactorRequired: true, method: 'email' });
   //   return reply.status(401).send({ error: "Invalid credentials" });//@TODO on devrait pas dire que les identifiants sont invalides
    }
    console.log("🔐[LOGIN] user",user)
   // return reply.status(200).send({ user });

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
      // Sinon, générer un token JWT forgot password

    const token = this.app.authService.generateToken(user);//@TODO
  //  console.log("🟢 token ",token)

        // Définir le cookie avec le token
      reply.setCookie('authForgetPasswordToken', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production', // Utiliser 'secure' en production
          sameSite: 'strict',
          path: '/',
          maxAge: 350 //==> 5 minutes
      });
    return reply.status(201).send({ token: token });
  }

//@BUG : a revoir
  /**
   * changer le mot de passe oublié
   * on utilise le token de reinitialisation du mot de passe: authForgetPasswordToken
   * 
   * @param req 
   * @param reply 
   * @returns 
   */
  async loginResetPassword(req: FastifyRequest, reply: FastifyReply) {
    const { password } = req.body as { password: string };
    if (!password) {
      return reply.status(400).send({ error: "Password is required" });
    }
    //- recuperer le token de reinitialisation du mot de mot de passe depuis les cookies
    const authForgetPasswordToken = req.cookies.authForgetPasswordToken;
    if (!authForgetPasswordToken) {
      return reply.status(401).send({ error: "No token provided" });
    }
    //- verifier le token de reinitialisation du mot de mot de passe et y recuperer l'id de l'utilisateur
    const decoded = this.app.jwt.verify(authForgetPasswordToken,"ACCESS_TOKEN_PUBLIC_KEY") as {id: number};
    if (!decoded) {
      return reply.status(401).send({ error: "Invalid token" });
    }
    //- recuperer l'utilisateur depuis la base de donnees
    const user = await this.UserRepository.getById(decoded.id);
    if (!user) {
      return reply.status(401).send({ error: "User not found" });
    }
    //- verifier si l'utilisateur a un authProvider
    if (!user.authProviders || user.authProviders.length === 0) {
      return reply.status(401).send({ error: "User has no auth provider" });
    }
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
    //- retourner un message de succes
    return reply.status(200).send({ message: "Password changed successfully" });
  }
}
