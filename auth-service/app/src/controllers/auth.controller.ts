import AuthProviderRepository from "../repository/AuthProvider.repository";
import  UserRepository  from "../repository/User.repository";
import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { BaseController } from "./BaseController";
import { generateQRCode } from "@src/utils/qrcode";
import { verifyTOTP } from "@src/utils/totp";
import qrcode from "qrcode";


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
        this.verify2FA = this.verify2FA.bind(this);
        this.generate2FAQRcode = this.generate2FAQRcode.bind(this);
        this.enable2FA = this.enable2FA.bind(this);
        this.disable2FA = this.disable2FA.bind(this);
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
 //   console.log("🟢 user ",user)
    if (!user) {
      return reply.status(401).send({ error: "Invalid credentials" });
    }

    // Vérifier si l'utilisateur a activé l'authentification à deux facteurs
    // Si oui, générer un token temporaire pour l'authentification à deux facteurs
    if (user.authProviders && !user.authProviders[0].two_factor_auth) {
      //1- generer un token temporaire pour l'authentification à deux facteurs
      const tempToken = this.app.authService.generateTemp2FAToken(user.authProviders[0].provider_id);
      reply.setCookie('AuthToken2FA', tempToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production', // Utiliser 'secure' en production
          sameSite: 'strict',
          path: '/',
          maxAge: 350 //==> 5 minutes
      });
      //2- générer un secret pour l'authentification à deux facteurs ou le recuperer s'il existe déjà
   //  const secret = this.app.authService.get2FASecret(user);
 //     console.log("🟢 token 2FA ",tempToken)
     // const qrCode = await generateQRCode('https://localhost:4433/login?token=' + tempToken);
      return reply.status(201).send({ twoFactorRequired: true, tempToken });
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
  //2FA
  async enable2FA(req: FastifyRequest, reply: FastifyReply) {}

  async disable2FA(req: FastifyRequest, reply: FastifyReply) {}

  async generate2FAQRcode(req: FastifyRequest, reply: FastifyReply) {
         const authToken2FA = req.cookies.AuthToken2FA;
        if (!authToken2FA) {
          return reply.status(401).send({ error: "Unauthorized" });
        }
        // Vérifier le token temporaire pour l'authentification à deux facteurs
         const decoded = this.app.jwt.verify(authToken2FA, "ACCESS_TOKEN_PUBLIC_KEY") as any;
      const userEmail = decoded.email; // récupère dynamiquement l'utilisateur ici
      console.log("🔐 2FA QR code userEmail",userEmail)
      const userAuthProvider = await this.AuthProviderRepository.getOneByParams({provider_id:userEmail,provider:"local"});
      if (!userAuthProvider) {
        return reply.status(400).send({ error: "UserAuthProvider not found" });
      }
      const {/* secret, */otpauth} = await this.app.authService.get2FASecret(userEmail);
      //si le otpath n'existe pas,envoyer une image vide sans erreur
      if (!otpauth) {
        return reply.status(200).header('Content-Type', 'image/png').send(Buffer.from([]));
      }
      // Vérifier si l'utilisateur a déjà un secret pour l'authentification à deux facteurs
          const qrBuffer = await qrcode.toBuffer(`${otpauth}` , { type: 'png' });
    
      reply
        .header('Content-Type', 'image/png')
        .send(qrBuffer);
    }
  
  /**
   * Vérifier le code de l'authentification à deux facteurs
   * 
   * @param req 
   * @param reply 
   * @returns 
   */

  async verify2FA(req: FastifyRequest, reply: FastifyReply) {
    const authToken2FA = req.cookies.AuthToken2FA;
    if (!authToken2FA) {
      return reply.status(401).send({ error: "[verify2FA] Unauthorized" });
    }
    // Vérifier le token temporaire pour l'authentification à deux facteurs
    const decoded = this.app.jwt.verify(authToken2FA, "ACCESS_TOKEN_PUBLIC_KEY") as any;
    const userEmail = decoded.email; // récupère dynamiquement l'utilisateur ici
      const { code } = req.body as { code: string };
      if (!code) {
        return reply.status(400).send({ error: "Code is required" });
      }
    //  const authProvider = await this.AuthProviderRepository.getAuthProviderByEmail(userEmail);
      const authProvider = await this.AuthProviderRepository.getOneByParams({provider_id:userEmail,provider:"local"});
      if (!authProvider) {
        return reply.status(400).send({ error: "User not found" });
      }
      const { two_factor_auth_secret } = authProvider; // à implémenter ou extraire depuis base
      if (!two_factor_auth_secret) {
        return reply.status(400).send({ error: "2FA secret not found" });
      }
      const isValid = verifyTOTP(code, two_factor_auth_secret);//TOPCode
      console.log("🔐 2FA verify isValid",isValid)
      if (!isValid) {
        return reply.status(400).send({ error: "Invalid 2FA code" });
      }

      // Authentifier l'utilisateur
      const params = {authProviders:{provider_id:userEmail, provider:"local"}};
      const user = await this.UserRepository.getOneByParams(params);
      if (!user) {
        return reply.status(400).send({ error: "User not found" });
      }
      const token = this.app.authService.generateToken(user);
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
}
