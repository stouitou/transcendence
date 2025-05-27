import { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify';
import { generateCSRFToken } from "../utils/crypto";
import { User } from "../models/User.models";
import { AuthController } from '../controllers/auth.controller';

const BACKEND_SERVER_URL = process.env.BACKEND_SERVER_URL || "https://localhost:4433";
const redirectUrlAfterLoginSuccess = `${BACKEND_SERVER_URL}/profile`;
const redirectUrlAfterLoginError = `${BACKEND_SERVER_URL}/login`;

export class AuthHandlerCallback {
	private authController: AuthController;
	constructor(private app: FastifyInstance) {
		this.authController = new AuthController(app);
		this.googleHandlerCallback = this.googleHandlerCallback.bind(this);
		this.githubHandlerCallback = this.githubHandlerCallback.bind(this);
		this.facebookHandlerCallback = this.facebookHandlerCallback.bind(this);
		this.fortyTwoHandlerCallback = this.fortyTwoHandlerCallback.bind(this);
	}


	async googleHandlerCallback(req: FastifyRequest, reply: FastifyReply) {
		const user = req.user as {user:User} & { token: string };
		const token = user.token ?? "";
		console.log("🔗 google callback",user)
		//res.send(req.user)
		reply.setCookie('authToken', token, {
			httpOnly: true,
			secure: true,//process.env.NODE_ENV === 'production', // Utiliser 'secure' en production
			sameSite: 'strict',
			path: '/',
			maxAge: 3600 // 1 heure
		});
		// 🟢 Associer l'utilisateur à la session
		if (user) {
		req.session.userID = user.user.id
		req.session.crsfToken = generateCSRFToken();
		}
		
		reply.redirect(redirectUrlAfterLoginSuccess);
	}


	async githubHandlerCallback(req: FastifyRequest, reply: FastifyReply) {

		const user = req.user as {user:User} & { token: string };
		const token = user.token ?? "";
		reply.setCookie('authToken', token, {
			httpOnly: true,
			secure: true,//process.env.NODE_ENV === 'production', // Utiliser 'secure' en production
			sameSite: 'strict',
			path: '/',
			maxAge: 3600 // 1 heure
		});
		if (user) {
		req.session.userID = user.user.id
		req.session.crsfToken = generateCSRFToken();
		}
		reply.redirect(redirectUrlAfterLoginSuccess);
	}

	async facebookHandlerCallback(req: FastifyRequest, reply: FastifyReply) {

		const user = req.user as User & { token: string };
		const token = user.token ?? "";
		reply.setCookie('authToken', token, {
			httpOnly: true,
			secure: true,//process.env.NODE_ENV === 'production', // Utiliser 'secure' en production
			sameSite: 'strict',
			path: '/',
			maxAge: 3600 // 1 heure
		});      
		reply.redirect(redirectUrlAfterLoginSuccess);
	}

	async  fortyTwoHandlerCallback(request: FastifyRequest, reply: FastifyReply) {
		try {
			const { token } = await this.app.fortyTwoOAuth2.getAccessTokenFromAuthorizationCodeFlow(request);
			console.log("🔓 42 Callback Token:", token);
			const {access_token} = token;
			const user = await this.authController.oauthCallbackApi42(request, reply, access_token); // @TODO change to Promise<string>
			// const user = req.user as User & { token: string };
			const authToken = (user  as  {user:User} & { token: string }).token ?? "";
				reply.setCookie('authToken', authToken , {
				httpOnly: true,
				secure: true,//process.env.NODE_ENV === 'production', // Utiliser 'secure' en production
				sameSite: 'strict',
				path: '/',
				maxAge: 3600 // 1 heure
			});
			if (user) {
				request.session.userID = user.user.id
				request.session.crsfToken = generateCSRFToken();
			}
			reply.redirect(redirectUrlAfterLoginSuccess);
			//  return  reply.send({ token: jwtToken });
		} catch (err) {
			console.error(err);
			reply.redirect(redirectUrlAfterLoginError);
			// reply.send(err);
		}
	}
}
