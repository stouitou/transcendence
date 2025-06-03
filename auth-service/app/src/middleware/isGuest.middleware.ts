import { generateErrorResponse } from "../Errors/handler";
import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";


/**
 * Middleware pour vérifier si l'utilisateur est un invité (non authentifié)
 * @param req - Requête Fastify
 * @param reply - Réponse Fastify
 */

export async function  isGuest(req: FastifyRequest, reply: FastifyReply) {
  // Vérifiez si une session existe
  if (req.session?.userID) {
    console.log("🔴 Session exists, checking authToken");

    const authToken = req.cookies.authToken;
    if (authToken) {
      try {
        const token = authToken.split(" ")[1];
        const decoded = req.server.jwt.verify(token, "ACCESS_TOKEN_PUBLIC_KEY");
        if (decoded) {
          console.log("🔴 User already logged in via token");
          return reply.status(403).send({ error: "You are already logged in" });
        }
      } catch (err) {
        console.log("🟡 Invalid or expired token, invalidating session");
        // Supprimer la session si le token est invalide ou expiré
        req.session.destroy();
        return generateErrorResponse(reply,err)
        //reply.status(401).send({ error: "Invalid or expired token" });
      }
    } else {
      console.log("🟡 No authToken found, invalidating session");
      req.session.destroy();
      //clear les cookies
      reply.clearCookie("authToken");
      reply.clearCookie("authToken2FA");
      reply.clearCookie("authForgetPasswordToken");
      reply.clearCookie("authForgetPasswordToken2FA");
      reply.clearCookie("sessionId");
      
    }
  }
}