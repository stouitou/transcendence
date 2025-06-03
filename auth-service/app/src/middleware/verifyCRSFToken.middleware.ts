import { CustomCSRFError } from "../Errors/errors";
import { generateErrorResponse } from "../Errors/handler";
import { FastifyRequest, FastifyReply } from "fastify";

export async function verifyCSRFToken(req: FastifyRequest, reply: FastifyReply) {
  try {
    const csrfToken = req.headers['x-csrf-token']; // Récupère le token CSRF depuis les en-têtes
    if (!csrfToken || csrfToken !== req.session.csrfToken) {
      //return reply.status(403).send({ error: "Invalid CSRF token" });
      throw new CustomCSRFError("Invalid CSRF token", "ERROR_CSRF_INVALID");
    }
    // Vérifie si le token a expiré
    if (Date.now() > req.session.csrfTokenExpiration) {
      //return reply.code(403).send({ error: 'CSRF token expired' });
      throw new CustomCSRFError("CSRF token expired", "ERROR_CSRF_EXPIRED");
    }
    console.log("🟢 CSRF token verified");
  }catch (error) {
    console.error("🔴 Error verifying CSRF token:", error);
    return generateErrorResponse(reply, error);
  }
}