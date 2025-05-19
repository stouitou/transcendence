import { FastifyReply, FastifyRequest } from "fastify";

export async function reconstructAuthHeader(req: FastifyRequest, reply: FastifyReply) {
  const authToken = req.cookies.authToken;
  if (authToken && !req.headers.authorization) {
    req.headers.authorization = `Bearer ${authToken}`;
    console.log("🔗 Authorization header reconstructed from cookie");
  }
}