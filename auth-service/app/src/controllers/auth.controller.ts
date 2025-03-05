import { AuthRepository } from "../repository/AuthRepository";
import { UserRepository } from "../repository/UserRepository";
import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

export class AuthController {
	  constructor(private app: FastifyInstance) {

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
	 
  // 🟢 Inscription (register)  
  async register(req: FastifyRequest, reply: FastifyReply) {
	console.log("🔗AuthController  start register")
/* 	if (!this.app.authService) {
		console.error("🔴 authService is not initialized");
	  } else {
		console.log("🟢 authService is initialized");
	  } */
    const { email, password } = req.body as { email: string; password: string };
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await this.app.authService.validateUser(email, password);
	console.log("🔗AuthController   existingUser? ",existingUser)
    if (existingUser) {
      return reply.status(400).send({ error: "User already exists" });
    }
	console.log("🔗 AuthController  try create User")

    // Créer l'utilisateur
    const newUser = await this.app.authService.createUser(email, password);    
	console.log("🔗 newUser",newUser)
  if (!newUser) {
      return reply.status(400).send({ error: "User already exists" });
    }
    const token = this.app.authService.generateToken(newUser!); // `!` pour forcer le non-null
console.log("🔗 token",{token})
    return reply.status(201).send({ token });
  }

  // 🟢 Connexion (login)
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

  
   const result = await  UserRepository.getUserById(decoded.id);
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

  // 🟢 Callback 42
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

/****en  cours */
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
 const authprovider =  await AuthRepository.getAutProviderByProviderId(profile.id,provider);
      // 2- si l'utilisateur existe déjà, le retourner
      if (!authprovider) return null;
      // 3- si l'utilisateur n'existe pas, le créer
      // 3.1- créer l'utilisateur dans la base de données
      const user = await UserRepository.createVoidUser();
      // 3.2- créer AuthProvider dans la base de données
      const authProvider = await AuthRepository.createAuthProvider({ provider_id/* : profile.id */, provider, user_id: user.id });
      // 4- retourner l'utilisateur créé
      return user;


      /**** fin */
      // et le cas échéant, le mettre à jour avec les informations du fournisseur d'authentification
    /* 	if (!this.app.authService) {
        console.error("🔴 authService is not initialized");
        } else {
        console.log("🟢 authService is initialized");
        } */
/*         const { email, password } = req.body as { email: string; password: string };
        // Vérifier si l'utilisateur existe déjà
        const existingUser = await this.app.authService.validateUser(email, password);
      console.log("registerWithOauthProvider   existingUser? ",existingUser)
        if (existingUser) {
          return reply.status(400).send({ error: "User already exists" });
        }
      console.log("🔗 registerWithOauthProvider  try create User")
    
        // Créer l'utilisateur
        const newUser = await this.app.authService.createUser(email, password);    
      console.log("🔗 newUser",newUser)
      if (!newUser) {
          return reply.status(400).send({ error: "User already exists" });
        }

        return newUser; */
   /*      const token = this.app.authService.generateToken(newUser!); // `!` pour forcer le non-null
    console.log("🔗 token",{token})
        return reply.status(201).send({ token }); */
      }
}
