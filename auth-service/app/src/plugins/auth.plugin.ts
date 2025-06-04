import { FastifyInstance } from "fastify";
import fastifyPassport from "@fastify/passport";
import fastifySession from "@fastify/session";
import fastifyCookie from "@fastify/cookie";
import fastifyOauth2 from '@fastify/oauth2';
import cors from '@fastify/cors';
import { registerGoogleStrategy , registerGithubStrategy } from "./oauth/index";

import { AuthSchema } from "../schemas/auth.schema";

//import { UserRepository } from "../repository/UserRepository";
import  UserRepository  from "../repository/User.repository";
export async function registerAuthPlugin(app: FastifyInstance) {
/* 	app.register(cors, {
  origin: ['http://frontend-container:3000', 'http://auth-service:3000','https://localhost:4433'], // Autorisez les domaines nécessaires
  credentials: true, // Permet l'envoi des cookies
}); */
	// 🔹 Middleware pour les sessions
	const safeSecret = "1223484dgjhfhkjgh;k,gjhkhghng,bldflbgh,ldf,bl,dl,nbldnl,dfl,glshdfkvihskd";
	app.register(fastifyCookie)
	app.register(fastifySession ,{
		secret: safeSecret,
		saveUninitialized: false,//  true, //-> false = ne pas créer de session pour les utilisateurs non authentifiés
		cookie: {secure: process.env.NODE_ENV === 'production' ? true : false,
			 httpOnly: true,
			 sameSite: 'strict',
			 maxAge: 60 *60 *1000
			}, // 1 heure
		rolling: true, // Renouvelle la durée de vie du cookie à chaque requête
	})
	app.register(fastifyPassport.initialize())
	// 🔹 Initialisation de Passport.js
	app.register(fastifyPassport.secureSession());
	// 🔹 Sérialisation/Désérialisation
  	//Sérialisation : on stocke l'ID de l'utilisateur dans la session
	fastifyPassport.registerUserSerializer(async (data:{user:{id:number}}, request) => {
		console.log("🔒 Sérialisation de donnee:", data);
		console.log("🔒 Sérialisation de donnee user:", data.user);
		console.log("🔒 Sérialisation de l'utilisateur, ID:", data.user.id);
		return data.user/* .id */});
	
	// Désérialisation : on récupère les infos de l'utilisateur depuis l'ID stocké
	fastifyPassport.registerUserDeserializer(async (user:{id:number}, request) => {
    const id = user.id;
	//console.log("🔓35 Désérialisation de l'utilisateur, ID:", id);
	const userRepository = new UserRepository();
    return await userRepository.getById(id);
  });
  // 🔹 Enregistrer les stratégies OAuth
  registerGoogleStrategy(app, fastifyPassport);
  registerGithubStrategy(app, fastifyPassport);

  // 🔹 Enregistrement de la stratégie 42
  app.register(fastifyOauth2, {
	name: 'fortyTwoOAuth2',
	schema: AuthSchema.oauthProvider,
	scope: ['public'],
	credentials: {
	  client: {
		id: process.env.API42_CLIENT_ID!,
		secret: process.env.API42_CLIENT_SECRET!,
	  },
	  auth: {
		authorizeHost: 'https://api.intra.42.fr',
		authorizePath: '/oauth/authorize',
		tokenHost: 'https://api.intra.42.fr',
		tokenPath: '/oauth/token',
	  },
	},
	startRedirectPath: '/api/auth/42api',//url de connexion
	callbackUri: process.env.API42_REDIRECT_URI!,
	generateStateFunction: (request) => {
		const state = Math.random().toString(36).substring(7);
		request.session.state = state;
		return state;
	  },
	checkStateFunction: (request) => {
	 console.log("🔓 checkStateFunction", request.session.state, (request.query as { state?: string }).state);
	 return  request.cookies['oauth2-redirect-state'] === (request.query as { state?: string }).state;
	},
	});
}

