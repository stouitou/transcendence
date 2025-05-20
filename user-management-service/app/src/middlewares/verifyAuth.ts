import { FastifyReply, FastifyRequest } from "fastify";


export async function verifyAuth(req: FastifyRequest, reply: FastifyReply) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    console.log("🔴 No Authorization header provided");
    return reply.status(401).send({ error: "Access denied, token required" });
  }

  try {
    const res = await fetch('http://auth_services:3000/internal/auth/me', {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'cookie': req.headers.cookie ?? "",
      },
    });
    const data = await res.json();
    if (!res.ok) {
      console.error("🔴 Authentication failed:", data);
      throw { status: res.status, message: data.statusText || "Authentication failed" };
    }
    // Nettoyer les données utilisateur si nécessaire
    if (data && data.authProviders) {
      delete data.authProviders;
      console.log("🟠 Removed authProviders from user data for security");
    }

    // Ajouter l'utilisateur authentifié à la requête
    req.authenticatedUser = data;
  } catch (error) {
    console.error("🟥 Error during authentication:", error);
    reply.clearCookie("authToken", { path: "/" });

    return reply.status(error.status || 500).send({ error: error.message || "Internal server error" });
  }
}