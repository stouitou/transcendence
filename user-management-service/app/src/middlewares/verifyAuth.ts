import { ErrorFactory } from "@src/Errors/ErrorFactory";
import { AppError, AuthError } from "@src/Errors/errors";
import { FastifyReply, FastifyRequest } from "fastify";
import { errorDebugLog } from "./logger.middleware";


export async function verifyAuth(req: FastifyRequest, reply: FastifyReply) {
  errorDebugLog("middleware", "verifyAuth", "Verifying authentication...");
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    errorDebugLog("middleware", "verifyAuth", "No Authorization header provided");
    //return reply.status(401).send({ error: "Access denied, token required" });
    throw new AuthError("Access denied, token required");
  }

  try {
    const res = await fetch('http://auth_services:3000/internal/auth/me', {
      method: 'GET',
      headers: {
        'Authorization': authHeader?? "",
        'cookie': req.headers.cookie ?? "",
      },
    });
    const data = await res.json();
    if (!res.ok) {
      errorDebugLog("middleware", "verifyAuth", "Authentication failed", data);
     throw  ErrorFactory.fromRemoteError(data);
    }
    // Nettoyer les données utilisateur si nécessaire
    if (data && data.authProviders) {
      delete data.authProviders;
      errorDebugLog("middleware", "verifyAuth", "🟠 Removed authProviders from user data for security");
    }

    // Ajouter l'utilisateur authentifié à la requête
    req.authenticatedUser = data;
  } catch (error) {
   // console.error("🟥 Error during authentication:", error);
    reply.clearCookie("authToken", { path: "/" });
    throw error

  //  return reply.status(error.status || 500).send({ error: error.message || "Internal server error" });
  }
}