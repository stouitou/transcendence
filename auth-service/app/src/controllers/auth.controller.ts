import AuthProviderRepository from "@src/repository/AuthProvider.repository";
import  UserRepository  from "../repository/User.repository";
import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { BaseController } from "./BaseController";


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
    const { email, password } = req.body as { email: string; password: string };
    // Vérifier si l'utilisateur existe déjà dan AuthProvider
    const existingUser = await this.AuthProviderRepository.getByParams({provider_id:email,provider:"local"});
  	console.log("❓ AuthController   existingUser: ", existingUser)
    if (existingUser) {
      return reply.status(400).send({ error: "User already exists" });
    }
    console.log("🟠 AuthController  try create User")

    // Créer l'utilisateur  
    const newUser = await this.app.authService.createUser(email, password);
	  console.log("🟡 newUser",newUser)
    if (!newUser) {
      return reply.status(400).send({ error: "User already exists" });
    }
    const token = this.app.authService.generateToken(newUser!); // `!` pour forcer le non-null
    console.log("🔗🟢 token",{token})
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
    console.log("🔗 email, password ",email,password)
    const user = await this.app.authService.validateUser(email, password);
    console.log("🟢 user ",user)
    if (!user) {
      return reply.status(401).send({ error: "Invalid credentials" });
    }

    const token = this.app.authService.generateToken(user);
    console.log("🟢 token ",token)
    return reply.status(201).send({ token: token });
  }

  // 🟢 Vérification du token
  async me(req: FastifyRequest, reply: FastifyReply) {
    const authHeader = req.headers.authorization;
    if (!authHeader) return reply.status(401).send({ error: "No token provided" });

    try {
      console.log("🔓 me authHeader",authHeader)

      const token = authHeader.split(" ")[1];
      const decoded = this.app.jwt.verify(token,"ACCESS_TOKEN_PUBLIC_KEY") as any;
      console.log("🟢 me decoded",decoded)

  
   //const result = await  UserRepository.getUserById(decoded.id);
   const result = await  this.UserRepository.getById(decoded.id);
   console.log("🟢 me result",result)
   if (!result) {
    return reply.status(401).send({ error: "Invalid token" });
  }
  //created_at
  //created_at
   console.log("81 🟢 me result",result)  
   return reply.status(200).send(result);
    } catch (err) {
      return reply.status(401).send({ error: "Invalid token" });
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
    console.log("🔓 42 Api Callback", user);
    reply.send( user);
      
    } catch (error) {
      reply.send(error);
    }
  }
}