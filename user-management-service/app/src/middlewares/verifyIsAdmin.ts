import { AuthError } from "../Errors/errors";
import { errorDebugLog } from "./logger.middleware";
import { FastifyReply, FastifyRequest } from "fastify";

export async function verifyIsAdmin(req: FastifyRequest, reply: FastifyReply) {
  errorDebugLog("middleware", "verifyIsAdmin", "Verifying verifyIsAdmin...");
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    errorDebugLog("middleware", "verifyAuth", "No Authorization header provided");
    //return reply.status(401).send({ error: "Access denied, token required" });
    throw new AuthError("Access denied, token required");
  }
  if (!req.authenticatedUser || !req.authenticatedUser.role || req.authenticatedUser.role !== "admin") {
	errorDebugLog("middleware", "verifyIsAdmin", "User is not an admin");
    throw new AuthError("Access denied, admin role required");
  }

}