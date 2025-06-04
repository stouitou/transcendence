
import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { BaseController } from "./BaseController";
import { generateCSRFToken } from "../utils/crypto";


  const wsCSRFTokenMap = new Map<number, { token: string; expiresAt: number }>();
/**
 * Contrôleur d'authentification
 * rappel: un contrôleur est une classe qui contient des méthodes qui gèrent les requêtes HTTP
 * -- Il est utilisé pour gérer les requêtes HTTP et les réponses.
 */
export class CrsfController extends BaseController {
  // Map pour stocker les tokens CSRF pour les WebSockets
 static getWsCSRFTokenMap() {
    return wsCSRFTokenMap;
  }
  /**
   * Crée une instance de AuthController.
   * 
   * @param app 
   */
  constructor(app: FastifyInstance) {
      super(app);
			console.log("🟢 CrsfController is initialized");
		  this.generateCSRFToken = this.generateCSRFToken.bind(this);
      this.validateCSRFToken = this.validateCSRFToken.bind(this);
      this.generateWsCSRFToken = this.generateWsCSRFToken.bind(this);
      this.validateWsCSRFToken = this.validateWsCSRFToken.bind(this);
	  }

  /**
   *  Inscription (register) by email/password
   * 
   * @param req 
   * @param reply 
   * @returns 
   */ 
  async generateCSRFToken(req: FastifyRequest, reply: FastifyReply) {
  /*   const csrfToken = generateCSRFToken();
      reply.setCookie('csrf_token', csrfToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production', // Utiliser 'secure' en production
          sameSite: 'strict',
          path: '/',
          maxAge: 350 //==> 5 minutes
      });

    // Renvoi le même token dans une réponse visible JS
    return { csrfToken }; */
//   if (!req.session.csrfToken) {
    req.session.csrfToken = generateCSRFToken();
    req.session.csrfTokenExpiration = Date.now() +  60 * 1000; // 1 minutes et c'est meme long
//  }

  console.log("🔐[CrsfController] CSRF Token generated:", req.session.csrfToken);
  // Envoie le token dans la réponse pour que le frontend puisse l’ajouter au header
  return { csrfToken: req.session.csrfToken };
	  
  }

  async validateCSRFToken(req: FastifyRequest, reply: FastifyReply) {
  const { csrfToken } = req.body as { csrfToken: string };
  if (!csrfToken || csrfToken !== req.session.csrfToken) {
    return reply.code(403).send({ error: 'Invalid CSRF token' });
  }
  // Vérifie si le token a expiré
  if (Date.now() > req.session.csrfTokenExpiration) {
    return reply.code(403).send({ error: 'CSRF token expired' });
  }
  return { success: true };
  }


  generateWsCSRFToken(req: FastifyRequest, reply: FastifyReply) {
      if (!req.session.userID) {
      return reply.code(403).send({ error: 'User not authenticated' });
    }
    const token =  generateCSRFToken();
    const expiresAt = Date.now() +  60 * 1000; // 1 minutes et c'est meme long
    wsCSRFTokenMap.set(req.session.userID, { token, expiresAt });
    return reply.code(200).send({ token });
  }

  validateWsCSRFToken(req: FastifyRequest, reply: FastifyReply){
  const { csrfToken,userId } = req.body as { csrfToken: string, userId: number };
  if (!csrfToken || !userId) {
    console.error("⚠️ [validateWsCSRFToken] Missing csrfToken or userId");
    console.error("⚠️ [validateWsCSRFToken] (!csrfToken || !userId) ",csrfToken,userId );
  return reply.code(403).send({ error: 'Missing csrfToken or userId' });
}

  const record = wsCSRFTokenMap.get(userId);
  if (!record) {
    console.error("⚠️ [validateWsCSRFToken] !record ",'Token not found for userId');
    return reply.code(403).send({ error: 'Token not found for userId' });
  }
  // Vérifie si le token est valide et s'il n'a pas expiré

    const { token: storedToken, expiresAt } = record;
    if (storedToken !== csrfToken) {
    console.error("⚠️🟥  [validateWsCSRFToken] (storedToken !== csrfToken)  ",storedToken, csrfToken,userId);
    console.error("⚠️ [validateWsCSRFToken] (storedToken !== csrfToken)  ",'Token mismatch');
      wsCSRFTokenMap.delete(userId); // Supprimez le token expiré
    return reply.code(403).send({ error: 'Token mismatch' });
  }

  if (Date.now() > expiresAt) {
      wsCSRFTokenMap.delete(userId); // Supprimez le token expiré
    console.error("⚠️ [validateWsCSRFToken] (Date.now() > expiresAt) ",'Token expired');
    return reply.code(403).send({ error: 'Token expired' });
  }

  wsCSRFTokenMap.delete(userId); // Supprimez le token apres validation réussie
  console.log("✅ [validateWsCSRFToken] Token valid");
  return { success: true };
  }
}
