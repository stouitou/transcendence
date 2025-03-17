import { FastifyReply, FastifyRequest } from "fastify";

import { FastifyInstance } from 'fastify';
import jwt from "jsonwebtoken";

export class AuthMiddleware {
  constructor(private app: FastifyInstance) {
    this.app = app;
    console.log("🔐 AuthMiddleware created");
    this.authMiddleware = this.authMiddleware.bind(this);
    
  }

  async authMiddleware(request: FastifyRequest, reply: FastifyReply) {
	try {
	  const authHeader = request.headers.authorization;
	  if (!authHeader) {
		return reply.status(401).send({ error: "Accès interdit, token requis." });
	  }
	  const token = authHeader.split(" ")[1];
    console.log("in authMiddleware: token", token)
	  const decoded = this.app.jwt.verify(token, "ACCESS_TOKEN_PUBLIC_KEY");
	  request.user = decoded; // Ajoute l'utilisateur à la requête
    request.authenticatedUser = decoded;
    console.log("🔐 decoded", decoded)
	} catch (error) {
	  return reply.status(401).send({ error: "Token invalide." });
	}
  };


}






// Middleware d'authentification
//ajour d'un defintion de type pour la requete
/* declare module 'fastify' {
 export interface FastifyRequest {
	user: string | JwtPayload//{ id: number; email: string; role: string };
	  }	
}
 */

/* const authMiddleware = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      return reply.status(401).send({ error: "Accès interdit, token requis." });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    request.user = decoded; // Ajoute l'utilisateur à la requête
  } catch (error) {
    return reply.status(401).send({ error: "Token invalide." });
  }
};

export default authMiddleware; */
