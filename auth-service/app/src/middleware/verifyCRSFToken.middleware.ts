import { FastifyRequest, FastifyReply } from "fastify";

export async function verifyCSRFToken(req: FastifyRequest, reply: FastifyReply) {
  const csrfToken = req.headers['x-csrf-token']; // Récupère le token CSRF depuis les en-têtes
  if (!csrfToken || csrfToken !== req.session.csrfToken) {
    console.log("🔴 Invalid CSRF token");
    return reply.status(403).send({ error: "Invalid CSRF token" });
  }
  // Vérifie si le token a expiré
  if (Date.now() > req.session.csrfTokenExpiration) {
    return reply.code(403).send({ error: 'CSRF token expired' });
  }
  console.log("🟢 CSRF token verified");
}